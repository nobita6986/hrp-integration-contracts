# CONTRACT AUTHORITY HIERARCHY

Tài liệu này xác định quyền sở hữu (ownership) và phân cấp thẩm quyền (authority) đối với các Domain và Contract giữa HRP và CRM, dựa trên V6+/V7 Roadmap và `HRP_EXECUTION_REALIGNMENT_PLAN.md`.

## 1. Nguyên tắc cốt lõi
- **Source Runtime > Tài liệu:** Source code đang chạy thực tế (Runtime) luôn thắng tài liệu mô tả khi xác định "đang triển khai" ở môi trường nào.
- **Approved Architecture > Runtime Code:** Domain authority đã được phê duyệt ở cấp kiến trúc (V6+/V7) quyết định business semantics mục tiêu. Nếu Runtime code vi phạm authority này, Runtime phải được sửa (Ví dụ: AFF-03B sửa RLS).

## 2. Thẩm quyền của HRP (System of Record)
HRP sở hữu và quyết định toàn bộ logic của:
- **Canonical identity & labor profile:** Quá trình tạo mới, matching (EXACT/POSSIBLE), gộp (merge) hồ sơ.
- **Application:** Nguồn gốc ứng viên và thông tin apply.
- **PlacementCase & Placement:** Vòng đời, trạng thái (OPEN/CLOSED/CONFIRMED), quá trình chuyển đổi trạng thái (Transition).
- **Workforce:** Lịch sử làm việc, hợp đồng.
- **Lifecycle & Permission semantics:** Phân quyền RLS, session, ai được quyền đọc/ghi.

*CRM không được phép ghi đè trạng thái của các thực thể này bằng các lệnh update thô.*

## 3. Thẩm quyền của CRM (System of Engagement)
CRM sở hữu và quyết định toàn bộ logic của:
- **Chat & CSKH (Customer Service):** Các kênh Zalo, SMS, Webhook.
- **Interaction Timeline:** Lịch sử tương tác, log cuộc gọi, ghi chú.
- **Campaign & Phân phối:** Chiến dịch tuyển dụng, phát tán tin nhắn.
- **Agent workflow & Routing:** Phân bổ nhân sự xử lý (Handling Assignment), tính điểm KPI, Analytics.
- **CRM internal UI/automation:** Tự động hóa nội bộ CRM.

## 4. Thẩm quyền của Neutral Repo (`hrp-integration-contracts`)
Neutral repository **chỉ sở hữu**:
- **Shared wire schemas:** Các định dạng JSON/DTO trao đổi giữa 2 hệ thống (VD: Event Envelope).
- **Compatibility:** Đảm bảo tương thích ngược.
- **Fixtures & Versioning metadata:** Dữ liệu test giả lập và version API.

*Neutral Repo KHÔNG sở hữu Business Logic hay Database Schema của HRP hay CRM.*

## 5. Quy trình Đề xuất và Phê duyệt Thay đổi (Reconciliation Process)
- **Đề xuất thay đổi:** Tier 1 (Planner) hoặc Tier 2 (Engineer) của bất kỳ bên nào đều có thể đề xuất (dưới dạng Code PR hoặc tài liệu).
- **Review phía HRP:** Tier 0 HRP kiểm duyệt mức độ an toàn (RLS, Database integrity).
- **Review phía CRM:** Tier 0 CRM kiểm duyệt tính khả thi workflow.
- **Xác nhận Bilateral (Hai chiều):** Quyết định gộp (Merge) vào Neutral Repo phải được cả Tier 0 HRP và Tier 0 CRM xác nhận bằng văn bản qua Git commit SHA (ACCEPTED_SHARED).
- **Breaking Business Semantics:** Bất kỳ thay đổi nào phá vỡ quy tắc nghiệp vụ hiện tại phải do **Owner** quyết định và giải quyết tranh chấp.
