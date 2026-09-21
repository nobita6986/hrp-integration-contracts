# RECONCILIATION DECISIONS

Tài liệu này ghi nhận các quyết định mở (Open Decisions) cần được Owner hoặc Tier 0 của HRP/CRM phân xử để thống nhất HRP-CRM Integration. (Revision 2)

## HRP-CRM-REC-001: Quản trị cờ DNC (Do Not Call) và Suppression
- **Status:** `OWNER_DECISION_BLOCKED`
- **CRM Response:** [TBD - Chờ phản hồi từ CRM]
- **HRP Response:** Đề xuất phân tách Authority rõ ràng cho từng loại suppression.
- **Evidence:** `dnc.ts` và `suppression.ts` từ CRM bundle. HRP chưa có cờ global DNC.
- **RECOMMENDED_OPTION:** 
  1. **Channel/contact/connection suppression:** CRM sở hữu (Engagement authority).
  2. **Canonical person/LaborProfile suppression:** HRP sở hữu (Record authority).
  3. **Organization-wide/global suppression:** HRP sở hữu.
  4. **Dispatch-time effective suppression:** Quyết định chặn (deny) là hợp (union) của các nguồn trên, trong đó `DENY` thắng.
  5. **Set/unset authority:** Mỗi hệ thống chỉ được quyền gỡ (unset) suppression thuộc thẩm quyền (authority) của mình.
  6. **Precedence:** Quyền deny cấp độ canonical (HRP) cao hơn channel (CRM).
  7. **Propagation:** Đồng bộ trạng thái canonical từ HRP sang CRM thông qua event.
  8. **HRP-unavailable/stale-cache behavior:** Nếu CRM mất kết nối với HRP hoặc cache bị stale (quá hạn) thì CRM phải fail-closed khi dispatch (không gửi tin nhắn).
- **Decision Owner:** Owner.
- **Blocked Scope:** Module `dnc.ts` và `suppression.ts`.
- **Unblocked Scope:** Draft reconciliation.
- **Next Required Message:** `CRM-HRP-MSG-004` (CRM Tier 0 phản hồi).

## HRP-CRM-REC-002: Service-to-Service (S2S) Authentication Gateway
- **Status:** `PROPOSED`
- **CRM Response:** [TBD]
- **HRP Response:** Đề xuất các trust boundary phân tách. Không dùng HMAC provider->CRM làm bằng chứng cho S2S HRP-CRM.
- **Trust Boundary Matrix:**
  - **Boundary 1: Provider → CRM Receiver**
    - Service identity: External Provider (Zalo, Chatwoot, v.v.)
    - Organization/Connection scope: Phụ thuộc Provider ID/Webhook URL.
    - Credential type: Tùy Provider (HMAC, Token).
    - Failure behavior: Trả 401/403.
    - Logging/Audit: Ghi log header/IP (phía CRM).
  - **Boundary 2: HRP → CRM Webhook/Event**
    - Service identity: HRP Core.
    - Capability/Permission: Chỉ đẩy event bất biến.
    - Credential type: Webhook HMAC Signature (PROPOSED).
    - Expiry/Timestamp protection: Bắt buộc kèm timestamp chống replay.
    - Key rotation: Định kỳ qua cấu hình Admin.
    - Failure behavior: Retry qua Outbox.
    - Logging/Audit: CRM ghi nhận theo Event ID.
  - **Boundary 3: CRM → HRP Command/Query API**
    - Service identity: CRM Integration Worker.
    - User delegation: Caller Actor ID từ CRM (nếu có).
    - Audience: HRP Gateway.
    - Capability/Permission: Phụ thuộc role Actor hoặc Scope giới hạn.
    - Credential type: Service JWT (PROPOSED).
    - Expiry/Timestamp protection: JWT short-lived expiry.
    - Revocation: HRP cung cấp endpoint revoke key/token.
    - Failure behavior: HRP chặn ở middleware 401/403.
    - Logging/Audit: Lưu vết API log phía HRP.
  - **Boundary 4: Internal Worker → Integration API**
    - Phân quyền theo role kỹ thuật cụ thể.
- **Decision Owner:** Owner.
- **Blocked Scope:** Khả năng gọi API cross-repo thực tế.
- **Next Required Message:** `CRM-HRP-MSG-004`.

## HRP-CRM-REC-003: Cơ chế Outbox và Idempotency
- **Status:** `PROPOSED`
- **HRP Proposal:**
  - **Atomic Boundary:** Đảm bảo ranh giới transaction (atomic boundary) giữa việc ghi dữ liệu domain (domain write) và lưu trữ event (outbox insert) bằng Postgres `$transaction`. Transactional outbox giải quyết vấn đề atomic capture.
  - **Broker Transport:** Message broker (Kafka/Redis Stream) là transport tùy chọn phía sau. Cả hai (Outbox table và Broker) không loại trừ nhau.
  - **Stable Event Identity:** Mỗi event có ID định danh bất biến được tạo ra ngay lúc insert.
  - **Ordering Scope:** Đảm bảo thứ tự theo Aggregate (VD: Profile ID).
  - **At-least-once Delivery:** Worker đảm bảo gửi ít nhất 1 lần (At-least-once).
  - **CRM Dedupe:** CRM bắt buộc phải lọc trùng lặp (dedupe) dựa theo Event ID.
  - **Idempotency Key Scope:** Quản lý theo `[Actor_ID, Entity_ID, Event_Hash]`.
  - **Payload Mismatch Behavior:** HRP gửi event nguyên bản; CRM tự parse/bỏ qua payload không hiểu (Forward Compatible).
  - **Retry/Backoff:** Exponential backoff trong Outbox dispatcher.
  - **DLQ (Dead Letter Queue):** Event gửi thất bại quá số lần sẽ vào DLQ.
  - **Replay/Retention:** Cấu hình retention policy 7-30 ngày. Khả năng replay từ DLQ.
  - **PUSH/PULL:** Khuyến nghị mô hình PUSH từ HRP sang CRM.
  - **Observability / Failure Recovery:** Log chi tiết tại Dispatcher.
  - **Lưu ý:** HRP không bắt buộc copy cấu trúc `Claim/Lease` nội bộ của CRM.
- **Decision Owner:** Owner.
- **Blocked Scope:** Đồng bộ State sang CRM an toàn.

## HRP-CRM-REC-004: Enum/Error Governance
- **Status:** Quyết định sử dụng Neutral Repo làm shared wire source theo chỉ đạo của Owner. Không cần mở lại. Tooling/codegen vẫn `PROPOSED`.
- **HRP Proposal cho Quản trị Enum & Lỗi:**
  - **Canonical/domain enum → wire enum mapping:** HRP mapping Enum Prisma nội bộ sang Neutral Enum trước khi xuất ra wire. Không dùng Prisma enum trực tiếp làm public wire authority.
  - **Internal error → wire error mapping:** Map lỗi HRP nội bộ sang các HrpError tiêu chuẩn.
  - **Unknown enum behavior:** Consumer (CRM) phải hỗ trợ tính năng fallback (VD: `UNKNOWN` hoặc bỏ qua) khi gặp enum mới chưa kịp cập nhật.
  - **Additive compatibility:** Thêm giá trị mới vào Enum không được coi là breaking change.
  - **Breaking compatibility:** Xóa/sửa ý nghĩa giá trị Enum cũ cần nâng version wire contract.
  - **Deprecation window:** Tối thiểu 1 sprint cảnh báo trước khi xóa.
  - **Producer/consumer rollout:** Producer chỉ bắt đầu xuất enum mới sau khi Consumer đã deploy schema tương thích.
  - **Error exposure policy:** Các lỗi rò rỉ hạ tầng (`P2002`, `42501`) phải bị chặn tại HRP API Gateway. Không đưa vào shared error contract.
- **Decision Owner:** Owner.
