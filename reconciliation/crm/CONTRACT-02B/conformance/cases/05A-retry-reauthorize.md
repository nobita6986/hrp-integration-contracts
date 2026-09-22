# 05A — Reauthorization and revocation
Status: DRAFT / NOT_EXECUTED. These are synthetic design examples aligned with HRP MSG-025, not executable schemas or runtime evidence. Technical proposals still require bilateral acceptance. Owner approvals are limited by MSG-026.

Draft cases:
1. Consume jti, downstream 503, retry within budget with new jti/same correlationId -> full auth recheck.
2. HRP revoke commits before retry authorization checkpoint -> deny 403 even if first attempt was transient.
3. Query already past checkpoint before revoke -> no retroactive cancellation guarantee.
4. User inactive/role or object permission changes -> enforce current HRP authority on retry.
5. Replay/delegation/user authority unavailable -> 503 fail-closed; no stale allow/service-only fallback.
6. Replay state lost -> fence until valid assertion horizon passes or controlled credential epoch invalidation; backend design remains HRP-owned.
Owner-approved controlled-pilot window: CRM logout/account switch blocks locally immediately; failed revoke delivery can leave HRP delegation valid only to remaining expiry (max 15 minutes, bounded by sessions), no auto-refresh.
This is not production acceptance or immediate cross-system revocation.
HRP proposal: retention to absolute exp+skew, atomic consume, no early eviction; exact mechanism not implemented.
