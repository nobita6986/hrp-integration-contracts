# CRM CONTRACT GAP REPORT (Revision 3)

**Bundle Revision:** r3 (Supersedes: r2)
**HRP Baseline:** 1059f6669482efac5b7956ef25d43996ca59d515
**CRM Baseline:** 72643356a0d1355f9dccc3921b47c990ea9c31c1

Tài liệu khảo sát chéo (Cross-repo Survey) 28 modules gốc và `index.ts` giữa CRM Contracts và HRP Runtime. (Mỗi symbol có HRP claim đều trích xuất dựa trên Evidence Mode: `SOURCE_ONLY`).

## 1. Chi tiết 28 Modules

### 1. `packages/contracts/src/commands/ai-proposals.ts`
- **Operation/Symbol:** AIProposalSchema, ApplyAIProposalInputSchema
- **CRM Baseline:** 72643356a0d1355f9dccc3921b47c990ea9c31c1
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE` (Đã tìm kiếm pattern `AIProposal*` tại `C:/CodeApp/HrP/src/domains/` trên baseline 1059f666).
- **Limitation:** Khảo sát trên main baseline, không tìm thấy file liên quan.
- **Domain Authority:** CRM (Engagement Workflow).
- **Disposition:** `TARGET_ONLY`
- **Blocker:** Không. Quyền nằm ở CRM.

### 2. `packages/contracts/src/commands/ai-provider-config.ts`
- **Operation/Symbol:** AIProviderConfigWriteSchema
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE` (Tìm kiếm `AIProvider*` tại `src/domains/`, baseline 1059f666).
- **Domain Authority:** CRM.
- **Disposition:** `TARGET_ONLY`

### 3. `packages/contracts/src/commands/analytics.ts`
- **Operation/Symbol:** MetricAggregateReadRequestSchema
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE` (Tìm kiếm `MetricAggregate*` tại `src/domains/`, baseline 1059f666).
- **Domain Authority:** CRM (Workflow & Đo lường).
- **Disposition:** `CRM_INTERNAL` (Phân loại theo authority thực).

### 4. `packages/contracts/src/commands/availability.ts`
- **Operation/Symbol:** UpdateLaborAvailabilityInputSchema
- **HRP Counterpart:** `C:/CodeApp/HrP/src/domains/talent/labor-profile.service.ts` (Symbol: `updateAvailability`, L150)
- **Domain Authority:** HRP (System of Record của Worker).
- **Disposition:** `PARTIAL_MATCH`
- **Match Details:**
  - *Matched Fields:* ID (string).
  - *Mismatched Fields:* HRP dùng chuỗi string đơn giản mô tả thời gian rảnh. CRM yêu cầu cấu trúc Patch JSON `AvailabilityPatch`.
  - *Required/Optional/Nullability:* HRP cho phép null. CRM yêu cầu mảng patch, không null.
  - *Enum Differences:* Không có enum trực tiếp, nhưng cấu trúc data khác biệt.
  - *Behavior Differences:* HRP cập nhật ghi đè (overwrite). CRM yêu cầu thao tác PATCH.
  - *Envelope/Error Differences:* HRP không bọc event envelope.
  - *Producer/Consumer impact:* CRM không thể gọi lệnh nếu HRP không deploy DTO mới.
- **Evidence Class:** `SOURCE_ONLY`.
- **Owner:** HRP.

### 5. `packages/contracts/src/commands/dnc.ts`
- **Operation/Symbol:** DncReasonSchema
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE` (Tìm kiếm cờ DNC tại `Prisma Schema`, baseline 1059f666).
- **Domain Authority:** `OWNER_DECISION_BLOCKED` (Xem REC-001).
- **Disposition:** `TARGET_ONLY`

### 6. `packages/contracts/src/commands/events.ts`
- **Operation/Symbol:** EventEnvelopeSchema
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE` (Tìm kiếm `EventEnvelope*` tại `src/`, baseline 1059f666).
- **Domain Authority:** Neutral/Shared Wire.
- **Disposition:** `TARGET_ONLY`

### 7. `packages/contracts/src/commands/evidence.ts`
- **Operation/Symbol:** CommandEvidenceRefSchema
- **HRP Counterpart:** `C:/CodeApp/HrP/src/domains/media/vercel-blob.service.ts` (Media Service)
- **Domain Authority:** HRP
- **Disposition:** `PARTIAL_MATCH`
- **Match Details:**
  - *Matched:* Bản chất lưu trữ URL file.
  - *Mismatched:* CRM yêu cầu DTO `CommandEvidenceRefSchema`. HRP lưu text URL nguyên gốc.
  - *Behavior Differences:* HRP không sử dụng ref object schema trên wire.

### 8. `packages/contracts/src/commands/gateway.ts`
- **Operation/Symbol:** WebhookReceiverRequestSchema
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE` (Tìm kiếm gateway S2S tại `app/api/`, baseline 1059f666).
- **Domain Authority:** HRP Infrastructure.
- **Disposition:** `OWNER_DECISION_BLOCKED` (Xem REC-002).

### 9. `packages/contracts/src/commands/identity.ts`
- **Operation/Symbol:** CreateOrMatchLaborProfileInputSchema
- **HRP Counterpart:** `C:/CodeApp/HrP/src/domains/applications/intake-writer.service.ts` (Symbol: `findOrCreateLaborProfile`, L200)
- **Domain Authority:** HRP (System of Record).
- **Disposition:** `PARTIAL_MATCH`
- **Match Details:**
  - *Matched Fields:* fullName, phone, citizenId.
  - *Mismatched Fields:* CRM yêu cầu identity provenance (nguồn gốc) bắt buộc. HRP gán cứng nguồn ngầm định.
  - *Behavior Differences:* HRP trả về entity Prisma (EXACT match / NEW). CRM dùng event `MatchingOutcomeResult`.
  - *Envelope/Error Differences:* HRP ném lỗi Prisma (`P2002`).

### 10. `packages/contracts/src/commands/intake.ts`
- **Operation/Symbol:** IntakeSubmissionPayloadSchema
- **HRP Counterpart:** `C:/CodeApp/HrP/src/domains/applications/aff03-public-intake.service.ts` (Symbol: `submitPublicIntake`, L50)
- **Domain Authority:** HRP.
- **Disposition:** `PARTIAL_MATCH`
- **Match Details:**
  - *Matched Fields:* Tương đồng các trường ứng tuyển cơ bản.
  - *Behavior Differences:* Hành vi lưu nháp (draft digest) chưa được HRP support.
  - *Blocker:* Lệnh bị chặn do HRP thiếu config GUC Postgres (RLS 42501). Path này thuộc AFF-03B chưa merge vào baseline chính.

### 11. `packages/contracts/src/commands/interactions.ts`
- **Operation/Symbol:** RecordTalentInteractionInputSchema
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE` (Tìm kiếm `Interaction*` tại `src/domains/`, baseline 1059f666).
- **Domain Authority:** CRM.
- **Disposition:** `CRM_INTERNAL`

### 12. `packages/contracts/src/commands/kpi.ts`
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE`
- **Domain Authority:** CRM.
- **Disposition:** `CRM_INTERNAL`

### 13. `packages/contracts/src/commands/mappings.ts`
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE`
- **Domain Authority:** Neutral (Shared Wire).
- **Disposition:** `TARGET_ONLY`

### 14. `packages/contracts/src/commands/merge-review.ts`
- **Operation/Symbol:** MergeLaborProfilesInputSchema
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE` (Chưa code chức năng này, tìm `MergeLaborProfiles` tại `src/domains/` baseline 1059f666).
- **Domain Authority:** HRP (HRP đã sở hữu canonical merge authority, không mở lại decision này).
- **Disposition:** `TARGET_ONLY` (Chờ HRP implement).

### 15. `packages/contracts/src/commands/next-action.ts`
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE`
- **Domain Authority:** CRM.
- **Disposition:** `CRM_INTERNAL`

### 16. `packages/contracts/src/commands/outbox.ts`
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE` (Tìm kiếm `Outbox` table tại Prisma Schema, baseline 1059f666).
- **Domain Authority:** HRP/Neutral (Xem REC-003).
- **Disposition:** `PROPOSED`

### 17. `packages/contracts/src/commands/placement-case.ts` & `enums.ts`
- **Operation/Symbol:** PlacementCasePatchSchema
- **HRP Counterpart:** `C:/CodeApp/HrP/src/domains/staffing/placement-case.service.ts` (Prisma `PlacementCase` model, `updateStatus`)
- **Domain Authority:** HRP.
- **Disposition:** `PARTIAL_MATCH`
- **Match Details:**
  - Dữ liệu PlacementCase bị tách thành 3 khái niệm biệt lập:
    1. **HRP Case Lifecycle Status:** (Quyền của HRP) Lưu tại field `status` trong DB. HRP cho phép các giá trị: `OPEN`, `IN_PROGRESS`, `READY_TO_PLACE`, `CLOSED`. Field này bị cấm patch (forbidden to patch) từ bên ngoài CRM.
    2. **CRM Operational Stage:** (Giao diện vận hành CRM) CRM có tập Frozen Enum: `NEW`, `CONTACTING`, `QUALIFYING`, `MATCHING`, `PROPOSED`, `INTERESTED`, `CLIENT_PROCESS`, `READY_TO_START`. Trong CRM contract, đây là field có thể patch (`intendedStage`).
    3. **Close Semantics / CLOSED_CASE_STATUS:** Khái niệm đóng case riêng biệt.
  - *Mapping Status:* HRP Runtime và CRM Frozen Enum hoàn toàn LỆCH NHAU (mismatch). Trạng thái hiện tại là `UNRESOLVED` do chưa có mapping nào có bằng chứng thực tế chứng minh sự tương thích. Không tự tạo mapping, không yêu cầu CRM đổi frozen enum. CRM được quyền gửi `intendedStage`, nhưng nó không update trực tiếp `status` của HRP.

### 18. `packages/contracts/src/commands/ports.ts`
- **Disposition:** `UNKNOWN`

### 19. `packages/contracts/src/commands/profile.ts`
- **Operation/Symbol:** UpdateLaborProfileInputSchema
- **HRP Counterpart:** `C:/CodeApp/HrP/src/domains/talent/labor-profile.service.ts`
- **Domain Authority:** HRP.
- **Disposition:** `PARTIAL_MATCH`
- **Match Details:** Khác biệt cấu trúc patch và envelope (Tương tự phần availability). HRP `update` toàn bộ DTO thay vì field path patch.

### 20. `packages/contracts/src/commands/providers.ts`
- **Disposition:** `TARGET_ONLY`

### 21. `packages/contracts/src/commands/queries.ts`
- **Disposition:** `TARGET_ONLY`

### 22. `packages/contracts/src/commands/routing.ts`
- **Operation/Symbol:** UpdateRoutingPoolInputSchema
- **HRP Counterpart:** `C:/CodeApp/HrP/src/domains/applications/handling-assignment.service.ts`
- **Domain Authority:** CRM (Quy tắc định tuyến nhân viên thuộc CRM).
- **Disposition:** `PARTIAL_MATCH`
- **Match Details:**
  - Semantic Drift (Sai lệch ngữ nghĩa): Việc phân công `HandlingAssignment` của HRP là lệnh gán người trực tiếp thủ công lưu tạm vào database. CRM `routing.ts` là rules engine tính điểm (weight/reservation) cho Employee Routing tự động.
  - HRP **không** tự động hóa bằng CRM employee routing. Phải thiết lập Entity Mapping giữa HRP `HandlingAssignment` và khái niệm CRM routing trước khi coi là cùng một thứ.

### 23. `packages/contracts/src/commands/scheduling.ts`
- **Operation/Symbol:** PlanningBatchItemSchema
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE`
- **Domain Authority:** CRM. (Chỉ thuộc CRM nếu nó xếp lịch call/campaign. Từng operation cần phân loại authority thực tế, không blanket-classify).
- **Disposition:** `TARGET_ONLY`

### 24. `packages/contracts/src/commands/suppression.ts`
- **Operation/Symbol:** (Liên quan Block/Unblock channel)
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE`
- **Domain Authority:** `OWNER_DECISION_BLOCKED` (Xem REC-001; Provisional).
- **Disposition:** `TARGET_ONLY`

### 25, 26, 27, 28. `enums.ts`, `envelopes.ts`, `errors.ts`, `primitives.ts`
- **Disposition:** Shared Wire `TARGET_ONLY`. Các file cấu trúc dữ liệu không map 1:1 với HRP Prisma.

### 29. `packages/contracts/src/index.ts` (Root Export Surface)
- **Root Exported Modules:** Khai báo xuất đầy đủ 28 modules liệt kê ở trên.
- **Root Public Symbols:** 518 public export names (139 type, 379 value).
- **Experimental/Internal Symbols:** Một số symbol nội bộ của CRM (như Vietnamese label maps, errorMessagesVi) đang lọt ra root.
- **Evidence State:** Các modules/symbols trong index này đều mang tình trạng `TARGET_ONLY` hoặc `CRM_INTERNAL` hoặc `PARTIAL_MATCH`. Phần lớn CHƯA có HRP evidence tương ứng (`NOT_FOUND_IN_SURVEY_SCOPE`).
- **Limitation:** Đây là Source Inventory, KHÔNG phải là một stable shared acceptance.
