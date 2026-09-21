# THIN SLICE CAPABILITY MATRIX (RECONCILIATION)

**Bundle Revision:** r1
**HRP Baseline:** 1059f6669482efac5b7956ef25d43996ca59d515
**Pending Delta:** AFF-03B (`1c08ecddd10564e0372f4146cf3527b5b21d4351`)

Đánh giá chéo mức độ đáp ứng (Capability Matrix) giữa HRP (Runtime) và CRM (Contracts).

| Capability | HRP Implementation Evidence | CRM Contract Evidence | Actor/Auth | Status | Limitations / Blocker |
|---|---|---|---|---|---|
| **Public JobPosting Projection** | `src/domains/job-board/public-detail.service.ts` | N/A | Public | `MERGED` | HRP đã có, CRM không quản lý. |
| **Public Apply** | `app/api/public/intake/route.ts` | `packages/contracts/src/commands/intake.ts` | `app_user_writer` / Gateway | `PARTIAL` | **Lỗi 42501 (AFF-03B).** HRP base chưa có S2S, CRM contract yêu cầu Webhook Signature. |
| **LaborProfile create-or-match** | `intake-writer.service.ts` | `packages/contracts/src/commands/identity.ts` | ServerSession | `PARTIAL` | HRP đã có logic EXACT/POSSIBLE. CRM contract định nghĩa Event nhưng HRP chưa bắn event ra Outbox. |
| **Application** | `application.service.ts` | N/A | ServerSession | `MERGED` | HRP đã có entity, CRM không mapping 1:1 (dùng Interaction). |
| **PlacementCase** | `placement-case.service.ts` | `packages/contracts/src/commands/placement-case.ts` | `ADMIN`/`HR` | `MERGED` | Enum status (OPEN/IN_PROGRESS/READY_TO_PLACE/CLOSED) tương đồng. HRP giữ role authority. |
| **NextAction** | Không có (N/A) | `packages/contracts/src/commands/next-action.ts` | TBD | `NOT_IMPLEMENTED` | Chỉ tồn tại dưới dạng hợp đồng CRM, HRP chưa implement bảng NextAction. |
| **HandlingAssignment** | `handling-assignment.service.ts` | `packages/contracts/src/commands/routing.ts` | `MANAGER` | `PARTIAL` | CRM có RoutingPool/Strategy, HRP hiện chỉ có assignment thủ công và lazy expiry. Semantic Drift lớn. |
| **Simple Workbench Query** | `labor-profile.read-service.ts` | `packages/contracts/src/commands/queries.ts` | ServerSession | `PARTIAL` | API HRP còn hạn chế. CRM Query Scope chưa được map sang Prisma where. |
| **Placement** | `placement.service.ts` | `packages/contracts/src/commands/placement-case.ts` | `ADMIN` | `MERGED` | Transition logic khép kín trong HRP. |
| **Public Recruiter Profile** | N/A | N/A | N/A | `NOT_IMPLEMENTED` | Chờ V9. |
| **Universal AFF** | `aff03-public-intake.service.ts` | N/A | API Key (TBD) | `PARTIAL` | Phụ thuộc AFF-03B và P0-D Idempotency S2S. |

## Ghi chú về AFF-03B
- Baseline `main` hiện chưa bao gồm AFF-03B.
- Pending delta `1c08ecddd10564e0372f4146cf3527b5b21d4351` đang chờ CI và Tier 3 audit.
- Chỉ khi nào AFF-03B được merge và deploy lên production thì chức năng Public Apply (AFF-03) mới được coi là `DEPLOYED`.
