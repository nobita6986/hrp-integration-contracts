# Build / Test Matrix (CONTRACT-03B.2 Phase 3)

## Method

For each of the 6 CRM consumers, the dependency entry
`"@hrp-engagement/contracts": "file:../[../]packages/contracts"` was
swapped to `file:../../.scratch-pkg/hrp-engagement-contracts-0.0.0-candidate.0.tgz`
(or 2-level-up equivalent) in the scratch worktree ONLY. After
`npm install` + `npm run build`, the package.json was reverted.
No changes were committed to primary CRM working tree.

## Per-consumer results

| Consumer | Baseline build | Candidate build | Test count (baseline) | Test count (candidate) | Failure classification |
|----------|----------------|------------------|------------------------|-------------------------|-------------------------|
| packages/config | PASS | **FAIL** | 0 (no unit test infra that hits contracts schemas; `node --test tests/*.test.mjs` runs 0 contract-related tests) | NOT_EXECUTED | Candidate-induced (SCHEMA_VERSION missing) |
| packages/integration-store | PASS | **FAIL** | 0 (Prisma tests require embedded-postgres; not exercised) | NOT_EXECUTED | Candidate-induced (14 schema errors) |
| apps/integration-worker | PASS | **FAIL** | 0 (worker tests require embedded-postgres) | NOT_EXECUTED | Candidate-induced (5 schema errors + cascade) |
| apps/integration-api | PASS | **FAIL** | 0 (orchestrator/gateway tests require external infra; mock-only tests not isolated to package) | NOT_EXECUTED | Candidate-induced (many schema errors + cascade) |
| apps/context-panel | PASS | **FAIL** | 0 (panel-ui tests require playwright; not run in scratch) | NOT_EXECUTED | Candidate-induced (many schema errors + cascade) |
| apps/core-1.10-media | PASS | **FAIL** | 0 (policy-harness test exists but requires external deps) | NOT_EXECUTED | Candidate-induced (6 schema errors) |

## Representative error samples (candidate-induced)

### packages/config

```
src/types.ts(16,10): error TS2305: Module `"@hrp-engagement/contracts"` has no exported member `SCHEMA_VERSION`.
```

### packages/integration-store

```
src/adapters.ts(10,3): error TS2305: Module `"@hrp-engagement/contracts"` has no exported member `ExternalContactLinkSchema`.
src/adapters.ts(12,3): error TS2724: `"@hrp-engagement/contracts"` has no exported member named `EventReceiptSchema`. Did you mean `ReceiptSchema`?
src/repos/event-receipt.ts(37,15): error TS2724: ... `EventReceiptSchema` ...
src/types.ts(11,3): error TS2305: ... `ExternalContactLinkSchema`.
src/types.ts(15,3): error TS2724: ... `EventReceiptSchema` ...
src/types.ts(16,3): error TS2305: ... `OutboxDeliveryIntentSchema`.
src/types.ts(17,3): error TS2305: ... `OutboxDeliveryReceiptSchema`.
```
(14+ errors total)

### apps/integration-worker

```
src/shared-types.ts(17,3): error TS2305: ... `HrpGatewayMethodSchema`.
src/shared-types.ts(18,3): error TS2305: ... `HrpGatewayCallContextSchema`.
src/shared-types.ts(19,3): error TS2305: ... `AcceptedResponseSchema`.
src/shared-types.ts(20,3): error TS2305: ... `AppliedResponseBaseSchema`.
src/shared-types.ts(21,3): error TS2305: ... `FailedResponseSchema`.
src/server.ts: cascade errors (Type `{}` not assignable to number, `unknown` not assignable to string/number)
```

### apps/integration-api

```
src/dlq/index.ts(30,10): error TS2305: ... `OUTBOX_PATCH_FORBIDDEN`.
src/gateway/ledger.ts(15,15): error TS2305: ... `HrpGatewayMethod`.
src/gateway/ledger.ts(15,33): error TS2305: ... `HrpGatewayTier`.
src/gateway/mock-gateway.ts(22,8): error TS2305: ... `HrpGatewayMethod`.
src/gateway/mock-gateway.ts(23,8): error TS2305: ... `HrpGatewayTier`.
src/gateway/mock-gateway.ts(25,10): error TS2305: ... `makeError`.
src/gateway/mock-gateway.ts: cascade `req.context is of type unknown`, etc.
```

### apps/context-panel

```
src/assistant/service.ts(27,10): error TS2305: ... `SCHEMA_VERSION`.
src/assistant/types.ts(22,3): error TS2305: ... `AIProposalSchema`.
src/assistant/types.ts(26,15): error TS2305: ... `PlanningBatchItemOutcome`.
src/dashboard/types.ts(34-46): many `METRIC_*`, `KPI_*`, `Metric*Grain*Schema` errors
src/orchestrator-wire.ts(78,15): error TS2305: ... `ActorClaim`.
src/orchestrator-wire.ts(78,27): error TS2305: ... `ContextPanelResult`.
src/routing/service.ts(29,3): error TS2305: ... `RoutingPoolSchema`.
src/routing/service.ts(30,3): error TS2305: ... `ROUTING_PATCH_FORBIDDEN`.
src/ui/components/intake-review.tsx(24,24): ... `AVAILABILITIES`, `AVAILABILITY_LABELS_VI`, `PLACEMENT_CASE_STAGES`, `PLACEMENT_CASE_STAGE_LABELS_VI`
```

### apps/core-1.10-media

```
src/evidence-store.ts(25,3): error TS2724: ... `SchemaVersionSchema`. Did you mean `ModuleSchemaVersionSchema`?
src/policy-harness.ts(26,3): error TS2305: ... `ObjectStorageReadRequestSchema`.
src/policy-harness.ts(27,8): error TS2305: ... `ObjectStorageHandle`.
src/secret-provider.ts(30,3): error TS2305: ... `SecretPortHandleSchema`.
src/secret-provider.ts(31,3): error TS2305: ... `SecretPortGetRequestSchema`.
src/secret-provider.ts(33,8): error TS2305: ... `SecretPortHandle`.
src/secret-provider.ts(35,10): error TS2305: ... `SECRET_PORT_FORBIDDEN_FIELDS`.
```

## Pre-existing limitations (CRM-side)

None. All 6 consumers build cleanly with `file:../packages/contracts`
(the local dev-harness at version 0.0.8-g0.8-fixes).

## Classification

- All 6 build failures are **CANDIDATE-INDUCED** (the candidate surface
  is intentionally narrow: only `talent-context-read/v1`).
- None are **PRE-EXISTING** (baseline builds are clean).
- This is consistent with the COMPATIBILITY-PLAN.md note at
  packaging commit E that the candidate is GREENFIELD on CRM side.

## Bottom line

CRM_BUILD_COMPATIBILITY verdict: **FAIL_EXPECTED** - the candidate cannot
replace the existing CRM `packages/contracts` workspace link. The two
packages serve different purposes and are not interchangeable.