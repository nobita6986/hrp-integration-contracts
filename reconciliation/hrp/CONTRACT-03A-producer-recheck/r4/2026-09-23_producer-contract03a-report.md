# Producer recheck CONTRACT-03A — F-01 còn mở

## Kết luận và phạm vi

Review đúng `272e883ef48c552054849905d7b75695b7ac4d8f`, theo [scope](scope.md). Build/test và integrity PASS, nhưng consumer-facing assertion validator vẫn nhận nhiều input trái EP-01/EP-05. HRP nhận lỗi hai positive controls legacy của mình; không yêu cầu CRM giữ legacy compatibility. Không sửa implementation và không kết luận có khai thác production.

| Finding | Disposition | Evidence |
| --- | --- | --- |
| F-01 | CHANGES_REQUIRED | Canonical entrypoint: 13/41 PASS, 28/41 FAIL; nhóm A–D dưới đây |
| F-02 | PASS — wire shape only | Exchange path/body, effective user và error shape; không runtime proof |
| F-03 | PASS — standalone token schemas | Canonical base64url, pad bits, Node fallback; assertion actor token còn thuộc F-01-B |
| F-04 | PASS — delegation schemas | Binding grammar/UTC-Z ở create/exchange/cancel/revoke; assertion B còn thuộc F-01-B |
| F-05 | PASS — reviewed redaction boundary | Unicode, unsafe inputs, byte bounds, missing/throwing Segmenter |
| F-06 | PASS — reviewed conformance cases | Exact pinned 22 vectors, omission, requested markers, seven-code parser probes |
| I-01 | PASS — integrity/coverage | 23 + 4 entries raw blobs, full scoped coverage, Node verify read-only |

PASS giới hạn vào surface đã ghi, không có nghĩa mọi module/profile đã hoàn chỉnh. F-03/F-04 helpers đúng không làm F-01 entrypoint đúng.

## Evidence

| ID | Source / artifact | SHA-256 | Reproduce |
| --- | --- | --- | --- |
| E-01 | `canonical-results.json` | `9ea09e20c0b4803bc46fe3d51e036e56a2adb46b94f1b34022fd8981019705b7` | `node canonical-probes.mjs` qua HRP_REVIEW_ROOT |
| E-02 | reviewed `packages/contracts/src/talent-context-read/assertion.ts` | `de8672e2db7ab22f68affa009c521374f6074d9da4f0299ef32902da4ed361cc` | `git show 272e883ef48c552054849905d7b75695b7ac4d8f:packages/contracts/src/talent-context-read/assertion.ts` |
| E-03 | `recheck-results.json` | `6a0d5b5e7d454cb0dbbe8c3d6fa35fe72a7292b1ed04e543d792b3b724c0d1f0` | `node capture-probes.mjs` |
| E-04 | `test.log` | `0b9a9c2279807942ddc856de546f3344bc42a28aa711ca7737635821537f9b1a` | `node capture.mjs` chạy ci/build/test |
| E-05 | `correction-verification.json` | `2b98d271c7697056e69f781b991d639e8c8c2a8cb00fa83a30c7400a82b8ad52` | `node verify-correction.mjs` |

Observation timestamps và exact synthetic inputs/results nằm trong E-01/E-03. Commands chạy từ bundle; candidate root theo README. Mọi file evidence khác được hash trong manifest.

## F-01 — bốn nhóm cần sửa trong cùng batch

Tất cả location dưới đây thuộc `packages/contracts/src/talent-context-read/assertion.ts` tại reviewed SHA. Authority: accepted ENGINEERING-PROFILE.md EP-01 strict claims/operation/time và EP-05 grammar/bounds. E-01 dynamic + E-02 static; status **validated**, confidence **high**, category **contract validation**, severity **high pre-runtime design boundary** (chưa có runtime exposure được chứng minh).

### A. Legacy normalization thay strict claims rejection

- Location: `validateClaimsObject` L328–575, đặc biệt L345, L387–400, L426–497; profile L824–864.
- 8 failing probes: serviceId thiếu/sai type, string scope, unknown role/binding/request/actor fields, flipped legacy binding/request.
- Example: chỉ xóa `serviceId` khỏi canonical valid query thì `validateAssertionFromWire` vẫn trả `ok:true`.
- Root cause: tự derive serviceId từ sub; cho phép scope string; remap legacy fields; dựng output mới bỏ unknown fields thay vì reject.
- Sửa tối thiểu: strict canonical schema bắt buộc serviceId, exact array scope, strict nested B/request/actor; loại nhánh legacy khỏi consumer validators. Diagnostics không được quyết định conformance.
- Không giữ legacy actor positive trong replay runner làm blocking expectation. Expected **true** của legacy diagnostic không phải authority.

### B. B và actor không tái sử dụng constraints đúng

- Location: L416–421, L500–570; chỉ kiểm typeof string rồi copy.
- 10 failing probes: callbackId grammar/length, sessionHandle empty/grammar/length, invalid date/offset timestamp, actor userId grammar/length, invalid delegationRef.
- Example: `binding.crmSessionDeadline='2026-02-30T10:00:00Z'` hoặc `actor.delegationRef='dg_bad'` đều `ok:true`.
- Vi phạm EP-01 strict B/actor + EP-05 canonical grammar, UTC-Z và canonical 32-byte token.
- Sửa tối thiểu: compose đúng B/actor primitives tại consumer-facing claims validator, không chỉ test helpers rời. Áp dụng toàn bộ EP-05 bounds của iss/aud/service/org/request, không chỉ các example bị fail.

### C. Operation và actor có hai nguồn quyết định mâu thuẫn

- Location: L689–694 (query không yêu cầu effective user), L867–880 (`opts.query` quyết định actor độc lập `operation`).
- 6 failing probes: actor.serviceId khác service; query bỏ actor khi flag false/omitted; create/exchange/cleanup nhận actor khi flag true.
- Sửa tối thiểu: derive actor requirement từ operation; reject inconsistent legacy flag hoặc bỏ flag khỏi entrypoint; bắt actor serviceId bằng authenticated/registered serviceId. Query yêu cầu DELEGATED_USER, các operation khác không nhận actor.
- Chỉ kiểm binding hình thức trong pure module; HRP user active/object authorization vẫn là runtime gate riêng.

### D. Profile constants bị caller option nới rộng

- Location: L578–605 và L809–810 cho time; L509–524/L852–863 cho method/hash.
- 4 failing probes: TTL 61 giây với override 120; now=exp+30 với skew override 60; GET cùng matching context; uppercase body hash cùng matching context.
- Hai case method/hash cố ý cung cấp **trusted context sai cấu hình nhưng match** để tách format check khỏi equality check. Không tuyên bố attacker tự điều khiển registration.
- Sửa tối thiểu: không cho public EP-01 entrypoint nới cap 60/30; enforce method POST và 64 lowercase hex trước comparison. Nếu helper generic cần override thì không gọi nó như strict profile mà không clamp/reject.
- Giữ verifierNow injectable để test; không yêu cầu dựng DB clock trong task schema.

## Coverage và giới hạn còn lại

- Strict typ generic JWT reject và canonical typ accept đã được xác minh riêng với canonical claims.
- Escaped/nested duplicate **header** keys reject qua exported raw entrypoint, không chỉ helper.
- `validateAssertionFromWire` L151–168 nhận raw header nhưng claims đã parse. Duplicate members trong raw claims, compact JWT/base64url framing và full Authorization/body byte bounds chưa được chứng minh bởi entrypoint này. CRM cần ghi chính xác coverage này; không mô tả header-only API là full wire validation. Đây là coverage gap của F-01, không phải yêu cầu mở signature/runtime.
- Full B equality với stored delegation/request body và actor userId equality với authority không được chứng minh bởi schema tests; phải có composition/runtime gate riêng.
- Legacy negative probes có invalid JWT sẵn có thể fail tại header trước khi tới claims; vì vậy 175/175 không thể đóng F-01. Supplemental cases dùng canonical control và thay riêng invalid dimension.
- Package manifest/coverage PASS không chứng nhận docs substance: r2 README tại candidate vẫn ghi old SHA/244 tests/legacy JWT compatibility. Cần follow-up note đồng bộ current evidence, không rewrite lịch sử.
- Candidate có historical BOM ở delegation.ts, module package.json, vectors test; CRLF ở ba test files. Raw hashes đều match; không claim toàn source LF/no-BOM. Bundle HRP mới dùng strict UTF-8/LF/no-BOM.
- Không source/tests/build-config CRM nào bị sửa trong review. Không thay frozen command semantics. Không runtime, browser, consumer compatibility hoặc independent audit PASS.

## Path và timeline

P-01 (callflow): synthetic canonical input [E-01] → exported `validateAssertionFromWire` L151 → header check → `validateAssertionProfile` L763 → permissive `validateClaimsObject` [E-02] → `ok:true` cho invalid claims [F-01 A/B/C/D]. Ảnh hưởng quan sát là pure validation acceptance, không phải truy cập dữ liệu.

Ngày 2026-09-23: pin candidate → clean npm ci/build/test [E-04] → exact probe correction/count inventory [E-05] → raw-blob integrity + old runner replay [E-03] → canonical recheck [E-01/E-02] → immutable evidence delivery. Không kế thừa audit verdict cũ cho delta mới.

## Yêu cầu CRM

Sửa F-01 A–D cùng một batch theo accepted spec; thêm regressions qua consumer entrypoint với canonical controls. Ghi rõ raw-claims/framing coverage và sửa handoff claim stale. Không sửa validator để nhận legacy controls. HRP không thay source CRM và không triển khai cạnh tranh.

SPEC_DESIGN = BILATERALLY_ACCEPTED; ACCEPTED_SHARED = NONE. Candidate **chưa đủ điều kiện** cho bước bilateral executable acceptance. H.09/Tier 3 và Owner enablement gates giữ nguyên.
