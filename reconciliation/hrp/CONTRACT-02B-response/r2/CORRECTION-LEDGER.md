# Correction Ledger (r2)

This document tracks the corrections applied in the r2 revision of the CONTRACT-02B design response.

## 1. SOURCE-EVIDENCE Corrections
- **CRM Wire Authority**: Thay thế mục "CRM Wire" sai thẩm quyền bằng evidence chính xác từ CRM frozen package (`packages/contracts/src/*`). Cụ thể: `mappings.ts`, `queries.ts`, `primitives.ts`, `errors.ts`, `envelopes.ts`.
- **HRP Evidence Completeness**: Bổ sung negative claims về `LaborProfile` (không có version hoặc organization ownership) và `AuthContext` (không có organizationId/service identity).
- **Alignment**: Đảm bảo repository, baseline, path, symbol và line/range được pin đúng theo từng boundary.

## 2. DESIGN-RESPONSE Corrections
- **Structure Enforcement**: Cấu trúc lại toàn bộ các decision D-01 đến D-04 theo đúng format 7 phần bắt buộc (Gap, Proposed Option, Reason, Affected Contracts, Affected Consumers, Remaining Bilateral Decisions, Implementation Owner).
- **Explicit Scoping**: 
  - Nêu rõ D-01/D-02 là additive read-query schemas.
  - Khẳng định CRM B.03 là consumer mới; mutation/version-aware consumers hiện hữu không đổi.
  - Nêu rõ D-03 còn mở các chi tiết về delegation/token; multi-org bị blocked do thiếu canonical organization ownership.
  - D-04 tái sử dụng `ContractErrorSchema` / `ErrorListSchema`; các thay đổi compatibility chờ REC-004b.
  - Xác nhận rõ implementation owner: HRP T1B / CRM T1B (nhưng chỉ sau bilateral acceptance); Tier 3 / H.09 audit bắt buộc trước real path.

## 3. BASELINE-DELTA Corrections
- **Precision**: Loại bỏ tuyên bố tuyệt đối "100% symbol không thay đổi". Thay bằng kết quả `git diff/name-only a49ceaa..0f46f0f` thực tế (chỉ gồm W5 HandlingAssignment và W5 closeout docs).
- **Scope Clarification**: Ghi rõ các file Talent read/AuthContext/LaborProfile được viện dẫn không nằm trong delta, và CRM frozen sources được pin ở CRM baseline riêng (không thuộc HRP diff).
