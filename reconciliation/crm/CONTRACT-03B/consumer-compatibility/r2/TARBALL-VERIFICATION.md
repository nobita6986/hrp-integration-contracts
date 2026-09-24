# Phase 1 - Tarball Verification

## Command sequence run in fresh P2 checkout
1. `git checkout b7505568957217184b225d99312066097c518fdc`
2. `core.autocrlf=true` enforced (per-repo config; required for readFileSync
   SHA to match committed manifest - see Limitations note on encoding)
3. `node packages/publish-candidate/scripts/verify-baseline.mjs`
   -> `baseline verify: 56 OK, 0 bad (of 56)`
4. `node packages/publish-candidate/scripts/assemble.mjs`
   -> `src/ has 39 files, tests/ has 35 files; assemble: done`
5. `npm --prefix packages/contracts ci && npm --prefix packages/contracts run build`
6. `npm --prefix packages/crm-frozen-root install && npm --prefix packages/crm-frozen-root run build`
7. `npm --prefix packages/publish-candidate ci && npm --prefix packages/publish-candidate run build`
8. `npm test` (publish-candidate) - tests 713, pass 713, fail 0 (47 suites)
9. `npm --prefix packages/publish-candidate pack --pack-destination=.`

## Tarball identity (after rebuild)
- Filename: hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz
- Size: 169360 bytes
- SHA-256: b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc
- npm shasum: 4713b1ce639acdc070a9fa95f868bc08b99d0f9b
- File count: 79

All fields match the brief exactly. Computed locally:

- SHA-256 (Get-FileHash): b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc
- Size (Get-Item.Length): 169360
- Unpacked file count: 79

## Committed manifest verification (N/N match)

### packages/publish-candidate/manifest.sha256
- Canonical SHA-256 (after UTF-16 BOM strip, keep CRLF): 8e457ba308ab60e75bd378f25e367cb0bc5265b411a4feaaa1f87264bf4b4619
- 136 entries / 136 match filesystem SHA-256 (after core.autocrlf=true checkout)
- NOTE: this file is committed with UTF-16 LE BOM + CRLF on disk; the
  committed manifest-format convention strips BOM and re-hashes UTF-8 (keeps
  CRLF). T1-A verified both forms and matched the brief recorded value.

### reconciliation/crm/CONTRACT-03B/packaging/r2/manifest.txt
- SHA-256: cd76385b95695fed3c32b05e18d869f3313d03f34f9b7618ef7a4b00ca536f1d
- 8 entries / 8 match filesystem SHA-256

## Reproducibility claim
- T0 independently rebuilt the tarball twice from P2-compatible inputs and
  observed byte-identical output (per the r2 TARBALL-EVIDENCE.md).
- This T1-A run reproduces the build on a fresh checkout of P2 and produces
  a byte-for-byte match to the brief recorded identity.