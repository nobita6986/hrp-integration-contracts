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
type TalentContextReadTarget = {
  kind: 'TALENT';
  laborProfileId: string;
  // NOTE: laborProfileVersion is intentionally excluded.
};

// Projection Enum
type TalentContextReadField =
  | 'identitySummary'
  | 'placementCase'
  | 'availability'
  | 'currentRelationship'
  | 'nextAction'
  | 'recentInteractions'
  | 'contactability'
  | 'suppressionSummary';

// Request Envelope
type TalentContextReadQueryRequestSchema = {
  schemaVersion: '1';
  correlationId: string;
  organizationId: string;
  actor: {
    // NOTE: Untrusted claims. Must match the signed assertion.
    kind: 'DELEGATED_USER';
    serviceId: string;
    userId: string;
    delegationRef: string;
  };
  target: TalentContextReadTarget;
  // Constraint: required, non-empty, unique, maximum 8 items.
  fieldAllowlist: TalentContextReadField[];
};

// Result Envelope
type TalentContextReadResult = {
  schemaVersion: '1';
  correlationId: string;
  organizationId: string; // Verified
  target: TalentContextReadTarget; // Resolved
  identitySummary?: {
    schemaVersion: '1';
    fullNameRedacted?: string;
    displayOnly: true; // Display directive must be inside the projection
  };
  unavailableFields: TalentContextReadField[];
  resolvedAt: string; // ISO8601 timestamp
};
```
*An HTTP `200` Success must return the `TalentContextReadResult` shape directly without any success wrapping.*

## 3. Projection Semantics
- **`identitySummary`**: Supported in the first slice.
- **Other 7 known fields**: Evaluated as requested-but-unsupported. Their names must be appended to `unavailableFields` if requested.
- **Unknown String**: Rejected immediately with `422 VALIDATION_ERROR`.
- **Unrequested Field**: Omit the data and DO NOT include it in `unavailableFields`.
- **Redaction Fallback**: If a safely redacted name cannot be generated, omit `identitySummary` entirely and mark it as unavailable. `fullNameRedacted` must never leak the raw full name. Redaction policy requires bilateral decision and test vectors prior to implementation.
- **Exclusions**: No phone, no CCCD, and no raw DTOs.
- **resolvedAt Semantics**: Represents the exact time HRP completed authorization/query/filtering. It is NOT a version, freshness proof, concurrency token, or snapshot guarantee. No `snapshotVersion` is provided.

## 4. Query-Local Error Contracts
```typescript
// Query-local extension for missing/internal
type QueryAdditionalError =
  | {
      code: 'NOT_FOUND';
      messageKey: 'errors.talentContext.notFound';
      retryClass: 'NEVER';
    }
  | {
      code: 'INTERNAL_ERROR';
      messageKey: 'errors.talentContext.internal';
      retryClass: 'NEVER';
    };

// Strict Query-Local Union
type TalentContextReadError =
  | ContractError
  | QueryAdditionalError;

// Error Response Envelope
type TalentContextReadErrorResponse = {
  schemaVersion: '1';
  status: 'FAILED';
  correlationId: string;
  errors: TalentContextReadError[];
};
```
*Note: The error response body does NOT contain an HTTP status code (`status: number`); the HTTP status resides exclusively in the transport layer.*

## 5. HTTP Status Mapping
- `401`: `AUTHENTICATION_REQUIRED`
- `403`: `FORBIDDEN` (authenticated but delegation, org, or capability denied)
- `404`: Query-local `NOT_FOUND` (Hidden and nonexistent objects MUST use the exact same `404` body, code, and `messageKey` to prevent existence oracles).
- `422`: `VALIDATION_ERROR` (e.g., schema validation failure or unknown projection field).
- `429`: `RATE_LIMITED`
- `500`: Query-local `INTERNAL_ERROR`
- `503`: Existing `DEPENDENCY_UNAVAILABLE`

## 6. Compatibility & Rollout Strategy
- **Versioning**: Expose query schemas via a new module/versioned entrypoint. Old imports and frozen consumers remain completely unaffected. No widening of the global error enum.
- **Rollout Sequence**:
  1. Bilateral contract acceptance.
  2. Contract artifact / package version publish.
  3. HRP implementation + H.09/Tier 3 Audit.
  4. CRM consumer implementation.
  5. Real-path enablement.
- **Kill-Switch / Rollback**: A missing/absent route results in a transport `404`. If the feature is temporarily disabled via feature flag or dependency failure, the contract response must be `503 DEPENDENCY_UNAVAILABLE`.
