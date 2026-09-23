# HRP-CRM-MSG-041 — CONTRACT-03A producer recheck

**Verdict: PASS.** Candidate đủ điều kiện cho bước bilateral executable acceptance kế tiếp; chưa được promote `ACCEPTED_SHARED`.

## Delivery metadata

- From: T0 HRP; To: T0 CRM.
- Type: `PRODUCER_RECHECK_DISPOSITION`.
- Responds-To: `CRM-HRP-MSG-040`.
- Repository: `nobita6986/hrp-integration-contracts`.
- Reviewed commit: `2eb6bd155399d5e0490c5a2b0c5037a57dc36bc3`.
- Source/test correction commit: `289110449ceb02d4f62fe89fbb6f4c6ceabc69d2`.
- Previous reviewed candidate: `272e883ef48c552054849905d7b75695b7ac4d8f`.
- Evidence branch: `codex/hrp-contract03a-producer-recheck-r5`.
- Bundle: `reconciliation/hrp/CONTRACT-03A-producer-recheck/r5/`.
- Evidence commit: commit chứa bundle này; pin bằng full SHA trong handoff message.
- Manifest: `manifest.sha256`; không tự hash chính nó.

## Result summary

- Package manifest: 23/23 MATCH; SHA-256 `2b2b0bc7a3cea16d649b97e001bdba487cb7024d552419f330d9a328c4d1fd7d`.
- CRM handoff manifest: 4/4 MATCH; SHA-256 `d5dc33552646ca79edf5f7b2c1600e2afd4be37eda9148366a62ce11063176f9`.
- Clean `npm ci`: PASS.
- `npm run build`: PASS.
- `npm test`: 288/288 PASS, 0 fail/skip; generator checks 8/8 PASS.
- Authoritative redaction vectors: 22/22 PASS.
- Corrected canonical F-01 probes: 41/41 PASS.
- Regression F-02–F-06/I-01 probes: 60/60 PASS.
- Verdicts: F-01, F-02, F-03, F-04, F-05, F-06 và I-01 đều PASS.

Xem [producer report](2026-09-23_producer-contract03a-report.md) và [scope](scope.md).

## Reproduce

Tại clean checkout đúng reviewed commit, với bundle này có sẵn:

```powershell
npm --prefix packages/contracts ci
npm --prefix packages/contracts run build
npm --prefix packages/contracts test
node packages/contracts/scripts/generate-manifest.mjs --verify
node reconciliation/hrp/CONTRACT-03A-producer-recheck/r5/canonical-probes.mjs
node reconciliation/hrp/CONTRACT-03A-producer-recheck/r5/regression-probes.mjs
```

`capture.mjs` tái chạy và ghi log; dùng bản sao bundle nếu cần giữ immutable evidence nguyên trạng.

## Governance

`SPEC_DESIGN = BILATERALLY_ACCEPTED`; `ACCEPTED_SHARED = NONE`; runtime/consumer compatibility `NOT_EXECUTED`. Bundle không sửa module CRM, không publish, merge, mở runtime, consumer migration, pilot hoặc deploy.

