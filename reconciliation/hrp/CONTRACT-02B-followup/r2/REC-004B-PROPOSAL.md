# REC-004b Proposal (Schemas & Error Contracts)

## 1. Transport Definition
**Recommended Transport**:
- **Method/Path**: `POST /api/integrations/crm/talent-context/query`
- **Headers**:
  - `Authorization`: Signed service assertion
  - `Content-Type`: `application/json`
- **Body**: JSON matching `TalentContextReadQueryRequestSchema`

## 2. Exact Conceptual Shapes

```typescript
// Target Definition
type TalentContextReadTargetSchema = {
  kind: 'TALENT';
  laborProfileId: string;
  // NOTE: laborProfileVersion is intentionally excluded.
};

// Request Envelope
type TalentContextReadQueryRequestSchema = {
  schemaVersion: '1';
  correlationId: CorrelationIdSchema;
  organizationId: string;
  actor: {
    // NOTE: This actor claim is UNTRUSTED and must be bound against the signed assertion.
    type: 'DELEGATED_USER';
    userId: string;
    delegationRef: string;
  };
  target: TalentContextReadTargetSchema;
  fieldAllowlist: Array<'identitySummary' | string>;
};

// Result Envelope
type TalentContextReadResultSchema = {
  schemaVersion: '1';
  organizationId: string; // Verified
  target: TalentContextReadTargetSchema; // Resolved
  displayOnly: true; // Literal true
  resolvedAt: string; // ISO8601 timestamp
  identitySummary?: {
    fullNameRedacted: string;
  };
  unavailableFields: string[];
};

// Query-Local Error Response
type TalentContextReadErrorResponseSchema = {
  schemaVersion: '1';
  status: number;
  correlationId: string;
  errors: Array<ContractErrorSchema | QueryAdditionalErrorSchema>;
};
```

## 3. Projection Semantics
- **Requested + Supported**: Return the requested data (e.g., `identitySummary`).
- **Requested + Known but Unsupported**: Omit the data and append the field name to `unavailableFields`.
- **Unrequested Field**: Omit the data and DO NOT include it in `unavailableFields`.
- **Unknown Projection Identifier**: Return `422 VALIDATION_ERROR`.
- **Constraint**: `unavailableFields` must strictly be a subset of the requested `fieldAllowlist`.
- **Redaction Fallback**: If a safely redacted name cannot be generated, omit `identitySummary` entirely and mark it as unavailable. `fullNameRedacted` must never leak the raw full name. Redaction policy is an HRP runtime policy that requires bilateral decision and test vectors prior to implementation.
- **Exclusions**: No `snapshotVersion`, no phone, no CCCD, and no raw DTOs.
- **resolvedAt Semantics**: Represents the exact time HRP completed authorization/query/filtering. It is NOT a version, freshness proof, concurrency token, or snapshot guarantee.

## 4. Error Contract Compatibility
- **Frozen Source Preservation**: The existing `ErrorCodeSchema`, `ERROR_POLICIES`, `ErrorListSchema`, and command envelopes must remain completely unchanged.
- **Query-Local Extension**:
  1. Continue parsing existing codes using `ContractErrorSchema`.
  2. Create a query-local `QueryAdditionalErrorSchema` exclusively for `NOT_FOUND` and `INTERNAL_ERROR`.
  3. Create a query-local union of `ContractErrorSchema | QueryAdditionalErrorSchema`.
  4. The error list (`errors`) uses this union.
- **Constraints**: No implicit widening of the global enum. Do not use `commandId`, `idempotencyKey`, or `UNKNOWN_COMMAND_OUTCOME`. This is a contract addition requiring REC-004b acceptance.

## 5. HTTP Status Proposal
- `200`: Success
- `401`: Authentication failure
- `403`: Authenticated, but delegation, organization, or capability denied
- `404`: Hidden and nonexistent objects (MUST use the exact same code, shape, and message to avoid acting as an existence oracle)
- `422`: Schema validation failure or unknown projection
- `429`: Rate limit exceeded
- `500`: Query-local `INTERNAL_ERROR`
- `503`: Existing `DEPENDENCY_UNAVAILABLE`
- **Leak Prevention**: Responses must never expose SQL, stack traces, internal secrets, PII, or differences between hidden vs. not-found states.

## 6. Compatibility & Rollout Strategy
- **Versioning**: Expose query schemas via a new module/versioned entrypoint. Old imports and frozen consumers are unaffected.
- **Rollout Sequence**:
  1. Bilateral contract acceptance.
  2. Contract artifact / package version publish.
  3. HRP implementation + H.09/Tier 3 Audit.
  4. CRM consumer implementation.
  5. Real-path enablement.
- **Kill-Switch / Rollback**: A missing/absent route results in a transport `404`. If the feature is temporarily disabled via feature flag or dependency failure, the contract response must be `503 DEPENDENCY_UNAVAILABLE`.
