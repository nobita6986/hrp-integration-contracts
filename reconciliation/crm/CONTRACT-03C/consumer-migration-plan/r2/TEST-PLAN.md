# Test Plan — matrix per slice (r2, corrected per C-02/C-05)

## M1 — Distribution pinning (BLOCKED_BY_DISTRIBUTION_DECISION)

| Suite | Type | Local-only | Notes |
|---|---|---|---|
| `npm ci` per consumer | dependency install | yes | executes after distribution decision |
| `npm run build` per consumer | TS compile | yes | all 6 |
| Root export parity pre-M1 | unit | yes | bundle baseline 379-name set |
| SCHEMA_VERSION / PACKAGE_VERSION pin | unit | yes | exact-string compare |

RUNTIME_HRP_TESTS: NOT_EXECUTED.

## M2 — Root export parity (corrected)

| Suite | Type | Local-only | Notes |
|---|---|---|---|
| contract-root-regression.test.mjs per consumer | unit | yes | exact-set equality 379/379 |
| Same test | unit | yes | SCHEMA_VERSION exact `"1"` |
| Same test | unit | yes | PACKAGE_VERSION exact `"0.0.8-g0.8-fixes"` |
| representative round-trip probes | unit | yes | at least: identity, command, event, envelope, error, enum |
| Pre-existing test fails (3 context-panel manifest) | unit | yes | unchanged, not regressed |

RUNTIME_HRP_TESTS: NOT_EXECUTED.

## M3 — Three parsers (corrected per C-03)

| Suite | Type | Local-only | Notes |
|---|---|---|---|
| parser-request.test.mjs | unit | yes | valid request parses |
| parser-request.test.mjs | unit | yes | malformed request returns `{ok:false, reason:"local-validation-failure"}` |
| parser-result.test.mjs | unit | yes | valid result parses |
| parser-result.test.mjs | unit | yes | malformed result returns `{ok:false, reason:"local-validation-failure"}` |
| parser-error.test.mjs | unit | yes | HRP-error envelope parses only when source looks like an HRP error |
| parser-error.test.mjs | unit | yes | non-error payload returns `{ok:false, reason:"local-validation-failure"}` |
| Forbidden-import grep guard | unit | yes | asserts no `dist/`, `src/`, or `internal/` in any parser import |
| Full integration-api unit suite | unit | yes | zero regression |

RUNTIME_HRP_TESTS: NOT_EXECUTED.

## M4 — Isolated port + mock + route (corrected per C-04)

| Suite | Type | Local-only | Notes |
|---|---|---|---|
| port-mock.test.mjs | unit | yes | positive path returns redacted result |
| port-mock.test.mjs | unit | yes | negative path returns HRP-error-shaped parse |
| port-mock.test.mjs | unit | yes | redaction applied before envelope emission |
| port-mock.test.mjs | unit | yes | no canonical mutation |
| route.test.mjs | unit | yes | route NOT registered at default startup |
| route.test.mjs | unit | yes | route registered under `HRP_MOCK_MODE=deterministic` or factory |
| route.test.mjs | unit | yes | actor/org boundary enforced (default reject) |
| Lint/grep guard | unit | yes | `intake-orchestrator.ts` does NOT reference `talent-context-read/` |
| Existing intake-orchestrator tests | unit + integration | yes | unchanged pass/fail status |

RUNTIME_HRP_TESTS: NOT_EXECUTED.

## M5 — Build/test/browser regression (corrected per C-05)

| Suite | Type | Local-only | Notes |
|---|---|---|---|
| Per-consumer `npm run build` | build | yes | 6/6 |
| Per-consumer `npm test` (non-PG) | unit + integration | yes | 6/6 |
| `apps/context-panel npm run build:ui` | bundle | yes | bundle generates |
| Boot context-panel server | integration | yes | server boots under mock-mode |
| Playwright UI regression | browser | yes | target 9/9 or full existing UI suite |
| asset-paths.test.mjs | unit | yes | scratch static asset paths normalized |
| Mock gating check | integration | yes | `HRP_MOCK_MODE=deterministic` |

NOT_VERIFIED is NOT an accepted default for M5. An environmental
limitation is recorded only AFTER the harness is correctly set up and
STILL fails.

RUNTIME_HRP_TESTS: NOT_EXECUTED.

## M6 — DEFERRED_SEPARATE_TASK

| Suite | Type | Local-only | Notes |
|---|---|---|---|
| Not implemented in r2 | -- | -- | M6 is documentation only |

## Aggregate test matrix (CRM scratch baseline at 72643356)

| Consumer | Baseline tests | Pre-existing fails |
|---|---|---|
| packages/config | 16 | 0 |
| packages/integration-store | 10 | 0 |
| apps/integration-worker (non-PG) | 224 | 0 |
| apps/integration-api (non-PG) | 349 | 0 |
| apps/context-panel | 310 | 3 (manifest-readonly) |
| apps/core-1.10-media | 48 | 0 |
| **Total relevant** | **957** | **3** |

After M5, candidate-induced fails MUST be 0. Pre-existing fails (3 in
context-panel) remain pre-existing. Total green: 954/957.

The browser sub-suite (e.g. 9 Playwright specs in baseline) is part of
the M5 target. M5 must reach the documented Playwright count, not a
reduced fallback.

## Out-of-scope tests (intentionally NOT run)
- Postgres-dependent tests in apps/integration-worker, integration-store.
- HRP runtime end-to-end tests.
- Production endpoint tests.
- Docker-required tests.
- VPS-side deploy smoke tests.

All remain `NOT_EXECUTED` per HRP-CRM-MSG-045.