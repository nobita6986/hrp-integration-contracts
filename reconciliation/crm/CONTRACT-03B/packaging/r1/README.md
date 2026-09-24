# CONTRACT-03B.1: Packaging Candidate - README

**Bundle:** reconciliation/crm/CONTRACT-03B/packaging/r1/
**Branch:** codex/contract03b-packaging
**Base accepted candidate:** 2eb6bd155399d5e0490c5a2b0c5037a57dc36bc3
**Producer PASS evidence:** 371267aeee58a45891af468e6f4799ca6dd23b0e
**Bilateral acceptance:** Message-ID HRP-CRM-MSG-043, record 696acaefeabc031be060eeced877b46d5828f7f8

## Status

- SPEC_DESIGN: BILATERALLY_ACCEPTED
- EXECUTABLE_CONTRACT: BILATERALLY_ACCEPTED
- ACCEPTED_SHARED: NOT_YET_PROMOTED
- Runtime / consumer compatibility: NOT_EXECUTED
- Packaging candidate version: 0.0.0-candidate.0
- Package identity: @hrp-engagement/contracts
- Subpath: @hrp-engagement/contracts/talent-context-read/v1
- Branch isolation: branched from accepted candidate 2eb6bd1...; no history rewrite.
- Packaging source commit (P): 68c5fc729afb306f27266f8b08f8c63a671a446e
- Evidence commit (E): pending (to be committed after Phase 2)

## Scope summary

| Scope | Description | Status |
|-------|-------------|--------|
| A | Documentation cleanup (manifest.sha256 header, assertion.ts comments aligned with strict executable behavior) | DONE |
| B | Package identity + subpath @hrp-engagement/contracts/talent-context-read/v1 + export map (ESM JS + .d.ts) | DONE |
| C | Reproducible artifact via npm ci, npm run build, npm test, npm pack | DONE |
| D | Scratch consumer install + ESM import + tsc --strict --noEmit | DONE |
| E | Export-map comparison + CRM consumer inventory + handoff inputs for 03B.2 | DONE |

## Evidence files

- README.md (this file)
- PACKAGE-INVENTORY.md
- EXPORT-MAP.md
- TARBALL-EVIDENCE.md
- SCRATCH-CONSUMER-EVIDENCE.md
- COMPATIBILITY-PLAN.md
- AC-EVIDENCE.md
- manifest.sha256

## Hard prohibitions (no exceptions)

- npm publish
- Git tag / GitHub Release
- Promote ACCEPTED_SHARED
- Modify CRM consumers
- Consumer migration
- Runtime endpoint / JWT signer / key provisioning / replay store / delegation store / audit DB
- HRP auth/RLS changes
- Migration / pilot / production / deploy
- Self-issued Packaging PASS

## Stop at

**READY FOR CONTRACT-03B.2 CRM CONSUMER COMPATIBILITY REVIEW**
