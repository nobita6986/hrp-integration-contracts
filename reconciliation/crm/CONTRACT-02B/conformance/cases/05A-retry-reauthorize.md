# Category 5A: Retry valid query - corrected for r4 followup

## Status

- Retry semantics (logical correlationId kept; new jti; reauthorize): PROPOSED (r4 followup REC-002 §4).
- Revocation race; user inactive: PROPOSED (r4 followup REC-002 §3).
- This file replaces Category 5 retry rules from r6 to align with r4 followup.

## Source of Decision / AC

- r4 REC-002 §4 (Retry is not replay): giữ `correlationId` cho cùng logical read và các lần retry; mỗi attempt dùng assertion/jti mới; refresh do user chủ động là logical read mới nên correlationId mới.
- r4 REC-002 §3 (Lifetime, revoke và availability): mọi retry kiểm toàn bộ authentication, delegation, user, org và object authorization lại.
- r4 REC-002 §5 (Negative AC draft): Timeout sau consume rồi retry mới -> reauthorize; revoke commit trước retry -> retry 403.
- Frozen baseline: RetryClassSchema có 5 giá trị (`NEVER`, `REAUTHENTICATE`, `REVIEW_REQUIRED`, `BOUNDED_SAME_KEY`, `RECONCILE_FIRST`); không `RETRY_SAFE`/`RETRY_UNSAFE`.

## Nguyên tắc mới (r4 followup)

1. **Cùng logical read** giữ cùng `correlationId` qua mọi attempt. `correlationId` chỉ để trace, không phải dedup/cache key.
2. **Mỗi attempt dùng assertion mới, jti mới.** Refresh do user chủ động là logical read mới → correlationId mới.
3. **Mỗi attempt phải reauthorize toàn bộ** (auth + delegation + user + org + object). Sau revoke có thể 403 dù lần trước thành công.
4. **CRM trace attempt riêng bằng jti hash trong metadata nội bộ.** Không thêm field wire chỉ để trace.
5. **Transient 429/503 có thể retry bounded/backoff** và tôn trọng Retry-After hợp lệ.
6. **Timeout sau khi đã consume jti** cũng phải dùng jti mới.
7. **Không cam kết retry transient failure sẽ thành công.** Retry là do caller quyết, không có semantic guarantee về kết quả.
8. **Không auto-retry 401/403/404/422/500.** 401 không được tạo signing loop vô hạn.

## Cases

### Case 5A.1 - Retry giữ nguyên correlationId, jti mới

Input synthetic:
- Logical read L, correlationId C được cấp lần đầu.
- Attempt #1: HTTP 503 DEPENDENCY_UNAVAILABLE (BOUNDED_NEW_ASSERTION per r4 query-only retry profile).
- Attempt #2: cùng correlationId C, jti mới J2, assertion mới, body hash mới (vì jti/replay binding).

Expected behavior:
- HTTP 200 (nếu HRP-13 sẵn sàng) HOẶC HTTP 5xx lại (transient còn lặp lại) HOẶC HTTP 403 (nếu revoke xảy ra giữa hai attempt).
- response body vẫn cùng `correlationId: C`.
- Server log/audit: hai attempt phân biệt bằng `(jti=hash(J1), outcome=5xx)` và `(jti=hash(J2), outcome=...)`.
- correlationId KHÔNG dùng làm authority hay cache key.

Nguon decision/AC:
- r4 REC-002 §4.
- r4 REC-004B §3 (BOUNDED_NEW_ASSERTION retry literal).

Status: PROPOSED.

HRP confirmation point: HRP-13, HRP-16.

### Case 5A.2 - Reauthorize toàn bộ - revoke race

Input synthetic:
- Attempt #1 với delegation D1, user U active, role `HR_MANAGER`.
- HRP revoke D1 (HRP logout / user disable / admin revoke) trước khi Attempt #2 đến.
- Attempt #2: cùng correlationId C, jti mới, assertion mới, body hash mới, cùng delegationRef.

Expected behavior:
- HTTP 403 FORBIDDEN (delegation no longer active) HOẶC HTTP 404 NOT_FOUND (nếu object authorization fail do RLS) HOẶC HTTP 401 (nếu assertion key đã rotate/revoke).
- KHÔNG có semantic guarantee rằng retry thành công.
- Server MUST recheck delegation/user authorization, không dùng positive cache.

Nguon decision/AC:
- r4 REC-002 §3 (Revoke đồng bộ).
- r4 REC-002 §4 (Reauthorize toàn bộ).
- r4 REC-002 §5 negative AC (Revoke commit trước retry → retry 403).

Status: PROPOSED.

### Case 5A.3 - User inactive / role xuống dưới allowlist

Input synthetic:
- Approval record có user U lúc đầu active với role `HR_MANAGER`.
- Trước Attempt #2 (trong cùng logical read C): HRP user disable HOẶC role bị giảm xuống `WORKER`.
- Attempt #2: cùng correlationId C, jti mới, assertion mới.

Expected behavior:
- HTTP 403 FORBIDDEN. Body says `code: FORBIDDEN`, `messageKey: errors.forbidden`, `retryClass: NEVER`.
- Server đọc user permission hiện thời mỗi attempt; không cache positive authorization.
- Allowed role set is `ADMIN`, `HR_MANAGER`, `HR_STAFF` (r4 REC-002 §2 step 7). `WORKER` and below không thuộc allowlist.

Nguon decision/AC:
- r4 REC-002 §2 step 7 (route allowlist).
- r4 REC-002 §3 (permission change mỗi query).

Status: PROPOSED.

### Case 5A.4 - Replay authority (replay/delegation/user authority store) unavailable

Input synthetic:
- Replay store hoặc delegation store trả lỗi (e.g. Redis cluster down, hoặc Postgres replica stale).
- Attempt mới: jti mới, nhưng không thể consume replay key hay đọc delegation record.

Expected behavior:
- HTTP 503 DEPENDENCY_UNAVAILABLE. `code: DEPENDENCY_UNAVAILABLE`, `messageKey: errors.dependencyUnavailable`, `retryClass: BOUNDED_NEW_ASSERTION` (query-only profile per r4).
- Server MUST NOT proceed to object lookup; fail-closed.
- Nếu replay state đã mất hoàn toàn, server phải fence (từ chối) cho tới khi expire assertion horizon hoặc có revoke credential epoch có kiểm soát — không bật lại với store rỗng và nhận token cũ.

Nguon decision/AC:
- r4 REC-002 §3 (replay/delegation store).
- r4 REC-002 §5 negative AC (replay/delegation store unavailable/mất state → 503/fence; không fail-open).
- r4 REC-004B §3 (RATE_LIMITED/DEPENDENCY_UNAVAILABLE → BOUNDED_NEW_ASSERTION trong query-only profile).

Status: PROPOSED.

## Những gì case này KHÔNG cover

- Exact issuance/exchange/cancel transport shapes (HRP-PENDING, chưa đối chiếu — xem `cases/05B-exchange-cancel-receipt.md`).
- Exact retry-after values (HRP-PENDING, HRP-16).
- Real jti format (HRP-PENDING, HRP-11).
- Real revocation hook wiring (HRP-PENDING, HRP-15).

## Out-of-scope points

- HRP-11 jti format - OPEN.
- HRP-13 replay retention - OPEN.
- HRP-15 revocation propagation - OPEN.
- HRP-16 retry-after windows - OPEN.
