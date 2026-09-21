# REC-002 Proposal (Authentication & Authorization)

## 1. HRP Current State
- HRP uses User JWT/session authentication.
- Supports active-user lookup and effective role resolution from DB.
- Operates via `withDbContext`/`applyRlsContext`.
- Enforces `LaborProfile` RLS and object visibility based on the effective HRP user.
- Lacks CRM service principal, trusted organization binding, delegation registry, S2S issuer/audience, and replay store capabilities.

## 2. HRP Proposed Direction

### T0 HRP Recommendation
1. CRM must use asymmetric per-request service assertion; no sharing of HS256 user-session secrets.
2. HRP will pin the issuer, audience, service subject, and trusted public key/`kid`.
3. Request actor is strictly `DELEGATED_USER`.
4. The service assertion must be bound to:
   - `serviceId`
   - Delegated HRP `userId`
   - `delegationRef`
   - Pinned `organizationId`
   - HTTP method/path
   - Request body hash
   - `issuedAt` / `notBefore` / `expiresAt`
   - Unique `jti`
5. HRP resolves the delegated user from the DB, checking for active status and effective role/permission.
6. The query runs using the effective delegated user through existing authorization/RLS logic.
7. Service-only authentication must be denied.
8. Incorrect organization must be denied prior to object lookup.
9. First slice supports only a single `organizationId` configured server-side.
10. Hidden or nonexistent objects must return indistinguishable responses.
11. Replay cache requires atomic consume of the `jti`; if the replay store is unavailable, the recommended behavior is to fail closed for the S2S read path.

### Negative Acceptance Cases (Minimum)
- Invalid signature / `kid` / issuer / audience
- Expired / not-yet-valid assertion
- Duplicate `jti` (replay attack)
- Method / path / body-hash mismatch
- `SERVICE` actor without delegation
- `serviceId` mismatch
- Missing / invalid / revoked `delegationRef`
- Inactive delegated user
- Organization mismatch
- Insufficient permission
- Hidden / nonexistent `LaborProfile`
- Replay store unavailable
- Requested field outside of allowlist
- Response containing phone, CCCD, or raw DTO
