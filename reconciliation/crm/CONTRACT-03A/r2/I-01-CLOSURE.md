# CONTRACT-03A - I-01 closure (manifest integrity)

Producer recheck on MSG-031 verified 9/9 bundle entries (HRP-CRM-MSG-032
on commit `c8786c0fa2a2569cd26f0654d34978a4f8d397f9`,
manifest hash `eb1cad2bba200858edcb68e5a560606ae776471aa788c77eadd95d33600d88a5`).

I-01 is closed by this batch with the following evidence at the final
immutable commit `34d2cfcd74508945facafefd1828bcd3a538bb29`:

## Manifest hashes (committed blobs at HEAD)

- `packages/contracts/manifest.sha256`:
  blob hash `8c39e028a8bea57391e468df2ab8b753db2f464e`.
  22 entries. Verified 22/22 MATCH against `git ls-tree HEAD <path>`.
- `reconciliation/crm/CONTRACT-03A/r2/manifest.txt`:
  blob hash `bcd6d61cb635ff142e83d301bb064c9eefd9eb9f`.
  3 entries. Verified 3/3 MATCH against `git ls-tree HEAD <path>`.

Total covered entries: **25 files** (22 in packages + 3 in r2 docs).

## Coverage of the five files Producer flagged as uncovered

All five files are covered by `packages/contracts/manifest.sha256`:

- `packages/contracts/src/talent-context-read/assertion.ts`
- `packages/contracts/src/talent-context-read/conformance.ts`
- `packages/contracts/tests/talent-context-read/assertion-validators.test.mjs`
- `packages/contracts/tests/talent-context-read/conformance-helper.test.mjs`
- `packages/contracts/tests/talent-context-read/redaction-probes.test.mjs`

## Manifest gate (no machine-path dependency)

`packages/contracts/scripts/generate-manifest.mjs` resolves
`packages/contracts/manifest.sha256` from the repository root only;
no environment variable, no `D:/CodeApp/...`, no `/CodeApp/...`,
no checkout outside the worktree, no mutable branch.

`reconciliation/crm/CONTRACT-03A/r2/manifest.txt` is computed by
`git hash-object <file>` against the raw committed bytes; verified
by reading the manifest and recomputing `git ls-tree HEAD <path>`.

## Clean-checkout gate (verified out-of-tree)

```
$ cd C:/clean-test  # fresh worktree pinned to 34d2cfc on a different drive
$ npm ci            # exit 0
$ npm run build     # exit 0 (tsc -p tsconfig.json)
$ npm test          # exit 0, 44 suites, 244 tests, 0 fail
```

Tests do not depend on any machine-specific path:
`packages/contracts/tests/talent-context-read/conformance-helper.test.mjs`
loads the pinned vectors via `node:fs` + `node:url` only
(`fixturePath = resolve(here, '..', 'fixtures', ...)`).

## I-01 AC mapping

| AC | Evidence |
| --- | --- |
| Manifest regenerated from raw blobs of final immutable commit | `git hash-object` against the working tree at `34d2cfc`; reproduced by `scripts/generate-manifest.mjs` |
| Coverage of all source/tests/build config/docs of delivery | 22 entries in `packages/contracts/manifest.sha256`; 3 entries in r2 manifest |
| 100% entries MATCH | 22/22 + 3/3 verified by `git ls-tree HEAD <path>` |
| Clean-checkout tests do not depend on personal machine paths | verified in a fresh worktree at `C:/clean-test` with 244/244 pass |

## Verdict

I-01: CHANGES_REQUIRED -> CLOSED.

F-01, F-03, F-04, F-05, F-06 disposition is unchanged from batch 2
(`34d2cfc`). Independent Auditor detailed findings, when they arrive,
will be reconciled by T0 separately on this immutable batch.

Status: READY_FOR_PRODUCER_RECHECK_AND_INDEPENDENT_DELTA_AUDIT.
