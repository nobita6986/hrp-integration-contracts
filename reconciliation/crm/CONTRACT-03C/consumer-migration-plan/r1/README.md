# CONTRACT-03C.2 — CRM Consumer Migration Plan

This directory contains the migration plan for adopting the additive
`@hrp-engagement/contracts/talent-context-read/v1` subpath in the HRP-CRM
workspace. The plan is DELIBERATELY not executed here; this bundle is
the design record and T0 review input.

## Authority
- HRP-CRM-MSG-045
- Acceptance commit: 1841c9354f361c4ac2bdb70a325c739c264262de
- Accepted module: @hrp-engagement/contracts/talent-context-read/v1
- Compatibility evidence: e7f90de7e6fb98c9e2900f00cc6b6265de712dc1
- Packaging source P2: b7505568957217184b225d99312066097c518fdc
- CRM baseline: 72643356a0d1355f9dccc3921b47c990ea9c31c1

## Branch
- codex/contract03c-consumer-migration-plan-r1
- Parent: 1841c9354f361c4ac2bdb70a325c739c264262de (acceptance commit)
- Predecessor chain: 1841c93 -> e7f90de -> 81a1000 (E3) -> f61ba01 -> be733bd -> b750556 (P2)

## Scope
- Plan-only delivery.
- No CRM code, package.json, or lockfile edits.
- No candidate installation in primary CRM.
- No consumer migration executed.
- No runtime HRP implementation.
- No npm publish/tag/release.
- No Docker, VPS, deploy, or production enablement.

## Files in this evidence directory
- README.md                  -- this index
- DEPENDENCY-INVENTORY.md    -- all package.json + lockfile inventory
- CONSUMER-MAP.md            -- per-consumer import map + future subpath plan
- MIGRATION-SEQUENCE.md      -- M1..M6 step plan with criteria and rollback
- FILE-CHANGE-PLAN.md        -- per-slice file diff plan
- TEST-PLAN.md               -- test matrix (root regression, subpath, builds,
                                 browser, mock behaviour, runtime = NOT_EXECUTED)
- ROLLBACK-PLAN.md           -- per-slice revert procedure
- GATE-REGISTER.md           -- gates needing T0 sign-off + open blockers
- manifest.sha256            -- raw SHA-256 manifest of this directory

## Manifest format
- Raw SHA-256, 64 lowercase hex per entry
- UTF-8 no BOM, LF line endings
- Repo-relative paths (this directory is `reconciliation/crm/CONTRACT-03C/consumer-migration-plan/r1`)
- No self-hash (manifest.sha256 is excluded from the entries)
- No machine paths, logs, node_modules, dist, scratch output

## Status
- Plan recorded across 6 slices (M1..M6).
- All slice entries identify: files, command, acceptance criteria, rollback,
  risks, T0 gate, and what can be verified locally without Docker.
- No slice executes code; all execution paths are conditional on T0 sign-off
  in GATE-REGISTER.md.

READY FOR T0 MIGRATION PLAN REVIEW.