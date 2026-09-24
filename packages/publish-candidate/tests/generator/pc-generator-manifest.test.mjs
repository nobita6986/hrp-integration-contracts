// Generator manifest tests for publish-candidate
// Covers: UTF-8/LF/no-BOM/no-null, tamper detection, --verify byte invariance.

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ok, strictEqual } from 'node:assert';

const HERE = dirname(fileURLToPath(import.meta.url));
// HERE = .../packages/publish-candidate/tests/generator
// repo root = 4 levels up
const REPO = resolve(HERE, '..', '..', '..', '..');
const GEN = resolve(REPO, 'packages', 'publish-candidate', 'scripts', 'generate-manifest.mjs');
const PC_MANIFEST = resolve(REPO, 'packages', 'publish-candidate', 'manifest.sha256');

function rawSha256(filePath) {
  const raw = readFileSync(filePath);
  return createHash('sha256').update(raw).digest('hex');
}

console.log('PC Generator manifest tests starting...');

{
  console.log('T1: executable by Node');
  const result = execFileSync('node', [GEN], { cwd: REPO, encoding: 'utf8' });
  ok(result.includes('packages/publish-candidate/manifest.sha256'), 'must reference PC manifest');
  console.log('  PASS');
}

{
  console.log('T2: UTF-8/LF/no-BOM/no-null');
  const raw = readFileSync(GEN);
  let nullCount = 0;
  for (let i = 0; i < raw.length; i++) { if (raw[i] === 0) nullCount++; }
  strictEqual(nullCount, 0, 'generator must have zero null bytes');
  const asUtf8 = raw.toString('utf8');
  strictEqual(asUtf8.codePointAt(0), 47, 'first char must be / (ASCII)');
  strictEqual(asUtf8.includes('\r\n'), false, 'must use LF, not CRLF');
  console.log('  PASS');
}

{
  console.log('T3: --verify exits non-zero on data tamper');
  if (!readFileSync(PC_MANIFEST, 'utf8').trim()) {
    console.log('  SKIP (manifest not yet generated)');
  } else {
    const orig = readFileSync(PC_MANIFEST, 'utf8');
    const lines = orig.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].trim();
      if (l && !l.startsWith('#')) { lines[i] = 'Z' + lines[i].substring(1); break; }
    }
    writeFileSync(PC_MANIFEST, lines.join('\n'), 'utf8');
    let exitCode = 0;
    try { execFileSync('node', [GEN, '--verify'], { cwd: REPO, encoding: 'utf8' }); } catch (e) { exitCode = e.status; }
    strictEqual(exitCode !== 0, true, '--verify must exit non-zero on tampered data');
    writeFileSync(PC_MANIFEST, orig, 'utf8');
    console.log('  PASS');
  }
}

{
  console.log('T4: --verify preserves manifest bytes');
  if (!readFileSync(PC_MANIFEST, 'utf8').trim()) {
    console.log('  SKIP (manifest not yet generated)');
  } else {
    const before = rawSha256(PC_MANIFEST);
    try { execFileSync('node', [GEN, '--verify'], { cwd: REPO, encoding: 'utf8' }); } catch (e) { /* ignore */ }
    const after = rawSha256(PC_MANIFEST);
    strictEqual(before, after, 'PC manifest must be unchanged after --verify');
    console.log('  PASS');
  }
}

{
  console.log('T5: all entries are exactly 64 lowercase hex');
  if (!readFileSync(PC_MANIFEST, 'utf8').trim()) {
    console.log('  SKIP (manifest not yet generated)');
  } else {
    const content = readFileSync(PC_MANIFEST, 'utf8');
    const dataLines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    for (const line of dataLines) {
      const tab = line.indexOf('  ');
      const sha = line.slice(0, tab);
      ok(/^[0-9a-f]{64}$/.test(sha), 'entry SHA must be 64 hex: ' + sha);
    }
    console.log('  PASS');
  }
}

{
  console.log('T6: manifest entries match committed raw SHA-256');
  if (!readFileSync(PC_MANIFEST, 'utf8').trim()) {
    console.log('  SKIP (manifest not yet generated)');
  } else {
    const content = readFileSync(PC_MANIFEST, 'utf8');
    const dataLines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    let okCount = 0;
    for (const line of dataLines) {
      const tab = line.indexOf('  ');
      const storedSha = line.slice(0, tab);
      const filePath = line.slice(tab + 2);
      const actualSha = rawSha256(resolve(REPO, filePath));
      if (storedSha === actualSha) okCount++;
    }
    strictEqual(okCount, dataLines.length, 'all entries must match actual SHA-256');
    console.log('  PASS (' + okCount + '/' + dataLines.length + ')');
  }
}

console.log('\n=== ALL PC GENERATOR TESTS PASSED ===');
