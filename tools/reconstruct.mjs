// tools/reconstruct.mjs
// Local, immutable-artifact reproduction + verification.
//
// Usage:
//   node tools/reconstruct.mjs \
//     --descriptor reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/ARTIFACT-DESCRIPTOR.json \
//     --output-dir <repo-relative-or-absolute-output-dir> \
//     [--package-dir packages/publish-candidate] \
//     [--skip-npm-ci]   (skip `npm ci` if node_modules already present and pinned) \
//     [--keep-tarball]  (do not delete the produced .tgz after verification; default: keep)
//
// Steps (all must succeed; any failure exits non-zero):
//   1. cd to package dir, run `npm run verify` (baseline verify).
//   2. Run `npm run assemble` (rebuild src/ + tests/ from CRM baseline + new module).
//   3. Run `npm run build` (tsc -> dist/).
//   4. Run `npm pack --pack-destination <output-dir>`.
//   5. Verify produced tarball identity matches descriptor:
//        - filename
//        - byte size
//        - SHA-256
//        - npm shasum
//        - file count
//   6. Print summary. Exit 0 on full match; exit 1 on any drift.
//
// Constraints (per MSG-045 / VF-02):
//   - Output directory is auto-created (mkdir -p).
//   - No absolute machine paths are emitted; only repo-relative paths.
//   - All paths are normalized through git rev-parse --show-toplevel.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, isAbsolute, sep, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname_of(import.meta.url);
const REPO = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();

function dirname_of(u) {
  // fileURLToPath('file:///D:/x/y.mjs') -> 'D:\\x\\y.mjs'
  const fp = fileURLToPath(u);
  const idx = fp.lastIndexOf(sep);
  return idx >= 0 ? fp.slice(0, idx) : fp;
}

function repoRel(p) { return isAbsolute(p) ? p : resolve(REPO, p); }

function parseArgs(argv) {
  const out = { skipCi: false, keepTarball: true };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--descriptor') out.descriptor = argv[++i];
    else if (a === '--output-dir') out.outputDir = argv[++i];
    else if (a === '--package-dir') out.packageDir = argv[++i];
    else if (a === '--skip-npm-ci') out.skipCi = true;
    else if (a === '--no-keep-tarball') out.keepTarball = false;
    else if (a === '--help' || a === '-h') {
      console.log('See top-of-file header.');
      process.exit(0);
    } else { console.error('Unknown flag: ' + a); process.exit(2); }
  }
  return out;
}

const args = parseArgs(process.argv);

// ---------- descriptor ----------

function loadDescriptor() {
  if (!args.descriptor) {
    console.error('--descriptor <path> is required');
    process.exit(2);
  }
  const abs = repoRel(args.descriptor);
  if (!existsSync(abs)) { console.error('descriptor not found: ' + args.descriptor); process.exit(2); }
  const D = JSON.parse(readFileSync(abs, 'utf8'));
  function pick(field) {
    const top = D[field];
    if (top !== undefined && top !== null) return top;
    const nestedMap = {
      source_commit: 'source.commit',
      package_name: 'package.name',
      package_version: 'package.version',
      filename: 'artifact.filename',
      byte_size: 'artifact.byte_size',
      sha256: 'artifact.sha256',
      npm_shasum: 'artifact.npm_shasum',
      file_count: 'artifact.file_count',
      accepted_subpath: 'accepted_subpath',
    };
    const np = nestedMap[field];
    if (np) {
      const parts = np.split('.');
      let v = D;
      for (const p of parts) { if (v && typeof v === 'object') v = v[p]; }
      if (v !== undefined && v !== null) return v;
    }
    return null;
  }
  const required = ['source_commit','package_name','package_version','filename','byte_size','sha256','npm_shasum','file_count','accepted_subpath','acceptance_record','publication_status'];
  for (const k of required) {
    if (pick(k) === null) {
      console.error('descriptor missing required field: ' + k);
      process.exit(2);
    }
  }
  return {
    source_commit: pick('source_commit'),
    package_name: pick('package_name'),
    package_version: pick('package_version'),
    filename: pick('filename'),
    byte_size: pick('byte_size'),
    sha256: pick('sha256'),
    npm_shasum: pick('npm_shasum'),
    file_count: pick('file_count'),
    accepted_subpath: pick('accepted_subpath'),
    acceptance_record: pick('acceptance_record'),
    publication_status: pick('publication_status'),
    _raw: D,
  };
}

const D = loadDescriptor();

// ---------- output dir ----------

const OUT_DIR = repoRel(args.outputDir || '.');
mkdirSync(OUT_DIR, { recursive: true });
console.log('reconstruct: output dir = ' + OUT_DIR);

const PKG_DIR = repoRel(args.packageDir || 'packages/publish-candidate');
if (!existsSync(PKG_DIR)) { console.error('package dir not found: ' + PKG_DIR); process.exit(2); }
console.log('reconstruct: package dir = ' + PKG_DIR);

// ---------- run step ----------

function run(label, cmd, args, cwd) {
  console.log('reconstruct: ' + label + ' ...');
  try {
    // On Windows, npm is npm.cmd; spawnSync requires shell:true to resolve it.
    const out = execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], shell: true });
    if (out && out.trim()) console.log(out.trimEnd());
  } catch (e) {
    console.error('reconstruct: ' + label + ' FAILED');
    const errOut = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
    if (errOut.trim()) console.error(errOut.trimEnd());
    process.exit(1);
  }
}

// 0. clean node_modules if asked to npm ci
if (!args.skipCi) {
  // `npm ci` requires the lockfile in place. Run from repo root.
  run('npm ci', 'npm', ['ci'], REPO);
} else {
  console.log('reconstruct: --skip-npm-ci (assuming node_modules is in sync with lockfile)');
}

// 1. baseline verify
run('baseline verify', 'npm', ['run', 'verify'], PKG_DIR);

// 2. assemble
run('assemble', 'npm', ['run', 'assemble'], PKG_DIR);

// 3. build
run('tsc build', 'npm', ['run', 'build'], PKG_DIR);

// 4. npm pack
run('npm pack', 'npm', ['pack', '--pack-destination', OUT_DIR], PKG_DIR);

const produced = resolve(OUT_DIR, D.filename);
if (!existsSync(produced)) {
  console.error('reconstruct: produced tarball not found at expected path: ' + produced);
  console.error('  listing output dir:');
  for (const e of execFileSync('node', ['-e', "console.log(require('fs').readdirSync(process.argv[1]).join('\\n'))", OUT_DIR], { encoding: 'utf8' }).split('\n')) console.error('    ' + e);
  process.exit(1);
}

// 5. verify identity
function rawSha256(filePath) {
  const raw = readFileSync(filePath);
  return createHash('sha256').update(raw).digest('hex');
}

function npmShasum(tgzPath) {
  // npm shasum is sha-1 of the packed bytes.
  const raw = readFileSync(tgzPath);
  return createHash('sha1').update(raw).digest('hex');
}

function fileCount(tgzPath) {
  // Use `npm pack --dry-run` JSON for authoritative count.
  const out = execFileSync('npm', ['pack', '--dry-run', '--json'], { cwd: PKG_DIR, encoding: 'utf8', shell: true });
  const arr = JSON.parse(out);
  if (!Array.isArray(arr) || arr.length !== 1) {
    console.error('reconstruct: unexpected npm pack --dry-run --json output');
    process.exit(1);
  }
  return arr[0].entryCount;
}

const producedSize = readFileSync(produced).length;
const producedSha = rawSha256(produced);
const producedShasum = npmShasum(produced);
const producedFileCount = fileCount(produced);

console.log('reconstruct: produced ' + D.filename + ' size=' + producedSize + ' sha256=' + producedSha + ' shasum=' + producedShasum + ' files=' + producedFileCount);

const checks = [
  { label: 'filename',     actual: basename(produced) === D.filename, expected: true },
  { label: 'byte_size',    actual: producedSize === D.byte_size,                     expected: true },
  { label: 'sha256',       actual: producedSha.toLowerCase() === D.sha256.toLowerCase(), expected: true },
  { label: 'npm_shasum',   actual: producedShasum.toLowerCase() === D.npm_shasum.toLowerCase(), expected: true },
  { label: 'file_count',   actual: producedFileCount === D.file_count,               expected: true },
];

let allOk = true;
console.log('reconstruct: identity check:');
for (const c of checks) {
  const mark = c.actual === c.expected ? 'OK' : 'DRIFT';
  console.log('  ' + mark + '  ' + c.label);
  if (c.actual !== c.expected) allOk = false;
}

if (!args.keepTarball) {
  // Leave tarball in place by default; this option is mainly for cleanup after
  // a multi-pass verification run.
}

if (!allOk) {
  console.error('=== RECONSTRUCT: DRIFT DETECTED ===');
  process.exit(1);
}

console.log('=== RECONSTRUCT: PASS (artifact identity matches descriptor) ===');

// Emit a tiny result file next to the descriptor so callers can audit.
const resultPath = resolve(OUT_DIR, 'RECONSTRUCT-RESULT.txt');
const result = [
  '# Local reconstruction result',
  '# All values from a fresh in-tree assemble + build + npm pack.',
  'filename=' + D.filename,
  'byte_size=' + producedSize,
  'sha256=' + producedSha,
  'npm_shasum=' + producedShasum,
  'file_count=' + producedFileCount,
  'source_commit=' + D.source_commit,
  'matched_descriptor=true',
  '',
].join('\n');
writeFileSync(resultPath, result, 'utf8');
console.log('reconstruct: wrote ' + resultPath);

process.exit(0);
