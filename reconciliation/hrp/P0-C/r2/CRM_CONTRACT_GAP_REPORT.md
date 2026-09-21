# CRM CONTRACT GAP REPORT (Revision 2)

**Bundle Revision:** r2 (Supersedes: r1)
**HRP Baseline:** 1059f6669482efac5b7956ef25d43996ca59d515
**CRM Baseline:** 72643356a0d1355f9dccc3921b47c990ea9c31c1

Tài liệu khảo sát chéo (Cross-repo Survey) 28 modules gốc và `index.ts` giữa CRM Contracts và HRP Runtime.

## 1. Domain Authority Constraints
- Việc không tìm thấy (NOT_FOUND_IN_SURVEY_SCOPE) counterpart ở HRP Runtime không tự động chuyển quyền sở hữu (ownership) sang CRM. Domain authority phải được quyết định bởi kiến trúc.
- Evidence Class được chia thành: `SOURCE_ONLY` (phân tích mã tĩnh).
- Các giới hạn (Limitation): Khảo sát dựa trên HRP Baseline `main`, không tính các nhánh Draft (như nhánh V6-Admin).

## 2. Chi tiết 28 Modules và Root Export

### 1. `packages/contracts/src/commands/ai-proposals.ts`
- **Operation/Symbol:** AIProposalSchema, ApplyAIProposalInputSchema
- **CRM Baseline:** 72643356a0d1355f9dccc3921b47c990ea9c31c1
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE` (Khảo sát tại `src/domains/`, symbol `AIProposal*`, baseline 1059f666).
- **Domain Authority:** CRM (Engagement Workflow).
- **Disposition:** `TARGET_ONLY`
- **Impact/Blocker:** Không có block vì HRP chưa tham gia tính năng AI workflow. Quyền nằm ở CRM.

### 2. `packages/contracts/src/commands/ai-provider-config.ts`
- **Operation/Symbol:** AIProviderConfigWriteSchema
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE`
- **Domain Authority:** CRM.
- **Disposition:** `TARGET_ONLY`

### 3. `packages/contracts/src/commands/analytics.ts`
- **Operation/Symbol:** MetricAggregateReadRequestSchema
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE`
- **Domain Authority:** CRM. (HRP giữ data tĩnh, CRM đo lường metric tương tác).
- **Disposition:** `CRM_INTERNAL` (Dự kiến, tùy thuộc owner chỉ định analytics là CRM-only hay global).

### 4. `packages/contracts/src/commands/availability.ts`
- **Operation/Symbol:** UpdateLaborAvailabilityInputSchema
- **HRP Counterpart:** `src/domains/talent/labor-profile.service.ts` (Symbol: `updateAvailability`, L150)
- **Domain Authority:** HRP (System of Record của Worker).
- **Disposition:** `PARTIAL_MATCH`
- **Match Details:**
  - *Matched Fields:* ID, Timestamp.
  - *Mismatched Fields:* HRP đang dùng string trần cho thời gian khả dụng. CRM Schema yêu cầu cấu trúc Patch JSON phức tạp (AvailabilityPatch).
  - *Nullability/Required:* HRP cho phép null, CRM yêu cầu mảng array ít nhất rỗng.
  - *Producer/Consumer impact:* HRP chưa đáp ứng được schema này, CRM không thể gọi lệnh nếu HRP không deploy DTO mới.
- **Evidence Class:** `SOURCE_ONLY`.
- **Owner:** HRP.

### 5. `packages/contracts/src/commands/dnc.ts`
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE`
- **Domain Authority:** `OWNER_DECISION_BLOCKED` (Xem REC-001).
- **Disposition:** `TARGET_ONLY`

### 6. `packages/contracts/src/commands/events.ts`
- **Operation/Symbol:** EventEnvelopeSchema
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE` (HRP dùng EventEmitter node nội bộ, không có event envelope type an toàn).
- **Domain Authority:** Neutral/Shared Wire.
- **Disposition:** `TARGET_ONLY`

### 7. `packages/contracts/src/commands/evidence.ts`
- **HRP Counterpart:** `src/domains/media/vercel-blob.service.ts` (Media Service)
- **Domain Authority:** HRP
- **Disposition:** `PARTIAL_MATCH`
- **Match Details:**
  - Cả hai đều có khái niệm URL file, tuy nhiên CRM yêu cầu `CommandEvidenceRefSchema`, HRP chỉ lưu text URL. Không khớp wire format.

### 8. `packages/contracts/src/commands/gateway.ts`
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE`
- **Domain Authority:** HRP Infrastructure.
- **Disposition:** `OWNER_DECISION_BLOCKED` (Xem REC-002 S2S Auth).

### 9. `packages/contracts/src/commands/identity.ts`
- **Operation/Symbol:** CreateOrMatchLaborProfileInputSchema
- **HRP Counterpart:** `src/domains/applications/intake-writer.service.ts` (Symbol: `findOrCreateLaborProfile`, L200)
- **Domain Authority:** HRP.
- **Disposition:** `PARTIAL_MATCH`
- **Match Details:**
  - *Matched:* SĐT, Tên, Căn cước.
  - *Mismatched:* CRM yêu cầu identity provenance (nguồn gốc), HRP chỉ gán cứng nguồn từ Intake.
  - *Behavior Diff:* HRP trả về entity Prisma (EXACT match / NEW). CRM mô tả `MatchingOutcomeResult` (event). HRP chưa phát ra event wire này.

### 10. `packages/contracts/src/commands/intake.ts`
- **Operation/Symbol:** IntakeSubmissionPayloadSchema
- **HRP Counterpart:** `src/domains/applications/aff03-public-intake.service.ts` (Symbol: `submitPublicIntake`, L50)
- **Domain Authority:** HRP.
- **Disposition:** `PARTIAL_MATCH`
- **Match Details:**
  - *Blocker:* Lệnh submitPublicIntake đang bị chặn bởi RLS (`42501`) do HRP thiết lập Postgres GUC thiếu (pending AFF-03B).
  - Khớp cấu trúc ứng tuyển, nhưng hành vi lưu nháp (draft digest) chưa được HRP support.

### 11. `packages/contracts/src/commands/interactions.ts`
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE`
- **Domain Authority:** CRM.
- **Disposition:** `CRM_INTERNAL`

### 12. `packages/contracts/src/commands/kpi.ts`
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE`
- **Domain Authority:** CRM.
- **Disposition:** `CRM_INTERNAL`

### 13. `packages/contracts/src/commands/mappings.ts`
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE`
- **Domain Authority:** Neutral (Shared Idempotency/Mapping).
- **Disposition:** `TARGET_ONLY`

### 14. `packages/contracts/src/commands/merge-review.ts`
- **Operation/Symbol:** MergeLaborProfilesInputSchema
- **HRP Counterpart:** HRP chưa có chức năng Merge Profile thực tế ngoài DB.
- **Domain Authority:** HRP (Canonical merge authority đã thuộc về HRP, không mở lại).
- **Disposition:** `TARGET_ONLY` (Chờ HRP implement logic).

### 15. `packages/contracts/src/commands/next-action.ts`
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE`
- **Domain Authority:** CRM.
- **Disposition:** `CRM_INTERNAL`

### 16. `packages/contracts/src/commands/outbox.ts`
- **HRP Counterpart:** `NOT_FOUND_IN_SURVEY_SCOPE`
- **Domain Authority:** HRP/Neutral (Xem REC-003).
- **Disposition:** `PROPOSED`

### 17. `packages/contracts/src/commands/placement-case.ts`
- **Operation/Symbol:** PlacementCasePatchSchema
- **HRP Counterpart:** `src/domains/staffing/placement-case.service.ts` (Prisma `PlacementCase` model, `updateStatus`)
- **Domain Authority:** HRP.
- **Disposition:** `PARTIAL_MATCH`
- **ĐỐI CHIẾU ENUM / STATUS MAPPING:**
  - **HRP `PlacementCase.status`:** `OPEN`, `IN_PROGRESS`, `READY_TO_PLACE`, `CLOSED` (Nguồn: Prisma Schema).
  - **CRM Contract Evidence:** CRM đang giữ field là `intendedStage` hoặc `status` (TBD từ evidence gốc).
  - **Mapping Values:**
    - `OPEN` (HRP) <-> `OPEN` (CRM) : Lossless
    - `IN_PROGRESS` (HRP) <-> `IN_PROGRESS` (CRM) : Lossless
    - `READY_TO_PLACE` (HRP) <-> `READY_TO_PLACE` (CRM) : Lossless
    - `CLOSED` (HRP) <-> `CLOSED` (CRM) : Lossless
  - **Impact:** Chưa có mapping hoàn chỉnh về field. Hiện chưa rõ CRM dùng enum này qua field `status` hay `stage`. Không yêu cầu CRM đổi enum, chờ ánh xạ rõ.

### 18. `packages/contracts/src/commands/ports.ts`
- **Disposition:** `UNKNOWN`

### 19. `packages/contracts/src/commands/profile.ts`
- **HRP Counterpart:** `src/domains/talent/labor-profile.service.ts` (Cập nhật CCCD/Address).
- **Domain Authority:** HRP.
- **Disposition:** `PARTIAL_MATCH`

### 20. `packages/contracts/src/commands/providers.ts`
- **Disposition:** `TARGET_ONLY`

### 21. `packages/contracts/src/commands/queries.ts`
- **Disposition:** `TARGET_ONLY`

### 22. `packages/contracts/src/commands/routing.ts`
- **HRP Counterpart:** HRP có khái niệm `HandlingAssignment`.
- **Disposition:** `PARTIAL_MATCH`
- **Semantic Drift Analysis:** HRP đang cấp phát HandlingAssignment thủ công (Manager gán), lưu `actor_id` xử lý tạm thời. Việc CRM quy định `routing.ts` với employee routing rules (Weight/Reservation) là sự chênh lệch lớn về ngữ nghĩa (Semantic Drift). Phải tạo Entity Mapping rõ ràng trước khi gọi là drift lỗi. HRP không tự động bằng CRM routing.

### 23. `packages/contracts/src/commands/scheduling.ts`
- **Disposition:** Tùy thuộc Owner xác định authority.
- **Analysis:** Không blanket-classify là `CRM_INTERNAL` theo tên module. Nếu lệnh scheduling đụng tới resource HRP thì authority cần xét. Hiện ghi nhận là `TARGET_ONLY`.

### 24. `packages/contracts/src/commands/suppression.ts`
- **Domain Authority:** `OWNER_DECISION_BLOCKED` (Provisional, xem REC-001).
- **Disposition:** `TARGET_ONLY`

### 25, 26, 27, 28. `enums.ts`, `envelopes.ts`, `errors.ts`, `primitives.ts`
- **Disposition:** Shared Wire `TARGET_ONLY`. Cần tuân thủ REC-004. Không đưa HRP hạ tầng (`P2002`) lên wire.

### 29. `packages/contracts/src/index.ts` (Root Export Surface)
- **Root Exported Modules:** Export trọn bộ 28 modules trên.
- **Root Public Symbols:** 518 public export names (139 type, 379 value).
- **Experimental/Internal Symbols:** Một số symbol nội bộ của CRM (như Vietnamese label maps/messagesVi) đang lọt ra root.
- **HRP Evidence:** Rất nhiều module trong số 28 module này (như Interaction, DNC, KPI, Outbox, Routing, Suppression) hoàn toàn CHƯA CÓ HRP counterpart evidence (NOT_FOUND_IN_SURVEY_SCOPE).
- **Status:** Đây là bảng kê khai (Source Inventory) từ mã CRM. Đây CHƯA PHẢI là Stable Shared Acceptance. Việc export tại index.ts không có nghĩa HRP đã duyệt 518 symbol này vào shared contract.
