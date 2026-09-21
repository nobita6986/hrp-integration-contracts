# REC-002 Proposal (Authentication & Authorization)

## 1. Authentication Layer vs. Query Actor Claim

- **Authentication Proof**: The authority is the asymmetric signed service assertion provided in the `Authorization` header.
- **Query Actor**: The actor payload in the request body is structured according to the frozen authority:
  ```typescript
  actor: {
    kind: 'DELEGATED_USER';
    serviceId: string;
    userId: string;
    delegationRef: string;
  }
  ```
- **Constraint**: All four fields in the `actor` body are strictly *untrusted claims*. They must exactly match the verified claims in the signed assertion.

## 2. Enforcement Sequence (Fail-Closed)
To prevent destroying valid tokens on malformed requests, the atomic consumption of `jti` must happen after body binding. The exact safe enforcement order is:

1. Parse the limited necessary request envelope.
2. Verify pinned `alg`, `typ`, `kid`, signature, issuer, audience, and time validity.
3. Bind the signed HTTP method, canonical endpoint path, raw-body SHA-256, `serviceId`, `actor`, and `organizationId`.
4. Reject organization mismatch prior to any object lookup.
5. Atomically consume the `jti` to prevent replay attacks.
6. Validate the delegation record (active, unrevoked, correct service/user/org/scope).
7. Resolve the active HRP user, role, and permissions strictly from the HRP database.
8. Apply route authorization allowlist.
9. Execute the query using the effective-user RLS.
10. Filter projection exactly before constructing the response.

## 3. Implementation Options & Decisions

| Area | HRP Recommendation | Alternative | Rationale | OWNER_DECISION_REQUIRED |
|---|---|---|---|---|
| **Issuer Owner** | CRM integration identity is the formal issuer owner. | HRP-issued symmetric token. | Decouples secrets; standardizes S2S trust. | Yes |
| **Algorithm** | Asymmetric JWS/JWT. Pin uniquely to `RS256`. Reject `none` and algorithm confusion. | ECDSA (`ES256`). | Simplest well-supported baseline for enterprise integrations. | Yes |
| **Assertion TTL** | Maximum 60 seconds. | 5 minutes. | Limits the window of vulnerability for leaked short-lived tokens. | Yes |
| **Clock Skew** | Maximum 30 seconds. | Strict 0s. | Accounts for minor network and NTP drift across clusters. | Yes |
| **Key Rotation** | Overlap period strictly > (TTL + Skew). Proposed operational value: 24 hours. | Immediate cutover. | Ensures zero downtime during credential rotation. | Yes |
| **Replay Store** | Shared atomic `SET-if-absent` store. Retention until `exp + skew`. Fail closed if unavailable. | In-memory cache. | Distributed lock prevents concurrent replay across pods. | Yes |
| **Delegation** | Persisted revocable record. Bound strictly to service/user/org/scope. Lifetime ≤ upstream user session. | Implicit delegation. | Explicit auditability and targeted revocation. | Yes |
| **Role Allowlist** | Initial slice exactly mirrors existing routes: `ADMIN`, `HR_MANAGER`, `HR_STAFF`. `HR_STAFF` remains under object-level RLS. `DIRECTOR`, `SALE`, `WORKER`, vendor roles, and `SERVICE`-only are strictly omitted. Any new capability (e.g., `CAN_READ_TALENT_CONTEXT`) is a future implementation requirement not in baseline. | Global reader role. | Principle of least privilege; maintains parity with baseline auth. | Yes |
| **Organization ID** | Canonical organization ID must be provided by the Owner (not fabricated). | Implicit single tenant. | Enables multi-tenant scaling path without hardcoded magic strings. | Yes |
| **Audit** | Persist essential metadata only. Do not log raw payload or PII. | Full request logging. | Data minimization and privacy compliance. | Yes |

## 4. Negative Acceptance Cases (Must Deny)
- Unknown or missing `kid`
- Wrong algorithm (including `none`)
- Concurrent replay (duplicate `jti`)
- Signed claims / body hash mismatch
- Revoked delegation
- Delegation-service / user mismatch
- Disabled user
- Insufficient permission
- Wrong organization (checked prior to object lookup)
- Unknown field requested (results in `422`)
- Raw phone / CCCD leak
- Replay-store unavailable
