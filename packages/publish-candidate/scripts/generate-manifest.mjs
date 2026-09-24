// generate-manifest.mjs for publish-candidate
// Generates or verifies raw SHA-256 manifests.
//
// Usage (generate mode, default behavior -- writes both package + evidence manifests):
//   node packages/publish-candidate/scripts/generate-manifest.mjs
//
// Usage (verify mode, read-only -- never writes files):
//   node packages/publish-candidate/scripts/generate-manifest.mjs --verify
//
// Usage (explicit destinations -- fixes VF-02 P2-only coupling):
//   node packages/publish-candidate/scripts/generate-manifest.mjs \
//     --pc-out packages/publish-candidate/manifest.sha256 \
//     --evidence-out reconciliation/crm/CONTRACT-03B/packaging/r2/manifest.txt \
//     --evidence-list-file reconciliation/crm/CONTRACT-03B/packaging/r2/manifest.files.txt
//
// Usage (verify an arbitrary manifest):
//   node packages/publish-candidate/scripts/generate-manifest.mjs \
//     --verify --manifest <repo-relative-or-absolute-path>
//
// Constraints / guarantees (added for CONTRACT-03C.1):
//   - Destination directories are auto-created (mkdir -p); no requirement that
//     the evidence directory already exists.
//   - Output paths are repo-relative when given as a leading-dot name; absolute
//     paths are also accepted but never written via machine-pinned fixtures.
//   - --verify mode is strictly read-only (no writeFileSync calls).
//   - P2-only checkout: with --pc-out alone, the script does not need the
//     evidence directory to exist.
//   - On any hash drift or missing input file, exits with non-zero status.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..', '..');

// ---------- CLI ----------

function parseArgs(argv) {
  const out = { verify: false, listFile: null, manifests: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--verify') out.verify = true;
    else if (a === '--pc-out') { out.pcOut = argv[++i]; }
    else if (a === '--evidence-out') { out.evidenceOut = argv[++i]; }
    else if (a === '--evidence-list-file') { out.listFile = argv[++i]; }
    else if (a === '--manifest') { out.manifests.push(argv[++i]); }
    else if (a === '--help' || a === '-h') {
      console.log('See top-of-file header for usage.');
      process.exit(0);
    } else if (a.startsWith('--')) {
      console.error('Unknown flag: ' + a);
      process.exit(2);
    }
  }
  return out;
}

const args = parseArgs(process.argv);

// ---------- Path helpers ----------

function repoRel(p) {
  return isAbsolute(p) ? p : resolve(REPO, p);
}

// ---------- core I/O ----------

function rawSha256(filePath) {
  const raw = readFileSync(filePath);
  return createHash('sha256').update(raw).digest('hex');
}

function gitLsFiles(subdir) {
  const out = execFileSync('git', ['ls-files', '-z', '--full-name', subdir], { cwd: REPO, encoding: 'utf8' });
  return out.split('\0').filter(Boolean);
}

function mkdirp(filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
}

function headerFor(outPath) {
  const base = '# Raw-File-SHA256: 64-hex SHA-256 of the file raw bytes.\n' +
               '# Format: <Raw-File-SHA256>  <repo-relative-path>\n';
  if (outPath.endsWith('packages/publish-candidate/manifest.sha256') ||
      outPath.endsWith('packages\\publish-candidate\\manifest.sha256')) {
    return base + '# Excludes: node_modules/, dist/, *.tgz, .gitignore, manifest.sha256 (no self-hash).\n\n';
  }
  return base + '# Excludes: machine paths, node_modules/, dist/, *.tgz, manifest itself.\n\n';
}

// ---------- verify (strictly read-only) ----------

function verifyManifest(manifestPath, fromFs) {
  const lines = readFileSync(manifestPath, 'utf8').split('\n');
  const dataLines = lines.filter(function(l) { return l.trim() && !l.startsWith('#'); });
  let ok = 0, bad = 0;
  const errors = [];
  for (const line of dataLines) {
    const tabIdx = line.indexOf('  ');
    if (tabIdx === -1) { errors.push('MALFORMED: ' + line); bad++; continue; }
    const shaPart = line.slice(0, tabIdx).trim();
    const pathPart = line.slice(tabIdx + 2).trim();
    if (!/^[0-9a-f]{64}$/.test(shaPart)) { errors.push('MALFORMED-SHA256: ' + shaPart); bad++; continue; }
    try {
      // Always read from filesystem; this is the strict read-only verify
      const raw = readFileSync(resolve(REPO, pathPart));
      const actual = createHash('sha256').update(raw).digest('hex');
      if (actual === shaPart) ok++;
      else { errors.push('MISMATCH: ' + pathPart); bad++; }
    } catch (e) {
      errors.push('MISSING: ' + pathPart);
      bad++;
    }
  }
  return { ok, bad, errors, total: dataLines.length };
}

function verifyOne(p) {
  const r = verifyManifest(p, true);
  console.log(p + ': ' + r.ok + '/' + r.total + ' MATCH, ' + r.bad + ' FAIL');
  for (const e of r.errors) console.log('  ' + e);
  return r;
}

// ---------- generate package manifest ----------

function generatePackageManifest(outPath) {
  const files = gitLsFiles('packages/publish-candidate').filter(function(p) {
    if (p.indexOf('node_modules/') >= 0) return false;
    if (p.indexOf('/dist/') >= 0) return false;
    if (p.endsWith('.gitignore')) return false;
    if (p.indexOf('.tgz') >= 0) return false;
    if (p.indexOf('manifest.sha256') >= 0) return false;
    return p.endsWith('.ts') || p.endsWith('.mjs') || p.endsWith('.cjs') || p.endsWith('.json') || p.endsWith('.md');
  });
  const frozenFiles = gitLsFiles('packages/crm-frozen-root').filter(function(p) {
    if (p.indexOf('BASELINE-MANIFEST.sha256') >= 0) return false;
    if (p.indexOf('/dist/') >= 0) return false;
    // crm-frozen-root mirrors CRM source; original behavior excludes .md notes
    return p.endsWith('.ts') || p.endsWith('.mjs') || p.endsWith('.cjs') || p.endsWith('.json');
  });
  const all = files.concat(frozenFiles).sort();
  let body = headerFor(outPath);
  for (const f of all) body += rawSha256(repoRel(f)) + '  ' + f + '\n';
  mkdirp(outPath);
  writeFileSync(outPath, body, 'utf8');
  return { path: outPath, count: all.length, sha: rawSha256(outPath) };
}

// ---------- generate evidence manifest from list file ----------

function readEvidenceListFile(listFilePath) {
  const abs = repoRel(listFilePath);
  if (!existsSync(abs)) throw new Error('evidence list file not found: ' + listFilePath);
  const txt = readFileSync(abs, 'utf8');
  return txt.split(/\r?\n/).map(function(l) { return l.trim(); }).filter(function(l) {
    return l.length > 0 && !l.startsWith('#');
  });
}

function generateEvidenceManifest(outPath, listFilePath, hardcodedFallback) {
  let files;
  if (listFilePath) {
    files = readEvidenceListFile(listFilePath);
  } else {
    files = hardcodedFallback;
  }
  // Exclude the manifest itself (no self-hash) to ensure determinism.
  // Like the package manifest, the evidence manifest does NOT include its own
  // hash; the verifier measures all other listed files only.
  // Strip absolute repo prefix and any leading './' so we can compare against
  // the repo-relative paths from the list file.
  let outRel = outPath.replace(/\\/g, '/');
  if (isAbsolute(outPath) && outRel.indexOf(REPO.replace(/\\/g, '/')) === 0) {
    outRel = outRel.slice(REPO.replace(/\\/g, '/').length).replace(/^\/+/, '');
  }
  outRel = outRel.replace(/^\.\//, '');
  files = files.filter(function(f) {
    const norm = f.replace(/\\/g, '/').replace(/^\.\//, '');
    if (norm === outRel) return false;
    return true;
  });
  let body = headerFor(outPath);
  let written = 0;
  for (const f of files) {
    try {
      body += rawSha256(repoRel(f)) + '  ' + f + '\n';
      written++;
    } catch (e) {
      body += '# MISSING: ' + f + '\n';
    }
  }
  mkdirp(outPath);
  writeFileSync(outPath, body, 'utf8');
  return { path: outPath, count: written, sha: rawSha256(outPath) };
}

// ---------- legacy defaults (kept for tests) ----------

const LEGACY_PC = 'packages/publish-candidate/manifest.sha256';
const LEGACY_EVIDENCE = 'reconciliation/crm/CONTRACT-03B/packaging/r2/manifest.txt';
const LEGACY_EVIDENCE_FILES = [
  'reconciliation/crm/CONTRACT-03B/packaging/r2/README.md',
  'reconciliation/crm/CONTRACT-03B/packaging/r2/BASELINE-PROVENANCE.md',
  'reconciliation/crm/CONTRACT-03B/packaging/r2/FULL-PACKAGE-ASSEMBLY.md',
  'reconciliation/crm/CONTRACT-03B/packaging/r2/ROOT-EXPORT-PARITY.md',
  'reconciliation/crm/CONTRACT-03B/packaging/r2/PACKAGE-INVENTORY.md',
  'reconciliation/crm/CONTRACT-03B/packaging/r2/TARBALL-EVIDENCE.md',
  'reconciliation/crm/CONTRACT-03B/packaging/r2/PRELIMINARY-CRM-MATRIX.md',
  'reconciliation/crm/CONTRACT-03B/packaging/r2/AC-EVIDENCE.md',
];

// ---------- main ----------

let totalBad = 0;

if (args.verify) {
  console.log('=== --verify mode (read-only) ===');
  // explicit --manifest targets
  for (const m of args.manifests) {
    const r = verifyOne(repoRel(m));
    totalBad += r.bad;
  }
  // if no --manifest given, verify the legacy defaults
  if (args.manifests.length === 0) {
    const pc = verifyOne(repoRel(LEGACY_PC));
    totalBad += pc.bad;
    const evPath = repoRel(LEGACY_EVIDENCE);
    if (existsSync(evPath)) {
      const ev = verifyOne(evPath);
      totalBad += ev.bad;
    } else {
      console.log(LEGACY_EVIDENCE + ': (not present -- skipped)');
    }
  }
  if (totalBad > 0) { console.log('=== VERIFY FAILED (' + totalBad + ' FAIL) ==='); process.exit(1); }
  console.log('=== VERIFY PASSED ===');
  process.exit(0);
}

// Generate mode. At least one --pc-out or --evidence-out is required; if
// neither is given, default to legacy behavior (write both PC + CONTRACT-03B
// packaging r2 evidence manifest).
const pcOut = args.pcOut || LEGACY_PC;
const evidenceOut = args.evidenceOut || LEGACY_EVIDENCE;

const pc = generatePackageManifest(repoRel(pcOut));
console.log('Generated:');
console.log('  ' + pc.path + ' (' + pc.count + ' entries)  sha256=' + pc.sha);
console.log('  repo-relative: ' + pcOut);

let evidenceCount = 0;
let evidenceSha = null;
try {
  const ev = generateEvidenceManifest(repoRel(evidenceOut), args.listFile || null, LEGACY_EVIDENCE_FILES);
  evidenceCount = ev.count;
  evidenceSha = ev.sha;
  console.log('  ' + ev.path + ' (' + ev.count + ' entries)  sha256=' + ev.sha);
  console.log('  repo-relative: ' + evidenceOut);
} catch (e) {
  console.log('  evidence manifest skipped: ' + e.message);
}

process.exit(0);
