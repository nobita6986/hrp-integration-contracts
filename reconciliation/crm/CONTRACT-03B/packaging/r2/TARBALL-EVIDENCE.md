# Tarball Evidence

## Identity
- Filename: hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz
- Candidate npm version: 0.0.0-r2-candidate.0
- Byte size: 169360 bytes (169.4 kB packed / 1.2 MB unpacked)
- File count: 79
- SHA-256: b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc
- npm shasum (sha1): 4713b1ce639acdc070a9fa95f868bc08b99d0f9b
- npm integrity: sha512-+27AdjodOKTVc[...]I9ZkvEND06HFw==

## Supersedes
- Old r1 tarball SHA-256: 7c394f74bfa16458bb67d414ff2373e27fb2fb934606a82b3f04e8127f0e87c0
- Old r1 was a single-surface replacement (root only had talent-context);
  r2 restores the full CRM root and keeps the talent-context subpath additive.

## Reproducibility
Built from clean checkout of P2 (commit b750556) using three committed scripts:
1. node packages/publish-candidate/scripts/verify-baseline.mjs
2. node packages/publish-candidate/scripts/assemble.mjs
3. npm --prefix packages/publish-candidate run build
4. npm --prefix packages/publish-candidate pack --pack-destination=.

Each step is deterministic given:
- Pinned CRM baseline (SHA + per-file raw SHA-256)
- Pinned new module (committed git tree in packages/contracts/)
- No network fetch, no absolute paths, no uncommitted dist/

## Reproduction log (this evidence build)
verify-baseline: 56 OK, 0 bad (of 56)
assemble: src/ has 39 files, tests/ has 35 files
tsc: build succeeded
npm pack: 79 files, 169.4 kB
SHA-256: b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc
npm shasum: 4713b1ce639acdc070a9fa95f868bc08b99d0f9b

## Independent reproduction (T0 verification)
T0 independently rebuilt the tarball twice from P2-compatible inputs.
Both runs were byte-identical to the values recorded above.

## Root export comparison
- Baseline root: 379 named exports
- Candidate root: 379 named exports
- Names identical (sorted-set comparison)
- Behavior identical (same Zod schemas / same factories / same constants)

## Subpath export
- Candidate subpath ./talent-context-read/v1: 83 named exports
- Maps to dist/talent-context-read/index.js (and index.d.ts)
- Includes 9 internal modules (assertion, conformance, delegation,
  primitives, query-errors, query-parser, query-types, redaction,
  index re-exports them all)

## Build hygiene
- dist/ is rebuilt each run from src/
- dist/ is gitignored and never committed
- Tarball only contains dist/, package.json, README.md, CHANGELOG.md,
  LICENSE
- No source maps, declaration maps, or dev artifacts leak into the package

## Files NOT in the tarball (verified by npm pack --dry-run)
- src/ (all .ts files)
- tests/ (all test files)
- scripts/ (assemble, build, manifest)
- node_modules/
- .gitignore
- package-lock.json
- BASELINE-MANIFEST.sha256 (this is committed in the neutral repo for
  provenance, but the consumer does not need it)
- manifest.sha256 (neutral-repo internal artifact)

The consumer sees only:
1. root imports working as CRM baseline
2. subpath working for talent-context-read
3. nothing else
