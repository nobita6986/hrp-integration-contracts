# Phase 6 - New Subpath Compatibility Probe

## Subpath under test
`@hrp-engagement/contracts/talent-context-read/v1`

This subpath is the additive new surface introduced by the r2 candidate.
It is greenfield: NO CRM consumer in the 6-consumer matrix currently
imports it.

## Probes used

### A) ESM runtime probe (`probe.mjs`)
21 assertions covering:

| # | Check | Result |
|---|---|---|
| 1 | Subpath module loads at runtime (ESM) | OK |
| 2 | `BACKEND_OPERATIONS` is exported and equals `["backend"]` | OK |
| 3 | `MODULE_SCHEMA_VERSION` is `'1'` | OK |
| 4 | `QUERY_ERROR_HTTP_STATUS` equals `{unauthorized:401, forbidden:403, notFound:404, conflict:409, unavailable:503, internal:500}` | OK |
| 5 | `QueryDelegatedUserActorSchema` rejects empty `id` | OK |
| 6 | `QueryDelegatedUserActorSchema` accepts `{kind:"user",id:"u-1"}` | OK |
| 7 | `TalentContextReadQueryRequestSchema` accepts valid query with assertion + delegatedUser + subject | OK |
| 8 | `TalentContextReadQueryRequestSchema` rejects unknown fields | OK |
| 9 | `TalentContextReadQueryRequestSchema` rejects malformed assertion | OK |
| 10 | `TalentContextReadQueryRequestSchema` rejects invalid delegation token | OK |
| 11 | `TalentContextReadQueryRequestSchema` rejects assertion with missing `value` | OK |
| 12 | `TalentContextReadQueryRequestSchema` rejects assertion with wrong `purpose` enum | OK |
| 13 | `TalentContextReadResultSchema` accepts parsed result with `subject` + `availability` | OK |
| 14 | `TalentContextReadResultSchema` rejects result missing subject | OK |
| 15 | `TalentContextReadErrorSchema` accepts `unauthorized` error | OK |
| 16 | `TalentContextReadErrorSchema` rejects unknown error code | OK |
| 17 | `redactFullName("Nguyen Van Anh")` returns `success:true, value:"N. V. Anh"` | OK |
| 18 | `redactFullName("A")` returns `success:false, reason:"unsafe"` (single-grapheme token) | OK |
| 19 | `redactFullName` with non-string input returns `success:false, reason:"unsafe"` | OK |
| 20 | Subpath root `index` does not import any `dist/` or `src/` private paths | OK |
| 21 | Subpath probe runs in same process as a root import -- root and subpath coexist | OK |

Result: 21/21 PASS.

### B) TypeScript declaration probe (`probe-types.ts`)
Strict TypeScript settings (target ES2022, module NodeNext, moduleResolution NodeNext, strict true).

Imported from subpath:
- `TalentContextReadQueryRequestSchema`, `TalentContextReadResultSchema`, `TalentContextReadErrorSchema`, `QueryDelegatedUserActorSchema`
- `BACKEND_OPERATIONS`, `MODULE_SCHEMA_VERSION`, `QUERY_ERROR_HTTP_STATUS`
- `redactFullName`

Used `z.infer<typeof X>` to derive request/result/error types.
Verified inference types match runtime schema expectations.

Result: 0 TS errors with `skipLibCheck: true` (CRM standard). With
`skipLibCheck: false`, pre-existing errors in `envelopes.d.ts` appear in
both baseline and candidate identically (Zod 3.24.2 vs TS 5.7.3
compatibility; not introduced by the r2 candidate).

## Conclusion
- NEW_SUBPATH_RUNTIME_COMPATIBILITY: PASS
- TYPESCRIPT_DECLARATION_COMPATIBILITY: PASS (subpath declarations resolve
  strict; pre-existing Zod/TS warnings on root only, not on new subpath)