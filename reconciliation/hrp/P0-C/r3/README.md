# HRP Reconciliation Bundle (P0-C / r3)

This bundle contains the official Evidence Reconciliation documents from the HRP Tier 1 (Planner) side in response to the CRM bundle `CONTRACT-01/r1` and the ACK message `CRM-HRP-MSG-004`.

- **Supersedes:** `reconciliation/hrp/P0-C/r2`
- **Supersedes Commit:** `cdd29b117c2d04a3740e6322d8ea2a94731af7a8`
- **Reason for Revision:** Phản hồi lại thông điệp `CRM-HRP-MSG-004` từ CRM Tier 0, sửa các lỗi claim (ví dụ: gỡ bỏ claim "Lossless" của PlacementCase), cập nhật phân tầng Suppression, cấu trúc Trust Boundary S2S, và quy chuẩn Enumeration Governance. Đảm bảo Capability Matrix bóc tách Evidence độc lập với trạng thái `MERGED`.

*Lưu ý: Revisions `r1` và `r2` vẫn mang tính bất biến (immutable) và không bị ghi đè trong lịch sử Git.*

## Contents
1. `CRM_CONTRACT_GAP_REPORT.md`: Comprehensive cross-check of 28 CRM modules and `index.ts` against HRP reality.
2. `THIN_SLICE_CAPABILITY_MATRIX.md`: Evaluation of end-to-end recruitment thin-slice capabilities with granular evidence tracking.
3. `hrp-contract-baseline.json`: Machine-readable evidence baselines, pending deltas, and test execution states.
4. `CONTRACT_AUTHORITY_HIERARCHY.md`: Rules governing System of Record vs System of Engagement boundaries.
5. `RECONCILIATION_DECISIONS.md`: Open questions requiring Owner or bilateral Tier 0 resolution, updated with detailed boundary and governance proposals.
6. `RECONCILIATION_PROTOCOL.md`: Procedural rules for cross-repository evidence exchange and encoding policies.

## Integrity
Verify the contents of this bundle against `manifest.sha256`. The manifest uses `sha256sum` style hashes on raw bytes (UTF-8, LF, No BOM) to prevent Windows checkout drift.
