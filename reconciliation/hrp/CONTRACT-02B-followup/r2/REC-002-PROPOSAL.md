# REC-002 Proposal (Authentication & Authorization)

## 1. Authentication Layer vs. Query Actor Claim

- **Authentication Proof**: The authority is the asymmetric signed service assertion provided in the `Authorization` header.
- **Query Actor**: The `DELEGATED_USER` claim in the request body is strictly an *untrusted claim* and must not be treated as authority.

### Explicit Binding Requirements
HRP must verify and bind the following claims securely:
- `serviceId`, `userId`, `delegationRef`, `organizationId`
- `HTTP method` and `canonical endpoint path`
- SHA-256 hash of the raw request-body bytes
- JWT Claims: `iss`, `sub`, `aud`, `iat`, `nbf`, `exp`, `jti`
- JOSE Header: `alg`, `typ`, `kid`

## 2. Enforcement Sequence (Fail-Closed)
1. Verify algorithm, header, signature, issuer, audience, and time validity.
2. Atomically consume the `jti` to prevent replay attacks.
3. Match the pinned organization before any object lookup occurs.
4. Bind the signed claims against the unverified actor and request body.
5. Validate the delegation (must be active, valid service/user/org/scope).
6. Lookup the HRP user: read `isActive`, `role`, and `permissions` strictly from the HRP database (never trust roles provided in the request or token).
7. Apply the exact route capability/role allowlist.
8. Execute the query under the effective HRP user via existing RLS.
9. Select only the minimum required projection (never invoke or return the raw `LaborProfileDetailDto`).
10. `SERVICE`-only contexts must always be denied.

## 3. Implementation Options & Decisions

| Area | HRP Recommendation | Alternative | Rationale | OWNER_DECISION_REQUIRED |
|---|---|---|---|---|
| **Issuer Owner** | CRM integration identity is the formal issuer owner. | HRP-issued symmetric token. | Decouples secrets; standardizes S2S trust. | Yes |
| **Algorithm** | Asymmetric JWS/JWT. Pin uniquely to `RS256`. Reject `none` and algorithm confusion. | ECDSA (`ES256`). | Simplest well-supported baseline for enterprise integrations. | Yes |
| **Assertion TTL** | Maximum 60 seconds. | 5 minutes. | Limits the window of vulnerability for leaked short-lived tokens. | Yes |
| **Clock Skew** | Maximum 30 seconds. | Strict 0s. | Accounts for minor network and NTP drift across clusters. | Yes |
| **Key Rotation** | Overlap period strictly > (TTL + Skew). Proposed operational value: 24 hours. | Immediate cutover. | Ensures zero downtime during credential rotation. | Yes |
| **Replay Store** | Shared atomic `SET-if-absent` store (e.g., Redis). Retention until `exp + skew`. Fail closed if unavailable. | In-memory cache (per pod). | Distributed lock prevents concurrent replay across pods. | Yes |
| **Delegation** | Persisted revocable record. Bound strictly to service/user/org/scope. Lifetime ≤ upstream user session. | Implicit delegation. | Explicit auditability and targeted revocation. | Yes |
| **Role Allowlist** | Strict initial route capability/role allowlist. `HR_STAFF` remains subject to existing RLS object scope constraints. | Global reader role. | Principle of least privilege. | Yes |
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
- Unsupported or unknown field requested
- Raw phone / CCCD leak
- Replay-store unavailable
