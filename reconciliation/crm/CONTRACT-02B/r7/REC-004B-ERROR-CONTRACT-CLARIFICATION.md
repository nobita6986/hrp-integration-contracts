# REC-004b - Error Contract Clarification (T1-B, identical to r6)

## Status

PROPOSED. CRM T1-B position: query-specific error contract. NOT_FOUND/INTERNAL_ERROR are proposals for that query-specific contract. Exact shape/naming/package placement require bilateral acceptance.

## Frozen Schema Boundary

ContractErrorSchema and ErrorCodeSchema (in @hrp-engagement/contracts@0.0.8-g0.8-fixes) are FROZEN. r7 does NOT propose modifications to these schemas.

## Reuse Existing Codes

r7 proposes REUSE of existing codes for the read slice where applicable:

| Code | Source | HTTP | Use in read slice |
|---|---|---|---|
| VALIDATION_ERROR | ContractErrorSchema | 422 | YES |
| AUTHENTICATION_REQUIRED | ContractErrorSchema | 401 | YES |
| FORBIDDEN | ContractErrorSchema | 403 | YES |
| RATE_LIMITED | ContractErrorSchema | 429 | YES |
| DEPENDENCY_UNAVAILABLE | ContractErrorSchema | 503 | YES |

## Additive Codes - Proposals for Query-Specific Contract

r7 position: the additive error codes belong in a query-specific error contract. NOT in the frozen ContractErrorSchema. Exact shape/naming/package placement require bilateral acceptance.

NOTE: r7 does NOT mandate creating a separate npm package. Package placement is a bilateral decision (could be a new file in the existing package, a separate file in a new sub-path, etc.).

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

r7 does NOT propose a preferred approach. The decision is bilateral.

Open dimensions for HRP and CRM to evaluate jointly:

- Parser scope (single shared parser vs query-specific parser).
- Version handling for the additive codes.
- Consumer audit impact (how exhaustive must the consumer be).
- Package placement (separate file in existing package vs new package).

## Auditor Illustration - NOT Final Design

If the Auditor has shown an illustrative `z.union([ContractError, TalentContextReadAdditionalError])` example, that is for discussion only. It is NOT the final schema.

CRM T1-B does NOT treat the Auditor illustration as design. The actual design requires:
- bilateral acceptance,
- version handling,
- consumer audit,
- package placement decision.

## Open Items for Bilateral Decision

- Exact shape of query-specific error contract.
- Naming of query-specific schemas.
- Versioning approach.
- Package placement (does NOT have to be a separate npm package).
- Parser scope (shared vs query-specific).
- Consumer audit scope.