# SOURCE EVIDENCE

**HRP Baseline:** `a49ceaa83ffa986bf939823a4e9f2c803a0649d6`

Dưới đây là các bằng chứng source code minh chứng cho capability Talent Read nội bộ hiện hữu của HRP.

## 1. Route và Response/Error

- **Repository-relative path:** `app/api/admin/labor-profiles/[id]/route.ts`
- **Symbols:** `ADMIN_ROLES`, `GET`
- **Line Ranges:** L10-L40
- **Mô tả:** Chứng minh role gate, 404 mapping, 401 AuthSessionError mapping, và 500 mapping.
- **Excerpt:**
```typescript
const ADMIN_ROLES = new Set(['ADMIN', 'HR_MANAGER', 'HR_STAFF']);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const ctx = await getAuthContext(req);
    if (!ADMIN_ROLES.has(ctx.role)) {
      return NextResponse.json({ error: 'FORBIDDEN', message: 'Not allowed' }, { status: 403 });
    }

    const prisma = getPrisma();
    const result = await withDbContext(prisma, ctx, async (tx) => {
      return getLaborProfileDetail(tx, ctx, resolvedParams.id);
    });

    if (!result) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'LaborProfile not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof AuthSessionError) {
      return NextResponse.json({ error: e.code, message: e.message }, { status: 401 });
    }
    console.error('Get LaborProfile detail error:', e);
    return NextResponse.json({ error: 'INTERNAL', message: 'Failed to fetch labor profile detail' }, { status: 500 });
  }
}
```

## 2. DTO, Query và Masking

- **Repository-relative path:** `src/domains/talent/labor-profile.read-service.ts`
- **Symbols:** `LaborProfileDetailDto`, `getLaborProfileDetail`, `resolveEffectivePermissions`
- **Line Ranges:** L135-L176 (DTO), L178-L247 (Service method)
- **Mô tả:** Chứng minh structure của DTO, query `findUnique`, phone/CCCD masking phụ thuộc vào quyền `CAN_VIEW_WORKER_SENSITIVE`, serialization của `updatedAt`, và internal projections như `placementCases`.
- **Excerpt (Query & Masking, L183-L245):**
```typescript
  const permissions = await resolveEffectivePermissions({ userId: ctx.userId, role: ctx.role });
  const canSeeSensitive = permissions.has('CAN_VIEW_WORKER_SENSITIVE');

  const profile = await tx.laborProfile.findUnique({
    where: { id },
// ... (include relations)
  if (!profile) {
    return null;
  }
// ...
  return {
    ...profile,
    phone: canSeeSensitive ? profile.phone : (profile.phone ? maskPhone(profile.phone) : null),
    cccdNumber: canSeeSensitive ? profile.cccdNumber : (profile.cccdNumber ? maskCccd(profile.cccdNumber) : null),
    consentAt: profile.consentAt?.toISOString() ?? null,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
// ...
```

## 3. Token Extraction và Verification

- **Repository-relative path:** `src/shared/auth/user.ts`
- **Symbols:** `getTokenFromRequest`, `getAuthUser`
- **Line Ranges:** L10-L35
- **Mô tả:** Cookie/Bearer behavior, fail-closed khi invalid token.

- **Repository-relative path:** `src/shared/auth/jwt.ts`
- **Symbols:** `AuthClaims`, `JWT_ALG`, `verifyJwt`
- **Line Ranges:** L11-L12, L34-L39, L59-L72
- **Mô tả:** HS256, claim validation (chỉ có sub, role), không có audience/service-account semantics.

## 4. AuthContext và DB Lookup

- **Repository-relative path:** `src/shared/auth/auth-context.ts`
- **Symbols:** `AuthContext`, `getAuthContext`
- **Line Ranges:** L20-L27, L51-L97
- **Mô tả:** Decode JWT, lookup User trong DB, check `isActive`, role thực lấy từ DB, không có `organizationId`.
- **Excerpt (L57-L68):**
```typescript
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    select: { id: true, role: true, isActive: true, vendorId: true },
  });

  if (!user) {
    throw new AuthSessionError('USER_NOT_FOUND', 'User not found');
  }
  if (!user.isActive) {
    throw new AuthSessionError('USER_INACTIVE', 'User is inactive');
  }
```

## 5. Transaction GUC

- **Repository-relative path:** `src/shared/auth/with-db-context.ts`
- **Symbol:** `withDbContext`
- **Line Ranges:** L34-L43

- **Repository-relative path:** `src/shared/auth/rls-context.ts`
- **Symbol:** `applyRlsContext`
- **Line Ranges:** L45-L74
- **Mô tả:** Thiết lập transaction-local GUCs (`is_local = true`), fail-closed nếu thiếu userId/role.

## 6. LaborProfile RLS

- **Repository-relative path:** `prisma/migrations/20260908150001_v6_phase1a_labor_profile_rls/migration.sql`
- **Line Ranges:** L6-L51
- **Mô tả:** `ENABLE` / `FORCE ROW LEVEL SECURITY` cho bảng `labor_profiles`. Policy `hrp_labor_profile_scope` xác định visibility cho `ADMIN`, `HR_MANAGER`, `DIRECTOR`, `HR_STAFF`, `SALE`, `WORKER`.
- **Excerpt:**
```sql
ALTER TABLE labor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_profiles FORCE ROW LEVEL SECURITY;

CREATE POLICY hrp_labor_profile_scope ON labor_profiles
  AS PERMISSIVE FOR ALL
  TO app_user_writer, app_user
  USING (
    hrp_session_role() IN ('ADMIN', 'HR_MANAGER', 'DIRECTOR')
// ... relation checks
```

## 7. Tests

- **Repository-relative path:** `src/domains/talent/labor-profile.read-service.test.ts`
- **Mô tả:** Các integration test tồn tại kiểm tra logic của Read Service.
  - Masked phone/CCCD khi thiếu permission: (L49-L65)
  - Unmasked fields khi có permission: (L67-L86)
  - ExactPhone denial khi thiếu permission: (L132-L136)

## 8. Negative Evidence (Sự không tồn tại)

Không có bất kỳ bằng chứng source code nào tại baseline `a49ceaa` cho:
- `ContextQueryRequestSchema`
- `ContextPanelResultSchema`
- `snapshotVersion`
- `unavailableFields`
- CRM service identity
- service-account organization binding

*Lưu ý: Kết quả trên được xác nhận bằng `git grep` trên toàn bộ source tree của HRP baseline `a49ceaa` và trạng thái `NOT_FOUND_IN_RELEVANT_RUNTIME_SCOPE`.*
