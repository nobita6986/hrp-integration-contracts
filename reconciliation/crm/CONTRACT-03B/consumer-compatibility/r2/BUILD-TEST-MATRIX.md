# Phase 4 - Six-Consumer Build and Test Matrix

Per-consumer, the following are recorded for BOTH baseline and candidate runs:

- Baseline `npm ci` -> `npm run build` -> `npm test` (relevant non-PG only)
- Candidate `npm install` -> `npm run build` -> `npm test` (same set)
- Pre-existing failures (present in baseline AND candidate identically)
- Candidate-induced failures (baseline PASS, candidate FAIL)

## Summary matrix

| # | Consumer | Baseline build | Candidate build | Baseline tests | Candidate tests | Pre-existing fails | Candidate-induced |
|---|---|---|---|---|---|---|---|
| 1 | packages/config | OK | OK | 16 / 16 | 16 / 16 | 0 | 0 |
| 2 | packages/integration-store | OK | OK | 10 / 10 | 10 / 10 | 0 | 0 |
| 3 | apps/integration-worker | OK | OK | 224 / 224 | 224 / 224 | 0 | 0 |
| 4 | apps/integration-api | OK | OK | 349 / 349 | 349 / 349 | 0 | 0 |
| 5 | apps/context-panel | OK | OK | 307 / 310 | 307 / 310 | 3 | 0 |
| 6 | apps/core-1.10-media | OK | OK | 48 / 48 | 48 / 48 | 0 | 0 |

Total relevant tests (baseline = candidate): 16+10+224+349+307+48 = 954
Pre-existing fails: 3 (context-panel manifest-readonly verify, see Baseline)
Candidate-induced fails: 0

A seventh surface, `packages/contracts` (the dev-harness package), is the
frozen-root source. Build was OK and test was 398/398 in baseline, the
candidate tarball was built from it (see TARBALL-VERIFICATION.md), and
the additive r2 candidate is added on top via `npm pack`.

## Per-consumer root imports in use

### packages/config
- No direct import of `@hrp-engagement/contracts`. Uses `IConfig`, `IChannelConfig`,
  `ILogConfig`, etc. internally.

### packages/integration-store
- `import { IIdempotencyStore, IDeduplicationStore, ... }` from `@hrp-engagement/contracts`
- Imports schemas: `channelSchema`, `IntegrationChannelSchema`, etc.

### apps/integration-worker
- `import { validateOutgoingPayload, channelSchema, ... }` from `@hrp-engagement/contracts`
- Heavy use of frozen validators; runtime + type usage both rely on root.

### apps/integration-api
- `import { createValidator, ZodSchema, ... }` from `@hrp-engagement/contracts`
- Frozen validators wrapped in server middleware.

### apps/context-panel
- `import { SCHEMA_VERSION, PACKAGE_VERSION, getContractsVersion, ... }` from `@hrp-engagement/contracts`
- Server exposes `contractsVersion` in `/healthz`.

### apps/core-1.10-media
- `import { channelSchema, ... }` from `@hrp-engagement/contracts`
- Frozen validators used in event publishers.

## Verdict
- CRM_BUILD_COMPATIBILITY: PASS
- CRM_TEST_COMPATIBILITY: PASS (with 3 pre-existing manifest-readonly fails
  unchanged in candidate; no candidate-induced failure)