// Generate and verify SHA-256 manifests for the CONTRACT-03A delivery.
//
// Usage (generate):
//   node packages/contracts/scripts/generate-manifest.mjs
//   # Writes packages/contracts/manifest.sha256 and
//   # reconciliation/crm/CONTRACT-03A/r2/manifest.txt
//
// Usage (verify):
//   node packages/contracts/scripts/generate-manifest.mjs --verify
//   # Verifies both manifests against committed blobs.
//   # Exit 0 = all match. Exit non-zero = missing/mismatch/malformed.
//
// Each manifest entry:
//   <raw-SHA256>  <repo-relative-path>
//
// Raw SHA-256 = Node crypto.createHash('sha256').update(rawFileBytes).digest('hex')
// of the FINAL committed blob content (not git hash-object which gives SHA-1).
//
// Git-Blob-OID (SHA-1, 40 hex) is NOT stored in manifest entries.
// The manifest file itself is NOT hashed (no self-hash).

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readFileSync as fsReadFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

// ─── Path helpers ────────────────────────────────────────────────────────────────

const HERE = dirname(fileURLToPath(import.meta.url));
// HERE = .../packages/contracts/scripts
// repo root = .../  (three levels up from scripts/)
const REPO = resolve(HERE, '..', '..', '..');

// ─── SHA-256 of a file's raw bytes ───────────────────────────────────────────

function rawSha256(filePath) {
  const raw = readFileSync(resolve(REPO, filePath));
  return createHash('sha256').update(raw).digest('hex');
}

// ─── Git ls-files (relative paths from repo root) ──────────────────────────────

function gitLsFiles(subdir) {
  const out = execFileSync('git', ['ls-files', '-z', '--full-name', subdir], {
    cwd: REPO,
    encoding: 'utf8',
  });
  return out.split('\0').filter(Boolean);
}

// ─── Raw SHA-256 of a file ────────────────────────────────────────────────────
// In normal (generate) mode: read from working tree.
// In verify mode: read from committed blobs at HEAD (or pinned SHA).

function readWorking(filePath) {
  return readFileSync(resolve(REPO, filePath));
}

function readBlob(sha, filePath) {
  return execFileSync('git', ['show', `${sha}:${filePath}`], { cwd: REPO });
}

function getReviewSha() {
  try {
    const out = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO, encoding: 'utf8' });
    return out.trim();
  } catch {
    return null;
  }
}

// ─── Verify one manifest (against committed blobs by default) ──────────────────

function verifyManifest(manifestPath, opts = {}) {
  const { fromFilesystem = false, pinnedSha = null } = opts;
  const blobSource = pinnedSha ?? getReviewSha();
  const lines = fsReadFileSync(manifestPath, 'utf8').split('\n');
  const dataLines = lines.filter(
    (l) => l.trim() && !l.startsWith('#') && !l.startsWith('Raw-File-SHA256') && !l.startsWith('Git-Blob-OID')
  );
  let ok = 0;
  let bad = 0;
  const errors = [];
  for (const line of dataLines) {
    const tabIdx = line.indexOf('  ');
    if (tabIdx === -1) {
      errors.push(`MALFORMED: "${line}"`);
      bad++;
      continue;
    }
    const shaPart = line.slice(0, tabIdx).trim();
    const pathPart = line.slice(tabIdx + 2).trim();

    if (!/^[0-9a-f]{64}$/.test(shaPart)) {
      errors.push(`MALFORMED-SHA256: "${shaPart}" in "${pathPart}"`);
      bad++;
      continue;
    }

    try {
      const raw = fromFilesystem
        ? readWorking(pathPart)
        : readBlob(blobSource, pathPart);
      const actual = createHash('sha256').update(raw).digest('hex');
      if (actual === shaPart) {
        ok++;
      } else {
        errors.push(`MISMATCH: "${pathPart}": expected ${shaPart}, got ${actual}`);
        bad++;
      }
    } catch (e) {
      errors.push(`MISSING: "${pathPart}": ${e.message}`);
      bad++;
    }
  }
  return { ok, bad, errors, total: dataLines.length };
}

// ─── Generate manifest for packages/contracts ─────────────────────────────────

function generateContractsManifest() {
  const outPath = resolve(REPO, 'packages', 'contracts', 'manifest.sha256');
  const subdir = 'packages/contracts';

  const files = gitLsFiles(subdir).filter((p) => {
    if (p.includes('node_modules/')) return false;
    if (p.includes('dist/')) return false;
    if (p.endsWith('.gitignore')) return false;
    return (
      p.endsWith('.ts') ||
      p.endsWith('.mjs') ||
      p.endsWith('.cjs') ||
      p.endsWith('.json') ||
      p.endsWith('.md')
    );
  });
  files.sort();

  let body =
    '# Raw-File-SHA256: 64-hex SHA-256 of the file raw bytes.\n' +
    '# Git-Blob-OID-SHA1: NOT stored in this manifest.\n' +
    '# Format: <Raw-File-SHA256>\\t<path>\n' +
    '# Excludes: node_modules/, dist/, manifest.sha256.\n\n';

  for (const f of files) {
    body += `${rawSha256(f)}  ${f}\n`;
  }
  writeFileSync(outPath, body, 'utf8');
  return { path: outPath, count: files.length };
}

// ─── Generate manifest for reconciliation/crm/CONTRACT-03A/r2 ───────────────────

function generateR2Manifest() {
  const outPath = resolve(
    REPO,
    'reconciliation',
    'crm',
    'CONTRACT-03A',
    'r2',
    'manifest.txt'
  );
  const dir = resolve(REPO, 'reconciliation', 'crm', 'CONTRACT-03A', 'r2');

  // List only our 4 tracked docs
  const files = ['README.md', 'AC-EVIDENCE.md', 'NOTES.md', 'I-01-CLOSURE.md'].map(
    (f) => `reconciliation/crm/CONTRACT-03A/r2/${f}`
  );

  let body =
    '# Raw-File-SHA256: 64-hex SHA-256 of the file raw bytes.\n' +
    '# Git-Blob-OID-SHA1: NOT stored in this manifest.\n' +
    '# Format: <Raw-File-SHA256>\\t<path>\n' +
    '# Excludes: manifest.txt itself.\n\n';

  for (const f of files) {
    body += `${rawSha256(f)}  ${f}\n`;
  }
  writeFileSync(outPath, body, 'utf8');
  return { path: outPath, count: files.length };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const verifyOnly = process.argv.includes('--verify');

if (verifyOnly) {
  console.log('=== --verify mode ===');
  console.log('Verifying manifest entries against committed blobs at HEAD.\n');

  const { ok: cOk, bad: cBad, errors: cErrors, total: cTotal } = verifyManifest(
    resolve(REPO, 'packages', 'contracts', 'manifest.sha256')
  );
  console.log(`packages/contracts/manifest.sha256: ${cOk}/${cTotal} MATCH, ${cBad} FAIL`);
  for (const e of cErrors) console.log('  ', e);

  const { ok: rOk, bad: rBad, errors: rErrors, total: rTotal } = verifyManifest(
    resolve(REPO, 'reconciliation', 'crm', 'CONTRACT-03A', 'r2', 'manifest.txt')
  );
  console.log(
    `reconciliation/crm/CONTRACT-03A/r2/manifest.txt: ${rOk}/${rTotal} MATCH, ${rBad} FAIL`
  );
  for (const e of rErrors) console.log('  ', e);

  const totalBad = cBad + rBad;
  if (totalBad > 0) {
    console.log(`\n=== VERIFY FAILED: ${totalBad} errors ===`);
    process.exit(1);
  } else {
    console.log('\n=== VERIFY PASSED: all entries match ===');
    process.exit(0);
  }
} else {
  const c = generateContractsManifest();
  const r = generateR2Manifest();

  console.log('Generated:');
  console.log(`  ${c.path} (${c.count} entries)`);
  console.log(`  ${r.path} (${r.count} entries)`);

  // Print the SHA-256 of each manifest file for handoff recording.
  const cSha = rawSha256('packages/contracts/manifest.sha256');
  const rSha = rawSha256('reconciliation/crm/CONTRACT-03A/r2/manifest.txt');
  console.log('\nManifest raw SHA-256 values (for handoff):');
  console.log(`  packages/contracts/manifest.sha256:     ${cSha}`);
  console.log(`  reconciliation/crm/CONTRACT-03A/r2/manifest.txt: ${rSha}`);
}
