# Source Evidence (HRP T0)

Evidence of stable paths and symbols in the new baseline:
- HRP baseline: `0f46f0fbf2c8bc8d106c9aa2f0d3fc6143d2850b`
- CRM baseline: `72643356a0d1355f9dccc3921b47c990ea9c31c1`

## 1. CRM Frozen Package Evidence
(Baseline: `72643356a0d1355f9dccc3921b47c990ea9c31c1`, Repository: neutral/CRM contracts)

- **`packages/contracts/src/commands/mappings.ts`**:
  - `TalentTargetRefSchema` (Line 246)
  - `CanonicalTargetRefSchema` (Line 275)
- **`packages/contracts/src/commands/queries.ts`**:
  - `QueryScopeSchema` (Line 101)
  - `ContextQueryRequestSchema` (Line 131)
  - `ContextPanelIdentitySummarySchema` (Line 172)
  - `ContextPanelResultSchema` (Line 312)
- **`packages/contracts/src/primitives.ts`**:
  - `OrganizationIdSchema` (Line 36)
  - `ExpectedVersionSchema` (Line 38)
  - `ServiceActorClaimSchema` (Line 86)
  - `DelegatedUserActorClaimSchema` (Line 89)
  - `ActorSchema` (Line 97)
- **`packages/contracts/src/errors.ts`**:
  - `ErrorCodeSchema` (Line 3)
  - `ContractErrorSchema` (Line 100)
  - `ErrorListSchema` (Line 113)
  - `ERROR_HTTP_HINT` (Line 131)
- **`packages/contracts/src/envelopes.ts`**:
  - Command response envelopes (`ResponseEnvelopeSchema` at Line 104, `FailedResponseSchema` at Line 88) chứng minh chúng là command-specific và chưa có query error envelope phù hợp.

## 2. HRP Internal Evidence
(Baseline: `0f46f0fbf2c8bc8d106c9aa2f0d3fc6143d2850b`, Repository: HRP)

- **LaborProfile Model**: `LaborProfile` model không có version hoặc organization ownership (chứng minh qua schema Prisma hiện hành và schema DB).
- **AuthContext**: `src/shared/auth/auth-context.ts` (L20). `AuthContext` không có `organizationId` hay `service` identity.
- **LaborProfile RLS**: `prisma/migrations/20260908150001_v6_phase1a_labor_profile_rls/migration.sql` (L10).
- **LaborProfile Read**: `src/domains/talent/labor-profile.read-service.ts` (L32: `getLaborProfilesList`, L178: `getLaborProfileDetail`).
  - *Evidence Note*: Existing route/read service và `LaborProfile` RLS chứng minh capability nội bộ cùng effective-user authorization (các negative claim về authentication service-only account không thể đọc labor profiles được viện dẫn từ việc RLS context không map credential đó sang identity hợp lệ trong context nội bộ).
