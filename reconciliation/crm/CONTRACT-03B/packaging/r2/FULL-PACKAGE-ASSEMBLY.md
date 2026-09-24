# Full Package Assembly

## Invariant
FULL_CANDIDATE = PINNED_FROZEN_ROOT_FROM_CRM_BASELINE + ACCEPTED_TALENT_CONTEXT_SUBPATH

## Inputs (committed in neutral repo)
1. packages/crm-frozen-root/ -- byte-exact copy of CRM packages/contracts/
   at commit 72643356a0d1355f9dccc3921b47c990ea9c31c1. 56 files
   (33 src modules + 22 tests + tsconfig + package.json + fixtures).
   Pinned by BASELINE-MANIFEST.sha256.

2. packages/contracts/src/talent-context-read/ -- the accepted CONTRACT-03A
   module (committed in this neutral repo at the same location used during
   CONTRACT-03A development).

3. packages/contracts/tests/talent-context-read/ -- the test suite for the
   new module.

## Assembly mechanism
Committed, reproducible, single command:
    node packages/publish-candidate/scripts/assemble.mjs

The script:
1. Verifies packages/crm-frozen-root/BASELINE-MANIFEST.sha256 byte-exact.
2. Cleans packages/publish-candidate/src/ and tests/.
3. Copies CRM frozen source -> packages/publish-candidate/src/ (flattened,
   no frozen/ subdir, so dist/index.js is the package's root).
4. Copies the new module -> packages/publish-candidate/src/talent-context-read/.
5. Copies frozen CRM tests -> packages/publish-candidate/tests/ (flattened).
6. Copies new module tests -> packages/publish-candidate/tests/talent-context-read/,
   rewrites from '../../dist/<x>' to from '../../dist/talent-context-read/<x>'
   so each test targets its subpath surface.
7. Copies test fixtures (tests/fixtures/).
8. Writes tests/generator/pc-generator-manifest.test.mjs (a publish-candidate
   variant of the generator test).
9. Asserts no duplicate output paths, no talent-context name leaking into root,
   no baseline module loss.

## Determinism
- All input files are pinned by SHA-256 (frozen root) and git-tree (new module).
- Output is byte-exact: same inputs -> same hashes, same tarball.
- No dist/, node_modules/, network fetch, hidden cache, or absolute paths
  used in the assembly pipeline.
- T0 reproduced the tarball twice from P2-compatible inputs, both runs
  byte-identical to the recorded identity (see TARBALL-EVIDENCE.md).

## Build
After assemble, the package builds with one command:
    npm --prefix packages/publish-candidate run build

This runs tsc against tsconfig.json (strict: true; skipLibCheck: true;
noUncheckedIndexedAccess: false; exactOptionalPropertyTypes: false), producing
packages/publish-candidate/dist/:
- dist/index.{js,d.ts} -- root surface, identical names to CRM baseline
- dist/commands/*.js -- frozen root command modules
- dist/talent-context-read/{index,assertion,conformance,delegation,primitives,
  query-errors,query-parser,query-types,redaction}.{js,d.ts} -- new subpath

## Tarball
    npm --prefix packages/publish-candidate pack --pack-destination=.

Produces hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz.
Final identity: 169360 bytes, SHA-256
b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc,
npm shasum 4713b1ce639acdc070a9fa95f868bc08b99d0f9b, 79 files.

## Failure detection
The assemble step fails (exit code 1) if any of:
- Baseline SHA-256 drift on any frozen file
- Duplicate output paths
- Missing baseline modules
- Talent-context names appearing in root
- Subpath collision

## What this assembly does NOT do
- Does not modify any CRM consumer
- Does not publish, tag, or release
- Does not promote ACCEPTED_SHARED
- Does not implement runtime, deploy, or run the system
