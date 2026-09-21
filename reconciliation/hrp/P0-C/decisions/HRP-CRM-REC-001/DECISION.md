# OWNER DECISION RECORD

## HRP-CRM-REC-001: Suppression Domain Authority
- **Decision-ID:** HRP-CRM-REC-001
- **Authority:** Owner
- **Status:** `OWNER_APPROVED`
- **Source Message:** `CRM-HRP-MSG-010`

### Approved Scope
1. **CRM Authority:** CRM sở hữu suppression ở cấp độ channel / contact / connection.
2. **HRP Authority:** HRP sở hữu suppression ở cấp độ canonical person trong từng organization.
3. **Cross-organization:** Không mặc định áp dụng suppression xuyên organization (cross-organization).
4. **Effective Deny:** Quyết định chặn (effective deny) là tập hợp (union) của tất cả các nguồn suppression. Tín hiệu deny từ bất kỳ nguồn nào đều sẽ chặn outbound dispatch, không bên nào được phép ghi đè (override) lệnh deny của bên kia.
5. **Set/Unset Authority:** Mỗi hệ thống chỉ được quyền gỡ (unset) suppression thuộc thẩm quyền quản lý của riêng mình.
6. **Bypass Workflows:** Suppression chỉ chặn outbound dispatch. Các luồng Intake (thu thập hồ sơ), Review (đánh giá), và Read (tra cứu) tuyệt đối KHÔNG bị suppression chặn.

## HRP-CRM-REC-001-OPS: Suppression Operations & SLA
- **Decision-ID:** HRP-CRM-REC-001-OPS
- **Authority:** HRP / CRM Tier 0 (Pending)
- **Status:** `OPEN/PROPOSED`
- **Chưa chốt (Unresolved):** Các chi tiết vận hành bao gồm: freshness (độ trễ cho phép), TTL của cache, cơ chế propagation (lan truyền), cache invalidation, resync khi mất đồng bộ, cơ chế recovery, unavailable behavior (hành vi khi mất kết nối HRP-CRM), cơ chế fail-open/fail-closed, và ảnh hưởng chi tiết tới outbound dispatch.
- *(Lưu ý: Không quy định bất kỳ TTL mặc định nào tại thời điểm này).*

## Bổ sung: Carry-forward correction từ CRM-HRP-MSG-008 (PlacementCase)
- Quyền sở hữu (Canonical authority) đối với vòng đời `PlacementCase` thuộc về HRP — ownership này đã được chốt (APPROVED).
- Tuy nhiên, Wire mapping (sự tương thích dữ liệu trên wire) và transition semantics (ý nghĩa chuyển đổi trạng thái) giữa CRM stage và HRP status vẫn ở trạng thái `UNRESOLVED`.
- Khẳng định: Tình trạng "UNRESOLVED mapping" chỉ phản ánh việc hai bên chưa khớp data interface, KHÔNG được diễn giải thành "quyền ownership chưa được chốt".

## System Boundaries & Limitations
- **ACCEPTED_SHARED:** `NONE`.
- Các quyết định mở khác bao gồm **REC-002**, **REC-003**, và **REC-004b** vẫn tiếp tục ở trạng thái `OPEN/PROPOSED`.
- Việc thông qua REC-001 KHÔNG tạo quyền (authorization) cho bất kỳ bên nào tự ý sửa đổi Frozen Contracts.
- Tuyệt đối không thực hiện implementation tại runtime, không can thiệp database migrations, không publish package, và không deploy lên môi trường.
- Quyết định REC-001 về Domain Authority chưa tự động tạo ra quyền triển khai (deployment right) khi các vấn đề vận hành (REC-001-OPS) và shared wire contract (hợp đồng giao tiếp chung) chưa đạt trạng thái chấp nhận (ACCEPTED_SHARED).
