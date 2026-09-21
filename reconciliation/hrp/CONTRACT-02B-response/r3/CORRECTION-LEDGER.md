# Correction Ledger (r3)

This document tracks the corrections applied in the r3 revision of the CONTRACT-02B design response.

## 1. DESIGN-RESPONSE Corrections
- **D-01 Gap**: Chỉnh sửa mệnh đề bị ngược. Ghi nhận chính xác `Frozen TalentTargetRefSchema` yêu cầu `laborProfileVersion`, nhưng HRP không có nguồn version đáng tin cậy. Khẳng định `ContextQueryRequestSchema` không thể biểu diễn read-by-known-ID hiện tại mà không có additive wire change.

## 2. SOURCE-EVIDENCE Corrections
- **CRM Source Authority**: Sửa authority name thành đúng repository `https://github.com/nobita6986/HRP-CRM.git` và không dùng từ khóa "neutral/CRM contracts". Giữ nguyên baseline `72643356a0d1355f9dccc3921b47c990ea9c31c1` cùng các symbols và line numbers đã verify ở r2.
- **HRP Negative Evidence**: Thêm line ranges cụ thể cho `prisma/schema.prisma` (L1398–1427), `auth-context.ts` (L20–27), và `app/api/admin/labor-profiles/[id]/route.ts` (ADMIN_ROLES L10, GET L12, getAuthContext L18, withDbContext L24). Loại bỏ diễn giải suy diễn, thay bằng kết luận chính xác phạm vi: "Không tồn tại CRM service-identity/org-binding path trong call path được khảo sát; hypothetical future S2S authorization chưa được implementation hoặc runtime-test."

## 3. BASELINE-DELTA Corrections
- **File list**: Ghi exact output của lệnh `git diff --name-only a49ceaa..0f46f0f` thay vì chỉ tóm tắt.
- Bám sát exact command output; không diễn giải thành source evidence mới.
