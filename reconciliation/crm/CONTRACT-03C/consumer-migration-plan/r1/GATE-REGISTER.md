# Gate Register — T0 gates + open blockers

## Gates needing T0 sign-off before each slice can proceed

### Gate G-03C.0 (before M1)
- [ ] T0 confirms the candidate tarball identity matches the brief:
      169360 bytes, SHA-256 b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc,
      npm shasum 4713b1ce639acdc070a9fa95f868bc08b99d0f9b,
      79 files.
- [ ] T0 confirms the candidate has been promoted to a release tag
      (or T0 explicitly approves the tarball reference path for CRM).
- [ ] T0 confirms the workspace `packages/contracts` is approved for
      additive replacement (vs tarball reference).

### Gate G-03C.1 (before M2)
- [ ] T0 approves the regression-test design (>=379 export assertion,
      not == 379, to avoid coupling).
- [ ] T0 confirms the pre-existing 3 context-panel manifest-readonly
      fails are tracked separately and are NOT counted as M2 regressions.

### Gate G-03C.2 (before M3)
- [ ] T0 reviews the adapter API surface and approves the discriminated
      `{ ok, query } | { ok, error }` shape.
- [ ] T0 confirms the adapter does NOT execute any provider, runtime,
      or HRP integration in M3 (pure Zod parser only).
- [ ] T0 confirms no schema/type duplication in CRM is allowed in M3.

### Gate G-03C.3 (before M4)
- [ ] T0 confirms the mock is gated behind `HRP_MOCK_MODE=deterministic`
      or an explicit factory option, NOT a default.
- [ ] T0 confirms all mock names go through `redactFullName` BEFORE
      being placed in the result envelope.
- [ ] T0 confirms the orchestrator edit does not change existing
      behaviour when `hrpRead` is unset.

### Gate G-03C.4 (before M5)
- [ ] T0 confirms the candidate-induced-fails count is the canonical
      success metric for M5 (target: 0).
- [ ] T0 confirms browser tests may be marked NOT_VERIFIED if Playwright
      is unavailable in the env.

### Gate G-03C.5 (before M6)
- [ ] T0 reviews the runtime interface boundary.
- [ ] T0 confirms the runtime interface file is sketch-only with
      `throw new Error("not implemented")` for any callable.
- [ ] T0 confirms all runtime tests in M6 are NOT_EXECUTED and remain so.

## Open blockers

### Blocker B-01: Tarball promotion
- The r2 candidate is at `0.0.0-r2-candidate.0`. T0 must promote it to
  a stable tag (e.g. `0.0.8-g0.8-tcr-v1.0.0`) before CRM can use it in
  M1 (production-aligned install path).
- Workaround: tarball install in M1 (already validated by compatibility
  evidence `e7f90de`).

### Blocker B-02: Workspace contracts replacement
- M1 Option A (workspace replacement) requires changing the
  `packages/contracts` workspace copy. This is a structural change
  that may affect the contracts package's own test/build pipeline.
- Workaround: tarball install (Option B).

### Blocker B-03: Browser env
- M5 browser checks depend on Playwright being available. If not,
  document as NOT_VERIFIED and rely on `npm run build:ui` output.

### Blocker B-04: HRP runtime contract
- M6 requires an HRP runtime interface specification that does not yet
  exist in the contracts package. The CRM plan defines a sketch; T0
  must ratify the sketch or supply an alternative.

## Gate status

| Gate | Status | Owner |
|---|---|---|
| G-03C.0 | OPEN | T0 |
| G-03C.1 | OPEN | T0 |
| G-03C.2 | OPEN | T0 |
| G-03C.3 | OPEN | T0 |
| G-03C.4 | OPEN | T0 |
| G-03C.5 | OPEN | T0 |

All gates are OPEN. None of M1..M6 may execute until the corresponding
gate is signed off by T0.