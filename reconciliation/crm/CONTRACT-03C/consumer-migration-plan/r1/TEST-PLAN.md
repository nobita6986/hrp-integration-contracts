# Test Plan — matrix per slice

## M1 — Pin/install additive candidate

| Suite | Type | Local-only | Notes |
|---|---|---|---|
| `npm ci` per consumer | build dependency | yes | all 6 consumers |
| `npm run build` per consumer | TS compile | yes | all 6 consumers |
| Root export parity (one-shot script) | unit | yes | compare 379/379 |
| SCHEMA_VERSION / PACKAGE_VERSION runtime check | unit | yes | both == baseline |
| Pre-existing test fails (3 context-panel) | unit | yes | unchanged |

RUNTIME_HRP_TESTS: NOT_EXECUTED.

## M2 — Frozen-root regression

| Suite | Type | Local-only | Notes |
|---|---|---|---|
| Per-consumer contract-root-regression.test.mjs | unit | yes | asserts >=379 exports, no name removed |
| Per-consumer full unit test suite | unit | yes | zero candidate-induced fails |

RUNTIME_HRP_TESTS: NOT_EXECUTED.

## M3 — Adapter

| Suite | Type | Local-only | Notes |
|---|---|---|---|
| `talent-context-read-adapter.test.mjs` | unit | yes | parses valid query, rejects malformed |
| Adapter coexistence with root import | unit | yes | root + subpath in same process |
| Adapter import-path guard | unit | yes | grep test that asserts no `dist/`/`src/`/`internal` in imports |
| Full integration-api test suite | unit + integration | yes (non-PG) | zero regression |

RUNTIME_HRP_TESTS: NOT_EXECUTED.

## M4 — Mock wiring

| Suite | Type | Local-only | Notes |
|---|---|---|---|
| `talent-context-read-mock.test.mjs` | unit | yes | positive: TalentContextReadResultSchema-valid |
| `talent-context-read-mock.test.mjs` | unit | yes | negative: TalentContextReadErrorSchema-valid |
| `talent-context-read-mock.test.mjs` | unit | yes | redaction: result has no raw PII |
| `orchestrator.test.mjs` (extension) | integration | yes (mock) | new happy-path with `hrpRead` enabled |
| Existing intake-orchestrator tests | integration | yes (mock) | unchanged when `hrpRead` unset |

RUNTIME_HRP_TESTS: NOT_EXECUTED.

## M5 — Build/test/browser regression

| Suite | Type | Local-only | Notes |
|---|---|---|---|
| Per-consumer `npm run build` | build | yes | 6/6 |
| Per-consumer `npm test` (non-PG) | unit + integration | yes | 6/6 |
| `apps/context-panel npm run build:ui` | bundle | yes | bundle generates, 0 unresolved imports |
| `apps/context-panel` Playwright | browser | conditional | if browser env available |
| Mock gating check | integration | yes | `HRP_MOCK_MODE` controls mock activation |

RUNTIME_HRP_TESTS: NOT_EXECUTED.

## M6 — Runtime interface (NOT implemented)

| Suite | Type | Local-only | Notes |
|---|---|---|---|
| Runtime interface file compiles | build | yes | strict TS |
| Runtime interface throws on call | unit | yes | asserts `Error("not implemented")` |
| Runtime HRP tests | integration | NO | NOT_EXECUTED (real provider required) |

## Aggregate test matrix (CRM scratch baseline at 72643356)

| Consumer | Baseline tests | Pre-existing fails |
|---|---|---|
| packages/config | 16 | 0 |
| packages/integration-store | 10 | 0 |
| apps/integration-worker (non-PG) | 224 | 0 |
| apps/integration-api (non-PG) | 349 | 0 |
| apps/context-panel | 310 | 3 (manifest-readonly autocrlf) |
| apps/core-1.10-media | 48 | 0 |
| **Total relevant** | **957** | **3** |

After M5, candidate-induced fails MUST remain 0. Pre-existing fails (3 in
context-panel) MUST remain unchanged. Total green: 954/957.

## Out-of-scope tests (intentionally NOT run)

- Postgres-dependent tests in apps/integration-worker, integration-store.
- HRP runtime end-to-end tests.
- Production endpoint tests.
- Docker-required tests.
- VPS-side deploy smoke tests.

These all remain `NOT_EXECUTED` per the brief and per HRP-CRM-MSG-045.