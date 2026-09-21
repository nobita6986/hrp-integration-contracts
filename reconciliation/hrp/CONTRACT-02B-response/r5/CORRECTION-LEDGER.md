# Correction Ledger (r5)

This document tracks the corrections applied in the r5 revision of the CONTRACT-02B design response.

## 1. Encoding Correction
- **Mojibake Repair**: R4 bị double-encode UTF-8, gây lỗi mojibake tiếng Việt (VD: `yÃƒÂªu cÃ¡ÂºÂ§u`). R5 được tái cấu trúc từ nguồn r3 sạch, bảo đảm LF, no BOM, và không có các ký tự Hangul, U+FFFD hoặc mojibake.

## 2. DESIGN-RESPONSE Corrections
- **D-04 Gap**: Sửa lỗi chính tả "Đề xuất bổ음에 sung" (trong bản r3) thành "Đề xuất bổ sung". Đảm bảo không còn ký tự Hangul.

## 3. BASELINE-DELTA Corrections
- **File List Classification**: Giữ nguyên danh sách 10 file chính xác của HRP delta, nhưng phân loại lại theo đúng nhóm:
  - 3 W5 task/closeout docs (`AUDIT.md`, `HANDOFF.md`, `TASK.md`)
  - 1 coordination cursor doc (`PLANNER_HANDOVER.md`)
  - 5 W5 implementation/test/migration files
  - 1 Vitest registration file (`vitest.integration-files.ts`)
