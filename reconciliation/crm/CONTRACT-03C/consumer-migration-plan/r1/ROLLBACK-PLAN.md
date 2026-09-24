# Rollback Plan — per-slice revert procedure

Each slice is designed to be reverted independently. The full rollback
restores the CRM tree to baseline 72643356a0d1355f9dccc3921b47c990ea9c31c1.

## M1 rollback

### Per consumer
```
git checkout baseline -- <consumer>/package.json <consumer>/package-lock.json
cd <consumer>
npm ci
```

This restores the lockfile to the baseline state and re-installs from
the workspace contracts package.

### Risk
- If the consumer has unsaved local changes outside the dep entry,
  `git checkout baseline -- <files>` will fail loudly and protect them.

## M2 rollback

```
git checkout baseline -- tests/contract-root-regression.test.mjs   # per consumer
```

M2 only adds new test files; rollback is a delete.

## M3 rollback

```
git checkout baseline -- apps/integration-api/src/orchestrator/talent-context-read-adapter.ts
git checkout baseline -- apps/integration-api/src/orchestrator/talent-context-read-adapter.test.mjs
```

Or simply `git rm` both files since they are new in M3.

## M4 rollback

```
git checkout baseline -- apps/integration-api/src/orchestrator/intake-orchestrator.ts
git checkout baseline -- apps/integration-api/tests/orchestrator.test.mjs
git rm apps/integration-api/src/orchestrator/talent-context-read-mock.ts
git rm apps/integration-api/src/orchestrator/talent-context-read-mock.test.mjs
```

The orchestrator and test file are reverted; the two new mock files
are deleted. The M3 adapter is preserved (not deleted) — it is safe
to keep even after M4 rollback.

## M5 rollback

M5 only runs tests; nothing to revert beyond what M1..M4 already
introduced. If a test in M5 reveals a regression, revert the offending
slice (M4, M3, M2, M1 in order).

## M6 rollback

```
git rm apps/integration-api/src/orchestrator/talent-context-read-runtime.ts
git rm docs/contracts/integration-talent-context-read-runtime.md
```

These are sketch-only files; rollback is a delete.

## Full rollback

In a clean scratch worktree:
```
git checkout baseline
```

This restores the CRM tree to baseline 72643356... with no dependency
on candidate, no adapter, no mock, no runtime interface.

## Reinstall after rollback

After any rollback, run per consumer:
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

- **Atomicity**: each slice is one or two commits. Rollback is a single
  `git checkout` per file.
- **No destructive operations**: rollbacks never delete a branch, tag,
  or remote ref.
- **No data loss**: rollbacks never touch DB, ledger, or audit trail.
- **No shared state**: rollbacks never touch shared node_modules at
  the workspace root (the CRM has none).

## Rollback that involves the candidate tarball

If a rollback must also revert from a tarball install to the workspace
`file:../contracts` install, the per-consumer recipe is:
```
git checkout baseline -- <consumer>/package.json <consumer>/package-lock.json
cd <consumer>
rm -rf node_modules
npm ci
```

This is the same as M1 rollback.