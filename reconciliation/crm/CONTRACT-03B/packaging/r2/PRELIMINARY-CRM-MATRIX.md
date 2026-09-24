# Preliminary CRM Scratch Matrix

## Setup
For each consumer, the candidate tarball was installed into the consumer's
local node_modules via:
    npm install --no-save <TARBALL>

Where TARBALL = hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz
(SHA-256: b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc).

This temporarily replaces @hrp-engagement/contracts (which the consumer
otherwise resolves to packages/contracts via file:) with the new
candidate. No consumer source was modified.

After each test, npm install (no args) was used to revert the dep.

## Result summary

Consumer                          Baseline build     With r2 candidate     Notes
packages/config                   PASS (exit 0)      PASS (exit 0)         TypeScript strict tsc
packages/integration-store        PASS (exit 0)      PASS (exit 0)         tsc
apps/integration-worker           PASS (exit 0)      PASS (exit 0)         tsc
apps/integration-api              PASS (exit 0)      PASS (exit 0)         tsc
apps/context-panel                PASS (tsc only)    PASS (tsc only)       npm run build also runs UI build; we tested tsc only since UI build is unrelated
apps/core-1.10-media              PASS (exit 0)      PASS (exit 0)         tsc

All six consumers return to baseline build behavior.

## Per-consumer detail

### packages/config
- Baseline: tsc exit 0
- Candidate: tsc exit 0 (after npm install of candidate tarball)
- Imports from @hrp-engagement/contracts resolve correctly
- No new errors emitted

### packages/integration-store
- Baseline: tsc exit 0
- Candidate: tsc exit 0
- Prisma + Zod imports resolve from root surface
- No type errors

### apps/integration-worker
- Baseline: tsc exit 0
- Candidate: tsc exit 0
- Worker uses many root command constructors (intake, outbox, etc.) -- all
  still exported under same names

### apps/integration-api
- Baseline: tsc exit 0
- Candidate: tsc exit 0
- API surface unchanged

### apps/context-panel
- Baseline: full npm run build runs tsc && npm run build:ui; UI build
  is unrelated to contracts and we tested tsc only
- Candidate: npx tsc --noEmit exit 0
- The new subpath is not imported by context-panel yet (no migration done;
  per task constraints, no consumer migration in r2)

### apps/core-1.10-media
- Baseline: tsc exit 0
- Candidate: tsc exit 0

## What this matrix DOES NOT prove
- This matrix only proves TypeScript compilation parity.
- It does not yet prove runtime behavior under the candidate (would
  require a separate runtime scratch test that loads the consumer code
  against the candidate's runtime).
- This matrix does not migrate any consumer to the new subpath
  (intentional -- per task constraints: no CRM consumer modification
  to make the candidate pass; no consumer migration in r2).

## Failure interpretation
If any of the six had failed (exit != 0), this matrix would have been
returned as CHANGES_REQUIRED. All passed, so the additive packaging
satisfies the consumer build compatibility requirement of the previous
verdict.

## Scratch artifact location (machine reference; not packaged)
The candidate tarball used here was built from P2 inputs at:
  packages/publish-candidate/hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz
SHA-256: b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc

CRM baseline (HEAD at evidence creation):
  72643356a0d1355f9dccc3921b47c990ea9c31c1

Note: machine paths are recorded only for traceability of where the
scratch tests were run. They are not part of the published package and
not required for verification.
