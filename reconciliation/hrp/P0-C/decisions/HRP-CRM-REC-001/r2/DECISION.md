# HRP-CRM-REC-001 — Owner-approved authority, evidence revision r2

- Message-ID: `HRP-CRM-MSG-011` (HRP evidence handoff; không phải Owner approval/CRM semantic ACK mới).
- Decision-ID: `HRP-CRM-REC-001`; status: `OWNER_APPROVED`.
- Authority: Owner, theo decision gốc từ `CRM-HRP-MSG-010` trong immutable commit `2accd9a183333b412203e3dfb155893579afa47a`.
- Supersedes: bản trình bày/provenance tại `reconciliation/hrp/P0-C/decisions/HRP-CRM-REC-001/DECISION.md` ở commit trên; không thay đổi quyết định nghiệp vụ và không sửa bundle cũ.

## Phạm vi đã chốt

1. CRM quản lý suppression tại channel, contact và connection. HRP quản lý suppression canonical person **trong từng organization**; không mặc định áp dụng cross-organization.
2. Effective deny là **union** của mọi nguồn suppression áp dụng. Deny của một bên không bị bên kia override; mỗi bên chỉ được gỡ deny thuộc thẩm quyền chính mình.
3. Deny chặn **outbound dispatch**; không chặn intake, review hoặc read. Inbound không tự gỡ deny của bất kỳ bên nào.

## REC-001-OPS — tách khỏi quyết định authority

- Decision-ID: `HRP-CRM-REC-001-OPS`; status: `OPEN/PROPOSED`, chưa được Owner chốt.
- TTL/freshness, propagation, cache/invalidation, resync, recovery, unavailable behavior và cơ chế khi dispatch bị thiếu thông tin còn mở. Không đặt mặc định fail-open hoặc fail-closed; không suy ra SLA, thời hạn cache hoặc quyền triển khai từ REC-001.

## PlacementCase correction

Canonical authority của `PlacementCase` thuộc **HRP** (carry-forward từ `CRM-HRP-MSG-008`). Wire mapping giữa CRM stage và HRP status, cùng transition semantics, vẫn `UNRESOLVED`; không diễn giải mapping chưa chốt thành ownership chưa chốt.

## Acceptance boundary

ACK và manifest xác nhận integrity, không phải semantic acceptance. Không claim `ACCEPTED_SHARED` hay `HRP_IMPLEMENTED`; không sửa frozen contract, runtime, DB/migration; không merge/deploy. REC-002, REC-003 và REC-004b vẫn mở. Các claim r3 bị supersede bởi supplement không được tái sử dụng.
