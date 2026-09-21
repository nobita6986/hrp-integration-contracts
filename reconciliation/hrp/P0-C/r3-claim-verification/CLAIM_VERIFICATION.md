# CLAIM VERIFICATION SUPPLEMENT

**HRP Source Baseline:** `1059f6669482efac5b7956ef25d43996ca59d515`
**CRM Source Baseline:** `72643356a0d1355f9dccc3921b47c990ea9c31c1`
**Supplement for:** `r3` bundle (commit `2ee99394a210fc51125523ceef9020812f893be2`)

## A. Availability Claim Verification
- **Claim bị kiểm chứng:** "CRM yêu cầu mảng patch" (tại `CRM_CONTRACT_GAP_REPORT.md` mục 4, r3).
- **CRM Schema Locator:** `nobita6986/HRP-CRM`, SHA `72643356a0d1355f9dccc3921b47c990ea9c31c1`, `packages/contracts/src/commands/availability.ts`, symbol `AvailabilityPatchSchema`, L40-49.
- **HRP Counterpart Locator:** `nobita6986/HRpartner`, SHA `1059f6669482efac5b7956ef25d43996ca59d515`, symbol `updateAvailability`. TRẠNG THÁI: `NOT_VERIFIED` (Không tồn tại trong baseline).
- **Kết quả So Sánh:**
  - *Shape CRM thực tế:* `AvailabilityPatchSchema` là một **Object**, không phải Array.
  - *Kết luận:* Claim "CRM yêu cầu mảng patch" là SAI sự thật và được rút lại (SUPERSEDED).
  - *Hình dáng quan sát được:* CRM truyền vào object `{ availability: AvailabilitySchema, availableFromDate?: CalendarDateSchema }` qua field `patch` của lệnh `UpdateLaborAvailabilityInputSchema`. HRP không lưu dữ liệu `availability` trực tiếp (chỉ suy ra) nên cũng không có schema/hàm tương ứng tại baseline.

## B. Identity Claim Verification
- **CRM Locator (Command Input):** `nobita6986/HRP-CRM`, SHA `72643356a0d1355f9dccc3921b47c990ea9c31c1`, `packages/contracts/src/commands/identity.ts`, symbol `CreateOrMatchLaborProfileInputSchema`, L59-75.
- **CRM Locator (Command Result):** `nobita6986/HRP-CRM`, SHA `72643356a0d1355f9dccc3921b47c990ea9c31c1`, `packages/contracts/src/commands/identity.ts`, symbol `MatchingOutcomeResultSchema`, L117-123.
- **HRP Locator:** `nobita6986/HRpartner`, SHA `1059f6669482efac5b7956ef25d43996ca59d515`, symbol `findOrCreateLaborProfile`. TRẠNG THÁI: `NOT_VERIFIED` (Không tìm thấy tại baseline).
- **Kết luận:** Vì HRP không có hàm `findOrCreateLaborProfile` tại baseline, mọi đối chiếu về field name, nesting, enum outcome đều trả về `NOT_VERIFIED`.
- *Sửa lỗi lập luận:* Việc "HRP chưa phát event" ở r3 là sai ngữ cảnh, do `MatchingOutcomeResult` là kết quả trả về của một request (Command Result), không phải integration event bất đồng bộ.

## C. PlacementCase Verification
- **Tình trạng Mapping:** `UNRESOLVED`.
- **Phân tách khái niệm:**
  1. *HRP Case Lifecycle Status:* Quản lý vòng đời PlacementCase của HRP.
  2. *CRM Operational Stage:* CRM có field `intendedStage` đóng vai trò là một **yêu cầu (request)** chuyển trạng thái vận hành, KHÔNG có quyền tự validate hay ép HRP chuyển đổi canonical transition (status).
  3. *Close Semantics:* Hành động đóng case.
- **Authority:** Quyền canonical authority đang được **đề xuất** là HRP, nhưng shared decision này CHƯA được chấp nhận. CRM stage KHÔNG phải là domain authority của HRP, và HRP không tạo mapping mới cho các enum CRM chưa được chấp nhận.

## D. HRP Symbol Verification tại Baseline 1059f6669482efac5b7956ef25d43996ca59d515
| Symbol | Repository Path | Line Range | Trạng thái | Ghi chú |
|---|---|---|---|---|
| `updateAvailability` | `src/domains/talent/labor-profile.service.ts` | N/A | `NOT_VERIFIED` | Không tồn tại. Rút lại claim r3. |
| `findOrCreateLaborProfile` | `src/domains/applications/intake-writer.service.ts` | N/A | `NOT_VERIFIED` | Không tồn tại. Rút lại claim r3. |
| `submitPublicIntake` | `src/domains/applications/aff03-public-intake.service.ts` | L50-60 | `SOURCE_VERIFIED` | Claim r3 được giữ nguyên (CONFIRMED). |
| `updateStatus` | `src/domains/staffing/placement-case.service.ts` | N/A | `NOT_VERIFIED` | File không tồn tại (Không tồn tại context khớp). Rút lại claim r3. |

*Excerpt cho `submitPublicIntake` (SOURCE_VERIFIED):*
```typescript
export async function submitPublicIntake(
    tx: Prisma.TransactionClient,
    input: {
      applicant: PublicIntakeInput;
      channel?: 'PUBLIC_MARKETPLACE';
      intent?: 'JOB_INTEREST' | 'GENERAL_INTEREST';
      projectId?: string | null;
```

## E. Decision Disposition (Cập nhật từ MSG-006)
- **REC-001 (DNC/Suppression):** HRP đồng thuận trình Owner proposal: CRM owns channel/contact/connection suppression; HRP owns canonical-person suppression trong organization; no cross-org default; effective deny = union; mỗi bên chỉ gỡ suppression của mình; outbound blocked, intake/review/read không bị chặn. Status vẫn `OWNER_DECISION_BLOCKED`.
- **REC-002 (S2S Auth):** Status `PROPOSED`. Không có implementation.
- **REC-003 (Outbox/Idempotency):** Invariant agreement only. Wire fields, key scope, PUSH/PULL, và retention 7-30 ngày còn `OPEN`.
- **REC-004a (Neutral Repo):** Status `CLOSED`.
- **REC-004b (Enum Policy):** Status `OPEN`.
- **ACCEPTED_SHARED:** `NONE`.

## F. Supersession Ledger
| File tại r3 | Claim cũ | Verdict | Evidence Locator | Wording thay thế |
|---|---|---|---|---|
| GAP_REPORT | Khảo sát Availability `updateAvailability` | `NOT_VERIFIED` | HRP `1059f666`, tìm `updateAvailability` rỗng | `NOT_FOUND_IN_SURVEY_SCOPE` |
| GAP_REPORT | CRM yêu cầu mảng patch | `SUPERSEDED` | CRM `72643356`, `availability.ts:40` | CRM yêu cầu object `AvailabilityPatchSchema`. |
| GAP_REPORT | Khảo sát Identity `findOrCreateLaborProfile` | `NOT_VERIFIED` | HRP `1059f666`, tìm `findOrCreate` rỗng | `NOT_FOUND_IN_SURVEY_SCOPE` |
| GAP_REPORT | HRP chưa phát event (Identity) | `SUPERSEDED` | CRM `72643356`, `identity.ts:117` | `MatchingOutcomeResult` là Command Result, không phải event. |
| GAP_REPORT | Khảo sát PlacementCase `updateStatus` | `NOT_VERIFIED` | HRP `1059f666`, `placement-case.service.ts` không tồn tại | `NOT_FOUND_IN_SURVEY_SCOPE` |
