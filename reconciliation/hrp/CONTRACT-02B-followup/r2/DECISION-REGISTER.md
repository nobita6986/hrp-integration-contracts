# Required Bilateral Owner Decisions (r2)

The following items are strictly `OWNER_DECISION_REQUIRED`. They are presented as T0 HRP recommendations and are awaiting CRM bilateral approval.

## REC-002 Decisions
- **Issuer owner**: Which system formally owns and issues the S2S tokens? (HRP recommends CRM).
- **Thuật toán cụ thể**: Exact signature algorithm. (HRP recommends uniquely pinning to `RS256`, rejecting `none` and algorithm confusion).
- **Access assertion TTL**: The maximum time-to-live for a single service assertion. (HRP recommends max 60 seconds).
- **Clock skew**: Allowed clock skew window. (HRP recommends max 30 seconds).
- **Key-rotation overlap**: Grace period and overlap behavior during key rotation. (HRP recommends an overlap > TTL + skew, e.g., 24 hours).
- **Delegation lifetime và revocation**: How long a delegation lives and the protocol for its revocation. (HRP recommends it must not outlive the upstream user session).
- **Replay-store technology/retention**: Underlying technology and retention period for consumed `jti`s. (HRP recommends shared atomic `SET-if-absent` with retention up to `exp + skew`, failing closed if unavailable).
- **Exact HRP role/capability allowlist**: Strict mapping of effective user roles to endpoints. (HRP recommends explicit allowlists, keeping `HR_STAFF` bound to existing RLS scope).
- **Canonical organizationId value**: Exact string or format for the pinned organization. (Must be provided by Owner, not fabricated).
- **Audit retention và operational recovery**: Policies for audit trails and recovery scenarios. (HRP recommends keeping metadata only, no raw payloads or PII).

## REC-004b Decisions
- **Exact query envelope naming/transport**: HTTP framing and endpoint paths. (HRP recommends `POST /api/integrations/crm/talent-context/query` with `CorrelationIdSchema`).
- **Additive enum compatibility và exhaustive consumers**: Whether to adopt the query-local versioned error union (HRP recommendation) or push an additive global enum which requires exhaustive CRM audit.

(No design is considered ACCEPTED_SHARED until these decisions are explicitly closed by T0 CRM).
