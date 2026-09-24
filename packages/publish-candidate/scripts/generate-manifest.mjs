// generate-manifest.mjs for publish-candidate
// Generates SHA-256 manifests for:
//   1. packages/publish-candidate/manifest.sha256  (source files in publish-candidate)
//   2. reconciliation/crm/CONTRACT-03B/packaging/r2/manifest.txt  (evidence bundle)
//
// Usage (generate):
//   node packages/publish-candidate/scripts/generate-manifest.mjs
//
// Usage (verify):
//   node packages/publish-candidate/scripts/generate-manifest.mjs --verify

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..", "..", "..");

function rawSha256(filePath) {
  const raw = readFileSync(resolve(REPO, filePath));
  return createHash("sha256").update(raw).digest("hex");
}

function gitLsFiles(subdir) {
  const out = execFileSync("git", ["ls-files", "-z", "--full-name", subdir], { cwd: REPO, encoding: "utf8" });
  return out.split("\0").filter(Boolean);
}

function verifyManifest(manifestPath, opts) {
  opts = opts || {};
  const fromFs = opts.fromFilesystem || false;
  const blobSource = (function() {
    try { return execFileSync("git", ["rev-parse", "HEAD"], { cwd: REPO, encoding: "utf8" }).trim(); }
    catch (e) { return null; }
  })();
  const lines = readFileSync(manifestPath, "utf8").split("\n");
  const dataLines = lines.filter(function(l) { return l.trim() && !l.startsWith("#"); });
  let ok = 0, bad = 0;
  const errors = [];
  for (const line of dataLines) {
    const tabIdx = line.indexOf("  ");
    if (tabIdx === -1) { errors.push("MALFORMED: " + line); bad++; continue; }
    const shaPart = line.slice(0, tabIdx).trim();
    const pathPart = line.slice(tabIdx + 2).trim();
    if (!/^[0-9a-f]{64}$/.test(shaPart)) { errors.push("MALFORMED-SHA256: " + shaPart); bad++; continue; }
    try {
      const raw = fromFs
        ? readFileSync(resolve(REPO, pathPart))
        : execFileSync("git", ["show", blobSource + ":" + pathPart], { cwd: REPO });
      const actual = createHash("sha256").update(raw).digest("hex");
      if (actual === shaPart) ok++;
      else { errors.push("MISMATCH: " + pathPart); bad++; }
    } catch (e) { errors.push("MISSING: " + pathPart); bad++; }
  }
  return { ok: ok, bad: bad, errors: errors, total: dataLines.length };
}

function generatePackageManifest() {
  const outPath = resolve(REPO, "packages", "publish-candidate", "manifest.sha256");
  const files = gitLsFiles("packages/publish-candidate").filter(function(p) {
    if (p.indexOf("node_modules/") >= 0) return false;
    if (p.indexOf("/dist/") >= 0) return false;
    if (p.endsWith(".gitignore")) return false;
    if (p.indexOf(".tgz") >= 0) return false;
    if (p === "packages/publish-candidate/manifest.sha256") return false;
    return p.endsWith(".ts") || p.endsWith(".mjs") || p.endsWith(".cjs") || p.endsWith(".json") || p.endsWith(".md");
  });
  const frozenFiles = gitLsFiles("packages/crm-frozen-root").filter(function(p) {
    if (p.indexOf("BASELINE-MANIFEST.sha256") >= 0) return false;
    return p.endsWith(".ts") || p.endsWith(".mjs") || p.endsWith(".json");
  });
  const all = files.concat(frozenFiles).sort();
  let body = "# Raw-File-SHA256: 64-hex SHA-256 of the file raw bytes.\n# Format: <Raw-File-SHA256>  <path>\n# Excludes: node_modules/, dist/, *.tgz, .gitignore.\n\n";
  for (const f of all) body += rawSha256(f) + "  " + f + "\n";
  writeFileSync(outPath, body, "utf8");
  return { path: outPath, count: all.length };
}

function generateEvidenceManifest() {
  const outPath = resolve(REPO, "reconciliation", "crm", "CONTRACT-03B", "packaging", "r2", "manifest.txt");
  const evidenceFiles = [
    "reconciliation/crm/CONTRACT-03B/packaging/r2/README.md",
    "reconciliation/crm/CONTRACT-03B/packaging/r2/BASELINE-PROVENANCE.md",
    "reconciliation/crm/CONTRACT-03B/packaging/r2/FULL-PACKAGE-ASSEMBLY.md",
    "reconciliation/crm/CONTRACT-03B/packaging/r2/ROOT-EXPORT-PARITY.md",
    "reconciliation/crm/CONTRACT-03B/packaging/r2/PACKAGE-INVENTORY.md",
    "reconciliation/crm/CONTRACT-03B/packaging/r2/TARBALL-EVIDENCE.md",
    "reconciliation/crm/CONTRACT-03B/packaging/r2/PRELIMINARY-CRM-MATRIX.md",
    "reconciliation/crm/CONTRACT-03B/packaging/r2/AC-EVIDENCE.md",
  ];
  let body = "# Raw-File-SHA256: 64-hex SHA-256 of the file raw bytes.\n# Format: <Raw-File-SHA256>  <path>\n# Excludes: manifest.txt itself.\n\n";
  for (const f of evidenceFiles) {
    try { body += rawSha256(f) + "  " + f + "\n"; } catch (e) { /* skip */ }
  }
  writeFileSync(outPath, body, "utf8");
  return { path: outPath, count: evidenceFiles.length };
}

const verifyOnly = process.argv.includes("--verify");

if (verifyOnly) {
  console.log("=== --verify mode ===");
  const c = verifyManifest(resolve(REPO, "packages", "publish-candidate", "manifest.sha256"), { fromFilesystem: true });
  console.log("packages/publish-candidate/manifest.sha256: " + c.ok + "/" + c.total + " MATCH, " + c.bad + " FAIL");
  for (const e of c.errors) console.log("  " + e);
  const evPath = resolve(REPO, "reconciliation", "crm", "CONTRACT-03B", "packaging", "r2", "manifest.txt");
  if (readFileSync(evPath, "utf8").trim()) {
    const r = verifyManifest(evPath, { fromFilesystem: true });
    console.log("CONTRACT-03B/packaging/r2/manifest.txt: " + r.ok + "/" + r.total + " MATCH, " + r.bad + " FAIL");
    for (const e of r.errors) console.log("  " + e);
    if (c.bad + r.bad > 0) { console.log("=== VERIFY FAILED ==="); process.exit(1); }
  }
  if (c.bad > 0) process.exit(1);
  console.log("=== VERIFY PASSED ===");
} else {
  const c = generatePackageManifest();
  const r = generateEvidenceManifest();
  console.log("Generated:");
  console.log("  " + c.path + " (" + c.count + " entries)");
  console.log("  " + r.path + " (" + r.count + " entries)");
  console.log("Manifest SHAs:");
  console.log("  packages/publish-candidate/manifest.sha256:       " + rawSha256(c.path));
  console.log("  CONTRACT-03B/packaging/r2/manifest.txt: " + rawSha256(r.path));
}
