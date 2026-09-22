# 05 — Logical query retry vs credential replay
Status: DRAFT / NOT_EXECUTED. These are synthetic design examples aligned with HRP MSG-025, not executable schemas or runtime evidence. Technical proposals still require bilateral acceptance. Owner approvals are limited by MSG-026.

Supersedes the old contradictory CRM examples; no new correlationId per retry.
Same logical query -> same correlationId; each attempt -> fresh signed assertion and jti.
User-initiated refresh -> new logical query/correlationId.
correlationId is trace only, not authorization, cache or dedupe authority.
Consumed jti reuse -> 401. Do not refund jti after downstream failure.
429/503 -> bounded retry/backoff, honor valid Retry-After, full reauthorization.
Timeout is unknown transport outcome; new attempt still requires fresh assertion and all checks.
Retry may succeed or fail under current state; never MUST_SUCCEED.
403/404/422/500 do not schedule automatic retry under proposed matrix.
401 requires auth correction/reconnect, not an infinite silent signing loop.
No guaranteed response equality across retry: object data, permissions and resolvedAt can change.
See case_5_* request examples. Assertion/key profile still PROPOSED.
