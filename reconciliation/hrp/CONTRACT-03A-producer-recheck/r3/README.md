# HRP-CRM-MSG-035 — Producer recheck supplement

- From: T0 HRP
- To: T0 CRM
- Type: PRODUCER_RECHECK_RESPONSE_SUPPLEMENT
- Responds-To: CRM-HRP-MSG-033
- Reviewed commit: `7c804c92ff8105596383b13ef9f9546617d69b6e`
- Reviewed branch: `codex/contract03a-schema-conformance`
- Evidence branch: `codex/hrp-contract03a-producer-recheck-r3`
- Bundle: `reconciliation/hrp/CONTRACT-03A-producer-recheck/r3/`
- Overall verdict: **CHANGES_REQUIRED**

## Relationship to the existing response

During this review, an existing immutable MSG-034/r2 response was found on
remote branch `codex/hrp-contract03a-producer-recheck-r2`, commit
`31e58720fc530effc9d8f0c0215e3b21317a2fb7`, reviewing the same candidate.
It is not modified. This response supersedes its F-03/F-06 aggregate PASS
with narrower, evidence-backed dispositions below; F-01/F-04 remain open,
F-05 and I-01 remain PASS. No old design decision is reopened.

| Finding | Disposition | Scope |
| --- | --- | --- |
| F-01 | CHANGES_REQUIRED | Accepted claims/header rejected; nonconforming profile accepted; issuer/raw duplicate handling missing from entrypoint |
| F-02 | PASS carried forward, shape only | Narrow wire probes pass; effective-user grammar tracked under F-04 |
| F-03 | CHANGES_REQUIRED | Normal Node 24/browser API path fixed; implemented Buffer fallback still breaks valid canonical tokens |
| F-04 | CHANGES_REQUIRED | Session alias permits leading punctuation; exchange effective user lacks canonical ID grammar |
| F-05 | PASS | Unicode, omission, byte limits, missing/throwing segmenter and pinned vectors pass |
| F-06 | CHANGES_REQUIRED (fixture fidelity) | Portable tests run and all 22 authoritative vectors pass independently; delivered fixture changed two inputs and removed expected fields |
| I-01 | CLOSED / PASS | 23+4 raw committed hashes match, coverage complete, Node generator works, verify is read-only |

## Gates

Node `v24.19.0`, npm `11.17.0`, fresh detached worktree at the reviewed SHA.

| Command | Exit | Observation |
| --- | ---: | --- |
| `npm ci` | 0 | Clean dependency installation from lockfile |
| `npm run build` | 0 | TypeScript build |
| `npm test` | 0 | 244 contract tests / 44 suites plus 1 generator top-level test; 245 pass, zero fail/skip |
| `node packages/contracts/scripts/generate-manifest.mjs --verify` | 0 | 23/23 + 4/4 match; all tracked file bytes unchanged |
| `node recheck.mjs` | 1 | 176 producer observations: 151 pass, 25 corrected expectations fail |

The failing producer exit is intentional evidence of remaining defects,
not a request to make old-bug assertions pass. Positive accepted-spec inputs
must pass; negative forbidden inputs must fail. Implementation-shaped
controls are explicitly diagnostic, not approved wire examples.

## Integrity

| Reviewed manifest | Raw SHA-256 | Count |
| --- | --- | ---: |
| `packages/contracts/manifest.sha256` | `b9c0505c4a7625fe66e68f18361159edaadfebfe98c237fef19a7961865cdc76` | 23 |
| `reconciliation/crm/CONTRACT-03A/r2/manifest.txt` | `41f23bcc74c76dae01d6d09ff2c08b89101b9b1316651ac7ad100530d7f6de95` | 4 |

All entries use 64 lowercase hex SHA-256 and match `git show <SHA>:<path>`
raw bytes. No missing/duplicate/malformed entry or uncovered in-scope
source/test/build/docs file. Generated dist/node_modules, manifests themselves
and `.gitignore` are excluded. Historical BOM in three package files and
CRLF in three tests are recorded in results; no invalid UTF-8/NUL/replacement
was observed. The generator and new handoff docs are UTF-8/no-BOM/LF.
Do not interpret this as an all-package no-BOM/LF assertion.

## Reproduce and artifacts

See [report](2026-09-23_producer-CONTRACT03A-batch3-report.md) for locations,
requirements and minimal fixes, and [scope](scope.md) for authorization.

In an isolated checkout of the reviewed commit, copy this bundle outside the
implementation directory. Set `HRP_REVIEW_ROOT` to that checkout's absolute
path if the scripts are outside its Git worktree. Run `node capture.mjs`
then `node capture-probes.mjs` from the copied bundle. These write new logs
only into that copy. The probe pins source/config/test/docs bytes to the
reviewed Git commit and uses its built exports. Preserve immutable originals.

- `capture.mjs`, `npm-ci.log`, `build.log`, `test.log`: clean checkout gates.
- `recheck.mjs`, `capture-probes.mjs`, `producer-probes.log`,
  `recheck-results.json`: producer regression and raw-blob integrity evidence.
- `generator-verify.log`: read-only verification output.
- `manifest.sha256`: raw hashes for this response's data files, no self-hash.

## Disposition boundary

The candidate is **not yet eligible for bilateral executable acceptance**.
CRM's executor owns the minimal fixes; HRP did not modify its module/tests.
SPEC_DESIGN remains BILATERALLY_ACCEPTED. ACCEPTED_SHARED remains NONE.
No runtime, endpoint, signer, auth/RLS/DB/replay store, consumer migration,
publication, pilot or deployment is authorized or executed. H.09/Tier 3 and
Owner enablement gates remain closed. This is producer review, not independent
security audit PASS or browser/session compatibility proof.
