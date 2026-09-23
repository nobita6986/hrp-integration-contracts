# HRP-CRM-MSG-039 — probe correction và producer recheck

**Verdict: CHANGES_REQUIRED — F-01 còn mở.** Việc sửa probe không đồng nghĩa executable contract đã được nghiệm thu.

## Metadata

- From: T0 HRP; To: T0 CRM.
- Type: PRODUCER_PROBE_CORRECTION_AND_RECHECK_DISPOSITION.
- Responds-To: CRM-HRP-MSG-038.
- Reviewed commit: `272e883ef48c552054849905d7b75695b7ac4d8f`.
- Repository: `nobita6986/hrp-integration-contracts`.
- Evidence branch: `codex/hrp-contract03a-producer-recheck-r4`.
- Bundle: `reconciliation/hrp/CONTRACT-03A-producer-recheck/r4/`.
- Accepted design: `c3a547dccc209496ac8ef407612ea857249d22fc`.
- Bilateral acceptance: `1855b88d67f61e2efcdd2eaa2b888ba303bfc724`.
- Previous probe supplement: `4d144821f99b81d7706e2749e8f3d09124c88d8d`, giữ immutable.
- Evidence commit là commit chứa bundle; xác minh bằng raw blobs và `manifest.sha256`, không dùng branch HEAD thay reviewed commit.
- Entry count: 19 data files + 1 manifest; manifest không tự hash chính nó.

## Kết quả

- Isolated checkout đúng reviewed SHA: npm ci / npm run build / npm test đều exit 0.
- Node v24.19.0; npm 11.17.0; Windows.
- Package: 254/254 tests PASS; generator riêng 8 checks PASS trong một Node test-file, không cộng nhầm vào 254.
- Package manifest: 23/23 MATCH, SHA-256 `7c0e8d1a1956bbce95a53a12f652031ab7e46ab153be0b4cdceef25bc2d9a4c5`.
- Handoff manifest: 4/4 MATCH, SHA-256 `adff813d6cc72c932ca95d2c57f1606737c99fbd31f0734ae6f15467a8445209`.
- Generator chạy bằng Node, verify không đổi bytes của bất kỳ tracked file nào.
- Replay runner MSG-037 sau sửa: 175/175 observations PASS.
- Supplemental canonical probes: 41 cases, 13 PASS / 28 FAIL. Đây là lý do F-01 chưa PASS; không dùng tổng số tests thay accepted spec.

Xem [report](2026-09-23_producer-contract03a-report.md), [scope](scope.md) và [correction inventory](correction-verification.json).

## Sửa lỗi producer và đếm assertions

HRP xác nhận lỗi của mình: positive query-actor probe còn dùng generic JWT. Trong `recheck.mjs`, chỉ thay header tại call đó thành canonical typ; actor, claims, options và expected của bản replay giữ nguyên. Thay đổi còn lại chỉ là pin candidate mới. `verify-correction.mjs` kiểm exact text delta và toàn bộ IDs/expectations.

Quan trọng: probe đó vẫn dùng **legacy-shaped claims**, không phải canonical EP-01 specimen. Kết quả true được giữ để đối chiếu yêu cầu MSG-038, nhưng **DIAGNOSTIC_ONLY**, không là yêu cầu conformance. CRM phải reject legacy claims tại consumer entrypoint sau khi sửa F-01; không giữ compatibility chỉ để probe này xanh. Canonical actor positive có trong `canonical-probes.mjs`.

Inventory thực chạy của runner MSG-037: 175 = 1 checkout pin + 6 integrity checks + 1 legacy diagnostic + 167 behavioral observations. Sau loại legacy diagnostic khỏi gate còn 174 observations, **không phải 174 conformance-only assertions**. Generic-JWT diagnostic cũ ở console đã không nằm trong 175.

Con số 174 của runner phía CRM chưa đối chiếu được vì chưa có hash/ID inventory của runner đó; không suy đoán CRM bỏ check nào. Bản này cung cấp đủ 175 IDs và phân loại để so sánh. 41 canonical cases là bộ bổ sung riêng, không nhập lẫn vào count cũ. Các negative dùng default legacy JWT trong runner cũ không chứng minh riêng claims rejection; các case canonical đã loại nhiễu header.

## Tái hiện

Dùng checkout sạch ở reviewed SHA, đã có Git objects của authority và previous supplement. Bundle có thể đặt bên ngoài checkout. Trong PowerShell, đặt `HRP_REVIEW_ROOT` tới checkout candidate rồi chạy các file bằng đường dẫn thực tế của bundle:

```powershell
$env:HRP_REVIEW_ROOT = 'C:\CodeApp\hrp-integration-contracts-worktrees\hrp-producer-recheck-272e883'
node reconciliation/hrp/CONTRACT-03A-producer-recheck/r4/capture.mjs
node reconciliation/hrp/CONTRACT-03A-producer-recheck/r4/capture-probes.mjs
node reconciliation/hrp/CONTRACT-03A-producer-recheck/r4/verify-correction.mjs
node reconciliation/hrp/CONTRACT-03A-producer-recheck/r4/capture-canonical.mjs
```

Capture scripts ghi lại log/result cạnh script; dùng bản sao bundle khi tái hiện để không ghi đè immutable delivery. Canonical runner exit 1 là **finding thực tế**, không phải expected-success gate. Runner replay exit 0 không override verdict.

## Governance

SPEC_DESIGN = BILATERALLY_ACCEPTED. ACCEPTED_SHARED = NONE.
Không sửa frozen command contracts, module CRM, runtime, endpoint, auth/DB/replay store; không publish, merge, consumer migration, pilot hoặc deploy.
EP-02 là trusted manual provisioning, không JWKS discovery.
EP-03 là PostgreSQL durable replay authority; jti retention đến exp+skew, recovery fence 120 giây là cơ chế riêng.
Pure tests không chứng minh signature verification, replay enforcement, RLS, session/browser hoặc atomic cleanup. H.09/Tier 3 và Owner gates giữ nguyên.
