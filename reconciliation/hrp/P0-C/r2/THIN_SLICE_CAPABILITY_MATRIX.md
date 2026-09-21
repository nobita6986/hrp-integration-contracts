# THIN SLICE CAPABILITY MATRIX (RECONCILIATION - r2)

**Bundle Revision:** r2 (Supersedes r1)
**HRP Main Baseline:** 1059f6669482efac5b7956ef25d43996ca59d515 (Chưa có AFF-03B)
**Pending Delta (AFF-03B):** `1c08ecddd10564e0372f4146cf3527b5b21d4351` (Chưa thuộc main baseline, chưa deployed).

Bảng đánh giá chéo năng lực (Capabilities) với các chi tiết theo yêu cầu r2.

| Capability | Schema/Model | Runtime Impl | Entrypoint | Validator | Actor/Delegation | Org Scope | Perm/Cap | Idempotency | Error/Retry/Tx | Test State | Merged | Deployed | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Public Apply (HRP Base)** | Prisma Model | Partial | `api/public/intake` | Zod | Public | None | None | None | Tx | `SOURCE_ONLY` | Yes | Yes | Baseline 1059f6 |
| **Public Apply (AFF-03B)** | Prisma Model | Implemented | `api/public/intake` | Zod | Public/S2S | None | RLS | None | Tx Error (42501) | `INTEGRATION_TEST_RAN` | No (Pending) | No | Commit 1c08ec |
| **LaborProfile Match** | Prisma | Yes | `intake-writer` | Yes | ServerSession | N/A | None | None | Prisma Tx | `SOURCE_ONLY` | Yes | Yes | Baseline 1059f6 |
| **PlacementCase** | Prisma | Yes | `placement-case.service` | Yes | Admin/HR | N/A | Auth | None | Prisma Tx | `SOURCE_ONLY` | Yes | Yes | Baseline 1059f6 |
| **Outbox Events** | None | No | None | None | N/A | N/A | N/A | Target Only | None | `NOT_FOUND_IN_SURVEY_SCOPE`| No | No | N/A |
| **HandlingAssignment** | Prisma | Yes | `handling-assignment` | Yes | Manager | N/A | None | None | Prisma Tx | `SOURCE_ONLY` | Yes | Yes | Baseline 1059f6 |

*Ghi chú:*
- HRP chưa có Idempotency/Retry logic, mọi giao dịch phụ thuộc vào Prisma Transaction.
- Lỗi RLS 42501 trong AFF-03B chỉ chặn luồng Public Apply và các path phụ thuộc, không chặn tiến trình Reconciliation tổng thể hay việc soạn thảo Draft Contract.
