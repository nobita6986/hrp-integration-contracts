# Phase 5 - Root Compatibility

## 1) Root export set baseline vs candidate: 379/379 identical

- Loaded baseline root `@hrp-engagement/contracts` (from packages/integration-store
  node_modules, which still holds the baseline `file:` copy in this branch of
  the probe) and extracted named exports at runtime via
  `Object.keys(await import(...))`.
- Loaded candidate root `@hrp-engagement/contracts` (from the r2 tarball) and
  did the same.
- Compared both arrays: identical, in the same order, with the same number
  of entries (379).
- Result: 379/379 identical named exports, no additions, no deletions, no
  renames.

## 2) Root runtime import works
- Both baseline and candidate root modules load successfully with
  `import * as C from "@hrp-engagement/contracts"` from a Node ESM probe.
- All frozen symbols referenced by CRM consumers resolve at runtime.

## 3) Root TypeScript declarations resolve strict
- `tsc --noEmit` against a probe file importing each frozen symbol (and
  each `Zod`-schema export) used by the CRM is OK with `strict: true`.
- Pre-existing Zod 3.24.2 / TS 5.7.3 errors in `envelopes.d.ts` only appear
  with `skipLibCheck: false`; they are present in BOTH baseline and candidate
  identically. They are NOT new errors introduced by the r2 candidate.

## 4) SCHEMA_VERSION / PACKAGE_VERSION are unchanged
- Baseline root SCHEMA_VERSION = '1', PACKAGE_VERSION = '0.0.8-g0.8-fixes'.
- Candidate root SCHEMA_VERSION = '1', PACKAGE_VERSION = '0.0.8-g0.8-fixes'.
- No drift.

## 5) Representative frozen validators parse/reject identical to baseline
- channelSchema accepts valid channel objects and rejects invalid.
- IntegrationChannelSchema accepts minimal valid envelope.
- backendOperationsSchema rejects non-allowed operations.
- All other frozen schemas sampled behave identically to baseline.

## 6) No talent-context exports leak into root
- The additive candidate includes the `talent-context-read/v1` subpath
  package; its internal symbols (e.g. `TalentContextReadQueryRequestSchema`,
  `TalentContextReadTargetSchema`, `BACKEND_OPERATIONS`,
  `MODULE_SCHEMA_VERSION`, `QUERY_ERROR_HTTP_STATUS`,
  `QueryDelegatedUserActorSchema`, `redactFullName`) are NOT exposed from
  the root.
- `Object.keys()` of root module does not contain any of those names.
- Shared primitives that DO appear in root (e.g. `CanonicalIdSchema`,
  `isoTimestampSchema`) are present in BOTH baseline and candidate
  identically; they are part of the existing frozen surface.

## Conclusion
- ROOT_EXPORT_BACKWARD_COMPATIBILITY: PASS (379/379 identical, no drift,
  no leak).
- TYPESCRIPT_DECLARATION_COMPATIBILITY: PASS (strict declarations resolve;
  pre-existing Zod-vs-TS warnings only).