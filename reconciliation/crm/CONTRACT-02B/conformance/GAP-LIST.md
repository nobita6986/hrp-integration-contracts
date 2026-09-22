# Remaining gaps
Status: DRAFT / NOT_EXECUTED. These are synthetic design examples aligned with HRP MSG-025, not executable schemas or runtime evidence. Technical proposals still require bilateral acceptance. Owner approvals are limited by MSG-026.

## OWNER_APPROVED — do not reopen
- ADMIN/HR_MANAGER/HR_STAFF external eligibility with current object permissions.
- HRP explicit consent, reapproval on uncertain exchange after cancel/confirmed expiry.
- Delegation maximum 15 minutes, bounded by session lifetimes, no auto-refresh.
- CRM immediate local blocking plus bounded HRP expiry window when revoke delivery fails, controlled pilot only.

## OPEN — Owner/HRP operations
ORG-1: HRP supplies canonical organizationId/registration, not CRM-invented value.
AUDIT-1: metadata access, retention and recovery responsibility; no raw token/body/PII.

## PROPOSED — bilateral engineering
AUTH-1: MSG-025 recommends RS256, assertion TTL<=60s/skew30s, pinned issuer/audiences/key provisioning; not final just because Owner approved delegation lifetime.
AUTH-2: receipt entropy/lifetime, immutable tuple and atomic consume/cancel; exact issuance/exchange/cancel request/response/path shapes and failure precedence remain HRP-REQ-2.
AUTH-3: retry/replay retention to exp+skew, fencing after lost state and key lifecycle including proposed rotation overlap.
AUTH-4: callback/session integration and safe error precedence for malformed actor versus unauthorized delegation.
WIRE-1: exact query shapes, seven-code parser and BOUNDED_NEW_ASSERTION proposal.
DIST-1: accepted neutral source commit, package/subpath/version and reproducible private artifact distribution. See DISTRIBUTION-PROPOSAL.md.
PII-1: redaction algorithm and synthetic test vectors, including Unicode/short/missing/unsafe values; HRP-REQ-1.

Replay-store backend/library and implementation layout are HRP engineering choices under agreed constraints, not reasons to ask Owner to design infrastructure.
No blanket new capability tag/JWKS endpoint required by this bundle.
Frozen schema remains authority for existing constraints. These examples do not introduce UUID-only identifiers.
No endpoint, package or runtime gate is opened by closing a documentation gap.
