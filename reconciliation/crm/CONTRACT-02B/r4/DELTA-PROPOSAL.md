# CONTRACT-02B r4 — Delta Proposal

From: T1-B (CRM)
To: T0 (HRP-CRM reconciliation)

r4 supersedes r3 (d971929) as current revision. r1-r3 are immutable.

## Provenance

| Artifact | SHA |
|---|---|
| CRM baseline | 72643356a0d1355f9dccc3921b47c990ea9c31c1 |
| Frozen package | @hrp-engagement/contracts@0.0.8-g0.8-fixes |
| CONTRACT-02A r3 | d91d07f517782643666ab01cce78bdf5424073ab |
| HRP r6 (MSG-022) | a2a5efa9f6e22e8beb1e858054a2585d343b4bea |
| HRP followup (REC-002/004b) | 8a28678 |
| r1 (immutable) | 608d67daf9c0853b79862e72a117cf4bc520015c |
| r2 (immutable) | 93a31ce4abc1aa76f5a11b130c79f80447cbdf79 |
| r3 (immutable) | d971929892209590a5455cc9ecffe7a44ac22f99 |

## Governance Flags

- ACCEPTED_SHARED = 0
- HRP_IMPLEMENTED = 0
- D-01..D-04 = AGREED_DIRECTION
- REC-001 = OWNER_APPROVED
- REC-002 = OPEN/PROPOSED (OWNER_DECISION_REQUIRED)
- REC-004b = OPEN/PROPOSED (OWNER_DECISION_REQUIRED)

---

## Section 1: Confirmed Design Direction

### D-01: Request target/version (AGREED_DIRECTION)

HRP proposes additive TalentContextReadQueryRequestSchema without laborProfileVersion.

- Gap: Frozen TalentTargetRefSchema requires laborProfileVersion; no trusted source for first read.
- Proposal: Additive TalentContextReadQueryRequestSchema / TalentContextReadTargetSchema. Target = schemaVersion='1', kind='TALENT', laborProfileId only.
- Transport: POST /api/integrations/crm/talent-context/query with CorrelationIdSchema.
- CRM does NOT propose: auto-filling laborProfileVersion with 0; using updatedAt; modifying frozen schema.

### D-02: Response snapshotVersion (AGREED_DIRECTION)

HRP proposes additive TalentContextReadResultSchema without snapshotVersion.

- Gap: Frozen ContextPanelResultSchema requires snapshotVersion; HRP has no version semantics.
- Proposal: Additive TalentContextReadResultSchema. No snapshotVersion. resolvedAt REQUIRED (query time marker, NOT version/concurrency token).
- updatedAt is NOT a substitute for snapshotVersion.
- CRM does NOT interpret resolvedAt as version, freshness, or concurrency signal.

### D-03: Auth, organization, object authorization (AGREED_DIRECTION)

- S2S: CRM-issued service assertion. HRP recommends CRM as issuer (asymmetric JWS/JWT, RS256 pinning).
- Actor: DELEGATED_USER mandatory. Service-only without delegation NOT permitted to read LaborProfile.
- Delegated user: active, not revoked. HRP resolves role/permission from HRP database.
- Query: executes under effective delegated user via existing RLS. LaborProfile RLS NOT modified.
- Organization: single pinned orgId. Multi-org NOT supported. organizationId NOT self-declared; pinned in service registration, verified server-side.
- Projection: identitySummary.fullNameRedacted + displayOnly=true. phoneRedacted omitted. No phone, no CCCD, no cccdNumberRedacted.
- Three projection states: requested-supported, requested-unsupported, unrequested. unavailableFields carries unsupported-requested only.

CRM does NOT accept or decide (see REC-002): issuer owner, algorithm, TTL/skew/rotation, delegation format/lifetime/revocation, role allowlist, audit metadata.

### D-04: Error contract (AGREED_DIRECTION)

- HTTP 200: TalentContextReadResultSchema directly, no wrapper.
- Non-2xx: TalentContextReadErrorResponse with schemaVersion='1', status='FAILED', correlationId, errors array.
- Error union: ContractError base + QueryAdditionalError (NOT_FOUND, INTERNAL_ERROR).
- HTTP mapping: 401 auth, 403 forbid, 422 validate, 429 rate limit, 503 dependency, 404 NOT_FOUND, 500 INTERNAL_ERROR.
- NOT_FOUND and INTERNAL_ERROR are additive (PROPOSED, pending REC-004b).
- Hidden and nonexistent object both return NOT_FOUND (no existence oracle).
- INTERNAL_ERROR does not leak exception/SQL/stack/PII.
- ApiErrorCode in CRM mock-ui is NOT shared wire authority.

CRM does NOT accept or decide (see REC-004b): additive enum compatibility, exact naming.

---

## Section 2: Wire Examples (DRAFT — not pass frozen schema parse)

### 2.1 Valid Query Request (draft)

```json
{
  "schemaVersion": "1",
  "correlationId": "corr-<safe>-<ts>-<rand>",
  "organizationId": "<TBD: pinned org id>",
  "actor": {
    "kind": "DELEGATED_USER",
    "serviceId": "<CRM service principal id>",
    "userId": "<HRP user id>",
    "delegationRef": "<delegation record ref>"
  },
  "target": {
    "kind": "TALENT",
    "laborProfileId": "<canonical laborProfileId>"
  },
  "fieldAllowlist": ["identitySummary"]
}
```

Note: laborProfileVersion absent. Field names DRAFT.

### 2.2 Valid Query Response (draft)

```json
{
  "schemaVersion": "1",
  "correlationId": "corr-<safe>-<ts>-<rand>",
  "organizationId": "<pinned org id>",
  "target": { "kind": "TALENT", "laborProfileId": "<canonical id>" },
  "identitySummary": {
    "schemaVersion": "1",
    "fullNameRedacted": "Ng*** V*** A",
    "displayOnly": true
  },
  "unavailableFields": [],
  "resolvedAt": "2026-09-22T10:00:00.000+07:00"
}
```

Note: snapshotVersion absent. resolvedAt is query-time marker, NOT version token.

### 2.3 Response with unavailableFields (draft)

```json
{
  "schemaVersion": "1",
  "correlationId": "corr-<safe>-<ts>-<rand>",
  "organizationId": "<pinned org id>",
  "target": { "kind": "TALENT", "laborProfileId": "<canonical id>" },
  "identitySummary": {
    "schemaVersion": "1",
    "fullNameRedacted": "Ng*** V*** A",
    "displayOnly": true
  },
  "unavailableFields": ["availability", "currentRelationship"],
  "resolvedAt": "2026-09-22T10:00:00.000+07:00"
}
```

### 2.4 Error: validation error (draft)

```json
{
  "schemaVersion": "1",
  "status": "FAILED",
  "correlationId": "corr-<safe>-<ts>-<rand>",
  "errors": [
    { "code": "VALIDATION_ERROR", "messageKey": "errors.talentContext.validation", "retryClass": "NEVER" }
  ]
}
```

HTTP 422.

### 2.5 Error: not found (draft, PROPOSED)

```json
{
  "schemaVersion": "1",
  "status": "FAILED",
  "correlationId": "corr-<safe>-<ts>-<rand>",
  "errors": [
    { "code": "NOT_FOUND", "messageKey": "errors.talentContext.notFound", "retryClass": "NEVER" }
  ]
}
```

HTTP 404. NOT_FOUND is PROPOSED per REC-004b.

### 2.6 Error: forbidden (draft)

```json
{
  "schemaVersion": "1",
  "status": "FAILED",
  "correlationId": "corr-<safe>-<ts>-<rand>",
  "errors": [
    { "code": "FORBIDDEN", "messageKey": "errors.talentContext.forbidden", "retryClass": "NEVER" }
  ]
}
```

HTTP 403.

---

## Section 3: CRM REC-002 Positions

| Item | HRP Rec | CRM T1-B |
|---|---|---|
| Issuer Owner | CRM-issued asymmetric JWS/JWT | AGREED |
| Algorithm | RS256 pinning, reject none | AGREED. No none/confusion/HS256. ES256 alternative acceptable. |
| Assertion TTL | Max 60 seconds | PROPOSED - accept 60s ceiling; actual may be shorter. |
| Clock Skew | Max 30 seconds | AGREED |
| Key Rotation | Overlap > TTL+skew; 24h proposed | AGREED on principle; 24h acceptable |
| Replay Store | Atomic SET-if-absent; fail-closed | AGREED on principle; store tech is HRP decision |
| Delegation Format/Lifetime/Revocation | Persisted revocable; bound to upstream session | AGREED on model; HRP issues delegations; CRM constructs actor; format/API is HRP decision |
| Role Allowlist | ADMIN, HR_MANAGER, HR_STAFF | AGREED; HR_STAFF under RLS; new capabilities are future requirement |
| Organization ID | Owner-provided; single pinned org | AGREED; format must be agreed among Owner/CRM/HRP |
| Audit Metadata | Essential metadata only; no raw PII | AGREED; CRM audit: correlationId, orgId, actor, target, resolvedAt, outcome, ts |
| Negative Acceptance | Must deny all listed cases | AGREED |

---

## Section 4: CRM REC-004b Positions

| Item | HRP Rec | CRM T1-B |
|---|---|---|
| Transport | POST /api/integrations/crm/talent-context/query | AGREED on POST+CorrelationId; path is HRP-proposed; correlationId for tracing, NOT idempotency |
| Additive Enum | Query-local union (preferred) OR additive global enum | PROPOSED - CRM prefers additive global enum (NOT_FOUND/INTERNAL_ERROR into shared ContractErrorSchema). Rationale: shared taxonomy reduces maintenance. Requires shared package change + exhaustive consumer audit. Alternative: query-local union acceptable if versioned/stable. |

---

## Section 5: Out of Scope

CRM T1-B does NOT decide: fine-grained key management; actual TTL (60s ceiling accepted); replay store tech; delegation format/API; rotation procedure; new roles; audit format; orgId value; additional error codes; messageKey strings; retryClass values.

---

## Section 6: Stop Condition

READY FOR T0 CRM review. ACCEPTED_SHARED = 0. H.09/Tier 3 gate unchanged.
