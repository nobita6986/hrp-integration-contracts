# REC-002 CRM T1-B Proposal: Delegation, Binding, and Negative Acceptance

## Provenance

- Parent: CONTRACT-02B r4 DELTA-PROPOSAL.md
- References: HRP CONTRACT-02B-followup/r3 REC-002-PROPOSAL.md
- Response to: HRP bilateral decision register (origin/evidence/hrp-contract-02b-followup-r1, commit 8a28678)

## Scope

This document details CRM T1-B positions on delegation, binding, and negative acceptance cases for the Talent Read slice. It covers only items that are bilateral decisions. HRP implementation decisions are noted as such; they are not claimed by CRM.

## 1. Delegation Model

### 1.1 Who Issues Delegations

HRP T0 recommends that HRP issues delegations, not CRM self-issues.

CRM T1-B position: AGREED. HRP issues delegations as records in HRP database. CRM does NOT self-issue delegations. Delegation is bound to the verified HRP user session.

Rationale: HRP controls the user identity and session lifecycle. CRM is a service consumer. Separating issuance from consumption maintains correct trust boundaries.

### 1.2 Delegation Lifetime

HRP T0 recommends: delegation lifetime must not outlive the upstream user session.

CRM T1-B position: AGREED. The delegation is bound to the HRP user session. If the user session expires or is revoked, the delegation is implicitly revoked.

CRM does NOT request: delegations that outlive the user session, or silent renewal without user re-authentication.

### 1.3 Delegation Revocation

HRP T0 recommends: persisted revocable delegation record with explicit revocation protocol.

CRM T1-B position: AGREED on the model. Revocation must be possible before the natural session expiry. Expected revocation triggers:

- User logout from HRP
- HRP admin revocation of delegation
- Organization change for the user
- Service principal deactivation

CRM does NOT require: real-time CRL/OCSP-style revocation. Revocation at session boundary is acceptable for this slice.

### 1.4 CRM Actor Construction

CRM constructs the DELEGATED_USER actor body from the delegation record provided by HRP. The actor body contains:

```json
{
  "kind": "DELEGATED_USER",
  "serviceId": "<CRM service principal id>",
  "userId": "<HRP user id>",
  "delegationRef": "<delegation record ref>"
}
```

These are untrusted claims in the request body. HRP must verify them against the signed assertion and the delegation record.

CRM does NOT self-declare these fields. They are populated from HRP-issued delegation data.

## 2. Effective User Resolution

### 2.1 Resolution Source

HRP T0 recommends: resolve the active HRP user, role, and permissions strictly from the HRP database.

CRM T1-B position: AGREED. The effective user for object authorization is resolved from HRP database, not from the delegation token alone. CRM does NOT cache or pre-resolve effective user permissions locally.

### 2.2 Role Mapping

HRP T0 recommends initial allowlist: ADMIN, HR_MANAGER, HR_STAFF.

CRM T1-B position: AGREED on the initial allowlist.

HR_STAFF role: object visibility enforced by existing LaborProfile RLS under the effective user context.

CRM does NOT request: a global reader role, a new SERVICE-only role, or any role not in the initial allowlist without a future implementation requirement.

### 2.3 Object Permission Mechanism

HRP T0 recommends: query executes using effective delegated user under existing RLS. Existing LaborProfile RLS is NOT modified.

CRM T1-B position: AGREED. Object visibility is determined by the effective user under HRP RLS. CRM does NOT request modifications to RLS logic. The effective user path satisfies existing RLS without changes.

## 3. Organization Binding

### 3.1 Server-Side Binding

HRP T0 recommends: organizationId is pinned in service registration and verified server-side. It is NOT self-declared by CRM body alone.

CRM T1-B position: AGREED. CRM passes the pinned organizationId in the request body. HRP verifies the organizationId against the service assertion. Any mismatch results in rejection prior to object lookup.

CRM does NOT request: self-declaration of organizationId, multi-org support, or orgId-based routing.

### 3.2 Single Pinned Organization

HRP T0 recommends: slice supports only a single pinned organizationId. Multi-org is blocked.

CRM T1-B position: AGREED. This slice is scoped to a single organization. CRM does NOT request multi-org support in this slice.

### 3.3 Organization ID Format

HRP T0 recommends: Owner provides the canonical organization ID value.

CRM T1-B position: AGREED. The organization ID is an Owner-provided configuration value. The exact format (opaque string, UUID, integer) must be agreed among Owner, CRM, and HRP as part of service registration.

CRM does NOT fabricate or guess the organizationId value.

## 4. Negative Acceptance Cases

The following conditions MUST result in denial (401/403/422) with appropriate error response. CRM T1-B AGREES with all of these.

| Condition | Expected Response | HTTP Status |
|---|---|---|
| Unknown or missing kid | Missing key identifier | 401 AUTHENTICATION_REQUIRED |
| Wrong algorithm (including none) | Algorithm mismatch | 401 AUTHENTICATION_REQUIRED |
| Concurrent replay (duplicate jti) | Token already used | 401 AUTHENTICATION_REQUIRED |
| Signed claims / body hash mismatch | Assertion integrity failure | 401 AUTHENTICATION_REQUIRED |
| Revoked delegation | Delegation revoked | 403 FORBIDDEN |
| Delegation-service / user mismatch | Actor assertion mismatch | 403 FORBIDDEN |
| Disabled user | User not active | 403 FORBIDDEN |
| Insufficient permission | Role not in allowlist | 403 FORBIDDEN |
| Wrong organization | Org mismatch prior to lookup | 403 FORBIDDEN |
| Unknown field requested | Field not in projection enum | 422 VALIDATION_ERROR |
| Raw phone / CCCD leak | Projection violation | 403 FORBIDDEN |
| Replay store unavailable | Security store unavailable | 503 DEPENDENCY_UNAVAILABLE |

CRM does NOT request exceptions to any of these denial cases.

## 5. What Is Not Decided Here

The following are HRP or Owner implementation decisions and are NOT bilateral decisions for this slice:

- Exact delegation record database schema
- Delegation API surface (issue, verify, revoke endpoints)
- Replay store technology (Redis, etc.)
- Key rotation operational procedure details
- Fine-grained key management (key escrow, HSM, etc.)
- Audit record schema and retention policy (beyond metadata only, no PII)
- Actual TTL value within the 60-second ceiling
- Clock skew tolerance within the 30-second ceiling
- New roles or capabilities beyond the initial allowlist

## 6. Open Item Requiring T0 Decision

One item remains OPEN for T0 CRM decision:

**Delegation Proof Transport**: How does CRM receive the delegation record from HRP?

Options:
- (A) HRP exposes a delegation issuance API; CRM calls it with user credentials to obtain a delegation token.
- (B) HRP embeds delegation information in the user session token or a side-channel response.
- (C) A hybrid: delegation is issued during the HRP user authentication flow and passed to CRM via a callback or stored token.

CRM T1-B does NOT decide this. This requires HRP and Owner decision.

## 7. CRM Implementation Obligations

Upon bilateral acceptance of REC-002, CRM T1-B will implement:

- S2S JWT assertion construction with CRM-issued key material
- DELEGATED_USER actor body construction from HRP-provided delegation data
- correlationId generation and tracing
- organizationId from pinned configuration
- fieldAllowlist construction for supported projections
- Error response parsing for all defined error codes
- Audit metadata recording (correlationId, orgId, actor, target, resolvedAt, outcome, timestamp)

CRM will NOT implement:
- Any key material generation or rotation procedures
- Replay store
- Delegation issuance or revocation
- HRP effective user resolution logic
