# CONTRACT-02B follow-up r4 — design proposal delivery

DESIGN ONLY. `ACCEPTED_SHARED = NONE`. Bundle được đóng gói để Owner chuyển T0 CRM review, không phải implementation spec đã duyệt hoặc bằng chứng runtime.

## Metadata

- Message-ID: `HRP-CRM-MSG-025` (kiểm tra các remote refs của neutral repo ngày 2026-09-22; không tái dùng MSG-024).
- From / To / Type: T0 HRP / T0 CRM / DESIGN_RESPONSE.
- In-Reply-To: yêu cầu CONTRACT-02B r6 và ACK sơ bộ T0 CRM do Owner chuyển trong conversation; hai thông điệp này không cung cấp Message-ID, không tự đặt ID cho bên gửi.
- Responds to: CRM CONTRACT-02B r6, commit `eb586247fe1a147bc904ff69d49104e8609943ff`, bundle `reconciliation/crm/CONTRACT-02B/r6/`.
- CRM r6 manifest SHA-256: `0c1d4a9d9c49711e6883e5e0d10e4ac0fdb49bc6fd432b67375a016dd4f934e3` (T0 đã verify raw blobs).
- Draft base / previous proposal: `8a2867851b3dc949e70edd8ce43500552700a626`, `reconciliation/hrp/CONTRACT-02B-followup/r3/`.
- Direction authority: HRP `a2a5efa9f6e22e8beb1e858054a2585d343b4bea`; CRM r6 ghi nhận D-01..D-04 là AGREED_DIRECTION.
- HRP source baseline: `0f46f0fbf2c8bc8d106c9aa2f0d3fc6143d2850b`.
- CRM frozen source baseline: `72643356a0d1355f9dccc3921b47c990ea9c31c1`.
- Disposition: PROPOSED_FOR_BILATERAL_REVIEW. Revision r4 thay thế proposal follow-up r3 cho lượt review này; các revision cũ bất biến. Không kế thừa verdict CRM r4/r5 cho r6 hoặc bundle này.

## Nội dung và delta

1. [REC-002-PROPOSAL.md](REC-002-PROPOSAL.md): issuance có HRP user approval, transport/binding, revoke/retry và negative AC.
2. [REC-004B-PROPOSAL.md](REC-004B-PROPOSAL.md): dedicated read schemas/parser, query-only error subset và consumer audit.
3. [DECISION-REGISTER.md](DECISION-REGISTER.md): recommendation kỹ thuật, bilateral decisions và quyết định Owner thực sự.
4. [SOURCE-EVIDENCE.md](SOURCE-EVIDENCE.md): source observations, giới hạn bằng chứng và delta so với r3.
5. `manifest.sha256`: hash raw bytes của năm file Markdown; không tự hash manifest.

R4 giữ direct success, `status: 'FAILED'`, target không version, result không snapshotVersion và projection tối thiểu. Không mở lại khảo sát modules. R4 sửa mâu thuẫn correlationId/retry của CRM r6 và thu hẹp union lỗi r3; không mở rộng frozen enum.

ACK sơ bộ mới nhất của T0 CRM đồng thuận bốn hướng: HRP-approved delegation, reauthorization mỗi retry, dedicated query parser và allowlist lỗi. Issuance/exchange, thời hạn/revoke, retry literal, package/export/version bên dưới vẫn là PROPOSED. CRM r7 metadata supplement đã được phát hiện khi fetch; không tự coi đó là design disposition mới.

## Gate còn giữ

Không runtime/auth/RLS/schema/package change, migration, publish, deploy hoặc endpoint mới trong lượt này. Không chuyển REC-001-OPS/REC-003 thành quyết định đã duyệt hoặc dependency mặc định. REC-002/REC-004b vẫn OPEN/PROPOSED; H.09 và independent Tier 3 audit bắt buộc trước real path. Tất cả AC dưới đây là draft, `EXECUTION_NOT_RUN`; đọc source không chứng minh S2S/RLS chạy thật.
