# REC-002 - HRP Proposes Mechanism; CRM Evaluates Consumer Compatibility (T1-B, identical to r6)

## Status

All REC-002 details remain at PROPOSED. CRM T1-B does NOT claim authority over:

- algorithm / key profile
- TTL
- rotation
- revocation
- replay / jti
- delegation issuance / transport
- role policy / role mapping

ADMIN / HR_MANAGER / HR_STAFF is HRP-illustrative only; it is NOT the final role allowlist.

## Framing

HRP owns the proposed mechanism for:

- issuance/transport of delegation proof
- binding service-user-organization-request
- revoke/retry semantics
- role policy

CRM evaluates the proposed mechanism from the consumer side:

- compatibility with existing CRM consumer patterns
- operational impact (key rotation coordination, replay-store dependency, delegation issuance call surface)
- audit metadata alignment

CRM does NOT assign HRP ownership of the shared wire protocol unilaterally. CRM does NOT decide HRP-side implementation details. Both sides discuss until bilateral acceptance.

## What CRM needs from HRP (mechanism proposals)

### 1. Delegation Proof - Issuance/Transport Mechanism

Question for HRP: How does CRM receive a delegation proof from HRP?

Possible directions (HRP decides):
- (A) HRP exposes a delegation issuance API; CRM calls it after user authentication to obtain a delegation token.
- (B) HRP embeds delegation info in the user session or a side-channel response.
- (C) HRP issues delegations as part of a callback during user authentication flow.
- (D) Other: HRP proposal.

CRM does not decide this. HRP owns the delegation issuance surface.

### 2. Binding Mechanism

Question for HRP: What is the exact binding model? Specifically:

- How does HRP bind the signed service assertion to the verified user session?
- How does HRP bind the organizationId claim to the request body and to the effective user context?
- How does HRP ensure that the userId in the actor body matches the verified HRP user?
- How does HRP reject organizationId mismatches prior to any object lookup?

CRM does not propose an answer. HRP owns this design.

### 3. Revoke / Retry Semantics

Question for HRP: How does HRP handle revocation and retry?

- Revocation triggers: what events trigger delegation revocation?
- Revocation propagation: how quickly does revocation take effect?
- Retry safety: when can a CRM client safely retry a query that previously failed?
- Replay vs retry: see REPLAY-VS-RETRY.md.

CRM does not propose answers. HRP owns revocation and retry semantics.

### 4. Role Policy

Question for HRP: What is the role policy for this slice?

- ADMIN/HR_MANAGER/HR_STAFF is HRP-illustrative only.
- HRP must confirm or revise.
- New capabilities (e.g., CAN_READ_TALENT_CONTEXT) are future implementation requirements.

## Negative Acceptance Cases (Draft AC, not run)

These are draft acceptance criteria for bilateral review. They are NOT test results.

| Condition | Expected Response | HTTP |
|---|---|---|
| Unknown / missing kid | AUTHENTICATION_REQUIRED | 401 |
| Wrong algorithm (including none) | AUTHENTICATION_REQUIRED | 401 |
| Expired assertion | AUTHENTICATION_REQUIRED | 401 |
| Body hash mismatch with signed claims | AUTHENTICATION_REQUIRED | 401 |
| Concurrent replay (duplicate jti) | AUTHENTICATION_REQUIRED | 401 |
| Revoked delegation | FORBIDDEN | 403 |
| Delegation-service mismatch | FORBIDDEN | 403 |
| Delegation-user mismatch | FORBIDDEN | 403 |
| Disabled user | FORBIDDEN | 403 |
| Insufficient permission | FORBIDDEN | 403 |
| Wrong organization | FORBIDDEN | 403 |
| Unknown field in fieldAllowlist | VALIDATION_ERROR | 422 |
| Raw phone / CCCD leak attempt | FORBIDDEN | 403 |
| Replay store unavailable | DEPENDENCY_UNAVAILABLE | 503 |

These are PROPOSED; HRP may revise the mapping or add cases.

## CRM Consumer-Side Evaluation

Upon receiving HRP proposals, CRM will evaluate:

- Compatibility with existing CRM consumer patterns.
- Operational impact (key rotation coordination, replay-store dependency, delegation issuance call surface).
- Audit metadata alignment (correlationId, actor, target, outcome, timestamp).

CRM does NOT make final decisions until HRP proposals are in hand.

## What CRM T1-B has NOT decided

- Specific algorithm
- TTL value
- Clock skew tolerance
- Key rotation cadence
- Replay store technology
- Delegation record format
- Delegation API surface
- Revocation delivery mechanism
- Role allowlist
- Audit retention policy beyond metadata-only, no-PII principle