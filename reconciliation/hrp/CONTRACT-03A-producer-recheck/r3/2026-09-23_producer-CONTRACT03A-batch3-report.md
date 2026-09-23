# CONTRACT-03A batch 3 — Producer recheck

## Kết luận và phạm vi

**CHANGES_REQUIRED** tại `7c804c92ff8105596383b13ef9f9546617d69b6e`.
Integrity đã sửa thành công; clean install/build/test đều xanh. Tuy nhiên,
F-01 vẫn lệch accepted EP-01, F-04 còn hở grammar; kiểm tra bổ sung phát hiện
F-03 Buffer fallback sai và F-06 fixture không giữ nguyên authoritative inputs.
F-05 PASS, không mở lại thiết kế redaction. Đây là producer review theo
[scope](scope.md), không phải runtime audit hay bằng chứng khai thác production.

## Evidence và cách tái hiện

Mọi đường dẫn source dưới đây thuộc repository và reviewed SHA đã pin, không
phải branch HEAD. SHA-256 từng artifact nằm trong `manifest.sha256` của bundle.

| ID | Source / artifact | Command / observation |
| --- | --- | --- |
| E-01 | `recheck-results.json`, integrity | `git show 7c804c92...:<path>` + Node SHA-256; 27/27 match, exact coverage |
| E-02 | `npm-ci.log`, `build.log`, `test.log` | `node capture.mjs`; npm ci/build/test exit 0, 245 tests pass |
| E-03 | `producer-probes.log`, `recheck-results.json` | `node capture-probes.mjs`; 176 observations, 151 PASS / 25 FAIL |
| E-04 | Source at reviewed SHA; locations below | Direct source inspection and `git diff 22fc50e..7c804c9 -- packages/contracts/src` |
| E-05 | `generator-verify.log` | Node generator --verify exit 0; raw snapshots of all tracked files before/after equal |
| E-06 | Pinned S28 vector blob | `git show 49f2dbc34cae66e8d63df5dd5d8cec0c008c4623:reconciliation/hrp/CONTRACT-02B-conformance-response/r2/REDACTION-VECTORS.json`; 4118 bytes, SHA-256 `a7e7ae0b32629a9dedd2a20031086460a606271c5cf305bbc76c14a76783e428` |

Ngày quan sát: 2026-09-23; timestamps thực nằm trong logs/results.
Environment: Node v24.19.0, npm 11.17.0, TypeScript 5.7.3, Zod 3.24.2.
Không chạy lại HRP runtime. Mọi token/ID/input dùng trong probes đều synthetic.

## Findings cần sửa

### F-01 — Assertion/profile vẫn sai accepted EP-01

- Verdict: CHANGES_REQUIRED; severity: high (contract boundary); status: validated; confidence: high; evidence: E-03 + E-04.
- Locations: `packages/contracts/src/talent-context-read/assertion.ts:41`, `:60`, `:190`, `:213`, `:374`, `:403`.
- Requirement: accepted ENGINEERING-PROFILE.md EP-01/EP-05 tại design commit `c3a547d...`, không phải các comments/tests do implementation tự định nghĩa.
- Header nhận HS256 và typ JWT, nhưng spec chỉ RS256 + `hrp-crm-service+jwt`. Header đúng bị reject; HS256/generic JWT qua implementation-shaped entrypoint lại PASS.
- Claims thiếu serviceId và actor; scope là string thay vì array literal; binding/request bị đảo nghĩa. Spec B gồm organizationId/crmSubject/crmSessionHandle/crmSessionDeadline/callbackId; request phải method POST/path/bodySha256. Positive canonical create/query đều bị reject. Branch query kiểm actor sau strict schema vốn không nhận actor, nên không thể thành công.
- Không có expected issuer validation; đổi iss vẫn PASS. Scope tùy ý và negative/unsafe integer epoch vẫn PASS. Subject check không thay serviceId/sub consistency, đăng ký issuer hoặc signed-B equality.
- Entrypoint chỉ nhận parsed objects, không gọi raw helper; không chứng minh strict UTF-8/framing/duplicate checks. Helper vẫn nhận escaped duplicate và nested duplicate. MAX_HEADER_LEN được khai báo không có nghĩa raw boundary đã được compose.
- Audience chỉ so caller string; operation set create/exchange/cleanup không biểu diễn cancel/revoke/query như EP-01. Phải ràng buộc operation với trusted registration và endpoint, không coi URL mẫu là config thật.
- Đã sửa đúng: nbf/organizationIdDigest bị reject; exp+skew equality bị reject; crit và sai body hash bị reject. Giữ các sửa này.
- Sửa tối thiểu: thay shape/constraints theo đúng EP-01; compose raw/profile validation rõ ràng qua entrypoint consumer, include expected issuer/full B/request/query actor và bounds. Có positive fixtures canonical cho từng operation, rồi mutate mỗi constraint để negative không bị che bởi shape sai khác. Không thêm signature verifier/store/runtime.

### F-03 — Canonical token PASS đường bình thường, FAIL Buffer fallback

- Verdict: CHANGES_REQUIRED (residual portability); severity: medium; status: validated; confidence: high; evidence: E-03 + E-04.
- Locations: `packages/contracts/src/talent-context-read/primitives.ts:59` và `:85`.
- Requirement: EP-05 canonical decode/re-encode equality; implementation tự cung cấp cả browser và Buffer fallback.
- Với Node 24 atob/btoa bình thường: cả 7 token schemas nhận canonical byte 0/128/251/255, reject pad bits sai.
- Khi atob/btoa không có nhưng Buffer có: token canonical bị reject. Encoder đang decode binary thành Latin-1 string thay vì base64 encode; decoder dùng TextDecoder latin1 rồi charCode mask có thể thay byte 0x80..0x9F. Probe tắt API trong try/finally, khôi phục ngay, không thay package/runtime.
- Sửa tối thiểu: dùng trực tiếp byte/base64 conversion đúng ở fallback hoặc một byte codec thống nhất; thêm fallback positive roundtrip gồm high bytes. Không cần thay token wire format. Không tuyên bố browser compatibility PASS từ probe này.

### F-04 — Grammar chưa áp hết ở consumer schemas

- Verdict: CHANGES_REQUIRED; severity: medium; status: validated; confidence: high; evidence: E-03 + E-04.
- Locations: `packages/contracts/src/talent-context-read/primitives.ts:268`, `:274`; `delegation.ts:158`.
- Requirement: EP-05 opaque grammar `^[A-Za-z0-9][A-Za-z0-9._:-]*$` cho session alias và canonical/effective user IDs.
- Create/exchange/cancel/revoke đều nhận `_session`/`-session`; regex hiện cho phép separator đầu. Exchange success nhận effectiveHrpUserId `bad id` vì chỉ min/max length.
- Đã sửa đúng: callback whitespace/session newline, UTC offset và February 30 bị reject; cleanup vẫn nhận past deadline có syntax hợp lệ. Không thêm yêu cầu active session cho cleanup.
- Sửa tối thiểu: dùng đúng existing canonical/opaque primitives tại các wire fields và thêm probe trực tiếp qua bốn operation schemas + exchange result.

### F-06 — Portable test xanh nhưng fixture không phải exact pinned vectors

- Verdict: CHANGES_REQUIRED (evidence/conformance fidelity); severity: medium; status: validated; confidence: high; evidence: E-03 + E-04 + E-06.
- Locations: `packages/contracts/tests/fixtures/redaction-vectors.fixtures.json:13`, `:28`; `tests/talent-context-read/conformance-helper.test.mjs:118` và `:162` (dưới packages/contracts).
- Hai input decomposed/one_letter_mark bị đổi từ `E + U+0301` sang NFC `É`; cả 22 vectors mất expectedUnavailableFields. Metadata hash đúng của nguồn không chứng nhận vector copy đúng. Test chỉ kiểm hash-string format và tự suy expected markers.
- Độc lập chạy đúng 22 authoritative vectors qua module hiện tại: 22/22 PASS. Không có redaction behavior regression ở các case này. Lỗi còn lại là corpus delivery và regression proof, không cần viết lại thuật toán.
- Sửa tối thiểu: lấy nguyên raw authoritative JSON làm fixture, không normalize/retype, giữ expected fields; giữ provenance riêng nếu cần. Portable loader kiểm actual copied bytes/hash và sử dụng expectedUnavailableFields, không chỉ regex 64 hex.
- Không đặt marker order thành gate mới: accepted S25 yêu cầu unique/requested-only, không yêu cầu first-appearance order. Comment/test hiện mô tả order mâu thuẫn nhưng không được dùng để phát minh policy mới.

## Các mục đã đóng / không phải blocker mới

- **I-01 PASS:** 23+4 entries SHA-256 64 hex đúng raw blobs; complete coverage; no missing/mismatch/duplicates. Generator Node --verify read-only. Nó kiểm working-tree bytes, nên producer đã kiểm raw Git độc lập. npm test có bước generate manifest rồi restore tamper; Git tracked content sau test không đổi.
- Encoding: ba source/fixture test files có BOM và ba tests CRLF; dữ liệu vẫn strict UTF-8, hash attest chính xác. Generator là UTF-8/no-BOM/LF. Không biến việc normalize toàn bộ package thành gate mới.
- **F-05 PASS:** Arabic/Hangul/SMP, FEFF/control/unsafe tokens, byte bounds, missing/throwing segmenter và 22 vectors đúng đều PASS. Không dùng Hangul occurrence trong synthetic vectors làm mojibake detector.
- **F-02 PASS shape-only:** placement path/body và code-only envelope giữ nguyên. Effective-user grammar residual ghi dưới F-04, không phủ nhận wire-shape correction.
- Seven-code parser: 28 producer probes về exact triples/wrong HTTP/messageKey/command retry literal PASS. Không có delta tới frozen root errors/envelopes/index so với prior reviewed commit; không claim consumer compatibility đã chạy.

## Path, giới hạn và next action

P-01 (callflow): synthetic accepted/forbidden input → exported dist entrypoint/schema
(E-04) → observed parse/profile result (E-03) → F-01/F-03/F-04.
P-02 (conformance): pinned raw vector (E-06) → delivered fixture comparison và
module execution (E-03) → F-06; behavior PASS không thay fidelity proof.
P-03 (integrity): pinned Git blob → SHA-256/coverage (E-01) → Node --verify
plus before/after bytes (E-05) → I-01 PASS.

Timeline: pin remote commit/fresh checkout; clean npm gates; inspect accepted
spec; independent raw-blob/probe run; detect existing immutable r2; issue this
new r3 supplement without modifying r2 or implementation.

CRM executor sửa một batch hẹp F-01/F-03/F-04/F-06, cập nhật docs bằng source
thật và regenerate manifests sau final bytes. Không cần mở lại inventory,
Owner roles/15-minute/revoke-window decisions, hoặc redaction design.
HRP không tự sửa module. Giữ EP-02 trusted manual provisioning (không JWKS),
EP-03 PostgreSQL durable replay, retention tới exp+skew và fence 120s là
cơ chế riêng. Không cái nào đã được thực thi/prove bởi schema tests.

SPEC_DESIGN=BILATERALLY_ACCEPTED; ACCEPTED_SHARED=NONE. Candidate chưa đủ
điều kiện bilateral executable acceptance. H.09/Tier 3/Owner gates vẫn đóng.
