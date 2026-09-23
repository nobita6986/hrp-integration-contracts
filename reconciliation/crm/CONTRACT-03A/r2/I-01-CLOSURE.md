# CONTRACT-03A - I-01 closure (manifest integrity)

Producer recheck on MSG-031 verified 9/9 bundle entries (HRP-CRM-MSG-032
on commit `c8786c0fa2a2569cd26f0654d34978a4f8d397f9`,
manifest hash `eb1cad2bba200858edcb68e5a560606ae776471aa788c77eadd95d33600d88a5`).

I-01 was closed in batch 2 (`34d2cfc`) with respect to *coverage*, but
the producer recheck surfaced 4 manifest-tooling findings in MSG-032:
1. Manifest entries used Git blob SHA-1 OIDs (40 hex) labeled as SHA-256.
2. Generator script was UTF-16LE with null bytes (failed `node ...`).
3. Generator used `git hash-object`, not raw file SHA-256.
4. The handoff values `8c39e028...` and `89efd868...` were Git blob
   OIDs (SHA-1), not SHA-256 of the manifest.

Batch 3 closes these findings. The new batch is tooling + docs only;
source/schema F-01..F-06 are not reopened.

## Manifest hashes (committed blobs at HEAD)

Format is `Raw-File-SHA256  <path>`, where the SHA-256 is computed by
`Node crypto.createHash('sha256').update(rawFileBytes).digest('hex')`
of the file's raw bytes in the FINAL committed manifest, not the
git blob OID.

- `packages/contracts/manifest.sha256`:
  Raw-File-SHA256: `b9c0505c4a7625fe66e68f18361159edaadfebfe98c237fef19a7961865cdc76`.
  23 entries. Verified 23/23 MATCH against the committed file raw bytes.
- `reconciliation/crm/CONTRACT-03A/r2/manifest.txt` (covered by `packages/contracts/manifest.sha256` line 24; computed by the same generator; verify via `node packages/contracts/scripts/generate-manifest.mjs --verify`). 4 entries. Verified 4/4 MATCH against the committed file raw bytes.

Total covered entries: **27 files** (23 in packages + 4 in r2 docs).

The previously reported handoff values `8c39e028a8bea57391e468df2ab8b753db2f464e`
and any `89efd868...` reference were **Git blob OID SHA-1 (40 hex)**, NOT
SHA-256. They are no longer labeled SHA-256 anywhere in this batch.

## Generator is now portable + correct

`packages/contracts/scripts/generate-manifest.mjs` is now:

- UTF-8 no BOM, LF, zero null bytes (`node <script>` succeeds without
  SyntaxError).
- Uses `Node crypto.createHash('sha256')` on the raw file bytes, not
  `git hash-object`.
- Each entry is exactly `<64 lowercase hex>  <repo-relative path>`
  (two ASCII spaces separator).
- Excludes `node_modules/`, `dist/`, `.gitignore`, and the manifest
  itself (no self-hash).
- Computes two manifests in one invocation:
  - `packages/contracts/manifest.sha256` (23 entries).
  - `reconciliation/crm/CONTRACT-03A/r2/manifest.txt` (4 entries).
- Adds a read-only `--verify` mode:
  - Does not write any manifest.
  - Exits non-zero on missing file, mismatch, malformed SHA (not 64
    lowercase hex), or any non-64-hex line.
  - Prints `N/N MATCH` and the failing paths.

## Generator test (`packages/contracts/tests/generator/generator-manifest.test.mjs`)

Eight assertions executed by Node directly (no build step required):

1. Executable by Node (`node scripts/generate-manifest.mjs` exits 0).
2. Generator file is UTF-8 / LF / no BOM / no null bytes.
3. `--verify` exits non-zero on tampered data line.
4. `--verify` does not change file bytes (before/after raw SHA-256).
5. Manifest covers `assertion.ts` and `conformance.ts`.
6. Manifest covers all batch-2 test files
   (`assertion-validators.test.mjs`, `conformance-helper.test.mjs`,
   `redaction-probes.test.mjs`, `redaction-vectors.fixtures.json`).
7. Every entry is exactly 64 lowercase hex.
8. Every entry verifies against the actual raw SHA-256 of the file.

All 8 generator tests pass under `npm test` in this batch.

## Clean-checkout gate (verified out-of-tree)

```
$ cd C:/clean-test  # fresh worktree pinned to <batch3 commit>
$ npm ci            # exit 0
$ npm run build     # exit 0 (tsc -p tsconfig.json)
$ npm test          # exit 0, 45 suites, 245 tests, 0 fail
```

(The +1 suite and +1 test are the new generator test.)

Tests do not depend on any machine-specific path:
`packages/contracts/tests/talent-context-read/conformance-helper.test.mjs`
loads the pinned vectors via `node:fs` + `node:url` only
(`fixturePath = resolve(here, '..', 'fixtures', ...)`).

## I-01 AC mapping

| AC | Evidence |
| --- | --- |
| Manifest regenerated from raw bytes of final immutable commit | `crypto.createHash('sha256').update(rawBytes)`; produced by `scripts/generate-manifest.mjs` |
| Coverage of all source/tests/build config/docs of delivery | 23 entries in `packages/contracts/manifest.sha256`; 4 entries in r2 manifest |
| 100% entries MATCH | 23/23 + 4/4 verified by `node scripts/generate-manifest.mjs --verify` (raw byte SHA-256) |
| Clean-checkout tests do not depend on personal machine paths | verified in a fresh worktree at `C:/clean-test` with 245/245 pass |
| Generator is UTF-8/LF/no-BOM/no-null, executable by Node | `packages/contracts/tests/generator/generator-manifest.test.mjs` (T1, T2) |
| Generator `--verify` exits non-zero on tamper / malformed / missing | `generator-manifest.test.mjs` (T3, T7) |
| Generator `--verify` preserves bytes | `generator-manifest.test.mjs` (T4) |
| Generator manifest coverage includes assertion.ts, conformance.ts, batch-2 tests | `generator-manifest.test.mjs` (T5, T6) |
| Each entry is exactly 64 lowercase hex | `generator-manifest.test.mjs` (T7) |
| Each entry matches raw file SHA-256 | `generator-manifest.test.mjs` (T8) |
| Handoff values clearly labeled as Raw-File-SHA256 (not Git-Blob-OID-SHA1) | this document + README.md + AC-EVIDENCE.md + NOTES.md |

## Verdict

I-01: CHANGES_REQUIRED -> CLOSED.

F-01, F-03, F-04, F-05, F-06 disposition is unchanged from batch 2
(`34d2cfc`); this batch only modifies the manifest tooling and the
documentation describing it. No source/schema delta under F-01..F-06
in this batch.

Status: READY_FOR_PRODUCER_RECHECK_AND_INDEPENDENT_DELTA_AUDIT.

---

## Batch 4 closure confirmation

- Final correction commit: 39885326a7957414e546e5245ae58faaeb993f69 (source/schema) + 2b794232b76ddcdde6f1862f8cae8ae7c59b50e4 (docs/manifest)
- Branch: codex/contract03a-schema-conformance

### Generator integrity

- UTF-8 no BOM, LF, executable by Node.
- Node crypto.createHash(sha256) on raw file bytes.
- 64 lowercase hex + 2 spaces + repo-relative path per entry.
- --verify mode reads committed blobs at HEAD; exit non-zero on missing/mismatch/malformed/non-64-hex.

### Manifests at HEAD

packages/contracts/manifest.sha256: 23 entries, raw SHA-256 f095c8f7e1f49eedd108b9a13cb2398a594f1f540fab024d8ee14512d0ba7fb5 (regenerate after commit for current).
reconciliation/crm/CONTRACT-03A/r2/manifest.txt: 4 entries, raw SHA-256 d0b72a5aacf8f58fbc9d2ec3bd48450be26cbce425bc0a01126839ee1e70d15b (regenerate after commit for current).

### N/N match

- packages/contracts/manifest.sha256: 23/23 MATCH
- reconciliation/crm/CONTRACT-03A/r2/manifest.txt: 4/4 MATCH

### No self-hash, no machine path, no dist/node_modules

Confirmed: generator excludes its own manifest file path, git ls-files handles relative paths portably, and the filters exclude node_modules/ and dist/.

### I-01 status

I-01 PASS. No regression introduced by batch 4 source fixes (F-01/F-03/F-04/F-06). Generator and manifests remain valid against committed blobs at the final correction commit.