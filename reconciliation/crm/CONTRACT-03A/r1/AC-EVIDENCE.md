# CONTRACT-03A — Acceptance criteria evidence

## Test execution

Command: `npm test` from `packages/contracts/`
Output: 111 tests, 16 suites, all passing.

```
tests 111
suites 16
pass 111
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 478.4856
```

## AC1 — Strict query request/result and projection semantics

### Strictness

- `.strict()` on every object schema: TalentContextReadQueryRequestSchema,
  TalentContextReadResultSchema, IdentitySummarySchema, QueryDelegatedUserActor,
  TalentContextReadTargetSchema, UnavailableFieldsSchema,
  TalentContextReadFieldAllowlistSchema.
- Rejects extras: `extra laborProfileVersion rejected`, `snapshotVersion extra rejected`,
  `extras rejected` for IdentitySummary, `extra fields rejected` for
  CreateDelegationRequest.

### No version fields

- Result has no `snapshotVersion`, no `expectedVersion`, no `laborProfileVersion`.
- Request has no `laborProfileVersion`. Tests verify extras rejected.
- `resolvedAt` is plain ISO timestamp, not version token.

### Requested/unsupported/unrequested split

- `unavailableFields: []` = nothing requested that was unsupported.
- `unavailableFields: ['identitySummary']` = requested but not safe.
- `unavailableFields: ['placementCase']` = requested known-but-unsupported.
- Test: `identitySummary in unavailableFields rejected` (cannot be both).
- Test: `identitySummary omitted other unavailable valid` (requested-but-unsafe omitted).

Evidence: query-conformance.test.mjs (R projection).

## AC2 — Seven-code errors

### Frozen triples (HTTP/messageKey/retryClass)

| Code | HTTP | messageKey | retryClass |
| --- | --- | --- | --- |
| VALIDATION_ERROR | 422 | errors.validation | NEVER |
| AUTHENTICATION_REQUIRED | 401 | errors.authenticationRequired | REAUTHENTICATE |
| FORBIDDEN | 403 | errors.forbidden | NEVER |
| RATE_LIMITED | 429 | errors.rateLimited | BOUNDED_NEW_ASSERTION |
| DEPENDENCY_UNAVAILABLE | 503 | errors.dependencyUnavailable | BOUNDED_NEW_ASSERTION |
| NOT_FOUND | 404 | errors.talentContext.notFound | NEVER |
| INTERNAL_ERROR | 500 | errors.talentContext.internal | NEVER |

### Rejections (verified by tests)

- VERSION_CONFLICT (command-only): `VERSION_CONFLICT rejected`
- UNKNOWN_COMMAND_OUTCOME (command-only): `UNKNOWN_COMMAND_OUTCOME rejected`
- BOUNDED_SAME_KEY retry literal (command-only): `BOUNDED_SAME_KEY rejected`
- Empty errors: `empty errors rejected`
- Multiple errors: `multiple errors rejected`
- Wrong messageKey for code: `wrong messageKey rejected`
- Wrong HTTP status for code: `wrong HTTP rejected`
- Extra fields in error object: `extra fields rejected`
- Enum size assertion: `enum size 7`

Evidence: query-conformance.test.mjs (7-code errors).

## AC3 — Delegation schemas separated from query envelope

- `delegation.ts` is a separate file with no exports crossing into query-types.
- Delegation error envelope: `{ status: FAILED, error: { code, messageKey } }` —
  NO `schemaVersion`, NO `correlationId`, NO `errors` array.
- Query error envelope: `{ schemaVersion, status: FAILED, correlationId, errors: [<one>] }`.
- Distinct code enums: QueryErrorCodeSchema (7) vs DelegationErrorCodeSchema (6).
- Delegation has no `retryClass`.
- Test: status=OK rejected for delegation error envelope (status must be FAILED).

Evidence: delegation-conformance.test.mjs (Delegation error envelope).

## AC4 — Assertion/profile validation negative cases

EP-01 strict claims shape covered:

- `correlationId bounds` (length 8..128)
- `correlationId opaque grammar` (rejects spaces, leading separators)
- `organizationId bounds` (1..64)
- `canonical id bounds` (1..128)
- `IsoTimestampSchema bounds` (rejects date-only, rejects naive time)
- `ModuleSchemaVersionSchema = 1`
- `target kind=TALENT only`
- `target extras rejected`
- DELEGATED_USER actor with all 4 fields; missing field rejected; wrong kind rejected

EP-05 field bounds:

- fieldAllowlist: 1..8 unique
- unavailableFields: 0..8 unique
- unknown field rejected

IdentitySummary shape:

- displayOnly must be literal `true`
- fullNameRedacted required
- extras rejected

Evidence: assertion-profile.test.mjs.

## AC5 — Redaction runs all 22 vectors + boundaries

22 vectors from MSG-028:

| ID | Input | Expected |
| --- | --- | --- |
| vietnamese | Nguyễn Văn An | N•• V•• A•• |
| decomposed | Élodie Durand | É•• D•• |
| one_han_token | 李 小龍 | unsafe |
| multi_han | 小龍 | 小•• |
| apostrophe_inside | O''Connor | O•• |
| hyphen_inside | Жан-Поль | Ж•• |
| short | A | unsafe |
| missing | null | unsafe |
| whitespace | "   " | unsafe |
| digit | A1pha Name | unsafe |
| bidi | User\\u202EName | unsafe |
| emoji | \\uD83D\\uDC69\\u200D\\uD83D\\uDCBB Test | unsafe |
| leading_apostrophe | ''Alpha | unsafe |
| leading_hyphen | -Alpha | unsafe |
| leading_mark | \\u0301Alpha | unsafe |
| trailing_punctuation | Alpha- | unsafe |
| one_letter_mark | É | unsafe |
| combining_initial | Q\\u0301uang | Q\\u0301•• |
| consecutive_punctuation | O''''Connor | unsafe |
| control_tab | Alpha\\tBeta | unsafe |
| unicode_spaces | \\u00A0Alpha\\u2003Beta\\u00A0 | A•• B•• |
| unrequested | (caller does not invoke) | n/a |

All 22 vectors: 22 tests pass.

EP-05 boundaries:

- over-limit input (>256 scalars): unsafe
- over-limit tokens (>16): unsafe
- non-string input (number, object, array, null, undefined): unsafe
- empty string: unsafe
- non-letter first character (digits, dot, @): unsafe
- output never contains raw input
- output never leaks phone/CCCD/email (those inputs are themselves rejected)

Evidence: redaction-vectors.test.mjs.

## AC6 — Parser failures handled safely

- `transport 404 with null body not NOT_FOUND` — null body → PROTOCOL_ERROR, not 404-as-NOT_FOUND.
- `transport 404 with HTML not NOT_FOUND` — HTML body → PROTOCOL_ERROR.
- `no raw body leak` — sensitive string in body never appears in JSON.stringify(parsed).
- `multiple errors rejected` — array length constraint enforced.
- `extra fields rejected` — strict schema rejects unknown keys in error objects.
- Parser never falls back to CommandError union: query parser imports its own schemas only.

Evidence: query-conformance.test.mjs.

## AC7 — Tests use actual exported implementation

- All tests import from `../../dist/index.js` (the actual compiled exports).
- No fixture-vs-fixture circular checks. Each test parses an actual literal
  input through `safeParse` and asserts on the result.
- Schema definitions are reused across positive/negative tests — no copy of
  schema definition inside test files.

## AC8 — No silent semantic change

If a test had found a contradiction between MSG-028/EP-01..EP-06 and the
implementation, it would have been reported to T0 CRM rather than silently
relaxed. The implementation adheres to:

- REC-004B r4 query shapes (eight fields, seven-code parser).
- S28 REDACTION.md algorithm steps 1-6.
- S28 TRANSPORT.md sections 1-5.
- EP-01 strict claims shape (correlationId/organizationId/canonical/opaque).
- EP-05 field/token bounds.
- Frozen CRM primitives.ts opaque grammar `^[A-Za-z0-9][A-Za-z0-9._:-]*$`.
- Frozen ERROR_POLICIES for VALIDATION_ERROR/AUTHENTICATION_REQUIRED/FORBIDDEN
  (reused), with retry class override for RATE_LIMITED/DEPENDENCY_UNAVAILABLE
  via the new BOUNDED_NEW_ASSERTION literal.
- NEW additions for NOT_FOUND/INTERNAL_ERROR + the two new messageKeys
  `errors.talentContext.notFound` and `errors.talentContext.internal`.

The implementation does NOT:

- Modify frozen root exports.
- Modify frozen RetryClassSchema (BOUNDED_NEW_ASSERTION is module-local).
- Modify frozen ContractErrorSchema.
- Reuse BOUNDED_SAME_KEY for query retry semantics.
- Add laborProfileVersion/snapshotVersion/expectedVersion.
- Add phone/CCCD/raw DTO.
- Accept unknown/error code/version/field as `unsupported`.