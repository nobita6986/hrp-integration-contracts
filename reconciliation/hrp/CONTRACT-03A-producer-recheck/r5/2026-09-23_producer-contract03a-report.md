# CONTRACT-03A producer recheck — Batch 5

> Verdict: **PASS** tại candidate `2eb6bd155399d5e0490c5a2b0c5037a57dc36bc3`.

## Executive summary

HRP đã checkout đúng immutable candidate, xác minh hai manifest từ raw committed blobs, chạy clean install/build/test và chạy lại producer probes theo accepted design. F-01 PASS `41/41`; regression F-02–F-06 và I-01 PASS `60/60`; package tests PASS `288/288`, authoritative redaction vectors PASS `22/22`, generator checks PASS `8/8`. Vì vậy candidate đủ điều kiện chuyển sang bước bilateral executable acceptance kế tiếp. Kết luận này không phải runtime/security audit PASS, không promote `ACCEPTED_SHARED`, và không mở bất kỳ runtime gate nào.

Phạm vi và giới hạn được pin tại [scope.md](scope.md).

## Evidence

| ID | Quan sát | Nguồn | Kết quả |
| --- | --- | --- | --- |
| E-01 | Checkout pin đúng reviewed candidate | `environment.txt`; `git rev-parse HEAD` | `2eb6bd155399d5e0490c5a2b0c5037a57dc36bc3` |
| E-02 | Package manifest từ committed blobs | `manifest-verify.log`; `regression-results.json` | SHA `2b2b0bc7a3cea16d649b97e001bdba487cb7024d552419f330d9a328c4d1fd7d`; 23/23 MATCH |
| E-03 | CRM handoff manifest từ committed blobs | `manifest-verify.log`; `regression-results.json` | SHA `d5dc33552646ca79edf5f7b2c1600e2afd4be37eda9148366a62ce11063176f9`; 4/4 MATCH |
| E-04 | Clean dependency install và build | `npm-ci.log`; `build.log` | exit 0 / exit 0 |
| E-05 | Package test suite | `test.log` | 288 passed, 0 failed/skipped; generator 8/8 PASS |
| E-06 | Corrected canonical F-01 probes | `canonical-probes.log`; `canonical-results.json` | 41/41 PASS |
| E-07 | Independent regression probes | `regression-probes.log`; `regression-results.json` | 60/60 PASS |
| E-08 | Source delta review | `git diff 272e883..2eb6bd -- packages/contracts/src packages/contracts/tests` | strict serviceId/scope/unknown-field/binding/actor/limit rules wired through consumer entrypoint |

## Finding disposition

| Finding | Verdict | Evidence | Kết luận |
| --- | --- | --- | --- |
| F-01 assertion/profile entrypoint | PASS | E-05, E-06, E-08 | serviceId bắt buộc và khớp sub; canonical scope array; strict nested objects; query-derived actor rule; POST/lowercase hash; TTL 60s và skew 30s không thể nới |
| F-02 delegation wire | PASS | E-05, E-07 | create/exchange/cancel/revoke shapes, path/body split, code-only error và effective user requirement giữ đúng |
| F-03 canonical tokens | PASS | E-05, E-07 | 7 token schemas chấp nhận canonical 32-byte base64url và reject non-canonical pad bits |
| F-04 immutable CRM binding | PASS | E-05, E-07 | grammar và UTC-Z deadline giữ strict trên 4 operation shapes |
| F-05 Unicode/redaction | PASS | E-05, E-07 | fail-closed omission, Unicode initials và byte bound giữ đúng |
| F-06 query/result/error conformance | PASS | E-05, E-07 | dedicated query/result, seven-code parser, command-only rejection và 22 authoritative vectors giữ đúng |
| I-01 manifest integrity | PASS | E-02, E-03, E-07 | exact SHA, raw blobs, entry counts và read-only verify đều PASS |

Không có finding blocking còn mở.

## Review path

1. Pin immutable commit — E-01.
2. Verify raw committed blobs và generator read-only — E-02, E-03.
3. Clean install, build và package tests — E-04, E-05.
4. Chạy canonical F-01 probes không chứa old-bug assertions — E-06.
5. Chạy regression perimeter F-02–F-06/I-01 và source review — E-07, E-08.
6. Kết luận PASS, chỉ đủ điều kiện cho bilateral executable acceptance kế tiếp.

Residual risks: pure schema tests không chứng minh signature verification, durable replay consume, authorization/RLS, session/browser compatibility hoặc atomic cleanup. Các mục này vẫn nằm ngoài scope và phải qua task/runtime gates riêng.

## Non-blocking observations

- `packages/contracts/.gitignore` bị generator chủ ý loại khỏi package manifest; code generator thể hiện ngoại lệ nhưng manifest header chỉ nêu `node_modules/`, `dist/` và manifest. Đây là clarity debt trước packaging, không làm sai 23-entry implementation perimeter đã công bố.
- Comment đầu `assertion.ts` còn một số mô tả compatibility cũ (`serviceId` derivation, string scope/flipped shape). Executable validator, tests và public entrypoint đều strict và PASS; nên đồng bộ comment trước package publication để tránh người đọc hiểu sai.

## Runtime limitations và governance

- `SPEC_DESIGN = BILATERALLY_ACCEPTED`.
- Executable contract candidate: **PRODUCER_RECHECK_PASS; ELIGIBLE_FOR_NEXT_BILATERAL_ACCEPTANCE_STEP**.
- `ACCEPTED_SHARED = NONE`.
- Runtime/consumer compatibility: `NOT_EXECUTED`.
- Không endpoint/JWT signer, DB/replay/delegation store, migration, package publish, consumer migration, pilot hoặc deploy.
- H.09/Tier 3 và Owner runtime gates giữ nguyên.

