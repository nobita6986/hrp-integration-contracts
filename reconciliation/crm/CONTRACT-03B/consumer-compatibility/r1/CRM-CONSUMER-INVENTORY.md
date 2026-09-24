# CRM Consumer Inventory (CONTRACT-03B.2)

## Search method

Search performed in CRM scratch worktree at `72643356a0d1355f9dccc3921b47c990ea9c31c1`:
- `Grep "@hrp-engagement/contracts"` across `apps/`, `packages/`, `docs/`
- `Grep "talent-context-read|TalentContextRead"` across the same tree
- Per-consumer package.json dependency scan

## Subpath-search result

| Search | Matches in CRM source | Notes |
|--------|------------------------|-------|
| `@hrp-engagement/contracts/talent-context-read/v1` | **0** | No CRM consumer imports this subpath |
| `talent-context-read` (any reference) | **0** | Only matches in the integration-contracts repo |
| `TalentContextRead` (PascalCase) | **0** | Only matches in the integration-contracts repo |

**Conclusion:** The candidate subpath is **greenfield** in CRM today.

## Root-import consumer inventory

Six consumers import `@hrp-engagement/contracts` (root) from the local
dev-harness package `packages/contracts` (version 0.0.8-g0.8-fixes).
All six currently pass `file:../packages/contracts` (or its
2-level-up equivalent) as their dependency source.

### packages/config

- **package.json:** `@hrp-engagement/contracts: file:../contracts`
- **Source imports:**
  - `src/types.ts:16` - `import { SCHEMA_VERSION } from "@hrp-engagement/contracts"`
- **Import kind:** runtime value (not type-only)
- **Surface used:** `SCHEMA_VERSION`
- **Build result (with candidate):** **FAIL** - `SCHEMA_VERSION` not exported by candidate

### packages/integration-store

- **package.json:** `@hrp-engagement/contracts: file:../contracts`
- **Source imports:**
  - `src/types.ts` - `EventReceiptSchema`, `ExternalContactLinkSchema`, `ConversationLinkSchema`, `ExternalContactRefSchema`, `ExternalConversationRefSchema`, `OutboxDeliveryIntentSchema`, `OutboxDeliveryReceiptSchema`
  - `src/adapters.ts` - same as above plus `ExternalContactLinkTarget`, `CanonicalTargetRef`, `ExternalConversationRef`
  - `src/repos/contact-link.ts` - `ExternalContactLink`
  - `src/repos/conversation-link.ts` - `ConversationLink`
  - `src/repos/event-receipt.ts` - `EventReceiptSchema`
- **Import kind:** mixed (value + type)
- **Surface used:** CRM dev-harness event-receipt / conversation-link / contact-link DTOs
- **Build result (with candidate):** **FAIL** - 14+ TS2305 / TS2724 errors (none of the above symbols exist in candidate)

### apps/integration-worker

- **package.json:** `@hrp-engagement/contracts: file:../../packages/contracts`
- **Source imports:**
  - `src/shared-types.ts` - `HrpGatewayMethodSchema`, `HrpGatewayCallContextSchema`, `AcceptedResponseSchema`, `AppliedResponseBaseSchema`, `FailedResponseSchema`
  - `src/server.ts` - uses schemas transitively (cascade errors when shared-types fails)
- **Import kind:** value (schemas) + type aliases
- **Build result (with candidate):** **FAIL** - shared-types.ts:5 TS2305 errors plus cascade errors in server.ts (Type "unknown" / "{}" not assignable)

### apps/integration-api

- **package.json:** `@hrp-engagement/contracts: file:../../packages/contracts`
- **Source imports (representative):**
  - `src/receiver/handler.ts:45` - `WebhookReceiverRequestSchema`, `WebhookReceiverVerified`
  - `src/receiver/scope-verify.ts:25` - schemas
  - `src/receiver/dedupe.ts:25` - schemas
  - `src/receiver/connection-registry.ts:40` - `WebhookSignatureAlgorithm`
  - `src/outbox/dispatcher.ts:23` - `SCHEMA_VERSION`
  - `src/outbox/ac3-handler.ts:20` - `SCHEMA_VERSION`
  - `src/outbox/unknown-handler.ts:27` - schemas
  - `src/outbox/reconciliation.ts:28` - schemas
  - `src/outbox/http-handler.ts:20` - `DeliveryReportingEvent`, `DeliveryFailureReason` (type-only)
  - `src/outbox/delivery-reporting.ts:31` - schemas
  - `src/outbox/delivery-receipt.ts:23` - schemas
  - `src/orchestrator/intake-orchestrator.ts:48` - schemas
  - `src/orchestrator/steps.ts:16` - `HrpGatewayMethod`, `MatchingOutcome` (type-only)
  - `src/orchestrator/dnc-handler.ts:30,32` - schemas + `HrpGatewayMethod` (type-only)
  - `src/gateway/types.ts:23,30,38,44` - schemas
  - `src/gateway/scenarios.ts:17` - `MatchingOutcome` (type-only)
  - `src/gateway/mock-gateway.ts:24,25` - `HrpGatewayMethod`, `HrpGatewayTier`, `makeError`
  - `src/gateway/ledger.ts:15` - `HrpGatewayMethod`, `HrpGatewayTier` (type-only)
  - `src/dlq/index.ts:30` - `OUTBOX_PATCH_FORBIDDEN`
- **Tests using dynamic ESM import:**
  - `tests/outbox.test.mjs:33` - `import("@hrp-engagement/contracts")` (dynamic)
  - `tests/orchestrator.test.mjs:21` - `ErrorCodeSchema`, `CommitSuppressionInputSchema`
  - `tests/gateway.test.mjs:32` - dynamic ESM import
- **Build result (with candidate):** **FAIL** - many TS2305 errors across receiver/, outbox/, orchestrator/, gateway/, dlq/ plus cascade `unknown` types

### apps/context-panel

- **package.json:** `@hrp-engagement/contracts: file:../../packages/contracts`
- **Source imports (representative):**
  - `src/assistant/types.ts:22-26` - `AIProposalSchema`, `ApplyAIProposalInputSchema`, `AIProviderConfigReadSchema`, `PlanningBatchItemOutcome` (type)
  - `src/assistant/service.ts:27` - `SCHEMA_VERSION`
  - `src/dashboard/types.ts:34-46` - `METRIC_GRAINS`, `METRIC_PERIODS`, `METRIC_UNITS`, `METRIC_ATTRIBUTION_STATES`, `KPI_TARGET_TYPES`, `KPI_PERIODS`, `MetricGrainSchema`, `MetricUnitSchema`, `MetricPeriodSchema`, `MetricAttributionStateSchema`
  - `src/orchestrator-wire.ts:78` - `ActorClaim`, `ContextPanelResult` (type-only)
  - `src/routing/types.ts:21` - schemas
  - `src/routing/service.ts:29-31` - `RoutingPoolSchema`, `ROUTING_PATCH_FORBIDDEN`
  - `src/routing/config-store.ts:15-17` - `UpdateRoutingPoolInputSchema`, `RoutingPoolSchema`
  - `src/ui/types.ts:12-18` - schemas + `ContextPanelResult` (re-export)
  - `src/ui/mock-api.ts:18` - `ContextPanelResult` (type-only)
  - `src/ui/components/intake-review.tsx:24` - `AVAILABILITIES`, `AVAILABILITY_LABELS_VI`, `PLACEMENT_CASE_STAGES`, `PLACEMENT_CASE_STAGE_LABELS_VI`
  - `src/ui/components/context-panel.tsx`, `placement-case.tsx`, `talent-panel.tsx`, `current-relationship.tsx`, `availability.tsx`, `close-reason-select.tsx`, `assistant-panel.tsx` - many type-only and value imports
- **Tests:**
  - `tests/panel-ui.test.mjs:18` - `await import("@hrp-engagement/contracts")` (dynamic)
- **Build result (with candidate):** **FAIL** - many TS2305 errors plus cascade errors

### apps/core-1.10-media

- **package.json:** `@hrp-engagement/contracts: file:../../packages/contracts`
- **Source imports:**
  - `src/secret-provider.ts:30-35` - `SecretPortHandleSchema`, `SecretPortGetRequestSchema`, `SecretPortHandle` (type), `SECRET_PORT_FORBIDDEN_FIELDS`
  - `src/policy-harness.ts:26-28` - `ObjectStorageReadRequestSchema`, `ObjectStorageHandle` (type)
  - `src/evidence-store.ts:25` - `SchemaVersionSchema`
- **Build result (with candidate):** **FAIL** - 6 TS2305 errors (none of the secret/evidence/object-storage symbols exist in candidate)

## Summary

| Consumer | Imports root @hrp-engagement/contracts? | Builds with candidate? | Pre-existing limitation? |
|----------|------------------------------------------|------------------------|-------------------------|
| packages/config | Yes (1 import) | NO - SCHEMA_VERSION missing | None |
| packages/integration-store | Yes (5+ files) | NO - 14+ schema errors | None |
| apps/integration-worker | Yes (2 files) | NO - 5 schema errors + cascade | None |
| apps/integration-api | Yes (20+ files) | NO - many schema errors + cascade | None |
| apps/context-panel | Yes (15+ files) | NO - many schema errors + cascade | None |
| apps/core-1.10-media | Yes (3 files) | NO - 6 schema errors | None |

**Zero consumers currently build with the candidate.** All breaks are
induced by the candidate's narrow surface (only `talent-context-read/v1`),
NOT by pre-existing defects in CRM or candidate. CRM baseline
`npm run build` passes cleanly with `packages/contracts` (dev-harness)
for all 6 consumers.