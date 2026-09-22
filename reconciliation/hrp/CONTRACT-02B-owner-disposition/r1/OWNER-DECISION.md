# Talent read slice — Owner disposition for controlled pilot

## Delivery metadata

- Message-ID: `HRP-CRM-MSG-026` (không xuất hiện trong các remote refs neutral repository đã kiểm tra ngày 2026-09-22).
- From / To / Type: T0 HRP / T0 CRM / OWNER_DECISION_DELIVERY.
- Supplements: `HRP-CRM-MSG-025`; không sửa hoặc thay thế toàn bộ design proposal.
- Authority: quyết định trực tiếp của Owner trong conversation ngày 2026-09-22, được T0 HRP ghi nhận ở đây; không tự gán Message-ID cho Owner.
- Proposal commit: `53e6db53a929409b1dc7b512a1ec897a3af5b659`.
- Proposal path: `reconciliation/hrp/CONTRACT-02B-followup/r4/`.
- Proposal manifest SHA-256: `e6f9dd0e2810525fde4743af16aca4bc6b2045dbe7c8de2f86c5aa8a49ee99f8`.
- HRP source baseline: `0f46f0fbf2c8bc8d106c9aa2f0d3fc6143d2850b`.
- CRM frozen source baseline: `72643356a0d1355f9dccc3921b47c990ea9c31c1`.
- CRM proposal: `eb586247fe1a147bc904ff69d49104e8609943ff`, `reconciliation/crm/CONTRACT-02B/r6/`.
- Scope: documentation-only Owner policy disposition; không có source-baseline delta hoặc runtime verification mới.
- `ACCEPTED_SHARED = NONE`.

## 1. External eligibility — OWNER_APPROVED, có điều kiện

Owner cho phép `ADMIN`, `HR_MANAGER`, `HR_STAFF` sử dụng Talent context từ CRM, với toàn bộ điều kiện sau:

- HRP kiểm tra effective user đang active, role và quyền từng hồ sơ ở mỗi query.
- Không mở rộng quyền so với HRP. Service-only không được đọc LaborProfile.
- Projection duy nhất là `identitySummary.fullNameRedacted`, với `displayOnly=true`; không phone, CCCD hoặc DTO nội bộ.
- Slice đầu chỉ hỗ trợ một `organizationId` do HRP cung cấp và bind server-side. Không suy ra quyền xuyên organization hoặc khả năng phân lập multi-organization.

Quyết định này đóng phần external eligibility trong Owner decision 1 của proposal r4. Giá trị canonical `organizationId` cụ thể chưa được cung cấp, vẫn OPEN; không lấy từ claim của CRM làm authority. Điều kiện từ chối sai organization trước object lookup của design proposal vẫn giữ nguyên.

## 2. Delegation UX/lifetime — OWNER_APPROVED cho pilot có kiểm soát

- Người dùng đăng nhập và chủ động approve tại HRP.
- Delegation tối đa 15 phút, không vượt thời hạn session liên quan, không tự gia hạn.
- Khi exchange timeout không rõ kết quả: phải cancel và nhận ACK, hoặc xác nhận expiry từ HRP, trước khi mở approval mới. Owner chấp nhận người dùng có thể phải approve lại.

Owner chấp nhận giới hạn rủi ro revoke cho pilot này:

- CRM logout/account switch phải chặn sử dụng ngay tại CRM.
- Nếu revoke chưa tới HRP do lỗi mạng, delegation có thể còn hiệu lực tại HRP đến expiry, tối đa thời gian còn lại của hạn 15 phút.
- Khi HRP revoke đã commit, query đi qua authorization checkpoint sau đó phải bị từ chối.
- Không tuyên bố thu hồi tức thời xuyên hệ thống. Quyết định này không cam kết hủy hồi tố query đã qua checkpoint trước revoke commit.

Phần UX/lifetime và giới hạn revoke trong Owner decision 2 của proposal r4 được đóng cho controlled pilot. Trước production phải đánh giá lại rủi ro thu hồi theo kết quả pilot. Không diễn giải approval này thành quyền triển khai hoặc bật pilot ngay khi bilateral spec và các gate chưa hoàn tất.

## 3. Các mục chưa được phê duyệt

| Mục | Trạng thái và next owner |
|---|---|
| Canonical organizationId cụ thể | OPEN — HRP cung cấp, bind server-side; không tự đặt giá trị trong tài liệu này. |
| Audit metadata access, retention, recovery | OPEN — Owner/operations quyết định; không bịa số retention hoặc quyền truy cập. |
| Receipt issuance/exchange/cancel transport, atomic consume, service-user-org-request binding | PROPOSED — hai T0 chốt đặc tả song phương; approval UX không phê duyệt ngầm wire shape. |
| Assertion algorithm/TTL/skew, trust/key lifecycle, replay retention và unavailable behavior | PROPOSED — HRP đề xuất kỹ thuật, CRM review compatibility; hạn 15 phút là delegation, không phải service assertion TTL. |
| Query error matrix, retry profile, export/package/version, parser và consumer scope | PROPOSED — REC-004b/bilateral review; frozen command contracts giữ nguyên. |
| Thuật toán redaction và test vectors | Chưa chốt — hai T0 phải hoàn tất; displayOnly không thay field filtering hoặc privacy enforcement. |

REC-002/REC-004b chưa được đóng toàn bộ. REC-001 ownership giữ nguyên; REC-001-OPS không đổi, không được chốt ngầm. Không mở thêm dependency hoặc quyết định REC-003 từ supplement này.

## 4. Execution boundary và evidence

Đây là Owner policy approval giới hạn, không phải bilateral acceptance của wire contract hoặc bằng chứng capability đã tồn tại. Không mở endpoint, auth/RLS/schema change, migration, consumer migration, publish hoặc deploy. Không mở production rollout.

Hai T0 tiếp tục bilateral contract review; implementation contract và enablement gate vẫn riêng biệt. H.09 và independent Tier 3 gate trước real path được giữ nguyên. T1A/T1B không nhận thêm runtime scope qua tài liệu này.

Supplement gồm một file `OWNER-DECISION.md` và `manifest.sha256` hash raw bytes của file đó. Proposal r4 và các evidence revision cũ giữ bất biến. Chỉ kiểm tra integrity/encoding/diff cho supplement; không chạy application tests và không tuyên bố pilot/runtime test PASS.
