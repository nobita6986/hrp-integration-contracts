# Source Evidence (HRP T0)

Evidence of stable paths and symbols in the new baseline.

## 1. CRM Frozen Package Evidence
- **Repository**: https://github.com/nobita6986/HRP-CRM.git
- **Baseline**: `72643356a0d1355f9dccc3921b47c990ea9c31c1`

- **`packages/contracts/src/commands/mappings.ts`**:
  - `TalentTargetRefSchema` (L246)
  - `CanonicalTargetRefSchema` (L275)
- **`packages/contracts/src/commands/queries.ts`**:
  - `QueryScopeSchema` (L101)
  - `ContextQueryRequestSchema` (L131)
  - `ContextPanelIdentitySummarySchema` (L172)
  - `ContextPanelResultSchema` (L312)
- **`packages/contracts/src/primitives.ts`**:
  - `OrganizationIdSchema` (L36)
  - `ExpectedVersionSchema` (L38)
  - `ServiceActorClaimSchema` (L86)
  - `DelegatedUserActorClaimSchema` (L89)
  - `ActorSchema` (L97)
- **`packages/contracts/src/errors.ts`**:
  - `ErrorCodeSchema` (L3)
  - `ContractErrorSchema` (L100)
  - `ErrorListSchema` (L113)
  - `ERROR_HTTP_HINT` (L131)
- **`packages/contracts/src/envelopes.ts`**:
  - `FailedResponseSchema` (L88)
  - `ResponseEnvelopeSchema` (L104)

## 2. HRP Internal Evidence
- **Repository**: https://github.com/nobita6986/HRpartner.git
- **Baseline**: `0f46f0fbf2c8bc8d106c9aa2f0d3fc6143d2850b`

- **LaborProfile Model**: `prisma/schema.prisma` L1398â€“1427. ToÃ n bá»™ `LaborProfile` model; cÃ³ `updatedAt` nhÆ°ng khÃ´ng cÃ³ version hoáº·c `organizationId`.
- **AuthContext**: `src/shared/auth/auth-context.ts` L20â€“27. `AuthContext` chá»‰ cÃ³ `userId`, `role`, `vendorId?`, `workerId?`; khÃ´ng cÃ³ `organizationId`/service identity.
- **Admin LaborProfile Route**: `app/api/admin/labor-profiles/[id]/route.ts`:
  - `ADMIN_ROLES` L10
  - `GET` L12
  - `getAuthContext` L18
  - `withDbContext` L24
- **LaborProfile RLS**: `prisma/migrations/20260908150001_v6_phase1a_labor_profile_rls/migration.sql` L10.
- **LaborProfile Read**: `src/domains/talent/labor-profile.read-service.ts` L32 (`getLaborProfilesList`), L178 (`getLaborProfileDetail`).

**Káº¿t luáº­n**: KhÃ´ng tá»“n táº¡i CRM service-identity/org-binding path trong call path Ä‘Æ°á»£c kháº£o sÃ¡t; hypothetical future S2S authorization chÆ°a Ä‘Æ°á»£c implementation hoáº·c runtime-test.
