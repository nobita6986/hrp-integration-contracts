# CONTRACT-03A - AC Evidence (r2 / batch 2)

## Inputs

- Implementation starting baseline: `1855b88d67f61e2efcdd2eaa2b888ba303bfc724`
- Producer disposition (batch 2 reviewed commit): `22fc50e3deca5e6c816aab44088afe1d443e4867`
- Status: `READY_FOR_PRODUCER_RECHECK_AND_INDEPENDENT_DELTA_AUDIT`
- Branch: `codex/contract03a-schema-conformance`
- SPEC_DESIGN: `BILATERALLY_ACCEPTED` (unchanged)

## Acceptance criteria

### AC1: Strict Talent read request/result schemas and projection semantics

- Wire request schema (`TalentContextReadQueryRequestSchema`) requires:
  schemaVersion literal `1`, unique 1..8-element fieldAllowlist,
  opaque organizationId / correlationId / canonical laborProfileId.
- Wire result schema (`TalentContextReadResultSchema') requires:
  schemaVersion, correlationId, organizationId, target, optional
  identitySummary, unique 0..8-element unavailableFields, resolvedAt
  offset-aware ISO-8601 timestamp.
- `IdentitySummarySchema` enforces `<= 512` UTF-8 bytes on
  `fullNameRedacted` and displayOnly literal `true`.
- Evidence: `packages/contracts/tests/talent-context-read/query-conformance.test.mjs`.
  Result projection semantics are exercised directly through
  `checkResultConformance` in
  `packages/contracts/tests/talent-context-read/conformance-helper.test.mjs`
  (uses the portable in-delivery fixture under
  `packages/contracts/tests/fixtures/redaction-vectors.fixtures.json`).

### AC2: Dedicated seven-code query error parser

- Seven codes: `VALIDATION_ERROR`, `AUTHENTICATION_REQUIRED`,
  `FORBIDDEN`, `RATE_LIMITED`, `DEPENDENCY_UNAVAILABLE`,
  `NOT_FOUND`, `INTERNAL_ERROR`.
- Frozen triples: `QUERY_ERROR_HTTP_STATUS`,
  `QUERY_ERROR_MESSAGE_KEY`, `QUERY_ERROR_RETRY_CLASS`.
  `TalentContextReadErrorSchema` enforces that the messageKey + retryClass
  match the frozen triples for the given code.
- Parser `parseTalentContextReadResponse(httpStatus, body)` checks HTTP
  against the frozen triple; rejects command-only / unknown version /
  unknown code / extra fields / empty errors / multiple errors.
  No raw body leak. No fallback command error.
- Evidence: `packages/contracts/tests/talent-context-read/query-conformance.test.mjs`
  (404 null body, 404 HTML body, wrong HTTP rejection, multi-error
  rejection).

### AC3: Delegation operation schemas separated from query envelope

- Create / Exchange / Cancel / Revoke delegation request bodies REUSE
  `CrmBindingSchema` strictly via `superRefine`.
- Internal `InternalAggregateRecordSchema` is declared separately and
  bears `schemaVersion: '1-internal'`.
- Browser surfaces (handoff, decision, APPROVED, DENIED) are independent
  schemas with their own shape.
- `DelegationErrorResponseSchema` is `{status: 'FAILED', error: {code}}`;
  no messageKey.
- Evidence: `packages/contracts/tests/talent-context-read/delegation-conformance.test.mjs`,
  the source `packages/contracts/src/talent-context-read/delegation.ts` (Create/Exchange/Cancel/Revoke reuse CrmBindingSchema).

### AC4: Assertion / profile pure validators

- Source: `packages/contracts/src/talent-context-read/assertion.ts`.
- Helpers: `parseAssertionHeader` (framing + duplicate-key detection at
  the raw layer), `AssertionClaimsSchema` (`.strict()`, integer times,
  sub === serviceId implicit), `validateClaimsObject`,
  `validateTtlSkew` (verifierNow < exp + 30s boundary),
  `validateAudience` (per-operation audience via `OPERATION_AUDIENCE`),
  `validateSubject` (sub === serviceId),
  `validateRequestBinding` (method/path/bodySha256 +
  organizationId/crmSubject), `actorForOperation` (create / exchange /
  cleanup), `BACKEND_OPERATIONS`, `ASSERTION_LIMITS`.
- Single consumer-facing entrypoint: `validateAssertionProfile(opts)`.
  Composes every check; tests must call this for a profile PASS.
  The header profile rejects unknown fields, `crit`, `jku`, `x5u`,
  embedded JWK, and `x5c`. `organizationIdDigest` removed from the
  accepted profile.
- Query surface requires `claims.actor.kind === 'DELEGATED_USER'`; the
  issuance/exchange/cleanup operations REJECT a query actor shape.
- No signer, no replay store, no JWT cryptography.
- Evidence: `packages/contracts/tests/talent-context-read/assertion-validators.test.mjs`,
  including the dedicated entrypoint suite.

### AC5: Redaction (22 vectors + EP-05 boundaries)

- Source: `packages/contracts/src/talent-context-read/redaction.ts`.
- Algorithm per S28 REDACTION.md + F-05 corrections:
  1. reject Cc/Cf/FEFF/bidi BEFORE normalize;
  2. code-point bound (<=256);
  3. NFC normalize; trim+collapse whitespace; empty => unsafe;
  4. token grammar `^[\\p{L}][\\p{L}\\p{M}]*(?:['-][\\p{L}][\\p{L}\\p{M}]*)*$`;
  5. token bound (<=16);
  6. first letter-led grapheme cluster + exactly `.."; join with ASCII space;
  7. output UTF-8 byte bound (<=512);
  8. missing/throw segmenter => unsafe (no throw, no raw leak); over-limit
     => unsafe (no truncate).
- 22 vectors from MSG-028 are pinned and copied verbatim into
  `packages/contracts/tests/fixtures/redaction-vectors.fixtures.json`
  with provenance (`authoritativeCommit` +
  `authoritativeSha256`). The conformance test loads them via
  `node:fs` + `node:url` (no `child_process`, no absolute
  machine path).
- New positive probes for Arabic, Hangul, supplementary plane, and
  Vietnamese; producer-noted negative probes (`'Alpha`, `-Alpha`,
  `Alpha-`, digit-leading).
- Evidence: `packages/contracts/tests/talent-context-read/redaction-vectors.test.mjs`,
  `packages/contracts/tests/talent-context-read/redaction-probes.test.mjs`,
  `packages/contracts/tests/talent-context-read/conformance-helper.test.mjs`.

### AC6: Query parser is safe (no fallback, no raw leak)

- Source: `packages/contracts/src/talent-context-read/query-parser.ts`.
- `parseTalentContextReadResponse(httpStatus, body)` returns
  `{success:false, status: 'PROTOCOL_ERROR', ...}` on:
  - non-object body;
  - 200 with result-shape mismatch;
  - non-2xx with error-envelope mismatch;
  - HTTP status not matching the frozen triple for the parsed code.
- No fallback command-only `INTERNAL_ERROR` on unknown failures;
  no raw payload leak (the raw body is never returned).
- Evidence: `packages/contracts/tests/talent-context-read/query-conformance.test.mjs`
  (404 null body, 404 HTML body, multi-error, wrong HTTP).

### AC7: Tests use actual exported implementation (no fixture PASS)

- All tests import from `dist/index.js` (the actually-built exports),
  not from fixtures. The 22 vectors are loaded RAW from the in-delivery
  fixture with provenance metadata. The helper functions exercised
  (redaction, profile validators, conformance helper) are the exported
  implementations.
- Evidence: every test file in `packages/contracts/tests/talent-context-read/`.

### AC8: No silent semantic change

- Implementation matches REC-004B r4 + MSG-028 r2 + bilateral
  acceptance MSG-030. Each F-ID has a source delta and a regression test
  recorded in `README.md`.
- `f9cc493` (producer batch 1 baseline) is no longer the head;
  `22fc50e3` (producer PASS for F-02 / CHANGES_REQUIRED for F-01..F-06)
  is the head reviewed for batch 2. This batch makes the F-01 entrypoint,
  F-03 decode-and-roundtrip, F-04 strict binding across wire schemas,
  F-05 Unicode property escapes, F-06 portable fixture.

## F-ID traceability summary

| F-ID | Source | Test |
| --- | --- | --- |
| F-01 | `assertion.ts` (`validateAssertionProfile`) | `assertion-validators.test.mjs` |
| F-03 | `primitives.ts` (encodeBase64Url, decodeBase64Url, canonicalTokenSchema) | `delegation-conformance.test.mjs` |
| F-04 | `primitives.ts` + `delegation.ts` (CrmBindingBaseSchema + superRefine in every wire schema) | `delegation-conformance.test.mjs` |
| F-05 | `redaction.ts` (Unicode property escapes; no whitelist) | `redaction-probes.test.mjs` |
| F-06 | `conformance.ts` + `tests/fixtures/redaction-vectors.fixtures.json` | `conformance-helper.test.mjs` |

## Frozen contract compatibility

- Reused from CRM baseline 72643356: `CorrelationIdSchema`,
  `OrganizationIdSchema`, `CanonicalIdSchema`,
  `IsoTimestampSchema`, `ModuleSchemaVersionSchema`.
- Frozen triples `QUERY_ERROR_HTTP_STATUS`,
  `QUERY_ERROR_MESSAGE_KEY`, `QUERY_ERROR_RETRY_CLASS` unchanged.
- `SingleScopeArraySchema` literal unchanged.
- `parseTalentContextReadResponse(httpStatus, body)` signature unchanged.

## Build / test commands

```
npm ci
npm run build
npm test
# 45 suites discovered, 245 tests, 0 fail.
```

(Node 24.19.0, npm 11.17.0, TypeScript 5.7.3, Zod 3.24.2.)

## Out of scope (runtime NOT_EXECUTED)

- Endpoint handlers / signer / key provisioning / DB / replay stores.
- Auth / RLS / session / browser wiring.
- Consumer migration / package release / tarball publication.
- Docker / VPS / deploy / pilot / production.
- Mock-based PASS for signature verification, jti consumption, session
  activity, RLS, cancel atomicity.

Status: READY_FOR_PRODUCER_RECHECK_AND_INDEPENDENT_DELTA_AUDIT.

## Manifest

- `packages/contracts/manifest.sha256` (committed blob, Raw-File-SHA256: `b9c0505c4a7625fe66e68f18361159edaadfebfe98c237fef19a7961865cdc76`): 23 entries. Verified every entry matches the committed HEAD blob via `git ls-tree HEAD <path>`; ALL MATCH.
- `reconciliation/crm/CONTRACT-03A/r2/manifest.txt` (no self-hash): 4 entries. Verified via the same `git ls-tree` parity check.

## I-01 closure

Producer recheck (MSG-032) verified 9/9 bundle entries. The final manifest at HEAD 34d2cfc covers 22 + 3 = 25 entries, all MATCH against git ls-tree HEAD <path>, with clean-checkout tests passing in C:/clean-test (244/244). See I-01-CLOSURE.md in this bundle for the full closure record.

---

## Batch 4 addendum (r2)

- Final correction commit: 39885326a7957414e546e5245ae58faaeb993f69
- Parent: 7c804c92ff8105596383b13ef9f9546617d69b6e
- Branch: codex/contract03a-schema-conformance

### F-01 acceptance (bilateral)

- Header (alg/typ/kid) and claims (iss/sub/serviceId/aud/iat/exp/jti/scope/binding/request/actor) conform to EP-01 spec at consumer-facing entrypoint validateAssertionProfile.
- Raw duplicate-key detection (escaped-equivalent + nested) BEFORE JSON.parse via parseAssertionHeader + detectDuplicateKeys.
- Issuer validation enforced at entrypoint (Layer 6) with required expectedIssuer in opts.
- Per-operation actor: create/exchange/cleanup/query recognized; query requires DELEGATED_USER; non-query rejects query actor.
- Impl-shape (binding/request flipped, typ:JWT) accepted only for legacy producer compatibility; spec-shape demands typ:hrp-crm-service+jwt.

### F-03 acceptance

- encodeBase64Url/decodeBase64Url accept canonical base64url (A-Z,a-z,0-9,-,_); reject padding; reject noncanonical alphabet; reject malformed; reject noncanonical spellings via exact byte-accurate round-trip.
- Token schemas enforce exact decoded length (32 bytes for PendingRequestId/HandoffProof/Receipt/DelegationRef/CallbackState/Jti/Csrf).
- Buffer fallback accepts - and _ for both encode and decode.

### F-04 acceptance

- BINDING_ID_GRAMMAR = ^[A-Za-z0-9][A-Za-z0-9._:-]*$ rejects leading punctuation; non-canonical grammar rejected.
- effectiveHrpUserId uses canonical grammar at consumer-facing schema (ExchangeDelegationSuccessSchema).
- Timestamp: UTC-Z only (rejects +07:00); calendar-valid (rejects 2026-02-30).
- No new active-session gate added to cleanup/cancel schema.

### F-06 acceptance

- Fixture packages/contracts/tests/fixtures/redaction-vectors.fixtures.json pinned to MSG-028 authoritative blob with provenance wrapper.
- expectedUnavailableFields preserved on every vector.
- Portable loader loadPinnedVectors() reads from repo-relative path.
- 22/22 authoritative redaction vectors PASS via reproducible package suite.

### I-01 manifest integrity (PASS)

- Generator UTF-8 no BOM, LF, executable by Node.
- Node crypto.createHash(sha256) on raw file bytes.
- 64 lowercase hex + 2 spaces + repo-relative path per entry.
- --verify mode reads from committed blobs at HEAD; exit non-zero on missing/mismatch/malformed/non-64-hex.

### Package test counts

- 244 package tests PASS + 1 generator test PASS = 245/245.
- 0 fail.

### Producer probe results (HRP-CRM-MSG-035 / r3 bundle)

- Total: 176
- Pass: 175
- Fail: 1 (HRP probe-script contradiction: F01 implementation-shaped control (diagnostic, not wire approval) expects true; F01 reject generic JWT typ through entrypoint expects false for the IDENTICAL call validate() with default implClaims+implHeader. Cannot be resolved without modifying the HRP-controlled recheck.mjs.)
- 22/22 authoritative redaction vectors PASS.
