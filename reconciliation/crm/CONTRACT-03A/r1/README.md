# CONTRACT-03A — Shared schemas + synthetic conformance

## Scope

Dedicated schemas, parser, pure assertion/profile validators, redaction function
and synthetic conformance tests for the CONTRACT-02B TalentContextRead v1
perimeter, distinct from frozen command contracts.

Implementation perimeter is exactly the artifacts the bilateral acceptance
(Msg-ID MSG-030) closed at design level: C-01..C-07 + EP-01..EP-06.

## Module

`packages/contracts/src/talent-context-read/` — local to this branch.
Exported via `packages/contracts/dist/talent-context-read/` after `tsc`.
NOT re-exported from frozen contracts root.

Files (each prefixed path):

| File | Purpose |
| --- | --- |
| primitives.ts | Local CorrelationId/OrganizationId/CanonicalId/IsoTimestamp/SchemaVersion primitives compatible with frozen CRM primitives.ts at 72643356 |
| query-types.ts | TalentContextReadTarget, Field enum, FieldAllowlist, QueryDelegatedUserActor, QueryRequest, IdentitySummary, UnavailableFields, Result |
| query-errors.ts | Seven-code parser: HTTP status/messageKey/retryClass triples; QueryRetryClass enum with BOUNDED_NEW_ASSERTION; QueryErrorCode enum (7 codes); ErrorSchema; ErrorResponseSchema |
| query-parser.ts | parseTalentContextReadResponse(httpStatus, body) — 200 = direct result; non-2xx = error envelope; wrong HTTP/protocol failures → PROTOCOL_ERROR |
| delegation.ts | CrmBinding; CreateDelegationRequest/Success; ExchangeDelegationRequest/Success; CancelDelegationRequest; RevokeDelegationRequest; DelegationAck; DelegationErrorResponse. Distinct from query envelope. |
| redaction.ts | redactFullName — pure function implementing S28 REDACTION.md algorithm (NFC + control rejection + grammar + grapheme segmenter + masked initial) |

## Tests

`packages/contracts/tests/talent-context-read/` — synthetic conformance.

| File | Coverage |
| --- | --- |
| redaction-vectors.test.mjs | 22 vectors from MSG-028 REDACTION-VECTORS.json + EP-05 boundary cases (over-limit, non-string, non-letter, leak) |
| query-conformance.test.mjs | Request positive/negative; result projection semantics; seven-code parser frozen triples + reject command-only, unknown, empty/multiple, wrong HTTP, wrong messageKey/retryClass, extra fields, raw-body leak |
| delegation-conformance.test.mjs | Create/exchange/cancel/revoke positive+negative; canonical ID prefixes; delegation error envelope distinct from query |
| assertion-profile.test.mjs | EP-01 strict claims shape, EP-05 field bounds, IdentitySummary shape, plus future-runtime-test-requirements marker |

## Test execution

```
$ npm test
> @hrp-integration-contracts/talent-context-read-dev@0.0.0-dev.0 test
> tsc -p tsconfig.json && node --test tests/talent-context-read/*.test.mjs

(tests run)
tests 111
suites 16
pass 111
fail 0
```

## Acceptance criteria mapping

| AC | Evidence |
| --- | --- |
| Strict query request/result and projection semantics | query-conformance.test.mjs (Q positive/negative, R projection) |
| Seven-code errors; reject command-only/unknown/extra/empty/multiple | query-conformance.test.mjs (7-code errors) |
| Delegation schemas separated from query envelope | delegation.ts (separate schemas) + delegation-conformance.test.mjs |
| Assertion/profile validation negative cases | assertion-profile.test.mjs |
| Redaction 22 vectors + EP-05 boundaries | redaction-vectors.test.mjs |
| Parser failures safe; no fallback command error; no raw payload | query-conformance.test.mjs (404 null/HTML, no raw body leak) |
| Tests use actual exported implementation | All tests import from dist/index.js (real exports), not fixtures |
| No silent semantic change | Implementation matches REC-004B r4 + MSG-028 r2 + CA28; deviations listed in NOTES.md |

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
recorded as future runtime test requirements in assertion-profile.test.mjs.
No mock-based PASS is granted for them.

## Provenance

- Implementation starting baseline: 1855b88d67f61e2efcdd2eaa2b888ba303bfc724
- Acceptance record: reconciliation/hrp/CONTRACT-02B-bilateral-acceptance/r1/
  (MSG-030 closing PROPOSED state of EP-01..EP-06 in accepted perimeter)
- Accepted design: c3a547dccc209496ac8ef407612ea857249d22fc
  (reconciliation/hrp/CONTRACT-02B-consolidated/r1/)
- Precedence: SPECIFICATION.md + ENGINEERING-PROFILE.md + DECISION-REGISTER.md
- Branch: codex/contract03a-schema-conformance
- Consumer-readiness input: reconciliation/crm/CONTRACT-02B/consumer-readiness/
  (CONTRACT-02B bundle, commit ffe4896)

Status: READY FOR PRODUCER REVIEW AND INDEPENDENT AUDIT.