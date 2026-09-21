# RECONCILIATION DECISIONS

Tài liệu này ghi nhận các quyết định mở (Open Decisions) cần được Owner hoặc Tier 0 của HRP/CRM phân xử để thống nhất HRP-CRM Integration. (Revision 3)

## HRP-CRM-REC-001: Quản trị cờ DNC (Do Not Call) và Suppression
- **Status:** `OWNER_DECISION_BLOCKED`
- **RECOMMENDED_OPTION (Đề xuất chờ Owner phê duyệt, không phải Authority chính thức):**
  - **Phân tầng Suppression:**
    - *Channel/contact/connection suppression:* CRM sở hữu (Ví dụ: Chặn Zalo cá nhân).
    - *Canonical-person và organization-level suppression:* Đề xuất HRP sở hữu. (Lưu ý cho Owner chốt: Mức độ "Global" là trong nội bộ một organization hay xuyên organization?).
  - **Effective Deny (Hợp của các nguồn):** Việc chặn gửi tin (deny) là hợp (union) của tất cả các tầng suppression. Không bên nào được quyền override lệnh deny của bên kia.
  - **Phạm vi chặn (Scope of Denial):** Việc chặn chỉ áp dụng cho outbound dispatch (gửi tin nhắn/giao tiếp ra ngoài). Các tác vụ Intake (nhận hồ sơ), Review (đánh giá) và Read workflows (xem thông tin) tuyệt đối không bị suppression chặn.
  - **HRP-unavailable & Cache Staleness:**
    - Khi dispatch outbound, nếu CRM mất kết nối với HRP hoặc cache về Canonical Suppression bị stale (quá hạn), hệ thống phải **fail-closed** (không gửi tin).
    - Cần quy định rõ cơ chế resync và unblock khi hệ thống kết nối lại.
- **Decision Owner:** Owner.

## HRP-CRM-REC-002: Service-to-Service (S2S) Authentication Gateway
- **Status:** `PROPOSED` (Cả HMAC webhook và Service JWT đều đang là đề xuất, chưa được claim là HRP đã có).
- **Trust Boundary Matrix:**
  - **Boundary 1: Provider → CRM Receiver**
    - Service identity, issuer, audience, verification authority: External Provider xác thực.
    - Không dùng Boundary 1 làm bằng chứng CRM->HRP đã có Auth.
  - **Boundary 2: HRP → CRM Webhook/Event**
    - Service identity: HRP Core.
    - Issuer: HRP / Audience: CRM.
    - Verification authority: CRM Gateway.
    - Org/Connection binding: Dựa trên endpoint URL hoặc metadata đăng ký.
    - User delegation: Không.
    - Permission: Gửi event 1 chiều.
    - Credential type: Webhook HMAC Signature (PROPOSED).
    - Expiry & Replay window: Payload bắt buộc kèm timestamp. Replay window tối đa 5 phút.
    - Rotation: Đổi key định kỳ.
    - Revocation: HRP ngưng gửi khi key bị revoke.
    - Failure behavior: Trả lỗi, lưu Outbox retry.
  - **Boundary 3: CRM → HRP Command/Query API**
    - Service identity: CRM Integration Worker.
    - Issuer: CRM / Audience: HRP.
    - Verification authority: HRP Gateway.
    - Org/Connection binding: Gắn cứng qua Service Account.
    - User delegation: Actor ID do CRM gửi lên **không** phải là delegated identity nếu chưa được HRP xác thực (trust explicitly).
    - Permission: Theo Scope.
    - Credential type: Service JWT (PROPOSED).
    - Expiry & Replay window: JWT short-lived (VD: 15 phút).
    - Rotation: Tự động xoay signing key.
    - Revocation: Cần xây dựng endpoint revocation (PROPOSED).
    - Failure behavior: HRP từ chối 401/403.
  - **Quy tắc Logging chung:** CẤM log raw `Authorization`, signature header, token, hoặc secret trong bất kỳ log nào.
- **Decision Owner:** Owner.

## HRP-CRM-REC-003: Cơ chế Outbox và Idempotency
- **Status:** `PROPOSED` (Các khái niệm Atomic domain tx + outbox, at-least-once, và dedupe tiếp tục là DRAFT).
- **Phân tách 3 loại Identity:**
  1. *Command idempotency key:* Dùng cho việc chống duplicate khi gọi command API.
  2. *Immutable event identity:* Dùng cho receiver (CRM) dedupe các event.
  3. *Delivery-attempt identity:* Định danh cho mỗi lần thử gửi qua network.
- **Payload Digest & Conflict:**
  - Payload digest chỉ dùng để đối soát/integrity.
  - Nếu Cùng event identity + cùng digest = Duplicate hợp lệ (Receiver dedupe/ACK).
  - Nếu Cùng event identity + khác digest = Conflict, KHÔNG được bỏ qua, phải ghi log hoặc đẩy vào bảng lỗi.
- **Business Behavior:**
  - Tách bạch durable ACK (nhận thành công vào queue của CRM) khỏi business apply success (CRM xử lý thành công logic nghiệp vụ).
  - Unsupported schema/event/enum phải tuân thủ đúng compatibility policy, không mặc định crash.
- **Các thiết kế PUSH/PULL, Ordering scope theo aggregate, Retry/DLQ, và Retention (7-30 ngày):** Vẫn là `PROPOSED` (chưa có evidence implement ở HRP).
- **Decision Owner:** Owner.

## HRP-CRM-REC-004: Enum/Error Governance
- **HRP-CRM-REC-004a: Neutral repository authority**
  - **Status:** `CLOSED`
  - Neutral Repo chính thức là shared wire source theo chỉ đạo của Owner. Quyết định này không cần mở lại.
- **HRP-CRM-REC-004b: Enum/Error compatibility policy**
  - **Status:** `OPEN/PROPOSED` (Bao gồm cả tooling/codegen).
  - Không mặc định việc thêm giá trị enum mới là backward-compatible nếu Consumer đang dùng Zod enum đóng (closed enum).
  - Không tự ý thêm giá trị `UNKNOWN`/fallback trên các đường ghi (mutation path).
  - Không dùng khái niệm "1 sprint" làm compatibility/deprecation window khi chưa có thông tin chính xác về consumer version và rollout conditions (điều kiện triển khai).
- **Decision Owner:** Owner (cho phần 4b).
