# Category 5C: Seven-Code Query Parser

## Status

- Query-only seven-code parser: PROPOSED (r4 followup REC-004B §3).
- New retry literal `BOUNDED_NEW_ASSERTION`: PROPOSED (r4 followup REC-004B §3, NOT in frozen RetryClassSchema).
- This file documents the seven triples CRM B.03 parser MUST handle; năm frozen-compatible triple giữ nguyên, hai additions + một retry literal thay đổi là query-only.

## Source of Decision / AC

- r4 REC-004B §3 (Lỗi: reuse code names, không reuse command retry semantics).
- Frozen baseline: `RetryClassSchema` (`NEVER | REAUTHENTICATE | REVIEW_REQUIRED | BOUNDED_SAME_KEY | RECONCILE_FIRST`) tại `packages/contracts/src/errors.ts` L17-24.
- Frozen baseline: `ContractErrorSchema.superRefine` buộc chính xác messageKey/retryClass theo `ERROR_POLICIES` (L100-109).
- Frozen baseline: không có `RETRY_SAFE` / `RETRY_UNSAFE` literals.

## Bảy triple (query-only)

| # | Code | HTTP | messageKey | retryClass (query-only) | Authority |
|---|---|---|---|---|---|
| 1 | VALIDATION_ERROR | 422 | errors.validation | NEVER | frozen |
| 2 | AUTHENTICATION_REQUIRED | 401 | errors.authenticationRequired | REAUTHENTICATE | frozen |
| 3 | FORBIDDEN | 403 | errors.forbidden | NEVER | frozen |
| 4 | RATE_LIMITED | 429 | errors.rateLimited | BOUNDED_NEW_ASSERTION | code+messageKey frozen; retryClass query-only |
| 5 | DEPENDENCY_UNAVAILABLE | 503 | errors.dependencyUnavailable | BOUNDED_NEW_ASSERTION | code+messageKey frozen; retryClass query-only |
| 6 | NOT_FOUND | 404 | errors.talentContext.notFound | NEVER | additive (PROPOSED) |
| 7 | INTERNAL_ERROR | 500 | errors.talentContext.internal | NEVER | additive (PROPOSED) |

## Nguyên tắc parser

1. Parser nhận HTTP status + body; phải biết 200 là result, non-2xx là query error.
2. Unknown version/code/field hoặc shape mismatch = protocol failure; không render raw body, không auto-retry, không fallback parse bằng command schema.
3. Transport 404 (route chưa tồn tại) KHÔNG giả làm object NOT_FOUND nếu body không parse đúng.
4. Frozen `ContractErrorSchema` KHÔNG parse được NOT_FOUND/INTERNAL_ERROR (ngoài enum). Old parser phải reject new query additions và `BOUNDED_NEW_ASSERTION`, KHÔNG nới rộng để test xanh.
5. B.03 retry scheduler KHÔNG reuse command idempotency retry helper; dùng query-only retry profile.
6. `BOUNDED_NEW_ASSERTION` cho phép retry read có bound/backoff, cùng logical correlationId nhưng jti mới và reauthorization; không đảm bảo success.

## Cases

### Case 5C.1 - Parser nhận đúng bảy triples

Input synthetic:
- Lần lượt 7 response non-2xx với 7 triple ở trên.

Expected behavior:
- Parser match đúng code/messageKey/retryClass cho cả 7.
- Parser KHÔNG match cho code ngoài 7 (ví dụ `VERSION_CONFLICT`, `UNKNOWN_COMMAND_OUTCOME`, `POLICY_REJECTION`) dù HTTP status hợp lý.

Nguon decision/AC:
- r4 REC-004B §3 (Query-local strict discriminated union đúng bảy code).

Status: PROPOSED.

### Case 5C.2 - Parser reject command-only codes

Input synthetic:
- Response có `code: VERSION_CONFLICT` (frozen code, không thuộc bảy code query).

Expected behavior:
- Parser reject với protocol failure; KHÔNG fallback parse bằng command schema.
- Old command parser vẫn hoạt động bình thường với code này (frozen contract unchanged).

Nguon decision/AC:
- r4 REC-004B §3 (Không import broad ContractError union).

Status: PROPOSED.

### Case 5C.3 - Parser reject unknown code

Input synthetic:
- Response có `code: ANOTHER_GREAT_ERROR` (không trong bảy code).

Expected behavior:
- Parser reject với protocol failure; KHÔNG render raw body, không auto-retry.
- KHÔNG nới rộng bảy code list để test xanh.

Nguon decision/AC:
- r4 REC-004B §3 (Unknown version/code/field → protocol failure).

Status: PROPOSED.

### Case 5C.4 - Parser reject BOUNDED_SAME_KEY từ command contract

Input synthetic:
- Response có `code: DEPENDENCY_UNAVAILABLE` (frozen) và `retryClass: BOUNDED_SAME_KEY` (frozen retry literal).

Expected behavior:
- Parser reject vì frozen triple không match query-only triple. Query-only triple yêu cầu `BOUNDED_NEW_ASSERTION`.
- Đây là compatibility decision explicit: query errors transient KHÔNG parse bằng frozen ContractErrorSchema.
- Nếu hai T0 chọn giữ frozen `BOUNDED_SAME_KEY`, schema và parser phải đối chiếu lại; không âm thầm diễn giải `BOUNDED_SAME_KEY` là cùng jti.

Nguon decision/AC:
- r4 REC-004B §3 (RATE_LIMITED/DEPENDENCY_UNAVAILABLE giữ frozen code+messageKey nhưng đề xuất thay retryClass chỉ trong query schema mới).

Status: PROPOSED.

### Case 5C.5 - Parser reject RETRY_SAFE / RETRY_UNSAFE

Input synthetic:
- Response (CRM r6 illustrative) có `retryClass: RETRY_SAFE` hoặc `retryClass: RETRY_UNSAFE`.

Expected behavior:
- Parser reject vì không thuộc frozen `RetryClassSchema` và không thuộc query-only retry profile.
- Đây là vi phạm rõ với frozen `RetryClassSchema`. CRM B.03 không được nới để test xanh.

Nguon decision/AC:
- r4 REC-004B §3 (RetryClassSchema có 5 giá trị; không RETRY_SAFE/RETRY_UNSAFE).
- Frozen `errors.ts` L17-24.

Status: PROPOSED.

### Case 5C.6 - Parser reject malformed correlationId trong response

Input synthetic:
- Response có `correlationId` malformed (không match `CorrelationIdSchema`).

Expected behavior:
- Parser không echo raw input; dùng safe server-generated ID theo schema.
- Nếu body vẫn parse được nhưng correlationId invalid, parser vẫn raise protocol failure.

Nguon decision/AC:
- r4 REC-004B §2 (malformed/missing correlationId dùng safe server-generated ID theo schema, không echo raw input).

Status: PROPOSED.

### Case 5C.7 - Hidden và nonexistent object cùng sanitized 404

Input synthetic:
- Object O bị RLS ẩn: response 404 NOT_FOUND với code/messageKey/retryClass theo query-only triple.
- Object X không tồn tại: response 404 NOT_FOUND với CÙNG code/messageKey/retryClass.

Expected behavior:
- Body và headers GIỐNG HỆT nhau (trừ correlationId).
- KHÔNG tiết lộ SQL/PII/stack.
- Server MUST log internally khác biệt (cho monitoring) nhưng wire output đồng nhất.

Nguon decision/AC:
- r4 REC-004B §3 (Hidden và nonexistent object cùng sanitized 404 code/messageKey).
- CRM r6 REC-004B.

Status: PROPOSED.

### Case 5C.8 - Transport 404 không phải object NOT_FOUND

Input synthetic:
- Route chưa tồn tại (`POST /api/integrations/crm/talent-context/query` không được enable).

Expected behavior:
- Transport 404 (HTML hoặc body không parse được).
- Parser KHÔNG coi là object NOT_FOUND.
- Body không parse được → protocol failure.

Nguon decision/AC:
- r4 REC-004B §1 (Transport 404 route chưa tồn tại không được giả làm object NOT_FOUND nếu body không parse đúng).

Status: PROPOSED.

## Những gì case này KHÔNG cover

- Exact parser implementation (HRP-owned producer conformance + CRM-owned consumer conformance).
- Locale messages (Vietnamese dictionary in `errorMessagesVi`; CRM-specific UI messages).
- Audit logging format (Owner decision, không tự quyết).

## Out-of-scope points

- HRP-17 BOUNDED_NEW_ASSERTION literal acceptance - OPEN bilateral.
- HRP-18 NOT_FOUND/INTERNAL_ERROR additions - OPEN bilateral.
- HRP-19 parser implementation ownership - OPEN.
