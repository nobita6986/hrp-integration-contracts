# Phase 2 - CRM Clean Baseline

## CRM scratch worktree
- Created from primary CRM working tree (`D:/CodeApp/Hrp-Crm`) at detached HEAD:
  `git worktree add D:/CodeApp/Hrp-Crm-03b2-r2-scratch 72643356a0d1355f9dccc3921b47c990ea9c31c1 --detach`
- After creation: `git status --porcelain | wc -l` = 0 (clean)
- `dist/`: absent
- `node_modules/`: absent
- `tmp_pgdata/`: absent
- `.codegraph.db`: absent
- No inherited changes from any other branch

## Environment
- OS: Microsoft Windows 10.0.26200
- Shell: PowerShell 7
- Node: node.exe on PATH (`C:\Program Files\nodejs\node.exe`)
- npm: bundled with Node
- Scratch root: r2 worktree (above), separate from primary CRM

## Baseline state of each consumer at scratch creation
| Consumer | dist/ | node_modules/ | package-lock | Inherited changes |
|---|---|---|---|---|
| packages/contracts | absent | absent | absent | 0 |
| packages/integration-store | absent | absent | absent | 0 |
| packages/config | absent | absent | absent | 0 |
| apps/integration-worker | absent | absent | absent | 0 |
| apps/integration-api | absent | absent | absent | 0 |
| apps/context-panel | absent | absent | absent | 0 |
| apps/core-1.10-media | absent | absent | absent | 0 |

## Pre-existing test failures (recorded BEFORE candidate install)
After baseline install/build/test of each consumer, these pre-existing failures
are observed (NOT candidate-induced):

| Consumer | Pre-existing fails | Affected tests |
|---|---|---|
| apps/context-panel | 3 / 310 | tests/manifest-readonly.test.mjs, tests/manifest-readonly-1.13.test.mjs, tests/manifest-readonly-1.14.test.mjs |

Failure cause (root): `manifest: --verify` check fails with `hash mismatch`
errors between the in-tree `manifest-readonly.sha256` and current source
file SHA-256. The committed `manifest.sha256` for these manifests was
generated under LF line endings; the local Windows checkout applies
`core.autocrlf=true` and converts source files to CRLF, producing a
different on-disk SHA-256. The `verify` command compares against the
currently-active working-tree bytes, so `--verify` reports drift.

These 3 fails are reproducible WITHOUT any candidate involvement; they are
baseline-environment failures that the candidate did not introduce.

All other consumers (0 fails each):
- packages/contracts: 398/398 PASS
- packages/integration-store: 10/10 PASS
- packages/config: 16/16 PASS
- apps/integration-worker (4 non-PG): 56+56+56+56 = 224/224 PASS
- apps/integration-api (5 non-PG): 349/349 PASS
- apps/core-1.10-media: 48/48 PASS