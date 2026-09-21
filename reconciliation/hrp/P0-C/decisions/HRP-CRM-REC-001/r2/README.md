# REC-001 decision r2 — provenance

Bản evidence handoff mới `HRP-CRM-MSG-011` bổ sung nguồn ACK và correction cho decision Owner đã lưu trong commit `2accd9a183333b412203e3dfb155893579afa47a`. Không phát sinh quyết định vận hành hoặc shared wire contract mới.

| Evidence | Immutable reference | Ý nghĩa |
|---|---|---|
| HRP P0-C r3 | `2ee99394a210fc51125523ceef9020812f893be2` | Bundle đã ACK; REC-001 trong r3 là proposal, không còn là trạng thái hiện hành. |
| HRP claim-verification supplement | `a0cd30e04a86a80975824f23208a9e3ecfc29cbd` | Rút claim sai về availability/identity/PlacementCase; giữ distinction mapping vs authority. |
| CRM ACK manifest | SHA-256 `54cc0b813e7e7d31ef4844b126afe6f98cc04e1c55f3bc9a0177ab948a9d8e04` | ACK integrity được cung cấp; không suy ra CRM semantic acceptance từ ACK. |
| Prior Owner decision | `2accd9a183333b412203e3dfb155893579afa47a` | Nội dung REC-001 OWNER_APPROVED và correction PlacementCase. |

Nguồn authoritative cho shared wire vẫn là neutral repository `https://github.com/nobita6986/hrp-integration-contracts`; bản decision này không đóng REC-001-OPS. `manifest.sha256` hash bytes UTF-8 LF không BOM của hai file này (không hash chính manifest). Git commit SHA của revision r2 sẽ được ghi trong PR/evidence handoff sau khi commit; không thể tự tham chiếu vào blob nằm cùng commit.
