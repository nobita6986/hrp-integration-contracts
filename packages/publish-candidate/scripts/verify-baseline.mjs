// verify-baseline.mjs
// Verifies the raw SHA-256 of every file in ../crm-frozen-root/
// matches the manifest BASELINE-MANIFEST.sha256.
//
// Detects:
//   - baseline hash drift (CRM source has been modified locally)
//   - missing baseline files
//   - duplicate paths in the manifest
//
// Exits non-zero on any mismatch. Output goes to stdout for evidence.
//
// Invariants:
//   - This script does NOT touch network, dist, or uncommitted buffers.
//   - It uses only the canonical manifest committed at the assembly commit.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const REPO = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const BASELINE_DIR = path.join(REPO, 'packages', 'crm-frozen-root');
const MANIFEST = path.join(BASELINE_DIR, 'BASELINE-MANIFEST.sha256');

function readManifest(p) {
  const txt = fs.readFileSync(p, 'utf8');
  const lines = txt.split(/\r?\n/);
  const entries = [];
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([0-9a-f]{64})\s+(.+)$/);
    if (!m) throw new Error('Manifest line malformed: ' + JSON.stringify(line));
    entries.push({ hash: m[1], rel: m[2] });
  }
  const seen = new Set();
  for (const e of entries) {
    if (seen.has(e.rel)) throw new Error('Duplicate path in manifest: ' + e.rel);
    seen.add(e.rel);
  }
  return entries;
}

function main() {
  if (!fs.existsSync(MANIFEST)) {
    console.error('FAIL: manifest not found at ' + MANIFEST);
    process.exit(1);
  }
  const entries = readManifest(MANIFEST);
  let ok = 0, bad = 0;
  for (const { hash, rel } of entries) {
    const abs = path.join(BASELINE_DIR, rel);
    if (!fs.existsSync(abs)) {
      console.error('MISSING: ' + rel);
      bad++;
      continue;
    }
    const b = fs.readFileSync(abs);
    const h = crypto.createHash('sha256').update(b).digest('hex');
    if (h !== hash) {
      console.error('DRIFT: ' + rel);
      console.error('  expected ' + hash);
      console.error('  got      ' + h);
      bad++;
    } else {
      ok++;
    }
  }
  console.log('baseline verify: ' + ok + ' OK, ' + bad + ' bad (of ' + entries.length + ')');
  if (bad > 0) process.exit(1);
}

main();
