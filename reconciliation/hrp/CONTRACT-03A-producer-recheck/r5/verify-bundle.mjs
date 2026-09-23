import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: here, encoding: 'utf8' }).trim();
const commit = process.argv[2] ?? 'HEAD';
const manifestPath = 'reconciliation/hrp/CONTRACT-03A-producer-recheck/r5/manifest.sha256';
const raw = execFileSync('git', ['show', `${commit}:${manifestPath}`], { cwd: root });
const lines = new TextDecoder('utf8', { fatal: true }).decode(raw).split('\n').filter((line) => /^[0-9a-f]{64}  /.test(line));
let failures = 0;

for (const line of lines) {
  const expected = line.slice(0, 64);
  const file = line.slice(66);
  try {
    const bytes = execFileSync('git', ['show', `${commit}:${file}`], { cwd: root });
    const actual = createHash('sha256').update(bytes).digest('hex');
    if (actual !== expected) {
      failures++;
      console.error(`MISMATCH ${file}`);
    }
  } catch {
    failures++;
    console.error(`MISSING ${file}`);
  }
}

console.log(`BUNDLE_VERIFY entries=${lines.length} match=${lines.length - failures} fail=${failures}`);
process.exitCode = failures ? 1 : 0;
