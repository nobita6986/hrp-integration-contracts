# SOURCE EVIDENCE

**HRP Baseline:** `a49ceaa83ffa986bf939823a4e9f2c803a0649d6`

Dưới đây là các bằng chứng source code minh chứng cho capability Talent Read nội bộ hiện hữu của HRP.

## 1. Route Endpoint

- **Repository-relative path:** `app/api/admin/labor-profiles/[id]/route.ts`
- **Symbol:** `GET`
- **Line Ranges:** L12-L40
- **Call Path:** `GET` → `getAuthContext` → `withDbContext` → `getLaborProfileDetail`
- **Excerpt:**
```typescript
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
//...
```

## 2. DTO and Read Service

- **Repository-relative path:** `src/domains/talent/labor-profile.read-service.ts`
- **Symbol:** `LaborProfileDetailDto`, `getLaborProfileDetail`
- **Line Ranges:** L135-L176 (DTO), L178-L247 (Service method)
- **Excerpt:**
```typescript
export interface LaborProfileDetailDto {
  id: string;
  fullName: string | null;
  phone: string | null;
  cccdNumber: string | null;
  identityVerification: string;
  completeness: string;
  consentAt: string | null;
  createdAt: string;
  updatedAt: string;
  workerId: string | null;
  
  intakes: {
    id: string;
    channel: string;
    createdAt: string;
  }[];
  
  submissions: {
    id: string;
    createdAt: string;
  }[];
  
  episodes: {
    id: string;
    status: string;
  }[];
  
  placementCases: {
    id: string;
    status: string;
  }[];
  
  activeHandlingAssignment: {
    id: string;
    assigneeUserId: string;
    assigneeName: string | null;
    source: string;
    startsAt: string;
    expiresAt: string | null;
  } | null;
}
```
