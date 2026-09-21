# Source Evidence (HRP T0)

Evidence of stable paths and symbols in the new baseline.

## 1. CRM Frozen Package Evidence
- **Repository**: https://github.com/nobita6986/HRP-CRM.git
- **Baseline**: `72643356a0d1355f9dccc3921b47c990ea9c31c1`

- **`packages/contracts/src/commands/mappings.ts`**:
  - `TalentTargetRefSchema` (L246)
  - `CanonicalTargetRefSchema` (L275)
- **`packages/contracts/src/commands/queries.ts`**:
  - `QueryScopeSchema` (L101) - Actor is defined as an untrusted claim payload.
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
  - `ErrorCodeSchema` (L3-14) - Enum is frozen.
  - `ContractErrorSchema` (L91-108) - Hard-locked to `ErrorCodeSchema`.
  - `ErrorListSchema` (L113) - Only accepts `ContractErrorSchema`.
  - `ERROR_HTTP_HINT` (L131)
- **`packages/contracts/src/envelopes.ts`**:
  - `FailedResponseSchema` (L88)
  - `ResponseEnvelopeSchema` (L104)

## 2. HRP Internal Evidence
- **Repository**: https://github.com/nobita6986/HRpartner.git
- **Baseline**: `0f46f0fbf2c8bc8d106c9aa2f0d3fc6143d2850b`

- **LaborProfile Model**: `prisma/schema.prisma` L1398–1427. Entire `LaborProfile` model; has `updatedAt` but lacks version or `organizationId`.
- **AuthContext**: `src/shared/auth/auth-context.ts` L20–27. `AuthContext` only has `userId`, `role`, `vendorId?`, `workerId?`; lacks `organizationId`/service identity.
- **Admin LaborProfile Route**: `app/api/admin/labor-profiles/[id]/route.ts`:
  - `ADMIN_ROLES` L10
  - `GET` L12
  - `getAuthContext` L18
  - `withDbContext` L24
- **LaborProfile RLS**: `prisma/migrations/20260908150001_v6_phase1a_labor_profile_rls/migration.sql` L10. Exact current RLS scope bound to effective DB user roles.
- **LaborProfile Read**: `src/domains/talent/labor-profile.read-service.ts` L32 (`getLaborProfilesList`), L178 (`getLaborProfileDetail`).

## Conclusions
1. **Identity & Auth**: Không tồn tại CRM service-identity/org-binding path trong call path hiện tại. S2S authorization hoàn toàn phải xây dựng mới (REC-002) trước khi tích hợp, vì `AuthContext` hiện hành chỉ hỗ trợ internal user sessions. HRP route roles và RLS scope hiện hành phụ thuộc vào user permissions có thật trong DB.
2. **Actor Claim**: `QueryScopeSchema` actor chỉ là untrusted claim. Phải verify bằng signed assertion để đảm bảo an toàn.
3. **Error Contracts**: `ErrorCodeSchema` (L3-14), `ContractErrorSchema` (L91-108), và `ErrorListSchema` (L113) bị khóa chặt với nhau. Không thể tái sử dụng trực tiếp chúng cho các lỗi query-specific như `NOT_FOUND` và `INTERNAL_ERROR` mà không làm vỡ frozen consumers. Phải sử dụng query-local union extension (REC-004b).
