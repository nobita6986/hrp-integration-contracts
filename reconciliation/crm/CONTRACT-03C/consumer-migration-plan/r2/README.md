# CONTRACT-03C.2 r2 — CRM Consumer Migration Plan

Corrections to the r1 plan, applied per T0 verdict `CHANGES_REQUIRED`.
No re-survey of inventory. Plan-only delivery; no CRM code edits, no
candidate install, no M1..M6 execution, no publish/tag/release, no
runtime, no Docker, no VPS, no deploy.

## Authority
- HRP-CRM-MSG-045
- Acceptance commit: 1841c9354f361c4ac2bdb70a325c739c264262de
- Accepted module: `@hrp-engagement/contracts/talent-context-read/v1`
- Packaging source P2: b7505568957217184b225d99312066097c518fdc
- Compatibility evidence: e7f90de7e6fb98c9e2900f00cc6b6265de712dc1
- CRM baseline: 72643356a0d1355f9dccc3921b47c990ea9c31c1
- r1 plan: 691f6630cb0bde0cdb70e0c315473ae23215a197 (preserved)
- r2 plan: this commit (corrections applied per CORRECTION-LEDGER.md)

## Branch
- codex/contract03c-consumer-migration-plan-r1 (unchanged)
- Worktree HEAD at handoff: see handoff message.

## Files in this evidence directory
- README.md                  -- this index
- CORRECTION-LEDGER.md       -- per-correction audit trail (C-01..C-08)
- DEPENDENCY-INVENTORY.md    -- identical to r1; unchanged
- CONSUMER-MAP.md            -- identical to r1; unchanged
- MIGRATION-SEQUENCE.md      -- rewritten for C-01..C-06
- FILE-CHANGE-PLAN.md        -- rewritten for C-01/C-04/C-06/C-08
- TEST-PLAN.md               -- rewritten for C-02/C-05
- ROLLBACK-PLAN.md           -- rewritten to match new FILE-CHANGE-PLAN
- GATE-REGISTER.md           -- rewritten for C-07
- manifest.sha256            -- SHA-256 of all sibling files (no self-hash)

Unchanged files in r1 versus r2 are intentional; the inventory is a
read-only observation and was not re-surveyed. Their content has
been carried forward as-is to preserve the audit trail.

## Manifest format
- Raw SHA-256, 64 lowercase hex per entry.
- UTF-8 no BOM, LF line endings.
- Repo-relative paths; this directory is
  `reconciliation/crm/CONTRACT-03C/consumer-migration-plan/r2`.
- No self-hash (`manifest.sha256` is excluded from the entries).

## Major changes vs r1 (full detail in CORRECTION-LEDGER.md)
- C-01: M1 distribution-decision deferred to CONTRACT-03C.1; no tarball
  path committed to any package.json.
- C-02: root regression uses exact 379-name set equality; not `>= 379`.
- C-03: adapter split into three parsers; no synthetic HRP errors.
- C-04: no intake-orchestrator edit; isolated TalentContextReadPort.
- C-05: browser harness must actually run; NOT_VERIFIED is not a
  default fallback.
- C-06: M6 redefined as documentation only; DEFERRED_SEPARATE_TASK.
- C-07: gate register updated to match new architecture.
- C-08: file plan updated; no committed package.json/lockfile change
  in M1 until distribution is decided.

## Status
READY FOR T0 MIGRATION PLAN RECHECK.