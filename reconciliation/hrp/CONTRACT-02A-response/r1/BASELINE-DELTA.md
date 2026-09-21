# BASELINE DELTA

**Previous HRP Baseline:** `1059f6669482efac5b7956ef25d43996ca59d515`
**Current HRP Baseline:** `a49ceaa83ffa986bf939823a4e9f2c803a0649d6`

## Scope of Changes (1059f666..a49ceaa)

Kết quả từ lệnh `git diff --name-status 1059f666..a49ceaa` cho thấy các thay đổi chỉ tập trung vào:
1. **AFF-03B / AFF-03C:** Các file test bảo mật (`security-boundary.aff03b.test.ts`, `security-boundary.aff03c.test.ts`), các route/service của `public-intake`, `tests/db`, và các `migration` liên quan (`20260919100000_aff03b_public_intake_rpc/migration.sql`, `20260921140000_aff03c_cs_labor_profile_backfill/migration.sql`).
2. **Tài liệu (Docs):** Bổ sung các tài liệu Discovery, Realignment plan (`EXECUTION_REALIGNMENT_DISCOVERY.md`, `CRM_CONTRACT_GAP_REPORT.md`, ...), và thư mục V8/V9.

## Immutable Relevant Paths

Các source path liên quan tới Talent read/auth sau đây **KHÔNG THAY ĐỔI** giữa hai baseline:
- `app/api/admin/labor-profiles/[id]/route.ts`
- `src/domains/talent/labor-profile.read-service.ts`
- `src/shared/auth/user.ts`
- `src/shared/auth/jwt.ts`
- `src/shared/auth/auth-context.ts`
- `src/shared/auth/with-db-context.ts`
- `src/shared/auth/rls-context.ts`
- `prisma/migrations/20260908150001_v6_phase1a_labor_profile_rls/migration.sql`

Điều này chứng minh rằng việc khảo sát trên baseline `a49ceaa` phản ánh chính xác trạng thái logic của Talent Read/Auth tương tự như baseline trước đó. Delta rộng hơn không hề tạo ra `ContextQueryRequestSchema`, `ContextPanelResultSchema`, S2S Talent endpoint hay snapshot semantics.
