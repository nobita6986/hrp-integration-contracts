# 05B — Receipt, exchange and cancel
Status: DRAFT / NOT_EXECUTED. These are synthetic design examples aligned with HRP MSG-025, not executable schemas or runtime evidence. Technical proposals still require bilateral acceptance. Owner approvals are limited by MSG-026.

Owner approved HRP login/explicit consent, possible reapproval after timeout and bounded pilot lifetime; exact wire transport is still PROPOSED.
Receipt binding draft: pendingId/service/effective HRP user/org/scopes/audiences/CRM subject/session/HRP session/callback/approval time/expiry.
Draft cases:
- Invalid service/session/org/audience/receipt binding -> deny; no delegation.
- Expired or consumed receipt -> deny; do not replay exchange result.
- Concurrent exchange -> atomic receipt consume + at most one active delegation.
- Transaction abort -> neither partial consumed receipt nor orphan delegation; consumed assertion jti not reused.
- Exchange timeout after possible commit -> authenticated cancel-pending, not receipt replay with new jti.
- Cancel concurrent with exchange -> serialized pending state; cancel revokes any resulting delegation.
- Cancel repeated -> idempotent, sanitized response, no existence oracle.
- Cancel ACK lost -> bounded cancel retry with new assertion; no replacement approval until ACK or HRP-confirmed expiry.
- Cancel after receipt expiry still authorized by bound pending transaction.
- New approval uses new pendingId/state/receipt.
Do not use Talent read result/error envelope for exchange/cancel; exact paths/body/status are HRP-REQ-2 OPEN.
No capability currently implemented is asserted by these cases.
