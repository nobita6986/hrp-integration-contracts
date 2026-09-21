# CONTRACT-02B Evidence Bundle (r1) — Minimal Talent Read Contract Proposal

## Provenance

- CRM repository: https://github.com/nobita6986/HRP-CRM.git
- CRM baseline (full SHA): 72643356a0d1355f9dccc3921b47c990ea9c31c1
- CRM frozen package: @hrp-engagement/contracts@0.0.8-g0.8-fixes
- Source workspace: D:\\CodeApp\\Hrp-Crm
- Predecessor (CONTRACT-02A r3): d91d07f517782643666ab01cce78bdf5424073ab
- HRP evidence response r3 (input): 61fd3a4236bd71d891f7e5030beafbd08ccdc505
- HRP baseline (current): a49ceaa83ffa986bf939823a4e9f2c803a0649d6
- HRP baseline (previous, immutable): 1059f6669482efac5b7956ef25d43996ca59d515
- HRP REC-001 decision: 2accd9a183333b412203e3dfb155893579afa47a
- Branch: evidence/crm-contract-02b-r1
- Revision: r1 (first revision of CONTRACT-02B)
- Layer: T1-B (CRM reconciliation slice brief owner); does not speak for HRP T0 or independent Auditor.

## Scope

CRM-side proposal for a minimal Talent read contract on the HRP-CRM B.03 real path. Output is proposal only; no code, no frozen-contract changes, no consumer migration.

Contents:
- PROPOSAL.md: Sections 1-5 (field mapping, minimal slice, auth/authorization, AC, ownership/dependencies).
- HRP-FIELD-MAPPING.md: Detailed mapping table with line references (queries.ts, primitives.ts, enums.ts, route.ts, read-service.ts, jwt.ts, etc.).
- CHANGE-PROPOSALS.md: CP1..CP8 itemized change proposals for T0 arbitration.
- ACCEPTANCE-CRITERIA.md: AC-1..AC-33 detailed acceptance criteria for future implementation.
- manifest.sha256: SHA-256 of files in this bundle (UTF-8, LF, no BOM). Excludes itself.

## Boundaries (confirmed, not relaxed)

- No edits to frozen CRM contracts @hrp-engagement/contracts@0.0.8-g0.8-fixes.
- No edits to CRM source code (apps/**, packages/**, scripts/v7.9a/**).
- No edits to docs/contracts/inventory.md pre-existing delta.
- No bootstrap of neutral package.
- No tag, publish, merge, force-push, deploy.
- No opening of HRP endpoint implementation on the CRM side.
- No independent Auditor PASS.
- No promotion of any module to ACCEPTED_SHARED.
- No request that HRP build a new endpoint in this task.
- No assumption that HRP source domain lacks all capability based on one route gap.
- No use of updatedAt as snapshotVersion.
- No transmission of raw LaborProfileDetailDto as wire.
- No transmission of raw CCCD/phone to CRM.
- No CRM-side redaction (HRP redacts server-side).
- No self-decision on TTL / credential / algorithm policy (REC-002 territory).

## Manifest verification

On Linux / macOS:

    cd reconciliation/crm/CONTRACT-02B/r1
    sha256sum -c manifest.sha256

On Windows (PowerShell 5+):

    Get-ChildItem -Recurse -File -Exclude manifest.sha256 | ForEach-Object { certutil -hashfile .FullName SHA256 | Select-Object -Skip 1 -First 1 }

Source of truth for SHA-256: the raw LF file bytes. Local LF manifest SHA-256 matches the value reported in the handoff. Git blob bytes are subject to system-wide core.autocrlf=true on Windows and may differ from the LF manifest hash.

## Supersession / revision pinning

- r1 is the first revision of CONTRACT-02B.
- Predecessor (CONTRACT-02A r3): d91d07f (immutable in Git history).
- Input (HRP response r3): 61fd3a4 (immutable in Git history).
- No force-push per RECONCILIATION_PROTOCOL §3.

## Stop

STOP — READY FOR T0 DESIGN REVIEW.
