# Correction Ledger (r6)

This document tracks the final integrity-only correction applied in the r6 revision of the CONTRACT-02B design response.

## 1. Integrity correction

- Removed literal examples of previously corrupted byte sequences from the correction ledger itself.
- Removed the literal non-Vietnamese sequence previously present in the D-04 correction description.
- No design decision, source evidence, baseline evidence, contract proposal, or implementation-owner mapping changed from r5.

## 2. Preserved r5 corrections

- D-04 uses the correct Vietnamese phrase `Đề xuất bổ sung`.
- The HRP delta remains classified as 3 W5 task/closeout documents, 1 coordination cursor document, 5 W5 implementation/test/migration files, and 1 Vitest registration file.
- All content files use strict UTF-8, LF line endings, and no BOM.
