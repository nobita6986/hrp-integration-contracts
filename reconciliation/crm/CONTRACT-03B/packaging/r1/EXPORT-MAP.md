# CONTRACT-03B.1 - Export map

## Package identity

- name: `@hrp-engagement/contracts`
- version: `0.0.0-candidate.0` (VERSION_CANDIDATE / NOT_PUBLISHED)
- private: false (declared for npm pack; not promoted to published)
- type: `module` (ESM only)
- main: `./dist/talent-context-read/index.js`
- types: `./dist/talent-context-read/index.d.ts`
- engines.node: `>=20`
- module: ES2022
- peer: zod 3.24.2

## Subpath contract

Canonical subpath (per scope B): `@hrp-engagement/contracts/talent-context-read/v1`

Consumers must import only via the explicit subpath. Root imports
(`@hrp-engagement/contracts`) continue to resolve for backward compatibility
but resolve to the SAME file as the subpath (both map to
`./dist/talent-context-read/index.js`).

## package.json exports map

```
{
  ".": {
    "import": "./dist/talent-context-read/index.js",
    "types": "./dist/talent-context-read/index.d.ts"
  },
  "./talent-context-read/v1": {
    "import": "./dist/talent-context-read/index.js",
    "types": "./dist/talent-context-read/index.d.ts"
  },
  "./talent-context-read/v1/package.json": "./package.json"
}
```

## Node and module requirements

- Node >= 20 (engines.node)
- ESM (type: module)
- zod 3.24.x declared as dependency (used by Zod schemas bundled in dist/)
- TypeScript 5.7.x for consumers that want strict typecheck

## Surface exposed at subpath

All exports from `./dist/talent-context-read/index.js`:

- assertion.ts:
  - parseAssertionHeader, validateAssertionFromWire, validateAssertionProfile,
    validateClaimsObject, validateTtlSkew, validateAudience, validateIssuer,
    validateSubject, validateRequestBinding, actorForOperation,
    diagnosticValidateAssertion, ASSERTION_LIMITS, BACKEND_OPERATIONS,
    OPERATION_AUDIENCE, AssertionProfileOk, AssertionProfileErr,
    ValidateAssertionProfileOpts
- conformance.ts:
  - buildConformanceProjection, SUPPORTED, KNOWN_UNSUPPORTED,
    compareUnavailableFields, CONFORMANCE_LIMITS
- delegation.ts:
  - PendingRequestIdSchema, DelegationRefSchema, ReceiptSchema,
    DelegationCreateRequestSchema, DelegationCreateSuccessSchema,
    DelegationExchangeRequestSchema, DelegationExchangeSuccessSchema,
    DelegationRevokeRequestSchema, DelegationCancelRequestSchema,
    DelegationHandoffRequestSchema, ApprovalDecisionSchema,
    ApprovedCallbackSchema, DeniedCallbackSchema, DelegationErrorSchema,
    InternalDelegationAggregateDtoSchema
- primitives.ts:
  - OrganizationIdSchema, CanonicalIdSchema, CorrelationIdSchema,
    IsoTimestampSchema, ModuleSchemaVersionSchema,
    BindingTimestampSchema, OpaqueBindingLikeIdSchema,
    SingleScopeArraySchema, OPAQUE_GRAMMAR
- query-errors.ts:
  - QueryRetryClassSchema, QueryErrorCodeSchema, TalentContextReadErrorSchema,
    TalentContextReadErrorResponseSchema, QUERY_RETRY_NEVER,
    QUERY_RETRY_REAUTH, QUERY_RETRY_BOUNDED_NEW,
    QUERY_ERROR_HTTP_STATUS, QUERY_ERROR_MESSAGE_KEY, QUERY_ERROR_RETRY_CLASS
- query-parser.ts:
  - parseTalentContextReadResponse
- query-types.ts:
  - TalentContextReadTargetSchema, TalentContextReadFieldSchema,
    TalentContextReadFieldAllowlistSchema, QueryDelegatedUserActorSchema,
    TalentContextReadQueryRequestSchema, IdentitySummarySchema,
    UnavailableFieldsSchema, TalentContextReadResultSchema
- redaction.ts:
  - redactFullName, REDACTION_LIMITS

## Isolation guarantees

- No source `.ts` files in the package.
- No DTO/schema copy.
- No competing package.
- Root export (`.`) and subpath (`./talent-context-read/v1`) point
  to the SAME compiled entrypoint. This is intentional: the accepted
  design does NOT split the contract into per-path bundles.
- All tests, fixtures, and dev-harness scripts stay in the integration
  contracts repo, not in the candidate package.
