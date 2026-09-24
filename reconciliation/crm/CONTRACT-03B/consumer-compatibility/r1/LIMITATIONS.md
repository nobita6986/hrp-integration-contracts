# Limitations (CONTRACT-03B.2)

## Out of scope (per brief, NOT executed)

| Category | Reason | Status |
|----------|--------|--------|
| RUNTIME_HRP_COMPATIBILITY | Brief explicitly forbids HRP runtime integration (endpoint, JWT, replay, delegation, audit DB) | NOT_EXECUTED |
| PRODUCTION_COMPATIBILITY | Brief explicitly forbids production / pilot / deploy | NOT_EXECUTED |
| Real HRP / Chatwoot / Zalo calls | Brief forbids external providers | NOT_EXECUTED |
| Docker / VPS / deploy | Brief forbids non-local testing | NOT_EXECUTED |
| npm publish / tag / release | Brief forbids promotion | NOT_EXECUTED |
| Promote ACCEPTED_SHARED | Brief forbids promotion | NOT_EXECUTED |

## In scope but not fully exercised (reasoning)

| Category | Status | Reason |
|----------|--------|--------|
| BROWSER_BUNDLE_COMPATIBILITY | NOT_VERIFIED | Phase 4 ran in pure Node.js + tsc, not under Vite/esbuild. The context-panel builds with esbuild, but no probe was run against the candidate inside an esbuild pipeline. Required separate setup; deferred to follow-up task. |
| CRM_TEST_COMPATIBILITY | NOT_EXECUTED | Brief allows tests "khong can provider that" (without external providers). Consumer unit/integration tests typically require embedded-postgres / Prisma generate / external mocks that are out of scratch scope. Only `npm run build` was exercised per consumer. Baseline unit tests for `packages/contracts` (398/398) did pass; consumer-level tests were left to the consumer test owners. |
| PRODUCTION_COMPATIBILITY | NOT_EXECUTED | Per contract (see above). |

## Pre-existing limitations observed in CRM

None. All 6 consumers build cleanly with the existing local dev-harness package `packages/contracts@0.0.8-g0.8-fixes`.

## Hard constraints observed

- Primary CRM working tree was NOT modified (verified: HEAD still
  `72643356a0d1355f9dccc3921b47c990ea9c31c1`, no working-tree changes
  added or removed during this task).
- All consumer-switch experiments were performed in the scratch worktree
  `<scratch-root>` and reverted.
- No CRM `package-lock.json` was committed in this task.
- No CRM `package.json` change was committed in this task.
- No `npm publish` / tag / release was performed.
- No Docker / VPS / deploy was performed.
- No real HRP / Chatwoot / Zalo calls were made.

## Known unknowns

- The reconciliation layer between the candidate subpath and CRM dev-harness
  surface has not been designed; this is a follow-up T0 task.
- The runtime delegation store and audit DB are NOT designed or implemented
  (and are explicitly out of scope per CONTRACT-03B.2 brief).
- Browser bundler (esbuild) compatibility with the candidate was not
  exercised in this task; it should be in a follow-up before production.

## Verdict calibration note

The brief asks for per-category verdicts without aggregating into a single PASS.
This bundle does that: 6 categories, 2 PASS (NEW_SUBPATH, TYPESCRIPT_DECLARATION),
1 NOT_APPLICABLE (ROOT_EXPORT, because the candidate is not a superset of the
existing dev-harness surface and is therefore not a "backward-compatible
replacement"), 1 FAIL_EXPECTED (CRM_BUILD), 1 NOT_EXECUTED (CRM_TEST),
1 NOT_VERIFIED (BROWSER_BUNDLE), and the 2 per-contract NOT_EXECUTED
(RUNTIME_HRP, PRODUCTION). Total: 8 categories, none collapsed.