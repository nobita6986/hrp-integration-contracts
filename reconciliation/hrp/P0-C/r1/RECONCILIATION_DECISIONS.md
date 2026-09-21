# RECONCILIATION DECISIONS

Tài liệu này ghi nhận các quyết định mở (Open Decisions) cần được Owner hoặc Tier 0 của HRP/CRM phân xử để thống nhất HRP-CRM Integration.

## HRP-CRM-REC-001: Quản trị cờ DNC (Do Not Call) và Suppression
- **Question:** HRP có lưu trữ và sở hữu cờ DNC của Worker không, hay CRM hoàn toàn làm chủ hệ thống Suppression?
- **Evidence:** CRM có module `dnc.ts` và `suppression.ts` (TARGET_ONLY). HRP hiện không có trường DNC trong DB Prisma.
- **Authority:** Cần quyết định ranh giới giữa System of Record và System of Engagement.
- **Options:**
  - *Option A:* CRM lưu và tự chặn luồng gửi tin. HRP không biết về DNC.
  - *Option B:* HRP lưu DNC (như một thuộc tính của LaborProfile), CRM phải query HRP trước khi tương tác.
- **Recommended Option:** Option A (CRM tự quản lý) để giảm tải cho HRP Database và giữ đúng vai trò Engagement.
- **Impact:** Nếu HRP lưu, phải migrate DB và thêm API.
- **Decision Owner:** Owner.
- **Blocked Scope:** Module `dnc.ts` và `suppression.ts` của CRM.
- **Status:** `OPEN`
- **Message References:** TBD.

## HRP-CRM-REC-002: Service-to-Service (S2S) Authentication Gateway
- **Question:** Giao thức Auth nào sẽ được dùng giữa HRP và CRM?
- **Evidence:** CRM đang định nghĩa WebhookSignature (hmac) trong `gateway.ts`. HRP chưa có cổng S2S nào.
- **Authority:** HRP hạ tầng (Tier 0).
- **Options:**
  - *Option A:* Dùng Webhook HMAC Signature (như CRM đề xuất).
  - *Option B:* Dùng Mutual TLS (mTLS).
  - *Option C:* Dùng JWT Service Accounts.
- **Recommended Option:** Option A cho Webhook từ HRP -> CRM, và Option C cho API CRM -> HRP.
- **Impact:** Định hình lại cách cấu hình Next.js API Routes ở HRP.
- **Decision Owner:** Owner.
- **Blocked Scope:** Module `gateway.ts` và khả năng gọi API S2S.
- **Status:** `OPEN`
- **Message References:** TBD.

## HRP-CRM-REC-003: Cơ chế Outbox và Idempotency
- **Question:** HRP có bắt buộc triển khai bảng Outbox vật lý trong PostgreSQL để bắn event sang CRM không?
- **Evidence:** CRM định nghĩa `outbox.ts` rất chi tiết (DeliveryReceipt, Claim, Lease). HRP hoàn toàn chưa có.
- **Authority:** HRP Core Architecture.
- **Options:**
  - *Option A:* HRP phải code Outbox pattern và workers để xử lý `outbox.ts`.
  - *Option B:* Dùng giải pháp Message Queue bên ngoài (Kafka/RabbitMQ) thay vì Outbox table trong Postgres.
- **Recommended Option:** Option A (Transactional Outbox) để đảm bảo consistency 100% với Prisma `$transaction`.
- **Impact:** Khối lượng dev phía HRP sẽ tăng mạnh ở P0-D.
- **Decision Owner:** Owner.
- **Blocked Scope:** Gửi event từ HRP sang CRM một cách an toàn.
- **Status:** `OPEN`
- **Message References:** TBD.

## HRP-CRM-REC-004: Xử lý Lỗi và Enum Chung
- **Question:** Có hợp nhất danh sách Enum và Error Codes giữa hai hệ thống thành 1 NPM package không?
- **Evidence:** `enums.ts` và `errors.ts` ở CRM có khả năng lệch (drift) với HRP Prisma Schema.
- **Authority:** Shared Architecture.
- **Options:**
  - *Option A:* Tự động generate chung từ 1 nguồn (Ví dụ: OpenAPI).
  - *Option B:* Copy thủ công (Rủi ro cao).
- **Recommended Option:** Option A.
- **Impact:** Cần thiết lập CI pipeline cross-repo.
- **Decision Owner:** Owner.
- **Blocked Scope:** Độ tin cậy của việc check logic (if error === 'xxx').
- **Status:** `OPEN`
- **Message References:** TBD.
