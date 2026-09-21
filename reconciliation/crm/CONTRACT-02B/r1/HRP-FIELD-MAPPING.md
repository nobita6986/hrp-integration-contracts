# HRP Field Mapping — Detail (CONTRACT-02B r1)

Each row references pinned source files and line ranges. Sources are pinned at:
- CRM baseline: 72643356a0d1355f9dccc3921b47c990ea9c31c1
- HRP baseline: a49ceaa83ffa986bf939823a4e9f2c803a0649d6
- HRP response r3 commit: 61fd3a4236bd71d891f7e5030beafbd08ccdc505

## 1. CRM frozen wire fields (queries.ts)

| Symbol | File | Line | Status |
|---|---|---|---|
| ContextQueryRequestSchema | packages/contracts/src/commands/queries.ts | 131 | FROZEN |
| ContextPanelResultSchema | packages/contracts/src/commands/queries.ts | 312 | FROZEN |
| ContextPanelIdentitySummarySchema | packages/contracts/src/commands/queries.ts | 172 | FROZEN |
| ContextPanelPlacementCaseSchema | packages/contracts/src/commands/queries.ts | 185 | FROZEN |
| ContextPanelAvailabilitySchema | packages/contracts/src/commands/queries.ts | 226 | FROZEN |
| ContextPanelCurrentRelationshipSchema | packages/contracts/src/commands/queries.ts | 241 | FROZEN |
| ContextPanelNextActionSummarySchema | packages/contracts/src/commands/queries.ts | 252 | FROZEN |
| ContextPanelContactabilitySchema | packages/contracts/src/commands/queries.ts | 288 | FROZEN |
| ContextPanelSuppressionSummarySchema | packages/contracts/src/commands/queries.ts | 299 | FROZEN |
| QueryScopeSchema | packages/contracts/src/commands/queries.ts | 101 | FROZEN |
| ReadOnlyIdentityPreviewRequestSchema | packages/contracts/src/commands/queries.ts | 361 | FROZEN (out of scope for B.03) |
| AllowedActionsQueryRequestSchema | packages/contracts/src/commands/queries.ts | 409 | FROZEN (not used in B.03) |

## 2. CRM primitives / enums (frozen)

| Symbol | File | Line |
|---|---|---|
| SchemaVersionSchema | packages/contracts/src/primitives.ts | 5 |
| CanonicalIdSchema | packages/contracts/src/primitives.ts | 37 |
| ExpectedVersionSchema | packages/contracts/src/primitives.ts | 38 |
| IsoTimestampSchema | packages/contracts/src/primitives.ts | 56 |
| OrganizationIdSchema | packages/contracts/src/primitives.ts | 36 |
| QueryScopeSchema | packages/contracts/src/primitives.ts (re-exported in queries.ts) | 101 (queries.ts) |
| ActorSchema | packages/contracts/src/primitives.ts | 97-101 |
| ServiceActorClaimSchema | packages/contracts/src/primitives.ts | 86 |
| DelegatedUserActorClaimSchema | packages/contracts/src/primitives.ts | 89 |
| UserActorClaimSchema | packages/contracts/src/primitives.ts | 83 |
| AvailabilitySchema | packages/contracts/src/enums.ts | 101 |
| CurrentRelationshipSchema | packages/contracts/src/enums.ts | 125 |
| PlacementCaseStageSchema | packages/contracts/src/enums.ts | 29 |
| ClosedCaseStatusSchema | packages/contracts/src/enums.ts | 51 |
| CaseCloseReasonSchema | packages/contracts/src/enums.ts | 65 |
| NextActionStatusSchema | packages/contracts/src/enums.ts | 149 |

## 3. HRP source (per HRP SOURCE-EVIDENCE.md, baseline a49ceaa)

| Symbol | Path | Line |
|---|---|---|
| GET (route handler) | app/api/admin/labor-profiles/[id]/route.ts | 10-40 |
| ADMIN_ROLES | app/api/admin/labor-profiles/[id]/route.ts | 10 |
| getAuthContext | src/shared/auth/auth-context.ts | 51-97 |
| AuthContext | src/shared/auth/auth-context.ts | 20-27 |
| withDbContext | src/shared/auth/with-db-context.ts | 34-43 |
| applyRlsContext | src/shared/auth/rls-context.ts | 45-74 |
| LaborProfileDetailDto | src/domains/talent/labor-profile.read-service.ts | 135-176 |
| getLaborProfileDetail | src/domains/talent/labor-profile.read-service.ts | 178-247 |
| resolveEffectivePermissions | src/domains/talent/labor-profile.read-service.ts | (L183 area) |
| CAN_VIEW_WORKER_SENSITIVE (permission key) | (referenced in read-service.ts L183-L245) | - |
| LaborProfile RLS migration | prisma/migrations/20260908150001_v6_phase1a_labor_profile_rls/migration.sql | 6-51 |
| hrp_labor_profile_scope policy | prisma/migrations/20260908150001_v6_phase1a_labor_profile_rls/migration.sql | (FORCE ROW LEVEL SECURITY) |
| JWT (HS256) | src/shared/auth/jwt.ts | 11-12, 34-39, 59-72 |
| AuthClaims | src/shared/auth/jwt.ts | (definitions) |
| getTokenFromRequest | src/shared/auth/user.ts | 10-35 |
| getAuthUser | src/shared/auth/user.ts | (definitions) |

## 4. Field-by-field status (extended from PROPOSAL §1.2)

### 4.1 Request side

ContextQueryRequestSchema (queries.ts L131):

- schemaVersion (SchemaVersionSchema) — REQUIRED. HRP MUST validate.
- scope (QueryScopeSchema L101) — REQUIRED. HRP today does not consume this; needs REC-002.
- target (CanonicalTargetRefSchema.optional()) — REQUIRED-if-not-external. Today HRP uses URL param id; can map to this.
- external (ExternalContactRefSchema.optional()) — REQUIRED-if-not-target. HRP today has no such field; UNSUPPORTED.
- fieldAllowlist (z.array(z.enum([...8])).max(16).optional()) — OPTIONAL. HRP today does not consume; UNSUPPORTED today.

### 4.2 Response side

ContextPanelResultSchema (queries.ts L312):

- schemaVersion (SchemaVersionSchema) — REQUIRED. HRP today has no wire schemaVersion literal; needs to emit.
- organizationId (OrganizationIdSchema) — REQUIRED. HRP today has no orgId in response; needs REC-002 + binding.
- snapshotVersion (ExpectedVersionSchema) — REQUIRED in frozen schema. HRP today has no snapshot semantics; UNRESOLVED.
- target (CanonicalTargetRefSchema.optional()) — OPTIONAL. HRP today has id in URL; can echo.
- identitySummary (ContextPanelIdentitySummarySchema.optional()) — OPTIONAL. HRP today has LaborProfileDetailDto with similar but different shape.
- placementCase (ContextPanelPlacementCaseSchema.optional()) — OPTIONAL. HRP today has placementCases[] (different shape).
- availability (ContextPanelAvailabilitySchema.optional()) — OPTIONAL. HRP has no canonical projection.
- currentRelationship (ContextPanelCurrentRelationshipSchema.optional()) — OPTIONAL. HRP has no canonical projection.
- nextAction (ContextPanelNextActionSummarySchema.optional()) — OPTIONAL. HRP has no nextAction in response.
- recentInteractions (z.array(...).max(16).optional()) — OPTIONAL. HRP treats intakes/submissions differently.
- contactability (ContextPanelContactabilitySchema.optional()) — OPTIONAL. HRP has no canonical projection.
- suppressionSummary (ContextPanelSuppressionSummarySchema.optional()) — OPTIONAL. DEFERRED per HRP Q-A5.
- resolvedAt (IsoTimestampSchema) — REQUIRED. HRP today does not emit this for query time.
- unavailableFields (z.array(z.enum([...8])).max(16).optional()) — OPTIONAL. HRP today has no such field.

### 4.3 Error shapes

HRP today (per SOURCE-EVIDENCE.md):
- 200: result
- 401: { error, message } for AuthSessionError
- 403: { error: FORBIDDEN, message: Not allowed }
- 404: { error: NOT_FOUND, message: LaborProfile not found }
- 500: { error: INTERNAL, message: ... }

Frozen CRM-side UI mapping (mock-api.ts L82-100 ApiErrorCode):
- MISSING_REVIEW, INVALID_SNAPSHOT, DIGEST_MISMATCH, SNAPSHOT_EXPIRED, ACTOR_MISMATCH (intake-specific)
- FORBIDDEN, UNAUTHORIZED, UNRESOLVED, STALE, TIMEOUT (general)
- IDEMPOTENCY_CONFLICT (REC-003 territory)
- VALIDATION_ERROR, NETWORK, UNKNOWN

Mapping: HRP error codes map to CRM ApiErrorCode. The mapping is owned by CRM; HRP returns {error, message} canonical.

## 5. Negative evidence (HRP r3 SOURCE-EVIDENCE.md §8)

From HRP source repo at baseline a49ceaa:

Check 1 (S2S/Contract Schema in HRP runtime scope):
- git grep -E ContextQueryRequestSchema|ContextPanelResultSchema|snapshotVersion|unavailableFields
- Result: NO_MATCH.
- Implication: HRP source has none of these wire schemas today.

Check 2 (Service Identity / Organization Binding in Talent read/auth call path):
- git grep -E -i audience|issuer|context.read|organizationId in route.ts + read-service.ts + src/shared/auth/
- Result: NO_MATCH.
- Implication: HRP source has no CRM service identity, no org binding, no context.read capability on the route.

Conclusion: B.03 real path is a GAP; HRP source domain has user JWT + RLS for HRP UI, not CRM S2S.
