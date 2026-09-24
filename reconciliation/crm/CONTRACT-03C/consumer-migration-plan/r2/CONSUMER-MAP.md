# Consumer Map (UNCHANGED)

Carried forward from r1. No re-survey per brief.

## Six CRM consumers and their `@hrp-engagement/contracts` usage today

### packages/config
- Imports: SCHEMA_VERSION in `packages/config/src/types.ts`.
- Frozen-root only; no subpath use.

### packages/integration-store
- Imports in `src/adapters.ts`, `src/types.ts`,
  `src/repos/contact-link.ts`, `src/repos/event-receipt.ts`,
  `src/repos/conversation-link.ts`.
- Frozen-root only; no subpath use.

### apps/integration-worker
- Imports in `src/shared-types.ts` only.
- Frozen-root only; no subpath use.

### apps/integration-api
- Imports in 18 files under `src/gateway/`, `src/dlq/`,
  `src/orchestrator/`, `src/outbox/`, `src/receiver/`.
- Tests: `tests/orchestrator.test.mjs`, `tests/gateway.test.mjs`,
  `tests/outbox.test.mjs`.
- Frozen-root only; no subpath use.
- Migration relevance (corrected per C-04): TARGET for new subpath via
  M3/M4 ONLY in the adapter/port layer; no edits to IntakeOrchestrator.

### apps/context-panel
- Imports in 18 files under `src/ui/`, `src/routing/`,
  `src/dashboard/`, `src/assistant/`, `src/orchestrator-wire.ts`.
- Test: `tests/panel-ui.test.mjs`.
- Frozen-root only; no subpath use.
- Migration relevance: deferred to follow-up slice; not in r2 scope.

### apps/core-1.10-media
- Imports in `src/secret-provider.ts`, `src/policy-harness.ts`,
  `src/evidence-store.ts`.
- Frozen-root only; no subpath use.

## scripts/tests references
All test references use root imports only. No subpath import exists in
any test fixture or script.

## Future subpath consumers (planned for r2, not executed)
- `apps/integration-api/src/orchestrator/talent-context-read/` (new
  directory in M3/M4):
  - `parser-request.ts`         (parseTalentContextReadRequest)
  - `parser-result.ts`          (parseTalentContextReadResult)
  - `parser-error.ts`           (parseTalentContextReadError)
  - `port.ts`                   (TalentContextReadPort interface)
  - `port-mock.ts`              (TalentContextReadPortMock, deterministic)
  - `parser-*.test.mjs`         (unit)
  - `port-mock.test.mjs`        (unit)
  - `route.ts`                  (HTTP route mock; gated; mock-mode only)
  - `route.test.mjs`            (mock route tests)

ONLY `apps/integration-api` adopts the subpath in M3/M4.

## Modules that will NOT import the subpath in r2
- packages/config
- packages/integration-store
- apps/integration-worker
- apps/core-1.10-media
- apps/context-panel  (deferred)
- All scripts
- All tests except the parser/port/route tests listed above