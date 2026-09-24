// tools/verify-artifact.mjs
// Read-only: verify an existing .tgz against an ARTIFACT-DESCRIPTOR.json.
// Does NOT rebuild the artifact -- only checks the bytes.
//
// Usage:
//   node tools/verify-artifact.mjs \
//     --descriptor reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/ARTIFACT-DESCRIPTOR.json \
//     --tarball <path-to-.tgz>
//
// Exit code:
//   0 = full match
//   1 = any drift
//   2 = usage error

import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, isAbsolute, basename } from 'node:path';
import { execFileSync } from 'node:child_process';

const REPO = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();

function repoRel(p) { return isAbsolute(p) ? p : resolve(REPO, p); }

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--descriptor') out.descriptor = argv[++i];
    else if (a === '--tarball') out.tarball = argv[++i];
    else if (a === '--help' || a === '-h') { console.log('See top-of-file header.'); process.exit(0); }
    else { console.error('Unknown flag: ' + a); process.exit(2); }
  }
  return out;
}

const args = parseArgs(process.argv);
if (!args.descriptor || !args.tarball) {
  console.error('--descriptor and --tarball are required');
  process.exit(2);
}

const descPath = repoRel(args.descriptor);
const tarPath = repoRel(args.tarball);
if (!existsSync(descPath)) { console.error('descriptor not found: ' + descPath); process.exit(2); }
if (!existsSync(tarPath))  { console.error('tarball not found: ' + tarPath); process.exit(2); }

const D_raw = JSON.parse(readFileSync(descPath, 'utf8'));

function pick(D, field) {
  const top = D[field];
  if (top !== undefined && top !== null) return top;
  const nestedMap = {
    filename: 'artifact.filename',
    byte_size: 'artifact.byte_size',
    sha256: 'artifact.sha256',
    npm_shasum: 'artifact.npm_shasum',
  };
  const np = nestedMap[field];
  if (np) {
    const parts = np.split('.');
    let v = D;
    for (const p of parts) { if (v && typeof v === 'object') v = v[p]; }
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
}
const D = {
  filename: pick(D_raw, 'filename'),
  byte_size: pick(D_raw, 'byte_size'),
  sha256: pick(D_raw, 'sha256'),
  npm_shasum: pick(D_raw, 'npm_shasum'),
};
for (const k of ['filename','byte_size','sha256','npm_shasum']) {
  if (D[k] === undefined) { console.error('descriptor missing required field: ' + k); process.exit(2); }
}

function rawSha256(p) { return createHash('sha256').update(readFileSync(p)).digest('hex'); }
function rawSha1(p)   { return createHash('sha1').update(readFileSync(p)).digest('hex'); }

const producedSize = readFileSync(tarPath).length;
const producedSha = rawSha256(tarPath);
const producedShasum = rawSha1(tarPath);

const producedBase = basename(tarPath);
const checks = [
  { label: 'filename',     actual: producedBase,     expected: D.filename },
  { label: 'byte_size',    actual: producedSize,     expected: D.byte_size },
  { label: 'sha256',       actual: producedSha,      expected: D.sha256.toLowerCase() },
  { label: 'npm_shasum',   actual: producedShasum,   expected: D.npm_shasum.toLowerCase() },
];

console.log('verify-artifact: descriptor=' + descPath);
console.log('verify-artifact: tarball=' + tarPath + ' (' + producedBase + ', ' + producedSize + ' bytes)');

let ok = true;
for (const c of checks) {
  const match = c.actual.toString().toLowerCase() === c.expected.toString().toLowerCase();
  console.log('  ' + (match ? 'OK' : 'DRIFT') + '  ' + c.label + ' actual=' + c.actual + ' expected=' + c.expected);
  if (!match) ok = false;
}

if (!ok) { console.error('=== VERIFY-ARTIFACT: DRIFT ==='); process.exit(1); }
console.log('=== VERIFY-ARTIFACT: PASS ===');
process.exit(0);
