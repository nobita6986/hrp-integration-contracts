# AC-ADDENDA — CONTRACT-02B r4

## Purpose

This document adds acceptance criteria that follow from the design decisions D-01 through D-04 and REC-002/REC-004b proposals. It supplements AC-1 through AC-31 from r3 (which remain unchanged).

New ACs are numbered from AC-32 onward.

## New ACs (from D-01)

### AC-32: Additive Read Query Schema

- [ ] Additive TalentContextReadQueryRequestSchema exists in the shared contract package
- [ ] Target does NOT contain laborProfileVersion
- [ ] Target contains schemaVersion (string '1'), kind ('TALENT'), laborProfileId
- [ ] Schema is additive (no modification to frozen TalentTargetRefSchema)
- [ ] fieldAllowlist is required, non-empty, unique, max 8 items
- [ ] Schema version is string '1', not numeric 1

### AC-33: Additive Read Result Schema

- [ ] Additive TalentContextReadResultSchema exists in the shared contract package
- [ ] Schema does NOT contain snapshotVersion
- [ ] Schema contains schemaVersion (string '1'), correlationId, organizationId, target, unavailableFields, resolvedAt
- [ ] Schema is additive (no modification to frozen ContextPanelResultSchema)
- [ ] resolvedAt is REQUIRED and is a query-time marker, NOT a version/concurrency token

### AC-34: resolvedAt Semantics

- [ ] resolvedAt is an ISO8601 timestamp
- [ ] resolvedAt is NOT used by CRM consumer as a version token
- [ ] resolvedAt is NOT used by CRM consumer as a cache key or freshness indicator
- [ ] CRM consumer does NOT interpret resolvedAt as a concurrency control signal

## New ACs (from D-03)

### AC-35: S2S Authentication

- [ ] Request includes a signed service assertion in Authorization header
- [ ] Assertion is asymmetric (RS256 or ES256)
- [ ] Assertion is validated by HRP before any object access
- [ ] Assertion includes serviceId, actor, organizationId claims
- [ ] Assertion TTL is within the agreed ceiling

### AC-36: DELEGATED_USER Actor

- [ ] Actor kind is DELEGATED_USER (not SERVICE_ONLY)
- [ ] Actor body contains serviceId, userId, delegationRef
- [ ] Actor claims match the verified signed assertion
- [ ] Delegation is active and not revoked
- [ ] Delegated user is active in HRP

### AC-37: Organization Binding

- [ ] organizationId in request body matches the pinned orgId
- [ ] HRP verifies orgId against service assertion
- [ ] Mismatch results in rejection prior to object lookup
- [ ] Single pinned organization (no multi-org support)

### AC-38: Object Permission via RLS

- [ ] Query executes under effective delegated user context
- [ ] Effective user role is in the agreed allowlist (ADMIN, HR_MANAGER, HR_STAFF)
- [ ] HR_STAFF role is subject to LaborProfile RLS
- [ ] Object visibility is enforced by HRP RLS

### AC-39: Projection — identitySummary

- [ ] identitySummary contains fullNameRedacted (redacted string)
- [ ] identitySummary contains displayOnly=true (slice constraint)
- [ ] identitySummary contains schemaVersion='1'
- [ ] identitySummary does NOT contain phoneRedacted
- [ ] identitySummary does NOT contain cccdNumberRedacted

## New ACs (from D-04)

### AC-40: Success Response Shape

- [ ] HTTP 200 returns TalentContextReadResultSchema directly
- [ ] No success wrapper envelope
- [ ] response includes schemaVersion, correlationId, organizationId, target
- [ ] response includes identitySummary and/or unavailableFields
- [ ] response includes resolvedAt

### AC-41: Error Response Shape

- [ ] Non-2xx returns TalentContextReadErrorResponse
- [ ] Error envelope contains schemaVersion='1'
- [ ] Error envelope contains status='FAILED'
- [ ] Error envelope contains correlationId
- [ ] Error envelope contains errors array (non-empty)

### AC-42: Error Code Mapping

- [ ] VALIDATION_ERROR maps to HTTP 422
- [ ] AUTHENTICATION_REQUIRED maps to HTTP 401
- [ ] FORBIDDEN maps to HTTP 403
- [ ] RATE_LIMITED maps to HTTP 429
- [ ] DEPENDENCY_UNAVAILABLE maps to HTTP 503
- [ ] NOT_FOUND maps to HTTP 404 (PROPOSED)
- [ ] INTERNAL_ERROR maps to HTTP 500 (PROPOSED)

### AC-43: No Existence Oracle

- [ ] Hidden object (RLS deny) returns NOT_FOUND
- [ ] Non-existent object returns NOT_FOUND
- [ ] Both cases return identical NOT_FOUND response
- [ ] Response does not reveal whether object exists but is hidden

### AC-44: INTERNAL_ERROR Privacy

- [ ] INTERNAL_ERROR response does not contain exception details
- [ ] INTERNAL_ERROR response does not contain SQL errors
- [ ] INTERNAL_ERROR response does not contain stack traces
- [ ] INTERNAL_ERROR response does not contain PII

### AC-45: ApiErrorCode Not Wire Authority

- [ ] ApiErrorCode from CRM mock-ui is NOT sent on the wire
- [ ] CRM mock-ui ApiErrorCode remains mock-only
- [ ] Wire errors use standard error codes from shared taxonomy

## New ACs (from REC-002)

### AC-46: Replay Prevention

- [ ] HRP enforces one-time use of jti
- [ ] Duplicate jti results in rejection
- [ ] Replay store is fail-closed (unavailable = reject)

### AC-47: Negative Acceptance

- [ ] Unknown kid results in 401
- [ ] Wrong algorithm results in 401
- [ ] Expired assertion results in 401
- [ ] Body hash mismatch results in 401
- [ ] Revoked delegation results in 403
- [ ] Disabled user results in 403
- [ ] Insufficient permission results in 403
- [ ] Wrong organization results in 403
- [ ] Unknown field in fieldAllowlist results in 422

### AC-48: Audit Metadata

- [ ] CRM records correlationId
- [ ] CRM records organizationId
- [ ] CRM records actor (serviceId, userId, delegationRef)
- [ ] CRM records target (kind, laborProfileId)
- [ ] CRM records resolvedAt
- [ ] CRM records outcome (success/failure)
- [ ] CRM records timestamp
- [ ] CRM does NOT record raw request/response bodies
- [ ] CRM does NOT record fullName, phone, or CCCD

## Implementation Dependency Note

All ACs above are gated by:

- Tier 3 / H.09 audit (canonical readiness gate)
- ACCEPTED_SHARED = 1 (bilateral T0 sign-off on REC-002 and REC-004b)
- HRP_IMPLEMENTED = 1 (HRP runtime readiness)

No implementation until these gates pass.
