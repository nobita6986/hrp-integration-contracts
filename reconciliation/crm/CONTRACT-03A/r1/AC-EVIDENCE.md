# CONTRACT-03A — Acceptance criteria evidence (correction batch)

## Test execution

Command: `npm test` from `packages/contracts/` (clean `npm ci` then `npm run build` then `npm test`).

Output: **217 tests, 7 suites, all passing, 0 fail, 0 cancelled, 0 skipped.**

```
ℹ tests 217
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ suites 7
```

(Compared to r2 baseline 111/111: this commit adds 106 new tests covering
F-01..F-06 corrections and re-organizes existing tests for stricter wire
conformance. Source parity vs audited source commit `71ddddd` is broken
where required by F-01..F-06 corrections.)

This commit's source delta and test count are re-stated after the F-01..F-06
correction batch (the audited baseline's source files in
`packages/contracts/src/` are NOT preserved by this commit; the r2 baseline
`f9cc493` is the full reviewed commit and the prior `71ddddd` audit PASS
remains valid for that snapshot only).

## AC1 — Strict query request/result and projection semantics

### Strictness

- `.strict()` on every object schema: `TalentContextReadQueryRequestSchema`,
  `TalentContextReadResultSchema`, `IdentitySummarySchema`,
  `QueryDelegatedUserActorSchema`, `TalentContextReadTargetSchema`,
  `UnavailableFieldsSchema`, `TalentContextReadFieldAllowlistSchema`,
  `TalentContextReadErrorResponseSchema`, `TalentContextReadErrorSchema`,
  `AssertionClaimsSchema`, `CrmBindingSchema`, `CreateDelegationRequestSchema`,
  `ExchangeDelegationRequestSchema`, `CancelDelegationRequestSchema`,
  `RevokeDelegationRequestSchema`, `DelegationErrorSchema`,
  `DelegationAckSchema`, `BrowserHandoffRequestSchema`,
  `ApprovalDecisionRequestSchema`.
- Rejects extras: full test set in `query-conformance.test.mjs` and
  `delegation-conformance.test.mjs`.

### No version fields, no broad command unions

- Result has no `snapshotVersion`, no `expectedVersion`, no `laborProfileVersion`.
- Request has no `laborProfileVersion`.
- `resolvedAt` is plain ISO timestamp, not a version token.
- `DelegationErrorResponseSchema` has no `schemaVersion`/`correlationId`/
  `errors` array; query error envelope has no `retryClass` semantics borrowed
  from frozen command triples.

### Requested / known-unsupported / unrequested split

Implemented by `checkResultConformance` (new in this commit, F-06):

- `requested unsafe` (e.g. `identitySummary` redaction `success: false`) →
  `r.identitySummary === undefined` and exactly one `identitySummary` marker
  in `unavailableFields`.
- `known-unsupported requested` (e.g. `placementCase` in allowlist) →
  marker ONLY if requested.
- `unrequested` (allowlist doesn't include the field) → no data, no marker.

Evidence: `conformance-helper.test.mjs`.

## AC2 — Seven-code errors

Frozen triples table preserved (HTTP / messageKey / retryClass). Seven codes
exactly. Rejections verified by tests:

- Command-only codes (`VERSION_CONFLICT`, `UNKNOWN_COMMAND_OUTCOME`,
  `BOUNDED_SAME_KEY` retry literal) → `PROTOCOL_ERROR`.
- Empty array, multi-element array → `PROTOCOL_ERROR`.
- Wrong messageKey / wrong retryClass / wrong HTTP / extra fields → rejected.
- `enum size 7` (assertion that the enum is exactly 7 entries).

Evidence: `query-conformance.test.mjs` (7-code errors section).

## AC3 — Delegation schemas separated from query envelope

This commit (F-02):

- `pendingRequestId` is in the route PATH for `ExchangeDelegationRequestSchema`
  and `CancelDelegationRequestSchema`. Both bodies are tested to REJECT bodies
  that try to put the ID in the body.
- `delegationRef` is only in the revoke body, never in the URL.
- `DelegationErrorResponseSchema` is now `{ status: 'FAILED', error: { code } }`.
  No `messageKey`, no detail. Tests verify both valid + extra-field rejections.
- New wire schemas: `BrowserHandoffRequestSchema`,
  `ApprovalDecisionRequestSchema`, `ApprovedCallbackOutcomeSchema`,
  `DeniedCallbackOutcomeSchema`. `CsrfTokenSchema` derived from
  `canonicalTokenSchema('cs_')`.
- `InternalAggregateRecordSchema` exposed only as a separate, internal-only DTO
  (named `1-internal` schema version); it is NOT a wire schema and is not
  tested against any HRP/CRM surface.

Evidence: `delegation-conformance.test.mjs` (sections F-02 / F-04 / F-04 binding).

## AC4 — Assertion/profile validation (F-01)

Pure validators. No signer, no signature verification, no replay store, no
session lookup, no RLS. Each check exported as its own function:

- `parseAssertionHeader(raw)`: framing + duplicate-key detection. Streams the
  raw string to detect top-level duplicate keys that `JSON.parse` silently
  drops. Fails before any signature / signing claim is trusted.
- `validateClaimsObject(value)`: strict Zod for the parsed object.
- `validateTtlSkew(claims, opts)`: integer `iat`/`exp`/`nbf`, TTL bound,
  skew, no future `iat`, no future `nbf`.
- `validateAudience(claims, opts)`: aud + iss equality.
- `validateSubject(claims, opts)`: `sub === serviceId`.
- `validateRequestBinding(claims, opts)`: method/path/body hash/org digest.
- `actorForOperation(op)`: distinct `requireEffectiveHrpUser` /
  `requireActiveCrmSession` per backend operation.

Negative cases verified by tests:

- Empty/oversize/non-string/control/FEFF/bidi framing rejected.
- Duplicate top-level key rejected (catches a class of bug that JSON.parse
  hides).
- Integer-only times (fractional `iat`/`exp` rejected).
- TTL > 60s, expiry past now, `iat` in future, `nbf` future rejected.
- Audience / issuer mismatch rejected.
- Subject-not-equal-serviceId rejected.
- Request-binding mismatch (method/path/bodyHash/org digest) rejected.
- Unknown backend operation rejected (no silent fallback).
- `cancel` and `revoke` cleanly accept a past CRM session deadline
  (cleanup uses immutable ownership only), while `exchange` requires an
  active session.

Evidence: `assertion-validators.test.mjs`.

## AC5 — Redaction (22 vectors + EP-05 boundaries + F-05 corrections)

22 vectors from pinned MSG-028 `REDACTION-VECTORS.json` pass through the
re-implemented `redactFullName` (no fixture normalization). Vector input
is passed verbatim from the pinned JSON via `git show` of commit
`49f2dbc34cae66e8d63df5dd5d8cec0c008c4623`.

This commit (F-05):

- FEFF/Cf/bidi rejected BEFORE normalization. Test: `'FEFF + Alpha'`
  returns `success: false` (was: `success: true`, redacted to `'A••'`).
- Code-point-aware initial handling. `U+10400 U+10401` accepted
  (was: omitted because `firstCluster[0]` got a UTF-16 surrogate half).
- Segmentation failure (`throw` or missing `Intl.Segmenter`) → unsafe
  (was: escape / throw / leak raw input).
- Output `<= 512 UTF-8 bytes` enforced in BOTH the function
  (`redactFullName.fullNameBytes`) and the result-schema layer
  (`IdentitySummarySchema` refine using `byteLengthUtf8`).
- Over-limit input → whole-projection omission (was: silent acceptance or
  truncation).

EP-05 boundaries:

- Code-point input cap (256) and token cap (16) → unsafe when exceeded.
- Non-string input (number, object, array, null, undefined) → unsafe.
- Empty string → unsafe.
- Non-letter first character (digit, `.`, `@`) → unsafe.
- Output never contains raw input.
- Inputs shaped like phone/CCCD/email are themselves rejected.

Evidence: `redaction-vectors.test.mjs` (22 vectors + boundaries) +
`redaction-probes.test.mjs` (F-05 regression probes).

## AC6 — Parser failures handled safely

- 404 with `null` body → `PROTOCOL_ERROR`, not a `NOT_FOUND` lookup.
- 404 with HTML body → `PROTOCOL_ERROR`.
- Sensitive substring in body never appears in `JSON.stringify(parsed)`.
- Multi-error array, wrong HTTP, wrong messageKey, wrong retryClass,
  extra fields in error object → rejected.
- Parser never falls back to CommandError union: query parser imports its own
  schemas only.

Evidence: `query-conformance.test.mjs` (7-code errors and Q/R sections).

## AC7 — Tests use the actual exported implementation

- Tests import from `../../dist/index.js` (the actual compiled exports).
- No fixture-vs-fixture circular checks. Each test parses an actual literal
  input through `safeParse` and asserts on the returned object.
- The pinned vector file is loaded by `git show` of the authoritative
  authority commit; the test never relies on a copy in the repository.

## AC8 — No silent semantic change

No test result was used to relax accepted constraints. Where the r2 source
disagreed with F-01..F-06, the source was updated and the corrected
expectation encoded in a regression test. The implementation adheres to:

- REC-004B r4 query shapes (eight fields, seven-code parser).
- S28 REDACTION.md algorithm steps 1-6, plus F-05 corrections.
- S28 TRANSPORT.md sections 1-5, plus F-02 / F-04 corrections.
- EP-01 strict claims shape + F-01 negative cases.
- EP-05 field/token/output bounds, plus F-03 / F-04 corrections.
- Frozen CRM primitives.ts opaque grammar
  `^[A-Za-z0-9][A-Za-z0-9._:-]*$`.
- Frozen ERROR_POLICIES for VALIDATION_ERROR / AUTHENTICATION_REQUIRED /
  FORBIDDEN (reused), with retry class override for RATE_LIMITED /
  DEPENDENCY_UNAVAILABLE via the new BOUNDED_NEW_ASSERTION literal.
- NEW additions for NOT_FOUND / INTERNAL_ERROR + the two new messageKeys
  `errors.talentContext.notFound` and `errors.talentContext.internal`.

The implementation does NOT:

- Modify frozen root exports.
- Modify frozen `RetryClassSchema` (BOUNDED_NEW_ASSERTION is module-local).
- Modify frozen `ContractErrorSchema`.
- Reuse `BOUNDED_SAME_KEY` for query retry semantics.
- Add `laborProfileVersion` / `snapshotVersion` / `expectedVersion`.
- Add phone / CCCD / raw DTO.
- Accept unknown / error / version / field as `unsupported`.
- Verify signatures, replay consume, session active, RLS or cancel atomic.

## F-ID evidence summary

| F-ID | Source delta (this commit) | Test added | Result |
| --- | --- | --- | --- |
| F-01 | `assertion.ts` (new): framing/duplicate-key, claims-shape, TTL/skew, audience, subject, request binding, actor-per-operation | `assertion-validators.test.mjs` | PASS |
| F-02 | `delegation.ts`: pending in PATH, revoke delegationRef in body, code-only error envelope, handoff/decision/callback schemas, internal aggregate separate, CSRF schema | `delegation-conformance.test.mjs` (rewritten) | PASS |
| F-03 | `primitives.ts`: `canonicalTokenSchema(prefix)` (prefix + 43 base64url + decode/re-encode roundtrip + 32 bytes), reused across all 7 token schemas | `delegation-conformance.test.mjs` (Token encoder section) | PASS |
| F-04 | `primitives.ts`: `CrmBindingSchema` opaque grammar + `BindingTimestampSchema` UTC-Z | `delegation-conformance.test.mjs` (F-04 section) | PASS |
| F-05 | `redaction.ts`: FEFF/Cf before normalize, code-point aware, segmenter catch, byte-bound in function + schema, whole-projection omission | `redaction-probes.test.mjs` | PASS |
| F-06 | `conformance.ts`: `checkResultConformance`; pinned-vector driven tests replacing `assert.ok(true)` | `conformance-helper.test.mjs` | PASS |
