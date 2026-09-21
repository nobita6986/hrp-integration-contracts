# CONTRACT AUTHORITY HIERARCHY (Revision 2)

Tài liệu này xác định quyền sở hữu (ownership) và phân cấp thẩm quyền (authority) đối với các Domain và Contract giữa HRP và CRM, dựa trên V6+/V7 Roadmap và `HRP_EXECUTION_REALIGNMENT_PLAN.md`.

## 1. Nguyên tắc cốt lõi
- **Source Runtime > Tài liệu:** Source code đang chạy thực tế (Runtime) luôn thắng tài liệu mô tả khi xác định "đang triển khai" ở môi trường nào. HRP source runtime tại baseline chính là bằng chứng xác thực (evidence of implementation).
- **Architecture Authority:** HRP architecture authority có toàn quyền quyết định canonical domain semantics của HRP. Tương tự, CRM source runtime quyết định CRM implementation.
- **Neutral Repo & Bilateral Acceptance:** Neutral repo đóng vai trò quyết định cấu trúc shared wire revision **CHỈ SAU KHI** có sự đồng thuận hai chiều (bilateral acceptance).
- **Evidence Bundle & Authority:** Evidence bundle bản thân nó KHÔNG tự tạo ra authority.
- **ACK:** Tin nhắn ACK chỉ là xác nhận toàn vẹn dữ liệu, KHÔNG phải là sự chấp thuận nghiệp vụ (semantic acceptance).
- **Sở hữu Domain:** Domain ownership KHÔNG tự động suy ra từ việc bên kia chưa có hoặc thiếu field/API. Nếu HRP thiếu field, quyền quyết định field đó vẫn có thể nằm ở HRP.

## 2. Thẩm quyền của HRP (System of Record)
HRP sở hữu và quyết định toàn bộ logic của:
- **Canonical identity & labor profile:** Quá trình tạo mới, matching, gộp hồ sơ. (Lưu ý: HRP đã nắm quyền Canonical Merge).
- **Application & PlacementCase:** Vòng đời, trạng thái, quá trình chuyển đổi trạng thái (Transition).
- **Lifecycle & Permission semantics:** Phân quyền RLS.

## 3. Thẩm quyền của CRM (System of Engagement)
CRM sở hữu và quyết định toàn bộ logic của:
- **Chat, CSKH & Channel Suppression:** Các kênh liên lạc và logic chặn gửi tin trên các kênh (Engagement).
- **Interaction Timeline, Analytics.**
- **Campaign & Phân phối.**

## 4. Thẩm quyền của Neutral Repo (`hrp-integration-contracts`)
Neutral repository chỉ sở hữu Shared Wire Schemas, khả năng tương thích ngược và dữ liệu test giả lập sau khi có sự xác nhận song phương. Không can thiệp DB/Business Logic của hai bên.
