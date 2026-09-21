# HRP Reconciliation Bundle (P0-C / r2)

This bundle contains the official Evidence Reconciliation documents from the HRP Tier 1 (Planner) side in response to the CRM bundle `CONTRACT-01/r1` and the ACK message `CRM-HRP-MSG-002`.

- **Supersedes:** `reconciliation/hrp/P0-C/r1`
- **Supersedes Commit:** `de1ebd122c665cb3557adaba27de48f9425f6dc3`
- **Reason for Revision:** Phản hồi lại thông điệp `CRM-HRP-MSG-002` từ CRM Tier 0, bổ sung chi tiết về Authority, S2S trust boundaries, Outbox design, Enum governance, và cập nhật 28/28 disposition rõ ràng hơn (tránh blanket classifications).

*Lưu ý: Revision `r1` vẫn mang tính bất biến (immutable) và không bị ghi đè trong lịch sử Git.*

## Contents
1. `CRM_CONTRACT_GAP_REPORT.md`: Comprehensive cross-check of 28 CRM modules and `index.ts` against HRP reality.
2. `THIN_SLICE_CAPABILITY_MATRIX.md`: Evaluation of end-to-end recruitment thin-slice capabilities with granular evidence tracking.
3. `hrp-contract-baseline.json`: Machine-readable evidence baselines, pending deltas, and test execution states.
4. `CONTRACT_AUTHORITY_HIERARCHY.md`: Rules governing System of Record vs System of Engagement boundaries.
5. `RECONCILIATION_DECISIONS.md`: Open questions requiring Owner or bilateral Tier 0 resolution, updated with detailed boundary and governance proposals.
6. `RECONCILIATION_PROTOCOL.md`: Procedural rules for cross-repository evidence exchange and encoding policies.

## Integrity
Verify the contents of this bundle against `manifest.sha256`. The manifest uses `sha256sum` style hashes on raw bytes (UTF-8, LF, No BOM) to prevent Windows checkout drift.
