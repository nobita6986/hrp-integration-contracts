# REC-004b - Error Contract Clarification (T1-B)

## Status

PROPOSED. No final decision on whether to use additive global enum or query-specific union.

## Frozen Schema Boundary

ContractErrorSchema and ErrorCodeSchema (in @hrp-engagement/contracts@0.0.8-g0.8-fixes) are FROZEN. r5 does NOT propose modifications to these schemas.

## Reuse Existing Codes

r5 explicitly proposes REUSE of existing codes for the read slice where applicable:

| Code | Source | HTTP | Use in read slice |
|---|---|---|---|
| VALIDATION_ERROR | ContractErrorSchema | 422 | YES |
| AUTHENTICATION_REQUIRED | ContractErrorSchema | 401 | YES |
| FORBIDDEN | ContractErrorSchema | 403 | YES |
| RATE_LIMITED | ContractErrorSchema | 429 | YES |
| DEPENDENCY_UNAVAILABLE | ContractErrorSchema | 503 | YES |

## Additive Codes - Proposed (Separate Package)

r5 proposes that the additive error codes belong in a NEW, query-specific error schema package - NOT in the frozen ContractErrorSchema.

Proposed new package (separate from frozen): packages/contracts/src/queries/talent-context-errors.ts (illustrative path; exact path is HRP decision).

Proposed additive codes for the read slice:

| Code | HTTP | Use |
|---|---|---|
| NOT_FOUND | 404 | Hidden or nonexistent object (no existence oracle) |
| INTERNAL_ERROR | 500 | Unexpected server error, no PII / SQL / stack / exception leak |

These are PROPOSED. They require bilateral acceptance before any shared package change.

## Wire Shape (DRAFT, not frozen)

Success (HTTP 200): TalentContextReadResultSchema directly, no wrapper.

Error (non-2xx):

```json
{
  "schemaVersion": "1",
  "status": "FAILED",
  "correlationId": "corr-<safe>-<ts>-<rand>",
  "errors": [
    {
      "code": "<VALIDATION_ERROR | AUTHENTICATION_REQUIRED | FORBIDDEN | RATE_LIMITED | DEPENDENCY_UNAVAILABLE | NOT_FOUND | INTERNAL_ERROR>",
      "messageKey": "errors.talentContext.<key>",
      "retryClass": "NEVER | RETRY_SAFE | RETRY_UNSAFE"
    }
  ]
}
```

## Naming

Names are PROPOSED and HRP-decision:

- TalentContextReadQueryRequestSchema
- TalentContextReadTargetSchema
- TalentContextReadResultSchema
- TalentContextReadErrorResponse
- TalentContextReadField (enum)
- TalentContextReadError (union)

CRM accepts any stable, versioned names. Final naming requires bilateral confirmation.

## Parsing and Consumer Impact

### Approach A: Additive Global Enum (CRM preference)

- Single error parser handles frozen ContractError codes + new additive codes (NOT_FOUND, INTERNAL_ERROR).
- Parser must accept the extended union without crashing on unknown codes.
- Exhaustive switch statements must be avoided in consumers.
- Requires: change to shared contract package + exhaustive consumer audit (per ACCEPTED_SHARED workflow).

### Approach B: Query-Specific Union (HRP preference)

- Separate error parser for this query type.
- Union must be versioned; consumer must handle version transitions.
- Parser version must be coordinated with HRP schema version.

## Auditor Illustration - NOT Final Design

If the Auditor has shown an illustrative `z.union([ContractError, TalentContextReadAdditionalError])` example, that is for discussion only. It is NOT the final schema.

CRM T1-B does NOT treat the Auditor illustration as design. The actual design requires:
- bilateral acceptance,
- version handling,
- consumer audit,
- package placement decision (where the additive codes live).

## Open Items for HRP Decision

- Package placement for additive codes (separate query package vs in-place addition).
- Naming of query-specific schemas.
- Versioning approach.
- Approach A vs Approach B final decision.