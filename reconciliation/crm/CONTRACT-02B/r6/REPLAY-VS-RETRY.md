# Replay vs Retry - Distinct Semantics

## Replay Token

A replay token (jti - JWT ID) is a ONE-TIME-USE identifier. After HRP consumes the jti, the same jti MUST NOT be accepted again. This protects against token theft and replay attacks.

Properties:
- Same jti within the TTL window = rejected as AUTHENTICATION_REQUIRED (401).
- jti consumption is atomic (SET-if-absent with fail-closed semantics).
- jti lifetime = assertion TTL + clock skew (max TTL+skew).
- Replay store unavailability = DEPENDENCY_UNAVAILABLE (503), reject closed.

## Retry of a Valid Query

A retry is a NEW request with a NEW jti, NEW correlationId, and the same business intent. Retry is appropriate when:
- The previous response was DEPENDENCY_UNAVAILABLE (503) and is now expected to succeed.
- The previous response was RATE_LIMITED (429) and the retry-after window has passed.
- The caller wants a fresh snapshot (since resolvedAt is a query-time marker, NOT a version guarantee).

Retry is NOT appropriate when:
- The previous response was FORBIDDEN (403) - permission has not changed.
- The previous response was VALIDATION_ERROR (422) - the request is malformed; fix the request first.
- The previous response was NOT_FOUND (404) - object state has not changed.

## Wire-Level Distinction

Replay attempt (must reject):
- Same assertion (or same jti) sent twice within TTL.
- HRP detects duplicate jti via replay store.
- Response: AUTHENTICATION_REQUIRED (401).

Retry attempt (must succeed if previous transient failure):
- New assertion, new jti, same correlationId (for tracing) OR new correlationId.
- HRP treats as a fresh request.
- Response: 200 success or appropriate error.

## Status

- Replay token semantics: PROPOSED (HRP implementation, but fail-closed is AGREED_DIRECTION).
- Retry semantics: PROPOSED (HRP implementation decides retry-after windows).

## What CRM Does NOT Decide

- jti format
- replay store technology
- replay store retention
- retry-after header values
- backoff strategy