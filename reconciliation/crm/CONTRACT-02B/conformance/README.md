# CONTRACT-02B - Conformance Cases (supplement)

## Purpose

DRAFT synthetic request/result/error examples covering the six categories required by T1-B.

## Scope Limitation (read first)

- These are DRAFT EXAMPLES for design discussion, NOT executable contract, NOT runtime tests.
- These DO NOT claim schema validation or runtime PASS.
- These DO NOT replace frozen contracts. No Zod schema/DTO has been written from these examples.
- No implementation is opened. No endpoint is opened. No frozen contract is modified.

## Source Decision Evidence

- CRM r6 (content): reconciliation/crm/CONTRACT-02B/r6/ @ commit eb586247fe1a147bc904ff69d49104e8609943ff
- CRM r7 (metadata): reconciliation/crm/CONTRACT-02B/r7/ @ commit f908de06ed22a204c2cecfa8f051b5130216e8c3
- HRP response r6: reconciliation/hrp/CONTRACT-02B-response/r6/ @ commit a2a5efa9f6e22e8beb1e858054a2585d343b4bea
- HRP followup r4 (MSG-025): reconciliation/hrp/CONTRACT-02B-followup/r4/ @ commit 53e6db53a929409b1dc7b512a1ec897a3af5b659
  - Manifest raw SHA-256: e6f9dd0e2810525fde4743af16aca4bc6b2045dbe7c8de2f86c5aa8a49ee99f8 (T0 verified 5/5)
- HRP Owner disposition (MSG-026): reconciliation/hrp/CONTRACT-02B-owner-disposition/r1/ @ commit c0ede9aeaba3ba26d620ae4e535d9e6a77cf9343
  - Manifest raw SHA-256: f2a7a4cb5ee7c3c7483f73298e2c703170a270bfacc72104473aa51a66e00612 (T0 verified 1/1)
- Frozen package: @hrp-engagement/contracts@0.0.8-g0.8-fixes
- CRM baseline: 72643356a0d1355f9dccc3921b47c990ea9c31c1
- HRP baseline (current): 0f46f0fbf2c8bc8d106c9aa2f0d3fc6143d2850b

## Status Legend

- AGREED_DIRECTION: bilateral direction agreement (D-01..D-04).
- PROPOSED: one side proposes, awaiting other.
- OPEN: not yet decided; HRP-owned mechanism details.
- HRP-PENDING: HRP must confirm/revise before any test.

## Out of Scope (placeholder policy)

- Issuer algorithm: PLACEHOLDER; OPEN.
- TTL value: PLACEHOLDER; OPEN.
- Key rotation cadence: PLACEHOLDER; OPEN.
- Replay store technology: PLACEHOLDER; OPEN.
- Role allowlist: PLACEHOLDER; OPEN.
- Exact body-hash mechanism: PLACEHOLDER; OPEN.

## Files in this supplement

- CONFORMANCE-INDEX.md
- GAP-LIST.md
- CORRECTION-DELTA.md
- DISTRIBUTION-PROPOSAL.md
- OUTGOING-MESSAGE.md
- cases/01-valid-read.md
- cases/02-auth-perm.md
- cases/03-hidden-object.md
- cases/04-fields.md
- cases/05-retry-vs-replay.md
- cases/05A-retry-reauthorize.md
- cases/05B-exchange-cancel-receipt.md
- cases/05C-seven-code-parser.md
- cases/06-error-parsing.md
- fixtures/requests.json
- fixtures/results.json
- fixtures/errors.json
- manifest.sha256

Total: 18 data files + 1 manifest = 19 files.
Manifest records SHA-256 of 18 data files; manifest.sha256 itself is NOT hashed.

Status: DRAFT / NOT_EXECUTED.

## Governance

- ACCEPTED_SHARED = 0
- HRP_IMPLEMENTED = 0
- H.09/Tier 3 gate unchanged
- Implementation: NOT_EXECUTED
- Consumer compatibility: NOT_EXECUTED
- Status: DRAFT / pending T0 disposition

## Encoding

- All files in this directory: UTF-8, no BOM, LF line endings.
- Manifest at manifest.sha256 records raw-bytes SHA-256 of 18 data files in this directory (NOT including manifest itself).

## Target Wrapper

- Request body fields `kind` and `laborProfileId` are wrapped under a `target` object per r4/r6 DELTA-PROPOSAL.md (HRP-proposed additive TalentContextReadQueryRequestSchema).
- Inline JSON snippets in cases/*.md follow the same wrapper.
