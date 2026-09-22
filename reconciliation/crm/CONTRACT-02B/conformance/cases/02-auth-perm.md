# 02 — Authentication and authorization
Status: DRAFT / NOT_EXECUTED. These are synthetic design examples aligned with HRP MSG-025, not executable schemas or runtime evidence. Technical proposals still require bilateral acceptance. Owner approvals are limited by MSG-026.

Owner MSG-026 APPROVED ADMIN/HR_MANAGER/HR_STAFF external eligibility within existing HRP object permissions, one organization and minimal projection.
Role alone does not authorize every object. HRP resolves active user and current permissions; body claims are not authority.
Cases in fixtures/requests.json:
- service-only: DENY_NO_READ; exact precedence for malformed/missing actor vs permission failure awaits exact boundary spec.
- valid-shape but mismatched/revoked delegation: 403.
- inactive user or wrong pinned organization: 403; wrong org before LaborProfile lookup.
- missing/invalid assertion: 401 with REAUTHENTICATE, not NEVER.
Do not conflate a missing delegationRef (invalid shape) with an active record later revoked.
ORG-1 concrete value remains OPEN; fixture org is synthetic only.
HRP confirms exact failure precedence and issuance transport; no policy is inferred from sample role strings.
