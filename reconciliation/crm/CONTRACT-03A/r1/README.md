# CONTRACT-03A — Shared schemas + synthetic conformance

## Status

`READY_FOR_PRODUCER_RECHECK_AND_DELTA_AUDIT`.
`SPEC_DESIGN = BILATERALLY_ACCEPTED`, `ACCEPTED_SHARED = NONE`.
Producer verdict on r2 baseline (`f9cc493`) was `CHANGES_REQUIRED` with
findings F-01..F-06.

This bundle adds an immutable correction batch (the current commit) that
addresses every F-ID. Producer review of this delta is independent of the
audit PASS retained for the prior source snapshot; do not carry over.

## Corrections (this commit)

| F-ID | Scope | Source delta (this commit) | Regression test |
| --- | --- | --- | --- |
| F-01 | Assertion/profile validators | `assertion.ts` (new): `parseAssertionHeader` (raw framing + duplicate-key detection); `AssertionClaimsSchema`; `validateClaimsObject`; `validateTtlSkew`; `validateAudience`; `validateSubject`; `validateRequestBinding`; `actorForOperation` + `validateRequiredActor`; `BACKEND_OPERATIONS`. | `assertion-validators.test.mjs` |
| F-02 | Delegation wire | `delegation.ts`: `pendingRequestId` is in PATH for exchange/cancel; `delegationRef` only in revoke body; `DelegationErrorResponseSchema = {status:'FAILED',error:{code}}` (no `messageKey`); added `BrowserHandoffRequestSchema`, `ApprovalDecisionRequestSchema`, `ApprovedCallbackOutcomeSchema`, `DeniedCallbackOutcomeSchema`, `CsrfTokenSchema` (via `primitives.ts`), `JtiSchema`. Internal `InternalAggregateRecordSchema` separated from wire. | `delegation-conformance.test.mjs` (rewritten) |
| F-03 | Canonical tokens | `primitives.ts`: shared `canonicalTokenSchema(prefix)` enforces prefix + 43 base64url chars unpadded + `decode -> re-encode` roundtrip with exactly 32 decoded bytes. Reused by `PendingRequestIdSchema`, `HandoffProofSchema`, `ReceiptSchema`, `DelegationRefSchema`, `CallbackStateSchema`, `JtiSchema`, `CsrfTokenSchema`. `QueryDelegatedUserActorSchema` now uses `DelegationRefSchema`. | `delegation-conformance.test.mjs` (Token encoder section); `query-conformance.test.mjs` |
| F-04 | Immutable binding grammar + UTC-Z | `primitives.ts`: `CrmBindingSchema` rejects callbackId/crmSessionHandle with space or newline and deadline with offset other than `Z`. New `BindingTimestampSchema` (RFC3339 UTC `Z`) applied to all binding deadlines; `IsoTimestampSchema` (offset-aware) retained for `result.resolvedAt`. Past deadlines with correct syntax remain accepted. | `delegation-conformance.test.mjs` (F-04 section) |
| F-05 | Redaction (FEFF, SMP, segmenter, byte bound, omit not truncate) | `redaction.ts`: rejects FEFF/Cf/bidi BEFORE normalization; code-point iteration for SMP handling; segmentation failure caught → unsafe; code-point-aware letter classification; `byteLengthUtf8(s) <= 512` enforced in function and in `IdentitySummarySchema`. Over-limit output omitted (no truncation). | `redaction-probes.test.mjs` |
| F-06 | Request/result conformance | `conformance.ts` (new): `checkResultConformance(requested, redactOutcome)` enforces the three F-06 rules. `compareUnavailableFields`. Uses pinned `REDACTION-VECTORS.json` from MSG-028 via `git show` (no fixture normalization). The previous `assert.ok(true)` placeholder for the unrequested case is replaced with active assertions. Parser signature unchanged. | `conformance-helper.test.mjs` |

## Module

`packages/contracts/src/talent-context-read/`

| File | Purpose |
| --- | --- |
| `primitives.ts` | Local `CorrelationId`/`OrganizationId`/`CanonicalId`/`BindingTimestamp`/`IsoTimestamp`/`SchemaVersion`; shared `canonicalTokenSchema(prefix)`; `CrmBindingSchema`; token schemas (`pd_`, `hp_`, `rc_`, `dg_`, `st_`, `jt_`, `cs_`); `SingleScopeArraySchema`. |
| `query-types.ts` | `TalentContextReadTargetSchema`; `TalentContextReadFieldSchema` (8 fields); `TalentContextReadFieldAllowlistSchema`; `QueryDelegatedUserActorSchema`; `TalentContextReadQueryRequestSchema`; `IdentitySummarySchema` (UTF-8 byte-bound); `UnavailableFieldsSchema`; `TalentContextReadResultSchema`. |
| `query-errors.ts` | Seven-code parser: `QueryErrorCodeSchema`, `QueryRetryClassSchema` (NEVER / REAUTHENTICATE / BOUNDED_NEW_ASSERTION), `QUERY_ERROR_HTTP_STATUS` / `QUERY_ERROR_MESSAGE_KEY` / `QUERY_ERROR_RETRY_CLASS` frozen triples, `TalentContextReadErrorSchema`, `TalentContextReadErrorResponseSchema`. |
| `query-parser.ts` | `parseTalentContextReadResponse(httpStatus, body)`. No raw body leak. No fallback command error. |
| `delegation.ts` | Wire delegation operations + browser surfaces (handoff, decision, APPROVED, DENIED) + ACK + code-only error envelope. `InternalAggregateRecordSchema` separate. |
| `assertion.ts` | F-01 pure validators: framing/duplicate-key, claims-shape, TTL/skew, audience/issuer, subject/serviceId, request binding (method/path/bodyHash/org digest), actor-per-operation. No signer/signature verification/replay store. |
| `redaction.ts` | `redactFullName` (pure): rejects Cc/Cf/FEFF/bidi before normalize; code-point-aware initial; segmentation failure → unsafe; UTF-8 byte bound 512; whole-projection omission on over-limit. |
| `conformance.ts` | F-06 helper: `checkResultConformance`, `compareUnavailableFields`. |
| `index.ts` | Re-exports all of the above. |

## Tests

`packages/contracts/tests/talent-context-read/`

| File | Coverage |
| --- | --- |
| `redaction-vectors.test.mjs` | 22 vectors from pinned MSG-028 `REDACTION-VECTORS.json` + EP-05 boundaries (over-limit input/tokens, non-string, empty, non-letter, raw-leak, phone/email). |
| `redaction-probes.test.mjs` | F-05 regression probes (FEFF/Cf, SMP, segmenter throw/missing, byte-bound, code-point-aware), mirror-image of HRP reproducer but with corrected expectations. |
| `conformance-helper.test.mjs` | F-06 conformance helper rules + pinned-vector driven projection assertions. Removes `assert.ok(true)`. |
| `query-conformance.test.mjs` | Strict query/result/request projection, 7-code error parser, raw-body-no-leak, command-only rejection, multi-error rejection, wrong HTTP rejection. |
| `delegation-conformance.test.mjs` | F-02 / F-03 / F-04 (path/body split, handoff/decision/callback schemas, code-only error, canonical tokens, binding grammar, UTC-Z, past-deadline accepted). |
| `assertion-profile.test.mjs` | EP-01 strict primitives + actor + allowlist + identity summary shape (no silent PAS for runtime invariants). |
| `assertion-validators.test.mjs` | F-01: framing/duplicate-key, claims-shape, TTL/skew, audience/issuer, subject/serviceId, request binding, actor-per-operation. |

## Test execution (clean checkout, after this commit)

```
$ npm ci
$ npm run build
$ npm test

ℹ tests 217
ℹ fail 0
```

(Node 24.19.0, npm 11.17.0, TypeScript 5.7.3, Zod 3.24.2.)

## Acceptance criteria mapping (post-correction)

| AC | Evidence |
| --- | --- |
| Strict query request/result and projection semantics | `query-conformance.test.mjs` (Q positive/negative, R projection, byte-bound) |
| Seven-code errors; reject command-only/unknown/extra/empty/multiple | `query-conformance.test.mjs` (7-code errors) |
| Delegation schemas separated from query envelope | `delegation.ts` (separate wire + browser schemas; `InternalAggregateRecordSchema` distinct) + `delegation-conformance.test.mjs` |
| Assertion/profile validation negative cases | `assertion-validators.test.mjs` |
| Redaction 22 vectors + EP-05 boundaries | `redaction-vectors.test.mjs` (vectors) + `redaction-probes.test.mjs` (F-05 corrections) |
| Parser failures safe; no fallback command error; no raw payload | `query-conformance.test.mjs` (404 null/HTML, no raw body leak) + `redaction-probes.test.mjs` (segmenter throw/missing caught) |
| Tests use actual exported implementation | All tests import from `dist/index.js` (real exports), not fixtures. Vectors loaded raw from pinned commit `49f2dbc34cae66e8d63df5dd5d8cec0c008c4623`. |
| No silent semantic change | Implementation matches REC-004B r4 + MSG-028 r2 + CA28 + bilateral acceptance MSG-030. Each F-ID has a source delta and a regression test. |
| F-06 active projection conformance (no `assert.ok(true)`) | `conformance-helper.test.mjs` (requested-unsafe, known-unsupported-marker-only-if-requested, unrequested-no-data-no-marker). |

## Excluded (per task scope)

- Endpoint handlers
- Signer / JWT verification runtime
- Key provisioning
- DB / replay / delegation stores
- Auth / RLS / session / browser wiring
- CRM or HRP consumer migration
- Package release / tarball publication / distribution
- Docker / VPS / deploy
- Real registration / pilot / production
- Audit retention / canonical organizationId
- REC-001-OPS / REC-003
- Mock-based PASS for runtime invariants (signature verify, jti consume, session active, RLS, cancel atomic)

## Pure validator limitation

Pure validators do not prove signature verification, jti consumption, session
activity, RLS enforcement or cancel atomicity. These are runtime invariants
recorded as future runtime test requirements. No mock-based PASS is granted
for them. `actorForOperation` flags `requireEffectiveHrpUser` /
`requireActiveCrmSession` for runtime checks but does NOT itself assert them.

## Reused from prior baseline (`f9cc493`)

- `CorrelationIdSchema`, `OrganizationIdSchema`, `CanonicalIdSchema`,
  `IsoTimestampSchema`, `ModuleSchemaVersionSchema` (frozen CRM primitive
  compatibility at 72643356).
- Query parser signature `parseTalentContextReadResponse(httpStatus, body)`.
- `QUERY_ERROR_HTTP_STATUS`, `QUERY_ERROR_MESSAGE_KEY`,
  `QUERY_ERROR_RETRY_CLASS` frozen triples.
- `SingleScopeArraySchema` fixed literal `talent-context:read:identitySummary`.
- 22-vector pinned `REDACTION-VECTORS.json` from MSG-028.

## Provenance

- Reviewed baseline: `f9cc493224792d15f99ba1debc27fc4d6a9cce7e`
- Audited baseline: `71dddddc7ba6ad5d2e8f775c9e76837ea558b46d`
- Producer review baseline: `80a9b9aa53088700266712642a6998647d5c5ff6`
- Implementation starting baseline: `1855b88d67f61e2efcdd2eaa2b888ba303bfc724`
- Acceptance record: `reconciliation/hrp/CONTRACT-02B-bilateral-acceptance/r1/` (MSG-030 closing PROPOSED state of EP-01..EP-06)
- Accepted design: `c3a547dccc209496ac8ef407612ea857249d22fc`
- Precedence: SPECIFICATION.md + ENGINEERING-PROFILE.md + DECISION-REGISTER.md
- Branch: `codex/contract03a-schema-conformance`
- Consumer-readiness input: `reconciliation/crm/CONTRACT-02B/consumer-readiness/` (CONTRACT-02B bundle, commit `ffe4896`)
- Pinned vector source: `49f2dbc34cae66e8d63df5dd5d8cec0c008c4623`
  (reconciliation/hrp/CONTRACT-02B-conformance-response/r2/REDACTION-VECTORS.json)

Status: READY_FOR_PRODUCER_RECHECK_AND_DELTA_AUDIT.
