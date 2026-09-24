// Generator manifest tests - I-01 tooling verification
// Covers: UTF-8/LF/no-BOM/no-null, tamper detection, --verify byte invariance,
// and coverage of assertion.ts, conformance.ts and batch-2 test files.

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ok, equal, notEqual, strictEqual } from 'node:assert';

const HERE = dirname(fileURLToPath(import.meta.url));
// Test lives at: packages/contracts/tests/generator/...
// Repo root = 4 levels up
const REPO = resolve(HERE, '..', '..', '..', '..');
const GEN = resolve(REPO, 'packages', 'contracts', 'scripts', 'generate-manifest.mjs');
const CONTRACTS_MANIFEST = resolve(REPO, 'packages', 'contracts', 'manifest.sha256');
const R2_MANIFEST = resolve(
  REPO,
  'reconciliation',
  'crm',
  'CONTRACT-03A',
  'r2',
  'manifest.txt'
);

function rawSha256(filePath) {
  const raw = readFileSync(filePath);
  return createHash('sha256').update(raw).digest('hex');
}

function rawSha256OfFile(filePath) {
  return rawSha256(resolve(REPO, filePath));
}

console.log('Generator manifest tests starting...');

// T1: executable by Node
{
  console.log('T1: executable by Node');
  const result = execFileSync('node', [GEN], { cwd: REPO, encoding: 'utf8' });
  strictEqual(result.includes('packages/contracts/manifest.sha256'), true);
  strictEqual(result.includes('reconciliation/crm/CONTRACT-03A/r2/manifest.txt'), true);
  console.log('  PASS');
}

// T2: UTF-8 / LF / no BOM / no null bytes
{
  console.log('T2: UTF-8/LF/no-BOM/no-null');
  const raw = readFileSync(GEN);

  let nullCount = 0;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === 0) nullCount++;
  }
  strictEqual(nullCount, 0, 'generator must have zero null bytes');

  const asUtf8 = raw.toString('utf8');
  strictEqual(asUtf8.codePointAt(0), 47, 'first char must be / (ASCII)');

  const hasCRLF = asUtf8.includes('\r\n');
  strictEqual(hasCRLF, false, 'must use LF line endings, not CRLF');
  console.log('  PASS');
}

// T3: --verify exits non-zero on data tamper
{
  console.log('T3: --verify detects data tamper');
  const orig = readFileSync(CONTRACTS_MANIFEST, 'utf8');
  try {
    const lines = orig.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].trim();
      if (l && !l.startsWith('#')) {
        lines[i] = 'Z' + lines[i].substring(1);
        break;
      }
    }
    writeFileSync(CONTRACTS_MANIFEST, lines.join('\n'), 'utf8');

    let exitCode;
    try {
      execFileSync('node', [GEN, '--verify'], { cwd: REPO, encoding: 'utf8' });
      exitCode = 0;
    } catch (e) {
      exitCode = e.status;
    }
    strictEqual(exitCode !== 0, true, '--verify must exit non-zero on tampered data');

    writeFileSync(CONTRACTS_MANIFEST, orig, 'utf8');
    console.log('  PASS');
  } catch (e) {
    writeFileSync(CONTRACTS_MANIFEST, orig, 'utf8');
    throw e;
  }
}

// T4: --verify does not change file bytes
{
  console.log('T4: --verify preserves manifest bytes');
  const before = rawSha256(CONTRACTS_MANIFEST);
  const beforeR2 = rawSha256(R2_MANIFEST);

  try {
    execFileSync('node', [GEN, '--verify'], { cwd: REPO, encoding: 'utf8' });
  } catch (e) {
    // ignore non-zero exit in this test
  }

  const after = rawSha256(CONTRACTS_MANIFEST);
  const afterR2 = rawSha256(R2_MANIFEST);
  strictEqual(before, after, 'contracts manifest must be unchanged after --verify');
  strictEqual(beforeR2, afterR2, 'r2 manifest must be unchanged after --verify');
  console.log('  PASS');
}

// T5: coverage - entries include assertion.ts and conformance.ts
{
  console.log('T5: manifest covers assertion.ts and conformance.ts');
  const content = readFileSync(CONTRACTS_MANIFEST, 'utf8');
  const lines = content.split('\n').filter(
    (l) => l.trim() && !l.startsWith('#')
  );

  const paths = lines.map((l) => l.split('  ')[1]);
  ok(
    paths.includes('packages/contracts/src/talent-context-read/assertion.ts'),
    'manifest must include assertion.ts'
  );
  ok(
    paths.includes('packages/contracts/src/talent-context-read/conformance.ts'),
    'manifest must include conformance.ts'
  );
  console.log('  PASS');
}

// T6: coverage - batch-2 test files present
{
  console.log('T6: manifest covers batch-2 test files');
  const content = readFileSync(CONTRACTS_MANIFEST, 'utf8');
  const lines = content.split('\n').filter(
    (l) => l.trim() && !l.startsWith('#')
  );
  const paths = lines.map((l) => l.split('  ')[1]);
  const batch2 = [
    'packages/contracts/tests/talent-context-read/assertion-validators.test.mjs',
    'packages/contracts/tests/talent-context-read/conformance-helper.test.mjs',
    'packages/contracts/tests/talent-context-read/redaction-probes.test.mjs',
    'packages/contracts/tests/fixtures/redaction-vectors.fixtures.json',
  ];
  for (const p of batch2) {
    ok(paths.includes(p), 'manifest must include: ' + p);
  }
  console.log('  PASS');
}

// T7: all entries are 64 hex
{
  console.log('T7: all entries are exactly 64 lowercase hex');
  const content = readFileSync(CONTRACTS_MANIFEST, 'utf8');
  const dataLines = content.split('\n').filter(
    (l) => l.trim() && !l.startsWith('#')
  );
  for (const line of dataLines) {
    const tab = line.indexOf('  ');
    const sha = line.slice(0, tab);
    ok(
      /^[0-9a-f]{64}$/.test(sha),
      'entry SHA must be 64 hex: ' + sha
    );
  }
  console.log('  PASS');
}

// T8: entries verify against actual file SHA-256
{
  console.log('T8: manifest entries match committed raw SHA-256');
  const content = readFileSync(CONTRACTS_MANIFEST, 'utf8');
  const dataLines = content.split('\n').filter(
    (l) => l.trim() && !l.startsWith('#')
  );
  let okCount = 0;
  for (const line of dataLines) {
    const tab = line.indexOf('  ');
    const storedSha = line.slice(0, tab);
    const filePath = line.slice(tab + 2);
    const actualSha = rawSha256OfFile(filePath);
    if (storedSha === actualSha) okCount++;
  }
  strictEqual(okCount, dataLines.length, 'all entries must match actual SHA-256');
  console.log('  PASS (' + okCount + '/' + dataLines.length + ')');
}

console.log('\n=== ALL GENERATOR TESTS PASSED ===');
