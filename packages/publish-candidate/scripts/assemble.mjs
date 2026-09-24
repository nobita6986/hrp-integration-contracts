// assemble.mjs
// Copies pinned CRM baseline source + new talent-context-read source
// into the publish-candidate src/ directory for compilation.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const REPO = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const PC_DIR = path.join(REPO, 'packages', 'publish-candidate');
const SRC_DIR = path.join(PC_DIR, 'src');
const FROZEN_DIR = path.join(REPO, 'packages', 'crm-frozen-root');
const FROZEN_SRC_DIR = path.join(FROZEN_DIR, 'src');
const NEW_MODULE_DIR = path.join(REPO, 'packages', 'contracts', 'src', 'talent-context-read');
const CONTRACTS_DEV_HARNESS = path.join(REPO, 'packages', 'contracts');
const TESTS_DIR = path.join(PC_DIR, 'tests');
const SCRIPTS_DIR = path.join(PC_DIR, 'scripts');

function copyAll(srcDir, dstDir) {
  for (const e of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcP = path.join(srcDir, e.name);
    const dstP = path.join(dstDir, e.name);
    if (e.isDirectory()) {
      fs.mkdirSync(dstP, { recursive: true });
      copyAll(srcP, dstP);
    } else {
      fs.mkdirSync(path.dirname(dstP), { recursive: true });
      fs.copyFileSync(srcP, dstP);
    }
  }
}

function copyContents(srcDir, dstDir) {
  for (const e of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcP = path.join(srcDir, e.name);
    const dstP = path.join(dstDir, e.name);
    if (e.isDirectory()) {
      fs.mkdirSync(dstP, { recursive: true });
      copyAll(srcP, dstP);
    } else {
      fs.mkdirSync(path.dirname(dstP), { recursive: true });
      fs.copyFileSync(srcP, dstP);
    }
  }
}

function main() {
  console.log('assemble: cleaning src/ and tests/');
  fs.rmSync(SRC_DIR, { recursive: true, force: true });
  fs.mkdirSync(SRC_DIR, { recursive: true });
  fs.rmSync(TESTS_DIR, { recursive: true, force: true });
  fs.mkdirSync(TESTS_DIR, { recursive: true });

  // 1. Copy frozen CRM baseline source (src/ contents) into SRC_DIR/
  console.log('assemble: copying frozen CRM baseline source');
  copyContents(FROZEN_SRC_DIR, SRC_DIR);

  // 2. Copy talent-context-read new module into SRC_DIR/talent-context-read/
  console.log('assemble: copying new module talent-context-read');
  const tcDir = path.join(SRC_DIR, 'talent-context-read');
  fs.mkdirSync(tcDir, { recursive: true });
  copyAll(NEW_MODULE_DIR, tcDir);

  // 3. Copy frozen CRM tests into tests/ (alongside dist/ so ../dist/ resolves)
  console.log('assemble: copying frozen CRM tests');
  copyAll(path.join(FROZEN_DIR, 'tests'), TESTS_DIR);

  // 4. Copy new module tests into tests/talent-context-read/ and fix imports
  console.log('assemble: copying new module tests');
  const tcTestsDst = path.join(TESTS_DIR, 'talent-context-read');
  fs.mkdirSync(tcTestsDst, { recursive: true });
  copyAll(path.join(CONTRACTS_DEV_HARNESS, 'tests', 'talent-context-read'), tcTestsDst);
  // Rewrite imports from root dist to subpath dist
  // Pattern: import X from '../../dist/<anything>' -> '../../dist/talent-context-read/<anything>'
  for (const e of fs.readdirSync(tcTestsDst)) {
    if (!e.endsWith('.mjs')) continue;
    const fp = path.join(tcTestsDst, e);
    let txt = fs.readFileSync(fp, 'utf8');
    // Replace ../../dist/ with ../../dist/talent-context-read/
    const oldPath = '../../dist/';
    const newPath = '../../dist/talent-context-read/';
    if (txt.includes(oldPath)) {
      txt = txt.split(oldPath).join(newPath);
      fs.writeFileSync(fp, txt, 'utf8');
    }
  }

  // 5. Copy generator manifest test into tests/generator/
  console.log('assemble: copying generator manifest test');
  fs.mkdirSync(path.join(TESTS_DIR, 'generator'), { recursive: true });
  copyAll(path.join(CONTRACTS_DEV_HARNESS, 'tests', 'generator'), path.join(TESTS_DIR, 'generator'));

  // 5b. Create pc-generator-manifest.test.mjs for PC package
  const pcGenTest = `// Generator manifest tests for publish-candidate
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
  strictEqual(asUtf8.includes('\\r\\n'), false, 'must use LF, not CRLF');
  console.log('  PASS');
}

{
  console.log('T3: --verify exits non-zero on data tamper');
  if (!readFileSync(PC_MANIFEST, 'utf8').trim()) {
    console.log('  SKIP (manifest not yet generated)');
  } else {
    const orig = readFileSync(PC_MANIFEST, 'utf8');
    const lines = orig.split('\\n');
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].trim();
      if (l && !l.startsWith('#')) { lines[i] = 'Z' + lines[i].substring(1); break; }
    }
    writeFileSync(PC_MANIFEST, lines.join('\\n'), 'utf8');
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
    const dataLines = content.split('\\n').filter(l => l.trim() && !l.startsWith('#'));
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
    const dataLines = content.split('\\n').filter(l => l.trim() && !l.startsWith('#'));
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

console.log('\\n=== ALL PC GENERATOR TESTS PASSED ===');
`;
  fs.writeFileSync(path.join(TESTS_DIR, 'generator', 'pc-generator-manifest.test.mjs'), pcGenTest, 'utf8');
  console.log('assemble: created pc-generator-manifest.test.mjs');

  // 6. Copy fixtures into tests/fixtures/
  console.log('assemble: copying test fixtures');
  const fixturesSrc = path.join(CONTRACTS_DEV_HARNESS, 'tests', 'fixtures');
  if (fs.existsSync(fixturesSrc)) {
    fs.mkdirSync(path.join(TESTS_DIR, 'fixtures'), { recursive: true });
    copyAll(fixturesSrc, path.join(TESTS_DIR, 'fixtures'));
  }

  // 7. Generate-manifest.mjs is committed at scripts/, not copied from dev harness
  console.log('assemble: skipping generate-manifest.mjs (committed source used)');

  // 8. Verify critical files
  if (!fs.existsSync(path.join(SRC_DIR, 'index.ts'))) {
    console.error('FAIL: frozen index.ts not found');
    process.exit(1);
  }
  if (!fs.existsSync(path.join(SRC_DIR, 'talent-context-read', 'index.ts'))) {
    console.error('FAIL: talent-context-read/index.ts not found');
    process.exit(1);
  }

  // 9. Summary
  let srcFiles = 0;
  (function countFiles(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.isDirectory()) countFiles(path.join(d, e.name)); else srcFiles++; } })(SRC_DIR);
  let testFiles = 0;
  (function countFiles(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.isDirectory()) countFiles(path.join(d, e.name)); else testFiles++; } })(TESTS_DIR);
  console.log('assemble: src/ has ' + srcFiles + ' files, tests/ has ' + testFiles + ' files');
  console.log('assemble: done');
}

main();
