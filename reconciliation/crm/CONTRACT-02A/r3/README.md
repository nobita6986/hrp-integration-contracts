# CRM CONTRACT-02A Evidence Bundle (r3) — Reconciliation slice brief (REVISED)

## Provenance

- CRM repository: https://github.com/nobita6986/HRP-CRM.git
- CRM baseline (full SHA): 72643356a0d1355f9dccc3921b47c990ea9c31c1
- CRM frozen package: @hrp-engagement/contracts@0.0.8-g0.8-fixes
- Source workspace: D:\\CodeApp\\Hrp-Crm
- Branch: evidence/crm-contract-02a-r1
- Revision: r3 (supersedes r2 dd8c048c586df84bf14100b93b277f8085b0af7e)
- Layer: T1-B (CRM reconciliation slice brief owner); does not speak for T0 HRP or independent Auditor.
- HRP evidence consumed (read-only):
  HRP r3 @ 2ee99394a210fc51125523ceef9020812f893be2
  HRP r3 supplement @ a0cd30e04a86a80975824f23208a9e3ecfc29cbd
  HRP REC-001 decision @ 2accd9a183333b412203e3dfb155893579afa47a
  HRP baseline 1059f6669482efac5b7956ef25d43996ca59d515

## Revision note (r2 -> r3)

T0 verdict on r2: CHANGES_REQUIRED (6 corrections: CR-2-1 through CR-2-12). r3 applies all corrections.

1. thin-slice-brief.md §4: Every symbol/field claim cites a line range in queries.ts / profile.ts / enums.ts / primitives.ts and refers to pinned Git blob hash 72643356. Each sub-schema is quoted verbatim with the actual field list. ContextQueryRequestSchema (queries.ts L131) is identified as the actual read-context request. ReadOnlyIdentityPreviewRequestSchema (queries.ts L361) is identified as the identity-preview request and noted as OUT OF SCOPE for B.03. ContextPanelSuppressionSummarySchema (queries.ts L299-310) fields are corrected to the actual source: schemaVersion, suppressionEventId (optional), reason (required), committedAt (required), fenceCutOffAt (optional).

2. Gate/auth: Real path requires auth design accepted, implementation evidence, and slice readiness gate. REC-002 OPEN/PROPOSED is not sufficient. Planning/mock path is not blocked.

3. Dependencies: Backlog-level milestone dependencies (H.01/H.02/H.08/H.09) are listed as backlog input for T0 arbitration. Coder does NOT self-promote milestone acceptance as a gate on this slice. Real path requirements are listed separately.

4. hrp-questions.md: 4 active questions (Q-A1 through Q-A4). Q-A3 reframed: canonical object authorization MUST be enforced server-side by HRP (not a choice). Q-A4 corrected: snapshotVersion semantic is HRP-owned; CRM does NOT assume monotonicity or generic cache semantics. Q-A5 moved to DEFERRED/optional; CRM does NOT self-decide where union is evaluated; REC-001-OPS not reopened.

5. Git/encoding/scope: Root .gitattributes has been removed (it was overreaching — it affected the entire repo). If a bundle-local attribute file is needed, it lives under the bundle directory only.

6. Self-check: r3 re-reads source files (queries.ts / profile.ts / enums.ts / primitives.ts) for every symbol cited, with line ranges. Field descriptions are quoted verbatim from source where possible; non-quoted observations are clearly labeled as Coder observation (not source claim).

Full correction ledger: see CORRECTION-LEDGER.md.

## Scope (Owner prompt D)

This bundle is the CRM-side reconciliation slice brief. It contains:
- Owner decision acknowledgement for HRP-CRM-REC-001 (APPROVED for domain authority; REC-001-OPS OPEN/PROPOSED).
- Thin-slice brief for the B.03 read-only Talent context path; explicitly NOT intake / merge / case / outbound.
- 4 active questions for HRP T0 (Q-A1 through Q-A4) + 1 optional/DEFERRED question (Q-A5).
- Note for T1-A clarifying that T1-A scope is B.01 only (Chatwoot POC, synthetic, edition verification) AND that T1-A additional scope (CI/CD, VPS deployment process) is preserved.
- Correction ledger documenting all changes from r2.

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
- No self-decision on where the suppression union is evaluated.
- No force-push / rewrite of r1 / r2 commits.

## Files in this bundle

1. CORRECTION-LEDGER.md: Itemized list of all factual corrections from r2. CR-2-1 through CR-2-12.
2. owner-decision-rec-001-record.md: CRM-side acknowledgement of HRP-CRM-REC-001 (APPROVED). Distinguishes four separate concepts (Owner decision, evidence ACK, bilateral wire acceptance, runtime implementation).
3. thin-slice-brief.md: B.03 read-only Talent context proposal. §4 cites actual schemas from queries.ts / profile.ts / enums.ts / primitives.ts with line ranges and verbatim excerpts.
4. hrp-questions.md: 4 active questions (Q-A1 through Q-A4) for HRP T0. Q-A5 DEFERRED/optional. No design questions.
5. t1-a-note.md: Information note for T1-A. Scope is P9/B.01 only. T1-A additional scope (CI/CD, VPS) preserved.
6. manifest.sha256: SHA-256 of files in this bundle (UTF-8, LF, no BOM). Excludes itself.

## Manifest verification

On Linux / macOS:

    cd reconciliation/crm/CONTRACT-02A/r3
    sha256sum -c manifest.sha256

On Windows (PowerShell 5+):

    Get-ChildItem -Recurse -File -Exclude manifest.sha256 | ForEach-Object { certutil -hashfile .FullName SHA256 | Select-Object -Skip 1 -First 1 }

Source of truth for SHA-256: the raw LF file bytes. Local LF manifest SHA-256 matches the value reported in the T0 handoff (7fc71bcf...). Git blob bytes are subject to system-wide core.autocrlf=true on Windows and may differ from the LF manifest hash; that is a Windows Git storage property, not a normalization that other platforms perform.

## Supersession / revision pinning

- r3 supersedes r2 (dd8c048c586df84bf14100b93b277f8085b0af7e).
- r2 supersedes r1 (89dabd9e65836c521137ccea5ab9b391f1d3982a).
- r1 remains immutable in Git history.
- r2 remains immutable in Git history.
- No force-push per RECONCILIATION_PROTOCOL §3.
