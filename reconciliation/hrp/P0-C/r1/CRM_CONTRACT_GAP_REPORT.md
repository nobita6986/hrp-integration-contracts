# CRM CONTRACT GAP REPORT

**Bundle Revision:** r1
**HRP Baseline:** 1059f6669482efac5b7956ef25d43996ca59d515
**CRM Baseline:** 72643356a0d1355f9dccc3921b47c990ea9c31c1

Báo cáo này đối chiếu toàn bộ 28 modules trong `@hrp-engagement/contracts` từ repository trung lập.

## 1. Domain Authority & Ownership

- **HRP (System of Record):** Nắm quyền làm chủ `identity.ts`, `intake.ts`, `placement-case.ts`, `availability.ts`, `profile.ts`. Các schema liên quan đến định danh, trạng thái Placement, thời gian rảnh rỗi của worker phải tuân thủ chuẩn của HRP.
- **CRM (System of Engagement):** Nắm quyền làm chủ `interactions.ts`, `suppression.ts`, `dnc.ts`, `analytics.ts`, `kpi.ts`, `routing.ts`, `scheduling.ts`.
- **Neutral (Shared):** `events.ts`, `envelopes.ts`, `errors.ts`, `primitives.ts`, `gateway.ts`, `mappings.ts`, `outbox.ts`.

## 2. Module Disposition (28 Modules)

### 1. `ai-proposals.ts`
- **Disposition:** `TARGET_ONLY`
- **HRP Counterpart:** N/A (HRP chưa có hệ thống AI đề xuất trường dữ liệu).
- **Domain Authority:** CRM (Workflow).
- **Proposal:** Ghi nhận là schema tương lai, chưa áp dụng vào HRP runtime.

### 2. `ai-provider-config.ts`
- **Disposition:** `TARGET_ONLY`
- **HRP Counterpart:** N/A.

### 3. `analytics.ts`
- **Disposition:** `CRM_INTERNAL`
- **HRP Counterpart:** N/A (Analytics do CRM tự tính toán và lưu trữ).

### 4. `availability.ts`
- **Disposition:** `NOT_IMPLEMENTED_HRP`
- **HRP Counterpart:** `src/domains/talent/labor-profile.service.ts` (nhưng chưa có patch interface rảnh rỗi chi tiết như CRM yêu cầu).
- **Proposal:** Đợi P1 hoàn tất, sẽ mapping sau. Owner: HRP.

### 5. `dnc.ts`
- **Disposition:** `NOT_IMPLEMENTED_HRP`
- **HRP Counterpart:** HRP chưa có Do Not Call semantics. HRP chỉ có `status` của LaborProfile.
- **Proposal:** Đề xuất mở `HRP-CRM-REC-001` để xem HRP có lưu cờ DNC hay không.

### 6. `events.ts`
- **Disposition:** `TARGET_ONLY`
- **HRP Counterpart:** N/A (HRP đang có event nội bộ, nhưng chưa đóng gói theo EventEnvelope của CRM).

### 7. `evidence.ts`
- **Disposition:** `TARGET_ONLY`
- **HRP Counterpart:** Khác biệt so với Vercel Blob Media hiện tại của HRP.
- **Proposal:** Gắn với P0-A Evidence Gateway.

### 8. `gateway.ts`
- **Disposition:** `OWNER_DECISION_REQUIRED`
- **HRP Counterpart:** Chưa có HTTP gateway thống nhất (đang dùng REST Next.js).
- **Proposal:** Owner quyết định auth/gateway S2S.

### 9. `identity.ts`
- **Disposition:** `PARTIAL_MATCH`
- **HRP Counterpart:** `src/domains/talent/labor-profile.service.ts` (CreateOrMatchLaborProfile).
- **Analysis:** EXACT/POSSIBLE match outcome khá tương đồng, nhưng HRP hiện chưa bắn event ra CRM. Owner: HRP.

### 10. `intake.ts`
- **Disposition:** `PARTIAL_MATCH`
- **HRP Counterpart:** `src/domains/applications/aff03-*`
- **Analysis:** IntakeContext đang bị RLS 42501 (AFF-03B). HRP giữ authority.

### 11. `interactions.ts`
- **Disposition:** `NOT_IMPLEMENTED_HRP`
- **HRP Counterpart:** N/A.
- **Authority:** CRM.

### 12. `kpi.ts`
- **Disposition:** `CRM_INTERNAL`

### 13. `mappings.ts`
- **Disposition:** `TARGET_ONLY`
- **Analysis:** Mapping ID giữa CRM contact và HRP LaborProfile chưa được xây dựng phía HRP.

### 14. `merge-review.ts`
- **Disposition:** `OWNER_DECISION_REQUIRED`
- **Analysis:** Quá trình gộp hồ sơ do ai sở hữu? Cần Owner quyết định.

### 15. `next-action.ts`
- **Disposition:** `NOT_IMPLEMENTED_HRP`

### 16. `outbox.ts`
- **Disposition:** `TARGET_ONLY`
- **HRP Counterpart:** HRP chưa có bảng Outbox. (Mục P0-D).

### 17. `placement-case.ts`
- **Disposition:** `PARTIAL_MATCH`
- **HRP Counterpart:** `placement-case.service.ts`.
- **Analysis:** HRP có enum OPEN/IN_PROGRESS/READY_TO_PLACE/CLOSED. CRM cần khớp đúng bộ này. HRP giữ authority.

### 18. `ports.ts`
- **Disposition:** `UNKNOWN`

### 19. `profile.ts`
- **Disposition:** `TARGET_ONLY`

### 20. `providers.ts`
- **Disposition:** `TARGET_ONLY`

### 21. `queries.ts`
- **Disposition:** `TARGET_ONLY`

### 22. `routing.ts`
- **Disposition:** `CRM_INTERNAL`

### 23. `scheduling.ts`
- **Disposition:** `CRM_INTERNAL`

### 24. `suppression.ts`
- **Disposition:** `CRM_INTERNAL`

### 25. `enums.ts`
- **Disposition:** `TARGET_ONLY`

### 26. `envelopes.ts`
- **Disposition:** `TARGET_ONLY`

### 27. `errors.ts`
- **Disposition:** `PARTIAL_MATCH`
- **HRP Counterpart:** HRP có lỗi chuẩn (P2002, 42501) nhưng mã HrpError enum cần chuẩn hóa với CRM.

### 28. `primitives.ts`
- **Disposition:** `PARTIAL_MATCH`
- **Analysis:** SchemaVersion, cuid, UUID... khá tương đồng.

## 3. Khác Biệt Trọng Tâm & Impact
- **Actor/Auth:** CRM kỳ vọng S2S Auth qua Gateway. HRP đang dùng ServerSession.
- **Idempotency/Outbox:** Toàn bộ Outbox/DeliveryReceipt của CRM (TARGET_ONLY) chưa tồn tại ở HRP. Rủi ro mất event cực cao.
- **Placement Transition:** HRP quản lý `PlacementCase` bằng Prisma. Bất kỳ lệnh API nào từ CRM muốn sửa status phải được authenticate và validate chặt chẽ qua HRP Service, không update DB thô.
