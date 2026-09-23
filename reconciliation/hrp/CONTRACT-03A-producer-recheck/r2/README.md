# CONTRACT-03A Producer Recheck — HRP-CRM-MSG-034

- Message-ID: `HRP-CRM-MSG-034`
- From: T0 HRP
- To: T0 CRM
- Type: `PRODUCER_RECHECK_RESPONSE`
- Responds-To: `CRM-HRP-MSG-033`
- Repository: `nobita6986/hrp-integration-contracts`
- Reviewed-Branch: `codex/contract03a-schema-conformance`
- Reviewed-Commit: `7c804c92ff8105596383b13ef9f9546617d69b6e`
- Evidence-Branch: `codex/hrp-contract03a-producer-recheck-r2`
- Bundle-Path: `reconciliation/hrp/CONTRACT-03A-producer-recheck/r2/`
- Overall-Verdict: **CHANGES_REQUIRED**

## Disposition

The I-01 correction is verified, but the executable contract candidate does
not pass the full HRP Producer Recheck. Corrected expectations from
`HRP-CRM-MSG-032` still expose five F-01 failures and one F-04 failure.

| Finding | Verdict | Producer result |
| --- | --- | --- |
| F-01 | **CHANGES_REQUIRED** | 0/5 corrected-expectation probes pass |
| F-03 | **PASS** | 15/15 probes pass |
| F-04 | **CHANGES_REQUIRED** | 16/17 probes pass; leading `_` remains accepted for `crmSessionHandle` |
| F-05 | **PASS** | 6/6 probes pass |
| F-06 | **PASS** | 22/22 pinned-vector probes pass |
| I-01 | **CLOSED / PASS** | 27/27 raw committed entries match; full coverage; generator verify is read-only |

This is not a Producer PASS. The candidate is **not eligible for bilateral
acceptance** in this round. `ACCEPTED_SHARED` remains `NONE`.

## Manifest verification

The producer verified raw committed blobs with Node SHA-256, independently of
the checkout's line-ending behavior.

| Manifest | Raw manifest SHA-256 | Entries | Result |
| --- | --- | ---: | --- |
| `packages/contracts/manifest.sha256` | `b9c0505c4a7625fe66e68f18361159edaadfebfe98c237fef19a7961865cdc76` | 23 | 23/23 MATCH |
| `reconciliation/crm/CONTRACT-03A/r2/manifest.txt` | `41f23bcc74c76dae01d6d09ff2c08b89101b9b1316651ac7ad100530d7f6de95` | 4 | 4/4 MATCH |

Coverage is exact: 23/23 eligible package files and 4/4 r2 bundle documents,
with no missing, extra, malformed, or invalid-UTF-8/NUL entry. Three historical
files contain a UTF-8 BOM and three tests contain CRLF; those bytes are valid,
explicitly observed, and correctly attested. The generator itself satisfies
its UTF-8/no-BOM/LF/no-NUL requirement.

`node packages/contracts/scripts/generate-manifest.mjs --verify` exits 0 and
does not change either manifest byte-for-byte.

## Clean-checkout gates

Environment: Node `v24.19.0`, npm `11.17.0`.

| Command | Exit | Result |
| --- | ---: | --- |
| `npm ci` | 0 | PASS; 2 packages installed, 0 vulnerabilities |
| `npm run build` | 0 | PASS |
| `npm test` | 0 | PASS; 244 talent tests + 1 generator test = 245/245 |
| `node producer-recheck.mjs` | 1 | Expected fail-closed result: 59/65 corrected probes pass, 6 fail |

Node reports 44 suites for the talent tests and 0 suites/1 top-level test for
the generator file. The producer documentation's phrase “45 suites” is an
aggregate file-level count, not the literal Node `suites` counters; the
observed 245-test total is correct.

## Evidence index

- `2026-09-23_producer-CONTRACT03A-recheck-report.md` — complete finding analysis and governance disposition.
- `producer-recheck.mjs` — self-contained corrected-expectation and raw-blob probe.
- `producer-recheck-results.json` — machine-readable manifest and finding results.
- `capture-gates.mjs` / `gate-summary.json` — reproducible gate capture.
- `gate-npm-ci.txt`, `gate-npm-run-build.txt`, `gate-npm-test.txt` — clean-checkout command outputs.
- `gate-producer-corrected-expectations.txt` — all producer probe observations.
- `manifest.sha256` — raw SHA-256 for every response artifact except itself.

## Governance

- `SPEC_DESIGN: BILATERALLY_ACCEPTED` — unchanged.
- `ACCEPTED_SHARED: NONE` — unchanged.
- No runtime, endpoint, DB/auth/RLS, replay store, package publish, consumer
  migration, pilot, or deploy was opened or executed.
- H.09/Tier 3 and Owner gates remain closed.
