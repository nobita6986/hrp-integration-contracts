# CONTRACT-03B.2 r2 Evidence Bundle

This directory contains the consumer compatibility evidence bundle for the
@hrp-engagement/contracts@0.0.0-r2-candidate.0 additive r2 candidate,
delivered by T1-A for T0 review.

## Branch
- codex/contract03b-consumer-compatibility-r2
- Created from E3 (81a1000efac3d244add07568f69cd63554fa3eff)

## Commits / ancestry
- Parent: 81a1000efac3d244add07568f69cd63554fa3eff (E3 — evidence closure)
- E3 parent: f61ba01fe7addd70db76836782a41f49e0371035
- P2 (packaging source): b7505568957217184b225d99312066097c518fdc (ancestor of E3)

## Artifact identity
- Package: @hrp-engagement/contracts@0.0.0-r2-candidate.0
- Tarball: hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz
- Size: 169360 bytes
- SHA-256: b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc
- npm shasum: 4713b1ce639acdc070a9fa95f868bc08b99d0f9b
- File count: 79
- Built from: clean checkout of P2 (b7505568...)

## CRM baseline
- Repo: nobita6986/HRP-CRM
- Baseline commit: 72643356a0d1355f9dccc3921b47c990ea9c31c1
- Primary CRM working tree at handoff: untouched (still at baseline HEAD; no
  changes propagated from scratch)

## Scratch environment
- Local Windows only
- OS: Microsoft Windows 10.0.26200; PowerShell 7
- No Docker, no WSL, no VPS, no deploy
- Scratch paths inside r2 worktree (no machine-specific paths in evidence)

## Files in this evidence directory
- README.md                      -- this index
- TARBALL-VERIFICATION.md        -- Phase 1 (tarball reproducibility)
- BASELINE-EVIDENCE.md           -- Phase 2 (CRM clean scratch state)
- CRM-CONSUMER-INVENTORY.md      -- Phase 3 (6-consumer inventory + lockfile delta)
- BUILD-TEST-MATRIX.md           -- Phase 4 (per-consumer build+test matrix)
- ROOT-COMPATIBILITY.md          -- Phase 5 (root parity 379/379 + no leak)
- SUBPATH-PROBE.md               -- Phase 6 (subpath ESM + TS probe)
- BROWSER-EVIDENCE.md            -- Phase 7 (browser bundle + panel boot)
- MIGRATION-PLAN.md              -- Phase 5 migration analysis
- LIMITATIONS.md                 -- out-of-scope items + pre-existing failures
- manifest.sha256                -- raw SHA-256 manifest of this directory

## Manifest format
- Raw SHA-256, 64 lowercase hex
- UTF-8 no BOM, LF line endings
- Repo-relative paths
- No self-hash
- Excludes: machine-specific paths, tarball, logs, node_modules, dist, scratch output

## Verdict categories (Phase 8)
1. ROOT_EXPORT_BACKWARD_COMPATIBILITY        -- PASS (379/379 identical, 0 drift)
2. NEW_SUBPATH_RUNTIME_COMPATIBILITY         -- PASS (21/21 runtime checks)
3. TYPESCRIPT_DECLARATION_COMPATIBILITY      -- PASS (strict declarations resolve)
4. CRM_BUILD_COMPATIBILITY                   -- PASS (6/6 consumers build clean)
5. CRM_TEST_COMPATIBILITY                    -- PASS (>=1212/1212 relevant tests,
                                                 identical to baseline,
                                                 only 3 pre-existing fails)
6. BROWSER_BUNDLE_COMPATIBILITY              -- PARTIAL (bundle generated, page
                                                 boots, panels navigable; 4/9
                                                 detailed checks pass)
7. RUNTIME_HRP_COMPATIBILITY                 -- NOT_EXECUTED (out of scope)
8. PRODUCTION_COMPATIBILITY                  -- NOT_EXECUTED (out of scope)