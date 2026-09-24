# CONTRACT-03B.1 r2 Evidence Index

This directory contains the complete evidence bundle for the r2 additive
packaging candidate. It is recorded for T1-A handoff and T0 verification.

## Branch
codex/contract03b1-r2

## Commits (chronological)
- P2  (packaging source): b7505568957217184b225d99312066097c518fdc
- E2  (prior evidence bundle, now superseded): be733bd187a08804db175355dac049c7fd6e54cd
- E3  (evidence closure, current): this commit

## Final tarball identity
- Filename: hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz
- npm package name: @hrp-engagement/contracts
- npm version: 0.0.0-r2-candidate.0
- Size: 169360 bytes
- File count: 79
- SHA-256: b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc
- npm shasum: 4713b1ce639acdc070a9fa95f868bc08b99d0f9b
- Built from: clean checkout of P2 (commit b750556)
- Reproducibility: T0 independently rebuilt twice from P2-compatible inputs;
  both byte-identical to the values recorded above.

## Tarball supersedes
- Old r1 tarball SHA-256 (single-surface replacement): 7c394f74bfa16458bb67d414ff2373e27fb2fb934606a82b3f04e8127f0e87c0
- r1 was rejected because it removed the frozen CRM root exports. r2 restores
  the full CRM root and keeps the talent-context-read/v1 subpath additive.

## Files in this evidence directory
- README.md                       — this index
- BASELINE-PROVENANCE.md          — CRM baseline SHA + per-file raw SHA-256
- FULL-PACKAGE-ASSEMBLY.md        — additive assembly mechanism
- ROOT-EXPORT-PARITY.md           — baseline === candidate root export set
- PACKAGE-INVENTORY.md            — full tarball file inventory (79 files)
- TARBALL-EVIDENCE.md             — tarball identity, hash, reproducibility
- PRELIMINARY-CRM-MATRIX.md       — 6-consumer scratch build outcome
- AC-EVIDENCE.md                  — test counts and probes
- manifest.sha256                 — raw SHA-256 manifest (with header)
- manifest.txt                    — raw SHA-256 manifest (canonical body)

## Manifest format (all *.sha256 / manifest.txt in this dir)
- Raw SHA-256, 64 lowercase hex
- UTF-8 no BOM, LF line endings
- Repo-relative paths
- Read-only verify supported via: node packages/publish-candidate/scripts/generate-manifest.mjs --verify
- Excludes: manifest files themselves (no self-hash), node_modules/,
  dist/, *.tgz, machine paths

## Test count breakdown (precise)
- Frozen CRM tests (from baseline 7264335):       423 tests
- CONTRACT-03A tests (talent-context-read/v1):    288 tests
- Generator / manifest tests (publish-candidate):    2 tests
- Aggregate TAP total:                            713 tests
- Aggregate TAP suites:                            47 suites
  (the 47 suites are nested describes inside talent-context-read tests;
  frozen CRM and generator tests run at the top level and contribute 0
  suites to the TAP suite counter)
- All 713/713 PASS, 0 FAIL.
