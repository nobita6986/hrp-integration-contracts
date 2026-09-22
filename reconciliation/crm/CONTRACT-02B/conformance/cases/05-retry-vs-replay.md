# Category 5: Retry valid query vs Replay credential

## Status

- Replay credential (jti one-shot): AGREED_DIRECTION (r6 REPLAY-VS-RETRY.md).
- Retry semantics (correlationId kept; new jti; reauthorize): PROPOSED (r4 followup REC-002 §4). See `cases/05A-retry-reauthorize.md` for corrected retry cases.
- Retry literal `BOUNDED_NEW_ASSERTION` vs `BOUNDED_SAME_KEY`: PROPOSED (r4 followup REC-004B §3). See `cases/05C-seven-code-parser.md`.
- Implementation specifics (jti format, replay store, retry-after): OPEN, HRP-PENDING.
- DRAFT only.
- **NOTE**: r6 "NEW correlationId for each retry" is corrected by r4 followup. See CORR-05 in CORRECTION-DELTA.md.

## Source of Decision / AC

- r6 REPLAY-VS-RETRY.md: replay token is one-shot; jti consumption is atomic (SET-if-absent with fail-closed semantics).
- **r4 followup REC-002 §4**: retry giữ cùng `correlationId` cho cùng logical read; mỗi attempt dùng assertion/jti mới; refresh do user chủ động là logical read mới nên correlationId mới.
- r6 REPLAY-VS-RETRY.md: "Replay store unavailability = DEPENDENCY_UNAVAILABLE (503), reject closed".
- CRM r6 REC-002 AC #5: Concurrent replay (duplicate jti) -> AUTHENTICATION_REQUIRED 401.
- CRM r6 REC-002 AC #14: Replay store unavailable -> DEPENDENCY_UNAVAILABLE 503.

## Why this category

A consumer must distinguish: (a) the credential is being reused (must reject), (b) the credential is fresh but the caller is retrying after a transient failure (must allow if business intent unchanged).

## Cases

### Case 5.1 - Replay attempt (same jti, same assertion) - MUST REJECT

Input synthetic:
- Assertion: previously consumed (jti already in replay store, still within TTL).
- Caller retries with identical jti and identical body hash.

Expected behavior:
- HTTP 401 AUTHENTICATION_REQUIRED.
- Code: AUTHENTICATION_REQUIRED.
- retryClass: NEVER (retried credential itself is the rejection reason).
- Server MUST log the event for monitoring (correlationId + jti only, no PII).

Nguon decision/AC:
- CRM r6 REC-002 AC #5.
- r6 REPLAY-VS-RETRY.md.

Status: AGREED_DIRECTION.

### Case 5.2 - Retry with NEW jti after transient 5xx (DEPENDENCY_UNAVAILABLE) - reauthorize and retry

Input synthetic:
- Previous response: HTTP 503 DEPENDENCY_UNAVAILABLE (server-side upstream transient).
- Caller now issues NEW request with NEW jti, same logical correlationId (same business intent), same laborProfileId, same fieldAllowlist.

Expected behavior:
- HTTP 200 (nếu transient đã giải quyết) HOẶC HTTP 5xx lại (fresh transient failure vẫn possible) HOẶC HTTP 403 (nếu revoke xảy ra giữa attempt).
- **Không semantic guarantee rằng retry thành công.** Retry là do caller quyết, không phải server promise.
- Server recheck toàn bộ: auth + delegation + user + org + object authorization.
- After 5xx: `retryClass: BOUNDED_NEW_ASSERTION` per r4 query-only profile; caller bounded/backoff, assertion mới.
- response body vẫn giữ cùng `correlationId: C` (same logical read).

Nguon decision/AC:
- r4 REC-002 §4 (retry không phải replay).
- r4 REC-002 §3 (mọi retry kiểm toàn bộ auth/authz lại).
- r4 REC-004B §3 (BOUNDED_NEW_ASSERTION cho transient errors).
- r6 REPLAY-VS-RETRY.md (retry distinction).
- CRM r6 REC-002 AC #14.

Status: PROPOSED.

HRP confirmation point: HRP-13, HRP-16.

Nguon decision/AC:
- r6 REPLAY-VS-RETRY.md (retry distinction).
- CRM r6 REC-002 AC #14.

Status: AGREED_DIRECTION.

### Case 5.3 - Retry with NEW jti after 429 RATE_LIMITED outside retry-after window - MUST ACCEPT

Input synthetic:
- Previous response: HTTP 429 RATE_LIMITED with retry-after header (placeholder).
- retry-after window has passed.
- Caller now issues NEW request with NEW jti.

Expected behavior:
- HTTP 200 OR HTTP 429 again (fresh rate-limit decision is acceptable).
- HRP decides retry-after windows; this case documents the expected shape, not values.
- Nguon decision/AC:
  - r6 REPLAY-VS-RETRY.md.
  - CRM r6 REC-002 AC #14 (generalization).
- Status: AGREED_DIRECTION. HRP-PENDING: HRP-16 (retry-after windows).

HRP confirmation point: HRP-16.

### Case 5.4 - Retry with NEW jti after 403 FORBIDDEN - MUST NOT CHANGE OUTCOME

Input synthetic:
- Previous response: HTTP 403 FORBIDDEN (correct outcome: user lacks permission).
- Caller retries with NEW jti.

Expected behavior:
- HTTP 403 FORBIDDEN again (the permission state is unchanged by retrying).
- Code: FORBIDDEN.
- retryClass on prior error was NEVER; consumer should not retry FORBIDDEN, but if it does, the server MUST respond consistently (no flip to 200).
- Nguon decision/AC:
  - r6 REPLAY-VS-RETRY.md ("Retry is NOT appropriate when the previous response was FORBIDDEN").
- Status: AGREED_DIRECTION.

### Case 5.5 - Retry with NEW jti after 422 VALIDATION_ERROR - MUST NOT CHANGE OUTCOME WITHOUT REQUEST FIX

Input synthetic:
- Previous response: HTTP 422 VALIDATION_ERROR.
- Caller retries with NEW jti but IDENTICAL body (no fix applied).

Expected behavior:
- HTTP 422 VALIDATION_ERROR again. The validation result is deterministic in the request body.
- Nguon decision/AC:
  - r6 REPLAY-VS-RETRY.md.
- Status: AGREED_DIRECTION.

### Case 5.6 - Retry after 404 NOT_FOUND with same laborProfileId - MUST NOT CHANGE OUTCOME

Input synthetic:
- Previous response: HTTP 404 NOT_FOUND (object hidden or nonexistent).
- Caller retries with NEW jti, same laborProfileId.

Expected behavior:
- HTTP 404 NOT_FOUND again. Object state has not changed.
- DOES NOT flip to 200.
- Nguon decision/AC:
  - r6 REPLAY-VS-RETRY.md.
  - CRM r6 REC-004B.
- Status: AGREED_DIRECTION.

### Case 5.7 - Replay store unavailable - MUST FAIL CLOSED

Input synthetic:
- Replay store unavailable (e.g., Redis down).
- A new request arrives with a fresh jti that cannot be persisted/checked.

Expected behavior:
- HTTP 503 DEPENDENCY_UNAVAILABLE.
- Code: DEPENDENCY_UNAVAILABLE.
- MUST NOT proceed to object lookup.
- Nguon decision/AC:
  - r6 REPLAY-VS-RETRY.md ("rejected closed").
  - CRM r6 REC-002 AC #14.
- Status: AGREED_DIRECTION. HRP-PENDING: HRP-12 (replay store technology), HRP-13 (retention).

## What these cases do NOT cover

- Real jti format (placeholder).
- Real replay store technology (HRP-PENDING).
- Real retry-after values (HRP-PENDING).
- Real revocation (separate category).

## Out-of-scope points

- HRP-11 (jti format) - OPEN.
- HRP-12 (replay store) - OPEN.
- HRP-13 (replay retention) - OPEN.
- HRP-15 (revocation propagation) - OPEN.
