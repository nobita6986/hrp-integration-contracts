# Baseline Delta

## Commit Range
- **From**: `a49ceaa83ffa986bf939823a4e9f2c803a0649d6` (Previous HRP baseline)
- **To**: `0f46f0fbf2c8bc8d106c9aa2f0d3fc6143d2850b` (New HRP baseline)

## Scope of Changes
Lệnh `git diff --name-only a49ceaa83ffa986bf939823a4e9f2c803a0649d6..0f46f0fbf2c8bc8d106c9aa2f0d3fc6143d2850b` trả về danh sách chính xác các file sau:

```
docs/PLANNER_HANDOVER.md
docs/tasks/hrp-v6-w5-handling-assignment-safety/AUDIT.md
docs/tasks/hrp-v6-w5-handling-assignment-safety/HANDOFF.md
docs/tasks/hrp-v6-w5-handling-assignment-safety/TASK.md
prisma/migrations/20260922100000_w5_handling_assignment_safety/migration.sql
src/domains/talent/handling-assignment.security.test.ts
src/domains/talent/handling-assignment.service.test.ts
src/domains/talent/handling-assignment.service.ts
tests/db/handling-assignment.integration.test.ts
vitest.integration-files.ts
```

Các file này bao gồm 4 file W5 task/closeout docs, 4 file W5 implementation/test/migration, file `vitest.integration-files.ts` (vitest registration) và `docs/PLANNER_HANDOVER.md`.

## Impact on CONTRACT-02B Scope
- Các file Talent read / AuthContext / LaborProfile schema / RLS được viện dẫn không nằm trong delta thay đổi này.
- CRM frozen sources được pin ở CRM baseline riêng (`72643356a0d1355f9dccc3921b47c990ea9c31c1`), không thuộc HRP diff.
