# CONTRACT-02B Evidence Bundle (r3)

## Provenance

- CRM repository: https://github.com/nobita6986/HRP-CRM.git
- CRM baseline (full SHA): 72643356a0d1355f9dccc3921b47c990ea9c31c1
- CRM frozen package: @hrp-engagement/contracts@0.0.8-g0.8-fixes
- Source workspace: D:\\CodeApp\\Hrp-Crm
- CONTRACT-02A r3 (predecessor): d91d07f517782643666ab01cce78bdf5424073ab
- HRP evidence response r3 (input): 61fd3a4236bd71d891f7e5030beafbd08ccdc505
- HRP baseline (current): a49ceaa83ffa986bf939823a4e9f2c803a0649d6
- HRP REC-001 decision: 2accd9a183333b412203e3dfb155893579afa47a
- Branch: evidence/crm-contract-02b-r3
- Predecessors in series: r1 608d67d, r2 93a31ce (both immutable)
- Revision: r3 (self-contained; supersedes r1 and r2)
- Layer: T1-B (CRM reconciliation slice brief owner). Does not speak for HRP T0 or independent Auditor.

## Scope

CRM-side proposal for a minimal Talent read contract on the HRP-CRM B.03 real path. Output is proposal only; no code, no frozen-contract changes, no consumer migration.

r3 is self-contained: readers do NOT need to combine r1 and r2 to derive the design. r1 and r2 are immutable in Git history.

## Bundle contents

- PROPOSAL.md: 7 sections. Four critical gaps, change proposals CP1..CP8, acceptance criteria AC-1..AC-31, boundaries, file list, supersession, stop condition.
- CHANGE-PROPOSALS.md: CP1..CP8 with full FROZEN REQUIREMENT / SLICE PROPOSAL / CONTRACT CHANGE bodies.
- ACCEPTANCE-CRITERIA.md: AC-1..AC-31 with full text. No AC-X placeholders.
- HRP-FIELD-MAPPING.md: Pinned source line references for all cited schemas and symbols. Gap summary table.
- CORRECTION-LEDGER.md: Root cause of r2 content loss and what r3 does differently.
- SCRATCH-VALIDATION.md: Approach and expected result for CRM-side Zod self-check. Status: NOT_RUN.
- README.md: This file. Provenance, verification, boundaries.
- manifest.sha256: SHA-256 of bundle files (UTF-8, LF, no BOM).

## Manifest verification

On Linux / macOS:
    sha256sum -c manifest.sha256

On Windows (PowerShell 5+):
    Get-ChildItem -File -Exclude manifest.sha256 | ForEach-Object { certutil -hashfile .FullName SHA256 }

Source of truth: raw LF file bytes. Git blob bytes are subject to system-wide core.autocrlf=true on Windows and may differ from LF manifest hash.

## Boundaries (confirmed)

- No edits to frozen CRM contracts @hrp-engagement/contracts@0.0.8-g0.8-fixes.
- No edits to CRM source code (apps/**, packages/**, scripts/**).
- No bootstrap / tag / publish / merge / force-push / deploy.
- No opening of HRP endpoint implementation on the CRM side.
- No independent Auditor PASS.
- No promotion of any module to ACCEPTED_SHARED.
- No request that HRP build a new endpoint in this task.
- No assumption that HRP source domain lacks all capability based on one route gap.
- No use of updatedAt as snapshotVersion.
- No transmission of raw LaborProfileDetailDto as wire.
- No transmission of raw CCCD or phone to CRM.
- No CRM-side redaction (HRP redacts server-side).
- No self-decision on TTL / credential / algorithm policy (REC-002 territory).
- No auto-fill of laborProfileVersion with 0 or updatedAt without a contract change.
- No claim that UI ApiErrorCode is a shared wire contract.
- No claim that RLS-hidden-row-to-404 is confirmed deployed evidence for the S2S CRM path.

## Supersession

- r3 supersedes r1 (608d67d) and r2 (93a31ce).
- r1 and r2 remain immutable in Git history.
- No force-push per RECONCILIATION_PROTOCOL section 3.

## Stop

STOP — READY FOR T0 DESIGN REVIEW.