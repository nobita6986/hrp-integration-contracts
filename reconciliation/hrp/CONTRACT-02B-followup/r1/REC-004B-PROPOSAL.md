# REC-004b Proposal (Schemas & Error Contracts)

## 1. Proposed Conceptual Schemas
Exact conceptual names and shapes (no code changes yet):
- `TalentContextReadTargetSchema`
- `TalentContextReadQueryRequestSchema`
- `TalentContextReadResultSchema`
- `QueryErrorResponseSchema`

## 2. Request Envelope
Must include:
- `schemaVersion = '1'`
- `organizationId`
- `DELEGATED_USER` claim
- Target consisting of `kind='TALENT'` and `laborProfileId`
- `fieldAllowlist` limited strictly to the minimum slice
- `correlationId` / request identifier (Proposed to allow trace mapping across service boundaries).

## 3. Result Envelope
Must include:
- `schemaVersion='1'`
- Verified `organizationId`
- Resolved target
- `identitySummary.fullNameRedacted`
- `displayOnly=true`
- `resolvedAt`
- `unavailableFields` semantics
- **Omitted**: No `snapshotVersion`, phone, or CCCD.

## 4. Error Compatibility
- Maintain frozen `ErrorCodeSchema` and current command envelopes.
- Proposed compatibility-safe query extension:
  - Reuse `ContractErrorSchema` for existing codes.
  - Query-specific extension for `NOT_FOUND` and `INTERNAL_ERROR`.
  - Avoid implicitly widening the frozen enum.
- **Alternatives Analysis**:
  1. *Query-local versioned error union*: Frozen consumers remain unchanged.
  2. *Additive global enum / new package version*: Requires exhaustive consumer audit.
- **T0 HRP Recommendation**: Prioritize query-local versioned extension (Alternative 1) to avoid breaking frozen consumers.

## 5. HTTP Proposal
- `200` Success
- `401` Service authentication
- `403` Delegation/org/capability denial
- `404` Hidden or nonexistent object (indistinguishable shape)
- `422` Validation
- `429` Rate limit
- `500` Internal
- `503` Dependency / replay infrastructure unavailable
- **Constraint**: Do not use `UNKNOWN_COMMAND_OUTCOME` or command idempotency envelopes for read queries.

## 6. Lifecycle & Integration Guidelines
- **Package / Wire Versioning**: Additive schemas provided without bumping global frozen base version.
- **Old Consumer Behavior**: Preserved strictly.
- **Parser Compatibility**: Old parsers see no changes; new parsers consume the distinct query schema.
- **Rollout Ordering**: 1. Contracts update. 2. HRP implementation. 3. CRM consumer implementation.
- **Rollback Behavior**: Service reverts to returning 404/503 for the endpoint if features are toggled off.
- **Implementation Ownership**: Shared contracts owned by neutral repository; HRP runtime by HRP T1B; CRM consumer by CRM T1B.
- **Auditing**: Tier 3 / H.09 gate is strictly required prior to real path deployment.
