# Source evidence và delta — r4

Observed 2026-09-22. Chỉ read-only source/document inspection, không live DB, endpoint probe hoặc runtime test. `SCRATCH_VALIDATION = NOT_RUN`; negative AC trong proposal chưa chạy. Không claim source/mock tests là deployed S2S proof.

Delivery clarification: T0 CRM ACK sơ bộ do Owner chuyển trong conversation đồng thuận bốn hướng và yêu cầu receipt binding/exchange timeout, lifetime/revoke, replay availability, error matrix, exact exports/version. ACK không cung cấp Message-ID; bundle không tạo ID thay CRM và không coi ACK là bilateral acceptance của các chi tiết mới.

## Evidence observations

E-01 — Neutral input: đọc đầy đủ năm Markdown HRP follow-up r3 tại `8a2867851b3dc949e70edd8ce43500552700a626` và bảy Markdown CRM r6 tại `eb586247fe1a147bc904ff69d49104e8609943ff`. CRM `REPLAY-VS-RETRY.md` yêu cầu new correlationId tại mục Retry rồi cho phép same/new tại Wire-Level Distinction; câu “must succeed” không phải acceptance rule an toàn. HRP r3 `REC-004B-PROPOSAL.md` đã có direct success và `status: 'FAILED'`; đây không còn là gap cần correction.

Reproduce trong neutral repo: `git show 8a2867851b3dc949e70edd8ce43500552700a626:reconciliation/hrp/CONTRACT-02B-followup/r3/REC-004B-PROPOSAL.md` và `git show eb586247fe1a147bc904ff69d49104e8609943ff:reconciliation/crm/CONTRACT-02B/r6/REPLAY-VS-RETRY.md`.

E-02 — HRP repository `nobita6986/HRpartner`, pinned `0f46f0fbf2c8bc8d106c9aa2f0d3fc6143d2850b`. Đọc raw Git blobs, không dùng working checkout làm authority.

| Path / symbol / lines | Observation | SHA-256 raw blob |
|---|---|---|
| `app/api/admin/labor-profiles/[id]/route.ts`: ADMIN_ROLES L10, GET L12–42, withDbContext L24–26 | Human route chỉ ADMIN/HR_MANAGER/HR_STAFF; dùng effective context/RLS; không nhận CRM delegation | `f34086ad3940abe14bacc8a4751b2c1ec93aa8a41d09e04982419e39eea8ee56` |
| `src/shared/auth/auth-context.ts`: AuthContext L20–27, getAuthContext L51–91, DB lookup L58–74 | isActive/role từ user DB; context không có service/org fields. Không suy rộng thành mọi repo không có service code | `a30bddb84d67d93bfe98fa142a59b4f9c49b1aa679a812be1d7cd6bfac1a8be2` |
| `src/shared/auth/with-db-context.ts`: withDbContext L34–43 | applyRlsContext trong transaction; không tạo delegation | `389c18439a2e9214801f87221e1e1be301d593634b24e3f4b2be14fca024e5e9` |
| `prisma/migrations/20260908150001_v6_phase1a_labor_profile_rls/migration.sql`: hrp_labor_profile_scope L10–51 | HR_STAFF read scope: worker_id null hoặc assigned worker; route allowlist vẫn cần vì RLS có role khác | `161800322d5084cf7d11870f93220315b9bcbe89338846dfa9f67e59b2b9f4cc` |

Reproduce: `git show 0f46f0fbf2c8bc8d106c9aa2f0d3fc6143d2850b:<repository-relative-path>` trong HRP repo; hash stdout raw bytes, không decode/re-encode qua shell để hash.

E-03 — CRM repository `nobita6986/HRP-CRM`, pinned `72643356a0d1355f9dccc3921b47c990ea9c31c1`. Đọc authenticated GitHub Contents API, base64 decode trong memory; không ghi source vào bundle.

| Path / symbol / lines | Observation | SHA-256 raw blob |
|---|---|---|
| `packages/contracts/src/errors.ts`: ErrorCodeSchema L3–14, RetryClassSchema L17–24, ERROR_POLICIES L31–63, ContractErrorSchema L100–109, ErrorListSchema L113 | Fixed code/messageKey/retry triples. Không RETRY_SAFE/RETRY_UNSAFE; transient dùng BOUNDED_SAME_KEY | `54df177848033b509789607377dd92f7319a08988b29558e8100f6c5e7e867e0` |
| `packages/contracts/src/primitives.ts`: CorrelationIdSchema L23, OrganizationIdSchema L36, CanonicalIdSchema L37, IsoTimestampSchema L56–60, DelegatedUserActorClaimSchema L89–96 | Bounded IDs/time, actor là claim; correlationId không command idempotency authority | `359a37758e18069ed69e5e1015b8ea00ed18c6b2f598b6125afce01962ef56ac` |
| `packages/contracts/src/envelopes.ts`: FailedResponseSchema L88–94, ResponseEnvelopeSchema L104–108 | Command failed response có commandId, không phải query envelope | `f68ea4866c4f33786b03298ca531b454ff97437200d31457d5ac89d1f32af4d2` |
| `packages/contracts/package.json`: name/version L2–3, exports L11 | Package private, version 0.0.8-g0.8-fixes; chỉ root export hiện có | `3e202ca38ec4ef1f4f0fed78f4b571ebb54fd86e6997eeaefe67956b581af70e` |

Reproduce command: `gh api 'repos/nobita6986/HRP-CRM/contents/packages/contracts/src/errors.ts?ref=72643356a0d1355f9dccc3921b47c990ea9c31c1' --jq .content`; base64-decode thành bytes và SHA-256. Lặp với repository-relative path tương ứng. Cần quyền read repo; không log token.

## Findings → proposed path

| Finding | Evidence | Proposed resolution path |
|---|---|---|
| F-01: r3 service signature không tự chứng minh consent/link HRP user | E-01, E-02 | HRP authenticated approval → one-time exchange → persisted delegation binding → effective-user read |
| F-02: CRM retry trace rule không nhất quán; retry success không đảm bảo | E-01 | Same logical correlationId, fresh jti, reauthorize toàn bộ; revoke có thể làm retry deny |
| F-03: broad ContractError union/CRM illustrative retries không đủ cho query | E-03 | Query-only seven-code parser; explicit new retry literal proposal; frozen command consumers unchanged |

Các findings là design gaps từ source, không phải runtime exploit hoặc finding về production deployment.

## Delta và giới hạn

Không đổi source baseline so với HRP follow-up r3; không tuyên bố latest HRP main giống baseline này. Fresh checks chỉ xác minh các paths trong E-02/E-03. R4 giữ hướng D-01..D-04, bổ sung issuance/trust bootstrap/revoke/retry, thu hẹp query error surface và tách engineering decisions khỏi Owner decisions. Module/endpoint/store/approval flow trong proposal là NEW capability, không phải evidence đã có.

Không kế thừa lỗi line reference ContractErrorSchema L91 như symbol start: L91 là base shape; symbol exported thực tế L100. Package subpath hiện chưa tồn tại, distribution còn cần quyết định bilateral. Không claim consumer audit/test PASS, không copy toàn frozen package vào neutral bundle. Manifest chỉ bảo đảm bytes của draft này; không chứng nhận semantics hay acceptance.

Khi chuẩn bị delivery, `git fetch --no-tags origin` phát hiện CRM r7 metadata supplement tại `f908de06ed22a204c2cecfa8f051b5130216e8c3` và nhánh conformance. Chỉ đọc r7 README để xác định đó là metadata supplement được tác giả mô tả; không audit hoặc tiếp nhận conformance branch làm authority mới trong response cho r6. Kiểm Message-ID bằng `git grep` trên toàn bộ fetched remote refs dưới `reconciliation`: HRP ID cao nhất tìm thấy là MSG-024; MSG-025 được cấp cho delivery này, không phải kiểm chứng các message chưa được lưu vào repo.

Các additions receipt/cancel/exchange, package candidate, query retry literal và required fullNameRedacted được T0 bổ sung vào draft r4 trước commit đầu tiên; không sửa revision đã commit trước đó. Chúng là proposed mechanism/compatibility changes, không phải capability đã có hoặc test đã chạy.
