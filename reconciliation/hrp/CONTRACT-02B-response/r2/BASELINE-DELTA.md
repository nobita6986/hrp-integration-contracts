# Baseline Delta

## Commit Range
- **From**: `a49ceaa83ffa986bf939823a4e9f2c803a0649d6` (Previous HRP baseline)
- **To**: `0f46f0fbf2c8bc8d106c9aa2f0d3fc6143d2850b` (New HRP baseline)

## Scope of Changes
- Lệnh `git diff --name-only a49ceaa..0f46f0f` gồm W5 HandlingAssignment implementation và W5 closeout docs.

## Impact on CONTRACT-02B Scope
- Các file Talent read / AuthContext / LaborProfile schema / RLS được viện dẫn không nằm trong delta thay đổi này.
- CRM frozen sources được pin ở CRM baseline riêng (`72643356a0d1355f9dccc3921b47c990ea9c31c1`), không thuộc HRP diff.
