# Baseline Delta

## Commit Range
- **From**: `a49ceaa83ffa986bf939823a4e9f2c803a0649d6` (Previous HRP baseline)
- **To**: `0f46f0fbf2c8bc8d106c9aa2f0d3fc6143d2850b` (New HRP baseline)

## Scope of Changes
Lá»‡nh `git diff --name-only a49ceaa83ffa986bf939823a4e9f2c803a0649d6..0f46f0fbf2c8bc8d106c9aa2f0d3fc6143d2850b` tráº£ vá» danh sÃ¡ch chÃ­nh xÃ¡c cÃ¡c file sau:

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

- 3 W5 task/closeout docs: AUDIT.md, HANDOFF.md, TASK.md.
- 1 coordination cursor doc: docs/PLANNER_HANDOVER.md.
- 5 W5 implementation/test/migration files:
  - migration.sql
  - handling-assignment.security.test.ts
  - handling-assignment.service.test.ts
  - handling-assignment.service.ts
  - handling-assignment.integration.test.ts
- 1 Vitest registration file: vitest.integration-files.ts.

## Impact on CONTRACT-02B Scope
- CÃ¡c file Talent read / AuthContext / LaborProfile schema / RLS Ä‘Æ°á»£c viá»‡n dáº«n khÃ´ng náº±m trong delta thay Ä‘á»•i nÃ y.
- CRM frozen sources Ä‘Æ°á»£c pin á»Ÿ CRM baseline riÃªng (`72643356a0d1355f9dccc3921b47c990ea9c31c1`), khÃ´ng thuá»™c HRP diff.
