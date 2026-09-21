# Required Bilateral Owner Decisions

The following items are strictly `OWNER_DECISION_REQUIRED`. They are presented as T0 HRP recommendations and are awaiting CRM bilateral approval.

## REC-002 Decisions
- **Issuer owner**: Which system formally owns and issues the S2S tokens?
- **Thuật toán cụ thể**: Exact signature algorithm (e.g., RS256, ES256).
- **Access assertion TTL**: The maximum time-to-live for a single service assertion.
- **Clock skew**: Allowed clock skew window.
- **Key-rotation overlap**: Grace period and overlap behavior during key rotation.
- **Delegation lifetime và revocation**: How long a delegation lives and the protocol for its revocation.
- **Replay-store technology/retention**: Underlying technology (e.g., Redis) and retention period for consumed `jti`s.
- **Exact HRP role/capability allowlist**: Strict mapping of effective user roles to endpoints.
- **Canonical organizationId value**: Exact string or format for the pinned organization.
- **Audit retention và operational recovery**: Policies for audit trails and recovery scenarios.

## REC-004b Decisions
- **Exact query envelope naming/transport**: HTTP framing and endpoint paths.
- **Additive enum compatibility và exhaustive consumers**: Whether to adopt the query-local versioned error union (HRP recommendation) or push an additive global enum which requires exhaustive CRM audit.

(No design is considered ACCEPTED_SHARED until these decisions are explicitly closed by T0 CRM).
