# CRM CONTRACT-02A Evidence Bundle (r1) — Reconciliation slice brief

## Provenance

- CRM repository: https://github.com/nobita6986/HRP-CRM.git
- CRM baseline (full SHA): 72643356a0d1355f9dccc3921b47c990ea9c31c1
- CRM frozen package: @hrp-engagement/contracts@0.0.8-g0.8-fixes
- Source workspace: D:\\CodeApp\\Hrp-Crm
- Branch: evidence/crm-contract-02a-r1
- Layer: T1-B (CRM reconciliation slice brief owner); does not speak for T0 HRP or independent Auditor.
- Predecessor bundle: reconciliation/crm/CONTRACT-01/r1/ @ 25fc8b1f7f61a4bd5b6a9313eddb866af2e41b31.
- HRP evidence consumed (read-only): HRP r3 @ 2ee99394a210fc51125523ceef9020812f893be2; HRP r3 supplement @ a0cd30e04a86a80975824f23208a9e3ecfc29cbd; HRP REC-001 decision @ 2accd9a183333b412203e3dfb155893579afa47a.
- HRP baseline: 1059f6669482efac5b7956ef25d43996ca59d515.

## Scope (Owner prompt D)

This bundle is the CRM-side reconciliation slice brief. It contains:
- Owner decision acknowledgement for HRP-CRM-REC-001 (APPROVED for domain authority; REC-001-OPS remains OPEN/PROPOSED).
- Thin-slice brief for the B.03 read-only Talent context path; explicitly NOT intake / merge / case / outbound.
- Questions for HRP (T0 HRP) organized by layer (technical / two-T0 design / Owner business).
- Note for T1-A Chatwoot POC clarifying what may / may not be assumed.

This bundle does NOT contain:
- Contract source code.
- Bootstrap of any package.
- Tag / publish / merge / deploy actions.
- Edits to apps/**, packages/**, scripts/v7.9a/**, docs/contracts/inventory.md delta.
- Edits to T1-A POC files.

## Boundaries (confirmed, not relaxed)

- No edits to frozen CRM contracts @hrp-engagement/contracts@0.0.8-g0.8-fixes.
- No edits to docs/contracts/inventory.md pre-existing delta.
- No edits to apps/context-panel or other CRM source files.
- No edits to scripts/v7.9a/ files.
- No edits to T1-A POC files.
- No bootstrap of neutral package.
- No tag, publish, merge, force-push, deploy.
- No independent Auditor PASS.
- No promotion of any module to ACCEPTED_SHARED.
- No implementation of HRP endpoints on the CRM side.
- No runtime change.

## Two-party workflow

- This bundle is the CRM-side slice brief exchange.
- HRP runs on a separate machine. They consume these artifacts from this branch.
- No HRP baseline / acceptance is assumed.
- HRP-side reply expected via Owner-mediated message-ID sequence per HRP r3 RECONCILIATION_PROTOCOL §1.

## Files in this bundle

1. owner-decision-rec-001-record.md: CRM-side acknowledgement of HRP-CRM-REC-001 (APPROVED). Carries forward MSG-008 PlacementCase authority correction.
2. thin-slice-brief.md: B.03 read-only Talent context proposal. Lists CRM symbols at pinned baseline, HRP counterpart evidence (or NOT_VERIFIED), H-task dependencies, mock status, and conditions to switch from mock to HRP real.
3. hrp-questions.md: 9 questions for HRP T0 grouped by layer; each has Decision-ID, evidence reference, requested action, and why-CRM-cannot-proceed.
4. t1-a-note.md: Information note for T1-A Chatwoot POC. Lists fields POC is mocking, limits, and items the POC must NOT assume from this bundle.
5. manifest.sha256: SHA-256 of files in this bundle (UTF-8, LF, no BOM). Excludes itself per Owner prompt E.

## Manifest verification

On Linux / macOS:

    cd reconciliation/crm/CONTRACT-02A/r1
    sha256sum -c manifest.sha256

On Windows (PowerShell 5+) use the SHA-256 helper available in Windows 10 1903+:

    Get-ChildItem -Recurse -File -Exclude manifest.sha256 | ForEach-Object { certutil -hashfile _.FullName SHA256 | Select-Object -Skip 1 -First 1 }

Note: Owner protocol (HRP r3 RECONCILIATION_PROTOCOL §4) requires raw-bytes SHA-256 with LF line endings. This bundle is committed as LF. Local Windows checkouts may apply autocrlf; verify with raw bytes (sha256sum -c) on a Linux / macOS box, or use git show HEAD:path | sha256sum.

## Supersession / revision pinning

- This is r1 of CRM CONTRACT-02A. No supersedes commit (no prior CRM 02A revision exists).
- Bundle branch is created on top of evidence/crm-contract-01-r1 (25fc8b1); CRM 01 r1 is the previous evidence round and remains immutable.
- Future revisions (r2, r3...) will declare supersedesCommit pointing to this r1 commit.
- No silent edits. Per HRP r3 RECONCILIATION_PROTOCOL §3, this branch will not be force-pushed.

## What T1-B does NOT do

- T1-B is not T0 HRP. T1-B does not speak for HRP.
- T1-B is not independent Auditor. T1-B does not self-grant PASS.
- T1-B does not reopen Owner-approved authority decisions (REC-001 APPROVED is not reopened).
- T1-B does not interpret Owner approval as wire acceptance or runtime right (per HRP REC-001 DECISION.md System Boundaries section).
- T1-B does not change frozen contracts.
- T1-B does not migrate consumers.
- T1-B does not deploy.

