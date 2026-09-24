# Rollback Plan — per-slice revert procedure (r2)

Each slice is designed to be reverted independently. The full rollback
restores the CRM tree to baseline 72643356a0d1355f9dccc3921b47c990ea9c31c1.

## M1 rollback

### Option A
```
git checkout baseline -- <consumer>/package.json <consumer>/package-lock.json
cd <consumer>
npm ci
```

### Option B
```
git checkout baseline -- packages/contracts/src/** packages/contracts/package.json packages/contracts/package-lock.json
cd <consumer>
npm ci
```

This restores the workspace `packages/contracts` to baseline and re-runs
resolution for every consumer.

### Risk
- Option B touches a shared module; verify that no consumer has cached
  a built artifact that references the additive export map. `npm ci`
  rebuilds from source and clears this risk.

## M2 rollback

```
git rm <consumer>/tests/contract-root-regression.test.mjs   # per consumer
```

M2 only adds new test files; rollback is a delete.

## M3 rollback

```
git rm -r apps/integration-api/src/orchestrator/talent-context-read/
```

R2 plan does not edit any existing file in M3, so a single directory
remove is the full rollback.

## M4 rollback

```
git rm apps/integration-api/src/orchestrator/talent-context-read/port.ts
git rm apps/integration-api/src/orchestrator/talent-context-read/port-mock.ts
git rm apps/integration-api/src/orchestrator/talent-context-read/port-mock.test.mjs
git rm apps/integration-api/src/orchestrator/talent-context-read/route.ts
git rm apps/integration-api/src/orchestrator/talent-context-read/route.test.mjs
```

The M3 parsers are PRESERVED on rollback (only the port/mock/route
files are removed). The lint/grep guard from M4 is also removed.

No edit to intake-orchestrator.ts exists, so the orchestrator test
remains at its pre-M4 baseline.

## M5 rollback

M5 runs existing checks; nothing to revert beyond what M1..M4
introduced. If M5 surfaces a regression, revert the offending slice
(M4, M3, M2, M1) in reverse order.

## M6 rollback

N/A. M6 owns no production source file in r2.

## Full rollback

```
git checkout baseline
```

This restores the CRM tree to baseline 72643356... with no reference to
candidate, no adapter, no mock, no route mock, no runtime stub.

## Reinstall after rollback

Per consumer:
```
cd <consumer>
rm -rf node_modules
npm ci
npm run build
npm test
```

This confirms the rolled-back state is build-clean and test-clean
relative to the rolled-back source.

## Rollback safety properties

- **Atomicity**: each slice is one or two commits.
- **No destructive operations**: never delete a branch, tag, or remote
  ref.
- **No shared state mutation**: Option B rewrites `packages/contracts`
  but the workspace is committed under git, so `git checkout baseline`
  is fully recoverable.
- **No HRP/DB/audit side-effects**: rollbacks never touch HRP, the
  reconciliation ledger, or the integration-store DB.

## Rollback that switches distribution mechanisms

If a future PR exercises Option A and a later PR wants to switch to
Option B (or vice versa), the rollback recipe is the per-option
recipe plus a `git rm` of the OTHER option's leftover files. M1
records no concrete file path for either option in r2, so the
rollback target is fully implicit and discoverable from git history.