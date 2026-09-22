# CONTRACT-03A — HRP producer review

Verdict: **CHANGES_REQUIRED**. Ngày review: 2026-09-22. Đây là producer review, không thay independent Auditor verdict và không phải runtime/security acceptance.

Commit được yêu cầu đã resolve duy nhất và tồn tại trên remote. Source/tests/build configuration giữ parity với commit CRM đã audit; clean-checkout build và 111 tests PASS. Tuy nhiên module chưa cover đầy đủ accepted schema perimeter và có các sai lệch wire/validation tái hiện được. CRM executor sửa; HRP không tạo implementation cạnh tranh.

## Pin và authority

- Repository: `https://github.com/nobita6986/hrp-integration-contracts`.
- Reviewed full SHA: `f9cc493224792d15f99ba1debc27fc4d6a9cce7e`.
- Remote branch: `codex/contract03a-schema-conformance`; fetched tip tại review trùng SHA trên. Không dùng tip khác thay thế.
- Audited source SHA: `71dddddc7ba6ad5d2e8f775c9e76837ea558b46d`.
- Accepted design: `c3a547dccc209496ac8ef407612ea857249d22fc`.
- Bilateral acceptance: `1855b88d67f61e2efcdd2eaa2b888ba303bfc724`.
- Precedence theo `SPECIFICATION.md`: Owner MSG-026; S28 correction cho transport/redaction; S25 cho query/errors; EP-01..06 cho engineering constraints. Không mở lại thiết kế đã chốt.
- S25: `53e6db53a929409b1dc7b512a1ec897a3af5b659`, `reconciliation/hrp/CONTRACT-02B-followup/r4/REC-004B-PROPOSAL.md`.
- S28: `49f2dbc34cae66e8d63df5dd5d8cec0c008c4623`, `reconciliation/hrp/CONTRACT-02B-conformance-response/r2/{TRANSPORT.md,REDACTION.md,REDACTION-VECTORS.json}`.

Scope được Owner chuyển giao: source/tests dưới `packages/contracts/*/talent-context-read`, build/lockfile và handoff CONTRACT-03A/r1. Chỉ dùng synthetic inputs, không HRP runtime/DB/credential. File locations dưới đây repository-relative tại reviewed SHA, trừ report/reproducer local.

## Evidence và tái hiện

E-01 — Git provenance, quan sát bằng command ngày 2026-09-22:

```powershell
git fetch origin codex/contract03a-schema-conformance
git rev-parse --disambiguate=f9cc493
git log FETCH_HEAD --format="%H %s" -5
git diff 71dddddc7ba6ad5d2e8f775c9e76837ea558b46d f9cc493224792d15f99ba1debc27fc4d6a9cce7e -- packages/contracts/src packages/contracts/tests packages/contracts/package.json packages/contracts/package-lock.json packages/contracts/tsconfig.json
```

Kết quả: một full SHA; parity diff rỗng. Checkout review detached, độc lập, không đổi branch đang làm việc.

E-02 — Build/test, Node `v24.19.0`, npm `11.17.0`, Windows; TypeScript lock `5.7.3`, Zod `3.24.2`. Từ `packages/contracts`:

```powershell
npm ci
npm run build
npm test
```

Cả ba exit 0; 111 tests, 16 suites, 111 PASS, 0 fail/skip. Đây là kết quả của test suite hiện có, không chứng minh đủ requirements. Không sửa lockfile hoặc tracked source. `dist/` là build output local untracked; `node_modules` local được npm ci tạo. Không publish.

E-03 — Raw Git blob manifest: 3/3 entries README/AC-EVIDENCE/NOTES MATCH. Manifest SHA-256 `b4d0a8ea18e06c0499e5eb95c76724f6cec66930477f1711729df49f37c41a25`. Manifest không cover implementation; review source trực tiếp.

E-04 — Manual source-to-authority review: đọc toàn bộ 7 TypeScript source files, cả 4 test files, package/config và pinned authority; rà exports/imports, strict validators và dataflow. Không chạy broad external SAST service. Source observations gắn ở từng finding.

E-05 — Dynamic supplemental probes, chạy từ review checkout:

```powershell
node review/reproduce.mjs
```

Reproducer đọc actual compiled exports, synthetic inputs và authoritative JSON vectors bằng raw `git show`. Nó assert **hành vi lỗi hiện tại** tại pin này, không phải regression tests đã sửa. Không network/DB/write. 21 requested algorithm vectors gốc PASS; unrequested projection chưa được chứng minh bởi hàm redaction đơn lẻ.

## Findings cần sửa trong cùng một lượt

Các finding dưới đây có confidence HIGH, status VALIDATED bằng E-04 và E-05 (F-06 còn đối chiếu trực tiếp test source). Severity là mức ưu tiên sửa conformance, không khẳng định exploit production.

### F-01 — P1: Thiếu assertion/profile validators trong accepted perimeter

- Location: `packages/contracts/src/talent-context-read/index.ts:1`; `packages/contracts/tests/talent-context-read/assertion-profile.test.mjs:12`.
- Requirement: EP-01 và bilateral acceptance bao gồm assertion/profile validation constraints, không chỉ query primitives.
- Evidence: exports không có header/claims/jti/profile validator. Suite “EP-01 strict claims shape” chỉ test correlationId/org/canonicalId/timestamp; không test `alg`, `typ`, `kid`, `iss`, `aud`, `sub=serviceId`, integer times, TTL/skew, scope, request hash/method/path hoặc operation-specific actor.
- Impact/path: caller không có pure executable profile để reject assertion shape/time/binding sai; “AC4 covered / no deviations” quá mức evidence.
- Sửa tối thiểu: bổ sung strict pure schemas/profile checks và negative cases theo EP-01; dùng explicit verifier time/registered-context input cho cross-field constraints. Không triển khai signer, signature verification, key fetch, replay store hoặc endpoint. Phân biệt raw duplicate-key/framing checks với validation trên parsed object; không claim phần chưa thực hiện.

### F-02 — P1: Delegation wire shapes lệch S28; browser operation shapes còn thiếu

- Location: `packages/contracts/src/talent-context-read/delegation.ts:74`, `:104`, `:180`, `:196`; toàn export surface tại `index.ts`.
- Requirement: S28 TRANSPORT §2–5.
- Evidence: exchange/cancel spec đặt `pendingRequestId` trong route và body chỉ `{...B, receipt}` / `{...B, reason}`. Schema hiện bắt buộc thêm ID vào body nên reject body normative. S28 delegation error là `{status:'FAILED',error:{code}}`; implementation bắt buộc `messageKey`, reject normative error. EP không phê duyệt bổ sung trường này.
- Coverage thiếu: handoff form `{pendingRequestId,handoffProof,callbackState}`, approval decision `{pendingRequestId,decision,csrfToken}`, callback APPROVED/DENIED discriminated shapes (DENIED không receipt), CSRF token validation. Đây là wire schemas, không phải browser/session runtime bị exclude.
- Sửa tối thiểu: phân biệt path params và body validators đúng S28; trả delegation error code-only; bổ sung operation schemas còn thiếu và fixture strict rejection. Nếu dùng internal aggregate DTO, đặt tên/adapter rõ và vẫn export validator cho exact wire body. Không đổi agreed wire để khớp code.

### F-03 — P1: Token không canonical và query actor bỏ qua delegation token constraint

- Location: `packages/contracts/src/talent-context-read/delegation.ts:27`; `query-types.ts:56`.
- Requirement: EP-05, token prefix + canonical base64url của đúng 32 bytes; decode/re-encode equality. Áp dụng `dg_` nhất quán.
- Evidence: `rc_ + 'A'.repeat(42) + 'B'` PASS regex nhưng decode/re-encode khác input. Query actor nhận `delegationRef:'dr-1'`, không đúng `dg_` 46 characters. Header/profile chưa có `jt_`, browser chưa có `cs_`.
- Impact/path: nhiều string representations cho một token byte sequence; validation giữa operations không thống nhất.
- Sửa tối thiểu: shared module-local token validation đúng prefix/byte length/canonical roundtrip; reuse cho query actor. Bổ sung pad-bit mutations, padding, alphabet, lengths và valid boundary fixtures. Không claim schema chứng minh randomness/entropy generation.

### F-04 — P2: Immutable binding nhận grammar/timestamp sai

- Location: `packages/contracts/src/talent-context-read/delegation.ts:16` và các B fields lặp lại ở create/exchange/cancel/revoke.
- Requirement: EP-05 yêu cầu callbackId/crmSessionHandle opaque grammar; binding timestamps canonical UTC `Z` trước khi tạo immutable tuple.
- Evidence: callbackId có space, crmSessionHandle có newline và deadline `+07:00` đều được nhận. Hiện chỉ giới hạn string length và `.datetime({offset:true})`.
- Sửa tối thiểu: reuse bounded opaque validators cho B và binding-specific UTC-Z validator. Không đổi frozen/general IsoTimestampSchema chỉ vì binding có constraint hẹp hơn. Kiểm chứng không silently normalize một binding đã ký; cleanup vẫn được nhận deadline quá khứ đúng cú pháp, không thêm active-session requirement.

### F-05 — P1: Redaction chưa fail-closed đúng Unicode và byte limits

- Location: `packages/contracts/src/talent-context-read/redaction.ts:17`, `:40`, `:67`, `:72`, `:121`; `query-types.ts:79`.
- Requirement: S28 REDACTION steps 1/4/6, EP-05 output <=512 UTF-8 bytes.
- Evidence: `\uFEFFAlpha` được trim rồi trả `A••`, dù U+FEFF là Cf phải reject trước normalize. `Q + U+0301 x254 + b` có 256 scalars nhưng trả output 515 bytes và result schema vẫn PASS. Schema `.max(512)` cũng nhận string 1536 bytes. Hai Deseret letters `U+10400 U+10401` là token hợp lệ nhưng bị omit vì `firstCluster[0]` lấy UTF-16 half-surrogate. Segmenter ném lỗi trong `segment()` làm hàm throw thay vì omit.
- Sửa tối thiểu: full Unicode Cc/Cf rejection trước normalize; code-point-aware initial; đếm letter-led graphemes theo spec; catch segmentation failure; đo UTF-8 bytes sau redaction và trong schema. Quá giới hạn phải omit, không truncate. Không thay grammar/algorithm đã accepted.

### F-06 — P2: Projection conformance chưa chứng minh requested/unsupported/unrequested

- Location: `packages/contracts/src/talent-context-read/query-types.ts:103`; `query-parser.ts:23`; `packages/contracts/tests/talent-context-read/redaction-vectors.test.mjs:38`.
- Requirement: S25 §2/§4, S28 omission rules và authoritative vectors có `expectedUnavailableFields`.
- Evidence: schema chỉ ngăn identitySummary đồng thời present/unavailable; parser không có request context. Test unrequested là `assert.ok(true)`, không gọi implementation; tests không assert authoritative `expectedUnavailableFields`. Hai copied fixtures decomposed/one-letter-mark đã được NFC trước khi chạy, nên không test đúng decomposed input gốc. Supplemental run tại E-05 xác nhận 21 requested algorithm vectors gốc vẫn PASS, nhưng chưa chứng minh projection assembly.
- Sửa tối thiểu: thêm pure request/result conformance helper hoặc equivalent production-intended projection validator, không đổi wire/parser signature đã chốt nếu không cần. Test requested-unsafe phải omit object và đánh unavailable đúng một lần; known-unsupported chỉ marker nếu requested; unrequested không object/marker. Dùng exact pinned vectors và kiểm các expected fields, không dùng self-fulfilling/no-op tests. Correlation/org/target pairing nên được thể hiện rõ ở boundary nào và có negative cases.

## Coverage disposition

| Surface | Producer review |
| --- | --- |
| Query direct result/strict object/no version fields | Có implementation; projection context còn F-06 |
| Seven query codes, HTTP/messageKey/retryClass, command-only rejection | PASS trong phạm vi pure parser đã review/test |
| Delegation create/exchange/cancel/revoke/ACK | Partial; F-02/03/04 |
| Handoff/decision/callback shapes | NOT_IMPLEMENTED, F-02 |
| Assertion header/claims/profile validation | NOT_IMPLEMENTED, F-01 |
| Redaction vectors/EP-05 boundaries | 21 requested normative algorithm vectors PASS; F-05/06 vẫn cần sửa |
| Frozen command semantics/root | Source diff chỉ thêm dedicated module, không đổi frozen root; consumer compatibility NOT_EXECUTED |
| Packaging/export/declaration artifacts | Separate task, không chặn design; source chưa export named TS types như S25 đề xuất, cần ghi rõ coverage thay vì claim full parity |

Build hygiene note không phải acceptance blocker riêng: `.gitignore` cleanup chưa ignore `packages/contracts/dist/`, nên build tạo untracked output; không stage output này. Harness đang tắt TS strict/noImplicitAny; build PASS không phải strict-typing proof. Packaging task phải kiểm exports/types/dependencies và consumer resolution riêng.

## Giữ đúng giới hạn EP-02/03 và governance

- EP-02: trusted manual provisioning; không JWKS discovery/jku/x5u runtime.
- EP-03: PostgreSQL durable atomic replay authority; retention đến absolute exp+skew (30s). F+120s lost-state fence là cơ chế recovery riêng, không phải jti retention. Delegation-state rollback cần phục hồi/invalidate authority riêng.
- Pure schema tests không chứng minh signature verification, replay consumption/fencing, RLS/object authorization, session/browser compatibility hoặc atomic cleanup/terminal ACK.
- Không publish/merge/consumer migration/runtime/pilot/deploy. Không credential hoặc organization value thật trong probes.
- `SPEC_DESIGN=BILATERALLY_ACCEPTED` giữ nguyên; `ACCEPTED_SHARED=NONE`; executable module acceptance chưa đạt; runtime/consumer compatibility `NOT_EXECUTED`.
- Owner gates, H.09/Tier 3 và registration/audit policy chưa bị thay đổi.

## Call path, timeline và hành động tiếp theo

P-01 (callflow): synthetic wire/name input → actual exported Zod/redaction function → accepted/rejected/throw observation E-05 → F-02..F-05. Không có endpoint, user data hoặc quyền runtime được truy cập. P-02: pinned authority → export/test inventory E-04 → missing profile/projection proof F-01/F-06.

Timeline trong ngày review: fetch/resolve → detached checkout → parity/authority read → npm ci/build/test → supplemental probes → report. Không chỉnh sửa tracked module hoặc T1 worktree.

CRM executor đóng F-01..F-06 trong một correction batch, cập nhật coverage/evidence trung thực, bàn giao immutable SHA mới. HRP review delta; independent audit disposition cho delta do CRM/T3 cung cấp, không tự kế thừa PASS cũ. Không yêu cầu Owner duyệt lại design đã accepted.

Report này là artifact local, chưa commit/push/gửi CRM tự động; không có Message-ID hoặc immutable delivery SHA mới được tự cấp. Skill code-audit hỗ trợ rà boundary và manual probes; docs-generator hỗ trợ cấu trúc evidence/finding/correction. Tool-index phụ trợ của skill không có trên máy, nên dùng Git/Node/npm đã xác minh; không cài thêm tool hoặc mở scope.

Checklist: pinned SHA/authority; clean dependency install; source/test parity; commands/runtime versions; synthetic reproducer; findings gắn location/requirement/evidence/minimal fix; runtime limitations; no source mutation. Flavor=null, không áp malware/attack narrative.
