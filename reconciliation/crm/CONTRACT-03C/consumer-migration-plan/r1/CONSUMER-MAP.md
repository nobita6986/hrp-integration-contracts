# Consumer Map — current usage + future subpath consumers

## Six CRM consumers and their `@hrp-engagement/contracts` usage today

### packages/config
- Imports: `import { SCHEMA_VERSION } from "@hrp-engagement/contracts";`
  (in `packages/config/src/types.ts`)
- Uses: schema-version constant for typed config schemas
- Frozen-root only; no subpath use.
- Migration relevance: NONE — does not need talent-context schemas.

### packages/integration-store
- Imports (multi-line blocks): `@hrp-engagement/contracts` in:
  - `src/adapters.ts`
  - `src/types.ts`
  - `src/repos/contact-link.ts`
  - `src/repos/event-receipt.ts`
  - `src/repos/conversation-link.ts`
- Uses: channelSchema, IntegrationChannelSchema, EventReceiptSchema,
  ConversationLink type, EventReceiptSchema, etc.
- Frozen-root only; no subpath use.
- Migration relevance: NONE today.
- Future relevance: may need to persist read-audit trail of
  `TalentContextReadQueryRequest` to the integration-store via a new
  `repo/talent-context-read.ts`. Out of scope for this plan.

### apps/integration-worker
- Imports: `@hrp-engagement/contracts` in `src/shared-types.ts`.
- Uses: re-exports/aliases of frozen primitives.
- Frozen-root only; no subpath use.
- Migration relevance: NONE today.
- Future relevance: the worker is the natural place to drive
  TalentContextRead queries on behalf of gateway/orchestrator requests
  (F-02 delegation). Out of scope.

### apps/integration-api
- Imports: `@hrp-engagement/contracts` in:
  - `src/gateway/types.ts`
  - `src/gateway/scenarios.ts`
  - `src/gateway/mock-gateway.ts`
  - `src/gateway/ledger.ts`
  - `src/receiver/connection-registry.ts`
  - `src/dlq/index.ts`
  - `src/orchestrator/dnc-handler.ts`
  - `src/orchestrator/steps.ts`
  - `src/orchestrator/intake-orchestrator.ts`
  - `src/outbox/dispatcher.ts`
  - `src/outbox/delivery-reporting.ts`
  - `src/outbox/delivery-receipt.ts`
  - `src/outbox/ac3-handler.ts`
  - `src/outbox/http-handler.ts`
  - `src/outbox/reconciliation.ts`
  - `src/outbox/unknown-handler.ts`
  - `src/receiver/dedupe.ts`
  - `src/receiver/handler.ts`
  - `src/receiver/scope-verify.ts`
- Tests: `tests/orchestrator.test.mjs`, `tests/gateway.test.mjs`,
  `tests/outbox.test.mjs` import frozen-root symbols.
- Frozen-root only; no subpath use.
- Migration relevance: TARGET for new subpath via M3/M4 — the API is
  the boundary where TalentContextRead enters CRM and where the
  delegation tokens are validated (F-02). See MIGRATION-SEQUENCE.md.

### apps/context-panel
- Imports: `@hrp-engagement/contracts` in 18 files under
  `src/ui/`, `src/routing/`, `src/dashboard/`, `src/assistant/`,
  `src/orchestrator-wire.ts`.
- Imports frozen types: ContextPanelResult, CurrentRelationship,
  Availability, CaseCloseReason, PlanningBatchItemOutcome, ActorClaim.
- Test: `tests/panel-ui.test.mjs` imports frozen enums.
- Frozen-root only; no subpath use.
- Migration relevance: UI display of redacted talent names. The
  `redactFullName` function from the new subpath can be imported by
  the talent-panel UI in a follow-up step (out of scope for M3/M4 —
  those target the API surface).

### apps/core-1.10-media
- Imports: `@hrp-engagement/contracts` in:
  - `src/secret-provider.ts`
  - `src/policy-harness.ts`
  - `src/evidence-store.ts`
- Uses: SECRET_PORT_FORBIDDEN_FIELDS, channelSchema, etc.
- Frozen-root only; no subpath use.
- Migration relevance: NONE today.

## scripts/tests that reference contracts

| File | Reference | Type |
|---|---|---|
| apps/context-panel/tests/panel-ui.test.mjs | `import ENUMS from "@hrp-engagement/contracts"` | test runtime import (root) |
| apps/integration-api/tests/outbox.test.mjs | `await import("@hrp-engagement/contracts")` | test dynamic import (root) |
| apps/integration-api/tests/orchestrator.test.mjs | `import { ErrorCodeSchema, ... }` | test runtime import (root) |
| apps/integration-api/tests/gateway.test.mjs | `await import("@hrp-engagement/contracts")` | test dynamic import (root) |
| packages/integration-store/probe-root.mjs | probe-only (not in baseline) | read-only |

No test imports any subpath. No script (under `scripts/`) imports
`@hrp-engagement/contracts` directly.

## Future subpath consumers (planned, not executed)

The `@hrp-engagement/contracts/talent-context-read/v1` subpath is
GREENFIELD — no consumer imports it today. The migration plan in
MIGRATION-SEQUENCE.md proposes adding it to:

- `apps/integration-api/src/orchestrator/talent-context-read-adapter.ts` (new file)
- `apps/integration-api/src/orchestrator/intake-orchestrator.ts` (optional wiring)
- `apps/context-panel/src/ui/components/talent-panel.tsx` (re-export UI helper, optional)

ONLY `apps/integration-api` will import the new subpath in M3/M4.
The context-panel adoption is intentionally deferred to a follow-up
slice so each step is reviewable.

## Modules that will NOT import the subpath

- packages/config — pure config types, no runtime read path
- packages/integration-store — currently uses root types only
- apps/integration-worker — pure worker, no UI/HRP boundary
- apps/core-1.10-media — synthetic media, no talent read path
- All scripts — no direct contract use
- All tests (except as fixtures)