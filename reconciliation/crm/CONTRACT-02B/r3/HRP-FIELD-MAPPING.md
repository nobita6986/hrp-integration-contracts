# HRP Field Mapping — CONTRACT-02B r3

Pinned sources: CRM baseline 72643356, HRP baseline a49ceaa, HRP response r3 61fd3a42.

## 1. CRM frozen wire — queries.ts (line references verified against baseline 72643356)

| Symbol | Line |
|---|---|
| ContextQueryRequestSchema | 131 |
| ContextPanelResultSchema | 312 |
| ContextPanelIdentitySummarySchema | 172 |
| ContextPanelPlacementCaseSchema | 185 |
| ContextPanelAvailabilitySchema | 226 |
| ContextPanelCurrentRelationshipSchema | 241 |
| ContextPanelNextActionSummarySchema | 252 |
| ContextPanelContactabilitySchema | 288 |
| ContextPanelSuppressionSummarySchema | 299 |
| QueryScopeSchema | 101 |
| ReadOnlyIdentityPreviewRequestSchema | 361 |
| AllowedActionsQueryRequestSchema | 409 |

## 2. CRM frozen wire — mappings.ts (line references verified)

| Symbol | Line |
|---|---|
| TalentTargetRefSchema | 246 |
| ClientTargetRefSchema | 255 |
| CanonicalTargetRefSchema | 275 |
| ExternalContactRefSchema | (in mappings.ts) |

## 3. CRM frozen wire — primitives.ts (line references verified)

| Symbol | Line |
|---|---|
| SchemaVersionSchema | 5 |
| OrganizationIdSchema | 36 |
| CanonicalIdSchema | 37 |
| ExpectedVersionSchema | 38 |
| IsoTimestampSchema | 56 |
| UserActorClaimSchema | 83 |
| ServiceActorClaimSchema | 86 |
| DelegatedUserActorClaimSchema | 89 |
| ActorSchema | 97 |

## 4. CRM frozen wire — enums.ts (line references verified)

| Symbol | Line |
|---|---|
| PlacementCaseStageSchema | 29 |
| ClosedCaseStatusSchema | 51 |
| CaseCloseReasonSchema | 65 |
| AvailabilitySchema | 101 |
| CurrentRelationshipSchema | 125 |
| NextActionStatusSchema | 149 |
| SCHEMA_VERSION = string 1 | 210 |

## 5. HRP source (per SOURCE-EVIDENCE.md, baseline a49ceaa)

| Symbol | Path | Line |
|---|---|---|
| GET route handler | app/api/admin/labor-profiles/[id]/route.ts | 10-40 |
| ADMIN_ROLES | app/api/admin/labor-profiles/[id]/route.ts | 10 |
| getAuthContext | src/shared/auth/auth-context.ts | 51-97 |
| AuthContext | src/shared/auth/auth-context.ts | 20-27 |
| withDbContext | src/shared/auth/with-db-context.ts | 34-43 |
| applyRlsContext | src/shared/auth/rls-context.ts | 45-74 |
| LaborProfileDetailDto | src/domains/talent/labor-profile.read-service.ts | 135-176 |
| getLaborProfileDetail | src/domains/talent/labor-profile.read-service.ts | 178-247 |
| CAN_VIEW_WORKER_SENSITIVE | src/domains/talent/labor-profile.read-service.ts | 183 area |
| LaborProfile RLS | prisma/migrations/20260908150001_v6_phase1a_labor_profile_rls/migration.sql | 6-51 |
| JWT (HS256) | src/shared/auth/jwt.ts | 11-12, 34-39, 59-72 |
| AuthClaims | src/shared/auth/jwt.ts | definitions |
| getTokenFromRequest | src/shared/auth/user.ts | 10-35 |

## 6. Gap summary

| Gap | Frozen requirement | HRP current state | Status |
|---|---|---|---|
| TalentTargetRefSchema.laborProfileVersion | REQUIRED in frozen (mappings.ts L246-253) | No S2S envelope; no version semantics | OPEN — Gap 1 in PROPOSAL |
| snapshotVersion | REQUIRED in frozen (queries.ts L317) | No snapshotVersion in DTO; updatedAt not defined as snapshot token | OPEN — Gap 2 in PROPOSAL |
| S2S auth (service JWT, org binding) | QueryScopeSchema.actor + organizationId REQUIRED | User JWT + RLS only; no S2S path | OPEN — Gap 3 in PROPOSAL |
| Shared error envelope | None defined in frozen queries.ts | HRP uses {error, message}; no shared error schema | OPEN — Gap 4 in PROPOSAL |
| displayOnly | z.boolean() in schema (queries.ts L182) | No displayOnly literal in DTO | PROPOSED — CP1 |
| phoneRedacted | z.string().optional() in schema (queries.ts L178) | HRP has masking via CAN_VIEW_WORKER_SENSITIVE | PROPOSED — CP2 |
| unavailableFields | z.array().optional() in schema (queries.ts L338-346) | No such field in DTO | PROPOSED — CP3 |
| resolvedAt | REQUIRED in frozen (queries.ts L336) | No query-time resolvedAt in DTO | PROPOSED — CP4 |
| organizationId in response | REQUIRED in frozen (queries.ts L316) | AuthContext has no orgId; route does not return org | PROPOSED — CP5 |
| CCCD in identitySummary | No such field in schema | N/A | Out of scope |

## 7. Negative evidence (HRP r3 SOURCE-EVIDENCE.md section 8)

Check 1: S2S/Contract Schema in HRP runtime scope
Command: git grep -E ContextQueryRequestSchema|ContextPanelResultSchema|snapshotVersion|unavailableFields
Result: NO_MATCH at baseline a49ceaa.

Check 2: Service Identity / Organization Binding in Talent read/auth call path
Command: git grep -E -i audience|issuer|organizationId in route.ts + read-service.ts + src/shared/auth/
Result: NO_MATCH at baseline a49ceaa.

Conclusion: B.03 real path is a GAP. HRP has user JWT + RLS for HRP UI, not CRM S2S.

---

## Stop

STOP — awaiting T0 arbitration on gap summary above.