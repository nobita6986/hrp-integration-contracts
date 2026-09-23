# CONTRACT-03A - Shared schemas + synthetic conformance (r2 / batch 2)

## Status

`READY_FOR_PRODUCER_RECHECK_AND_INDEPENDENT_DELTA_AUDIT`.

Target reviewed commit: `22fc50e3deca5e6c816aab44088afe1d443e4867`.
`SPEC_DESIGN = BILATERALLY_ACCEPTED` remains untouched.
`ACCEPTED_SHARED` remains `NONE`.

Producer verdict on r2 was `CHANGES_REQUIRED` against commit `22fc50e3`,
with disposition:
- F-02 PASS (exact wire shape already correct).
- F-01 / F-03 / F-04 / F-05 / F-06 CHANGES_REQUIRED.

Independent Auditor verdict was also `CHANGES_REQUIRED`; its detailed
findings, when they arrive, will be reconciled by T0 separately. The
corrections below are against the producer disposition.

## Corrections (this commit)

| F-ID | Scope | Source delta (this commit) | Regression test |
| --- | --- | --- | --- |
| F-01 | Single consumer-facing assertion entrypoint | `assertion.ts` adds `validateAssertionProfile(opts)`; it composes the framing/duplicate-key check, an explicit `alg/typ/kid` profile that rejects `crit`, `jku`, `x5u`, embedded JWK, and the claims profile (`iss/sub/serviceId/aud/iat/exp/jti/scope/binding/request`), TTL/skew with `verifierNow < exp + 30s` boundary, per-operation audience, subject === serviceId, strict request binding (method/path/bodySha256 + organizationId/crmSubject), and the per-operation actor profile. Query surface requires `claims.actor.kind = DELEGATED_USER`; issuance/exchange/cleanup reject the query actor shape. `organizationIdDigest` removed (not in accepted profile). No signer, no replay store. | `assertion-validators.test.mjs` (entrypoint suite) |
| F-03 | Canonical base64url | `primitives.ts` no longer shortcuts to the browser `atob` for base64url; it normalizes `_/-` to standard base64, decodes manually if needed, requires exactly 32 decoded bytes, and roundtrips `decode -> encode` to verify canonicality. The seven token schemas (`pd_`, `hp_`, `rc_`, `dg_`, `st_`, `cs_`, `jt_`) and `QueryDelegatedUserActorSchema` are all checked through the same `canonicalTokenSchema(prefix)` factory. Format validation does not prove entropy. | `delegation-conformance.test.mjs` (token section) |
| F-04 | Strict immutable binding | `primitives.ts` exposes `CrmBindingBaseSchema` and `CrmBindingSchema`; every consumer-facing wire schema (`CreateDelegationRequestSchema`, `ExchangeDelegationRequestSchema`, `CancelDelegationRequestSchema`, `RevokeDelegationRequestSchema`) reuses the strict `CrmBindingSchema` via `superRefine`. `callbackId` and `crmSessionHandle` follow opaque grammar and reject whitespace/newline. `crmSessionDeadline` is canonical RFC3339 UTC `Z` and a real Gregorian date (rejects `2026-02-30`, `+07:00`). `IsoTimestampSchema` (offset-aware) remains for `result.resolvedAt`. `cleanup` (cancel/revoke) still accepts a past deadline with correct syntax; no active-user/session requirement is added at the binding layer. | `delegation-conformance.test.mjs` (binding section) |
| F-05 | Unicode redaction | `redaction.ts` drops the custom Unicode-whitelist script; the initial-letter check uses Unicode property escapes `[\\p{L}]` so Arabic, Hangul, supplementary-plane letters (e.g. `U+10400`, `U+10401`) are first-class. Cc/Cf/FEFF/bidi are still rejected BEFORE normalization. Output byte cap (UTF-8 `<= 512`) is enforced both in the function and in `IdentitySummarySchema`. Missing/throwing `Intl.Segmenter` returns `unsafe` (no throw, no raw leak). Out-of-limit causes whole-projection omission (no truncation). | `redaction-probes.test.mjs` |
| F-06 | Portable pinned vectors + projection conformance | `tests/fixtures/redaction-vectors.fixtures.json` is the in-delivery copy of MSG-028's 22 vectors with provenance metadata (`authoritativeCommit`, `authoritativeSha256`, `byteCount`). `conformance-helper.test.mjs` loads the fixture via `node:fs` + `node:url` (no `child_process`, no absolute machine path) and asserts: requested unsafe -> omit `identitySummary` + single marker; known unsupported -> marker ONLY if requested; unrequested -> neither data nor marker; multiple known requested fields -> unique + first-appearance order. The previous `assert.ok(true)` placeholder is replaced with active assertions. | `conformance-helper.test.mjs` |

## Module

`packages/contracts/src/talent-context-read/`

| File | Purpose |
| --- | --- |
| `primitives.ts` | Opaque grammar primitives; `BindingTimestampSchema` (RFC3339 UTC `Z`, real Gregorian date); `IsoTimestampSchema` (offset-aware) for `result.resolvedAt`; `canonicalTokenSchema(prefix)` factory; the seven token schemas (`pd_`, `hp_`, `rc_`, `dg_`, `st_`, `jt_`, `cs_`); `CrmBindingBaseSchema` + `CrmBindingSchema` (whitespace/newline/offset/offset guard); `encodeBase64Url` / `decodeBase64Url` (no browser `atob` shortcut on base64url); `byteLengthUtf8`. |
| `query-types.ts` | `TalentContextReadTargetSchema`; `TalentContextReadFieldSchema` (8 fields); `TalentContextReadFieldAllowlistSchema`; `QueryDelegatedUserActorSchema` (uses `DelegationRefSchema`); `TalentContextReadQueryRequestSchema`; `IdentitySummarySchema` (UTF-8 byte-bound); `UnavailableFieldsSchema`; `TalentContextReadResultSchema`. |
| `query-errors.ts` | Seven-code parser: `QueryErrorCodeSchema`, `QueryRetryClassSchema` (NEVER / REAUTHENTICATE / BOUNDED_NEW_ASSERTION), `QUERY_ERROR_HTTP_STATUS` / `QUERY_ERROR_MESSAGE_KEY` / `QUERY_ERROR_RETRY_CLASS` frozen triples, `TalentContextReadErrorSchema`, `TalentContextReadErrorResponseSchema`. |
| `query-parser.ts` | `parseTalentContextReadResponse(httpStatus, body)`. No raw body leak. No fallback command error. |
| `delegation.ts` | Wire delegation operations + browser surfaces (handoff, decision, APPROVED, DENIED) + ACK + code-only error envelope. `Create/Exchange/Cancel/RevokeDelegationRequestSchema` REUSE `CrmBindingSchema` strictly. `InternalAggregateRecordSchema` separate. |
| `assertion.ts` | F-01 entrypoint `validateAssertionProfile(opts)`; helpers `parseAssertionHeader`, `AssertionClaimsSchema`, `validateClaimsObject`, `validateTtlSkew`, `validateAudience`, `validateSubject`, `validateRequestBinding`, `actorForOperation`, `BACKEND_OPERATIONS`, `OPERATION_AUDIENCE`, `ASSERTION_LIMITS`. |
| `redaction.ts` | `redactFullName` (pure): rejects Cc/Cf/FEFF/bidi before normalize; Unicode property escapes for initial letter; missing/throw segmenter returns `unsafe`; UTF-8 byte bound 512; whole-projection omission on over-limit. |
| `conformance.ts` | F-06 helper: `checkResultConformance`, `compareUnavailableFields`, `compareUnavailableFieldsInOrder`. |
| `index.ts` | Re-exports all of the above. |

## Tests

`packages/contracts/tests/talent-context-read/`

| File | Coverage |
| --- | --- |
| `redaction-vectors.test.mjs` | 22 vectors from pinned MSG-028 + EP-05 boundaries (over-limit input/tokens, non-string, empty, non-letter, raw-leak, phone/email). |
| `redaction-probes.test.mjs` | F-05 regression probes (FEFF/Cf, SMP, segmenter throw/missing, byte-bound, code-point-aware); new positive probes for Arabic, Hangul, supplementary-plane, Vietnamese; producer-noted negative probes (`'Alpha`, `-Alpha`, `Alpha-`, digit-leading). |
| `conformance-helper.test.mjs` | F-06 conformance helper rules + portable pinned vectors + multi-field order. Removes `assert.ok(true)`. |
| `query-conformance.test.mjs` | Strict query/result/request projection, 7-code error parser, raw-body-no-leak, command-only rejection, multi-error rejection, wrong HTTP rejection. |
| `delegation-conformance.test.mjs` | F-02 / F-03 / F-04 (path/body split, handoff/decision/callback schemas, code-only error, canonical tokens, strict binding, UTC-Z, real-date, past-deadline accepted). |
| `assertion-profile.test.mjs` | EP-01 strict primitives + actor + allowlist + identity summary shape (no silent PASS for runtime invariants). |
| `assertion-validators.test.mjs` | F-01: framing/duplicate-key, claims-shape, TTL/skew boundary (`verifierNow < exp + 30s`), per-op audience, subject/serviceId, request binding, query-only/issuance-actor rules, single consumer-facing entrypoint. |

And `packages/contracts/tests/fixtures/redaction-vectors.fixtures.json`
is the portable in-delivery fixture that carries the authoritative
provenance (`49f2dbc34cae66e8d63df5dd5d8cec0c008c4623`,
`a7e7ae0b32629a9dedd2a20031086460a606271c5cf305bbc76c14a76783e428`,
4118 bytes, 22 vectors).

## Test execution (clean checkout, after this commit)

```
$ npm ci
$ npm run build
$ npm test

# 44 suites discovered, 244 tests, 0 fail.
```

(Node 24.19.0, npm 11.17.0, TypeScript 5.7.3, Zod 3.24.2.)

## Acceptance criteria mapping (post-correction batch 2)

| AC | Evidence |
| --- | --- |
| Strict query request/result and projection semantics | `query-conformance.test.mjs` + `conformance-helper.test.mjs` |
| Seven-code errors; reject command-only/unknown/extra/empty/multiple | `query-conformance.test.mjs` (7-code errors) |
| Delegation schemas separated from query envelope | `delegation.ts` (separate wire + browser schemas; `InternalAggregateRecordSchema` distinct) + `delegation-conformance.test.mjs` |
| Assertion/profile validation negative cases | `assertion-validators.test.mjs` (full suite incl. entrypoint) |
| Redaction 22 vectors + EP-05 boundaries | `redaction-vectors.test.mjs` (vectors) + `redaction-probes.test.mjs` (F-05 batch 2 probes incl. Arabic/Hangul/SMP/Vietnamese) |
| Parser failures safe; no fallback command error; no raw payload | `query-conformance.test.mjs` (404 null/HTML, no raw body leak) + `redaction-probes.test.mjs` (segmenter throw/missing caught) |
| Tests use actual exported implementation | All tests import from `dist/index.js` (real exports), not fixtures. Vectors loaded via portable in-delivery fixture with provenance metadata. |
| No silent semantic change | Implementation matches bilateral acceptance MSG-030. Each F-ID has a source delta and a regression test. |
| F-06 active projection conformance (no `assert.ok(true)`) | `conformance-helper.test.mjs` (requested-unsafe, known-unsupported-marker-only-if-requested, unrequested-no-data-no-marker, multi-field ordered). |
| F-01 entrypoint composition | `assertion-validators.test.mjs` (entrypoint suite) |
| F-03 canonical base64url no-atob-shortcut | `primitives.ts::encodeBase64Url`/`decodeBase64Url` + token-schema factory |
| F-04 strict CrmBindingSchema reused | `delegation.ts` (Create/Exchange/Cancel/Revoke all run CrmBindingSchema via superRefine) |

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

Pure validators do not prove signature verification, jti consumption,
session activity, RLS enforcement or cancel atomicity. These are runtime
invariants recorded as future runtime test requirements. No mock-based
PASS is granted for them. `actorForOperation` flags
`requireEffectiveHrpUser` / `requireActiveCrmSession` for runtime
checks but does NOT itself assert them.

## Reused from prior baseline (`22fc50e3`)

- `CorrelationIdSchema`, `OrganizationIdSchema`, `CanonicalIdSchema`,
  `IsoTimestampSchema`, `ModuleSchemaVersionSchema` (frozen CRM primitive
  compatibility at 72643356).
- Query parser signature `parseTalentContextReadResponse(httpStatus, body)`.
- `QUERY_ERROR_HTTP_STATUS`, `QUERY_ERROR_MESSAGE_KEY`,
  `QUERY_ERROR_RETRY_CLASS` frozen triples.
- `SingleScopeArraySchema` fixed literal `talent-context:read:identitySummary`.
- The seven-code error envelope and the wire-side `pendingRequestId` /
  `delegationRef` placement from F-02 batch 1 (kept; no refactor).

## Manifest

`packages/contracts/manifest.sha256` (committed blob `8c39e028a8bea57391e468df2ab8b753db2f464e`) covers 22 entries: source under `packages/contracts/src/talent-context-read/`, the portable fixture under `packages/contracts/tests/fixtures/`, every test under `packages/contracts/tests/talent-context-read/`, the `scripts/generate-manifest.mjs` tool, plus `package.json`, `package-lock.json`, and `tsconfig.json`. Excluded: `node_modules/`, `dist/`, and the manifest itself (no self-hash). Reproduced via `node packages/contracts/scripts/generate-manifest.mjs` (cwd = repo root).

`reconciliation/crm/CONTRACT-03A/r2/manifest.txt` (no self-hash) covers 3 entries: `README.md`, `AC-EVIDENCE.md`, `NOTES.md`. Excluded: `manifest.txt` itself (no self-hash).

