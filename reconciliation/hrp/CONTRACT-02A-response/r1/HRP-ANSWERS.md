# HRP ANSWERS to CRM-HRP-MSG-012 (CONTRACT-02A)

## Trả lời Q-A1: Capability Envelope
1. HRP hiện **không có** endpoint nhận envelope tương đương với `ContextQueryRequestSchema`, `scope`, `target`/`external`, hoặc `fieldAllowlist`.
2. HRP hiện **không trả** envelope tương đương với `ContextPanelResultSchema`.
3. **Capability gần nhất:**
   - `GET /api/admin/labor-profiles/[id]`
   - Request chỉ sử dụng canonical LaborProfile ID trên URL.
   - Response là `LaborProfileDetailDto` (nội bộ), không phải là shared Context Panel contract.
4. **Chứng minh Source:**
   - **HTTP method/path:** `GET /api/admin/labor-profiles/[id]`
   - **Source symbol:** `GET`, `getLaborProfileDetail`
   - **Repository-relative path:** `app/api/admin/labor-profiles/[id]/route.ts`, `src/domains/talent/labor-profile.read-service.ts`
   - **Exact line ranges tại baseline `a49ceaa`:** `route.ts` L12-L40; `labor-profile.read-service.ts` L178-L247
   - **Call path:** `GET` → `getAuthContext` → `withDbContext` → `getLaborProfileDetail`
5. **Kết luận trung thực:**
   - Capability nội bộ hiện hữu.
   - CRM-compatible S2S endpoint chưa tồn tại.
   - B.03 real path là GAP.
   - Lượt này HRP KHÔNG đề xuất hoặc triển khai endpoint mới.

## Trả lời Q-A2: Projection Support Matrix

| Projection | Status | Ghi chú |
|---|---|---|
| `identitySummary` | `PARTIAL` | Capability gần nhất trả về `id`, `fullName`, `phone`, `cccdNumber`, `completeness`, `identityVerification`. Phone/CCCD được full hoặc masked tùy theo quyền `CAN_VIEW_WORKER_SENSITIVE`. Tuy nhiên, HRP không tự gọi `fullName` là `displayName` wire contract, cũng không có định dạng `fullNameRedacted`/`phoneRedacted` giống CRM yêu cầu. |
| `placementCase` | `PARTIAL` | Chỉ trả về Internal detail là danh sách `{id, status}[]`. Transition/wire mapping `OUT_OF_SCOPE_THIS_ROUND`. Hoàn toàn không tuyên bố wire-compatible. |
| `availability` | `UNSUPPORTED` | Không có canonical response field cho availability. |
| `currentRelationship`| `UNSUPPORTED` | Không có CRM enum projection và không có `readonly: true`. |
| `nextAction` | `UNSUPPORTED` | Không có trong response hiện tại. |
| `recentInteractions` | `UNSUPPORTED` | Không có. HRP không coi `intakes` hoặc `submissions` là CRM interactions. |
| `contactability` | `UNSUPPORTED` | Không có canonical projection. |
| `suppressionSummary` | `DEFERRED` | Q-A5 đang DEFERRED/optional. Không mở REC-001-OPS. |

## Trả lời Q-A3: Authorization
- **Hiện trạng HRP:** Endpoint hiện tại sử dụng human-user JWT (cookie `hrp_session` hoặc Bearer token, ký HS256, với claims `sub` và `role`). Route tiến hành lookup User trong DB, kiểm tra `isActive`, role thực lấy từ DB (không tin role tự khai).
- **Route giới hạn:** Chỉ cho phép `ADMIN`, `HR_MANAGER`, `HR_STAFF`.
- **Database / RLS:** `withDbContext` thiết lập transaction-local GUC. LaborProfile RLS thực hiện object visibility theo role/user/Worker relationship.
- **GAP đối với S2S B.03:**
  - Không có CRM service identity.
  - Không có JWT audience HRP dành cho service.
  - Không có service-account binding.
  - `AuthContext` không có `organizationId`.
  - Request hiện không có trusted organization scope.
  - Không có evidence về authorization CRM service → organization → canonical target.
  - Current RLS chỉ là authorization cho HRP user context, không đủ để tuyên bố S2S CRM path đã sẵn sàng.
- **Kết luận:**
  - HRP có server-side object authorization cho endpoint nội bộ hiện tại.
  - HRP chưa có server-side organization/service authorization cho CRM B.03.
  - Quyết định REC-002 vẫn `OPEN/PROPOSED`; cần decision acceptance và implementation evidence trước khi có thể gọi là real path.
  - CRM vẫn phải giữ local session/API/mapping authorization.
  - HRP không yêu cầu REC-003 hoặc REC-001-OPS nếu read path này chưa thực sự phụ thuộc chúng.

## Trả lời Q-A4: Error & Consistency Semantics
Ghi nhận response/error hiện tại của capability gần nhất:
- `200`: Trả trực tiếp `LaborProfileDetailDto`.
- `401`: `{ error, message }` cho auth/session failure.
- `403`: `{ error: "FORBIDDEN", message: "Not allowed" }` cho role ngoài allowlist.
- `404`: `{ error: "NOT_FOUND", message: "LaborProfile not found" }`. Việc RLS/object invisibility xảy ra sẽ biểu hiện thành `null` và được route map thành `404`; HRP KHÔNG tuyên bố 403/404 semantics rộng hơn source chứng minh.
- `500`: `{ error: "INTERNAL", message: ... }`.

**Các kiểm chứng bổ sung:**
- **Không có** `unavailableFields`. (Unsupported projection hiện không được trả dưới dạng `200 + unavailableFields`).
- **Không có** `snapshotVersion`. Field `updatedAt` tồn tại trong DTO nhưng không được định nghĩa là snapshot/concurrency/cache token.
- **Không thêm** `expectedVersion` vào `ContextPanelResult`.
- **Không đề xuất** CRM cache/concurrency policy; ghi rõ `NO_CONTRACT / UNRESOLVED`.
- **Quyết định REC-004b** vẫn `OPEN/PROPOSED`.

## Trả lời Q-A5
- Trạng thái: `DEFERRED/OPTIONAL`
- HRP không tự trả lời mở rộng về vấn đề này trong lượt khảo sát hiện tại.
