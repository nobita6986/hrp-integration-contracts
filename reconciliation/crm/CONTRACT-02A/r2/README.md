# CRM CONTRACT-02A Evidence Bundle (r2) — Reconciliation slice brief (REVISED)

## Provenance

- CRM repository: https://github.com/nobita6986/HRP-CRM.git
- CRM baseline (full SHA): 72643356a0d1355f9dccc3921b47c990ea9c31c1
- CRM frozen package: @hrp-engagement/contracts@0.0.8-g0.8-fixes
- Source workspace: D:\\\\CodeApp\\\\Hrp-Crm
- Branch: evidence/crm-contract-02a-r1
- Revision: r2 (supersedes r1 89dabd9e65836c521137ccea5ab9b391f1d3982a)
- Layer: T1-B (CRM reconciliation slice brief owner); does not speak for T0 HRP or independent Auditor.
- HRP evidence consumed (read-only):
  HRP r3 @ 2ee99394a210fc51125523ceef9020812f893be2
  HRP r3 supplement @ a0cd30e04a86a80975824f23208a9e3ecfc29cbd
  HRP REC-001 decision @ 2accd9a183333b412203e3dfb155893579afa47a
  HRP baseline 1059f6669482efac5b7956ef25d43996ca59d515

## Revision note

r2 is a targeted correction of r1. The following changes were made after T0 review:

1. thin-slice-brief.md: Replaced 7 fabricated symbol names with verified actual symbol names from CRM baseline source. Corrected displayName PII classification. Removed NextAction and expectedVersion from minimum data (they are optional in HRP result). Reframed H.01-H.02-H.08-H.09 as milestone-level dependencies. Removed AFF-03B from B.03/B.04 blocker lists. Corrected CRM integration mapping note (mapping does NOT grant authorization).

2. owner-decision-rec-001-record.md: Corrected acknowledgement label from INTEGRITY_ONLY to OWNER_APPROVED. Separated four distinct concepts (Owner decision, evidence ACK, bilateral wire acceptance, runtime implementation). Corrected MSG-008 role from creating authority to reminding authority. Reordered PlacementCase carry-forward to list correct fact first, supplement caveat second.

3. hrp-questions.md: Trimmed from 9 questions to 5 questions needed for the read-only slice. Moved PlacementCase mapping, AFF-03B, REC-001-OPS, enum policy to backlog reference. Marked Client timing and KPI/Phase10 ordering as DEFERRED. Removed bilateral mechanism question (already agreed per RECONCILIATION_PROTOCOL).

4. t1-a-note.md: Corrected T1-A scope to P9/B.01 only (Chatwoot local/test, synthetic, edition verification). Removed webhook signature, suppression, routing from B.01 scope. Explicitly noted that webhook signature verification is a B.02 item.

Full correction ledger: see CORRECTION-LEDGER.md (17 CR-IDs).

## Scope (Owner prompt D)

This bundle is the CRM-side reconciliation slice brief. It contains:
- Owner decision acknowledgement for HRP-CRM-REC-001 (APPROVED for domain authority; REC-001-OPS OPEN/PROPOSED).
- Thin-slice brief for the B.03 read-only Talent context path; explicitly NOT intake / merge / case / outbound.
- 5 questions for HRP T0 (technical evidence only; no design questions for this round).
- Note for T1-A clarifying that T1-A scope is B.01 only (Chatwoot POC, synthetic, edition verification).
- Correction ledger documenting all changes from r1.

This bundle does NOT contain:
- Contract source code.
- Bootstrap of any package.
- Tag / publish / merge / deploy actions.
- Changes to apps/**, packages/**, scripts/v7.9a/**, docs/contracts/inventory.md delta.
- Changes to T1-A POC files.

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

## Files in this bundle

1. CORRECTION-LEDGER.md: Itemized list of all factual corrections from r1. 17 CR-IDs (CR-1 through CR-17).
2. owner-decision-rec-001-record.md: CRM-side acknowledgement of HRP-CRM-REC-001 (APPROVED). Carries forward MSG-008 PlacementCase authority correction. Distinguishes four separate concepts.
3. thin-slice-brief.md: B.03 read-only Talent context proposal. Corrected symbol names (CR-1). Removed fabricated names. Separated minimum required vs optional fields. Corrected PII note (CR-2). Reframed milestone dependencies (CR-4, CR-5, CR-6).
4. hrp-questions.md: 5 questions for HRP T0. Layer A only. Moved design questions to backlog or DEFERRED (CR-11 through CR-14).
5. t1-a-note.md: Information note for T1-A. Corrected scope to B.01 only (CR-15 through CR-17). Removed webhook/suppression/routing from scope.
6. manifest.sha256: SHA-256 of files in this bundle (UTF-8, LF, no BOM). Excludes itself.

## Manifest verification

On Linux / macOS:

    cd reconciliation/crm/CONTRACT-02A/r2
    sha256sum -c manifest.sha256

On Windows (PowerShell 5+):

    Get-ChildItem -Recurse -File -Exclude manifest.sha256 | ForEach-Object { certutil -hashfile [_.FullName] SHA256 | Select-Object -Skip 1 -First 1 }

Note: Owner protocol (HRP r3 RECONCILIATION_PROTOCOL §4) requires raw-bytes SHA-256 with LF line endings. This bundle is committed as LF.

## Supersession / revision pinning

- r2 supersedes r1 (89dabd9e65836c521137ccea5ab9b391f1d3982a).
- r1 remains immutable in Git history.
- Future revisions will declare supersedesCommit pointing to r2 SHA.
- No force-push per RECONCILIATION_PROTOCOL §3.
