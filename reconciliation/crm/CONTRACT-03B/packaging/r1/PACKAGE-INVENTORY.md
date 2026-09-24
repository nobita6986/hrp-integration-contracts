# CONTRACT-03B.1 - Package inventory

## Source files (not packaged)

These live under packages/contracts/ and are NOT copied into the tarball.
The packaging candidate consumes only their compiled output from
packages/contracts/dist/.

| File | Role |
|------|------|
| packages/contracts/src/talent-context-read/*.ts | source (Zod schemas, validators, parsers) |
| packages/contracts/src/index.ts | re-export barrel (dev-harness only) |
| packages/contracts/tests/**/*.test.mjs | tests |
| packages/contracts/scripts/generate-manifest.mjs | manifest tool |
| packages/contracts/manifest.sha256 | source manifest |
| packages/contracts/tsconfig.json | TS config |

## Packaged files (20 files, 131.9 kB unpacked, 28.6 kB tarball)

From npm pack --dry-run and npm pack outputs:

| Path | Bytes |
|------|-------|
| README.md | 5056 |
| package.json | 1022 |
| dist/talent-context-read/index.js | 909 |
| dist/talent-context-read/index.d.ts | 268 |
| dist/talent-context-read/assertion.js | 34505 |
| dist/talent-context-read/assertion.d.ts | 8693 |
| dist/talent-context-read/conformance.js | 4012 |
| dist/talent-context-read/conformance.d.ts | 1343 |
| dist/talent-context-read/delegation.js | 10428 |
| dist/talent-context-read/delegation.d.ts | 15994 |
| dist/talent-context-read/primitives.js | 11914 |
| dist/talent-context-read/primitives.d.ts | 3950 |
| dist/talent-context-read/query-errors.js | 2929 |
| dist/talent-context-read/query-errors.d.ts | 5210 |
| dist/talent-context-read/query-parser.js | 2188 |
| dist/talent-context-read/query-parser.d.ts | 1701 |
| dist/talent-context-read/query-types.js | 4288 |
| dist/talent-context-read/query-types.d.ts | 9333 |
| dist/talent-context-read/redaction.js | 6973 |
| dist/talent-context-read/redaction.d.ts | 1285 |

Total: 20 files. No node_modules/, no tests, no .git/,
no machine paths, no logs, no source TS files, no hidden configs.

## Inventory check (npm pack --dry-run)

- npm notice package: @hrp-engagement/contracts@0.0.0-candidate.0
- npm notice total files: 20
- npm notice filename: hrp-engagement-contracts-0.0.0-candidate.0.tgz
- npm notice package size: 28.6 kB
- npm notice unpacked size: 131.9 kB
- npm notice shasum: 3523ec849cd3262485641644a988eb5ee9aaffa9  (npm-registry shasum, not the canonical SHA-256 of the tarball file)

Verification checklist (per Scope C):
- [x] no node_modules
- [x] no tests/evidence
- [x] no secrets / logs / machine paths
- [x] no accidental source/build artifacts beyond declared files
- [x] only declared files (dist/talent-context-read, README.md) and package.json end up in the tarball

## Files excluded from the candidate package on purpose

- packages/publish-candidate/scripts/copy-from-harness.mjs (build-time helper)
- packages/publish-candidate/.gitignore (dev-only)
- All source TypeScript files
- All test files (*.test.mjs, fixtures)
- manifest.sha256, NOTES.md, AC-EVIDENCE.md
