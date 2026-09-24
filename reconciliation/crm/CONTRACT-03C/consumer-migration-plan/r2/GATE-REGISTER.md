# Gate Register — T0 gates + open blockers (r2 corrected per C-07)

## Gates

### G-03C.0 — Distribution decision (renamed from "release tag")
- Artifact identity confirmed by T0.
- ACCEPTED_SHARED is present.
- Only the distribution mechanism from CONTRACT-03C.1 is still pending.
- Status: OPEN — pending distribution decision from CONTRACT-03C.1.
- Owner: T0.

### G-03C.1 — Root regression design (corrected per C-02)
- T0 approves exact 379/379 parity test design.
- T0 confirms SCHEMA_VERSION and PACKAGE_VERSION are exact-string
  compared.
- T0 confirms representative round-trip probes are included, not just
  the export count.
- Status: OPEN.
- Owner: T0.

### G-03C.2 — Parser separation (corrected per C-03)
- T0 approves the three-parser API shape
  (`parseTalentContextReadRequest`,
   `parseTalentContextReadResult`,
   `parseTalentContextReadError`).
- T0 confirms no synthetic HRP error envelope is produced by any
  parser.
- T0 confirms the failure-mode taxonomy is:
  - local-validation-failure,
  - valid-hrp-error-envelope,
  - transport-runtime-failure.
- Status: OPEN.
- Owner: T0.

### G-03C.3 — Isolated port/mock (corrected per C-04)
- T0 confirms the read port and mock are isolated; no
  IntakeOrchestrator coupling.
- T0 confirms the route mock is gated (not default).
- T0 confirms no canonical mutation is performed by the port or
  route.
- Status: OPEN.
- Owner: T0.

### G-03C.4 — Browser harness actually runs (corrected per C-05)
- T0 confirms the browser regression runs and reaches its documented
  count (e.g. 9/9 or full existing UI suite).
- T0 confirms `NOT_VERIFIED` is NOT an accepted default fallback.
- T0 confirms no product change masks asset 404s from the scratch
  harness.
- Status: OPEN.
- Owner: T0.

### G-03C.5 — CLOSED_AS_DEFERRED (corrected per C-06)
- M6 owns NO production source file in r2.
- M6 status is `DEFERRED_SEPARATE_TASK`.
- G-03C.5 closure is conditional on the future M6 opening criteria:
  - HRP runtime specification delivered;
  - H.09 / Tier 3 sign-off;
  - Owner runtime gate opened.
- Status: CLOSED_AS_DEFERRED.
- Owner: T0 records closure.

## Open blockers

### B-01 — REMOVED
"Release tag required" is removed. PACKAGE_PUBLICATION is NOT_EXECUTED;
local migration does NOT depend on a published tag.

### B-02 — Distribution mechanism (renamed per C-01)
- Pending decision from CONTRACT-03C.1 (artifact-pinning task).
- Two valid options recorded in MIGRATION-SEQUENCE.md:
  - Option A: repo-local immutable reference;
  - Option B: replace workspace `packages/contracts` with full
    additive accepted source.
- Neither option is committed in r2.

### B-03 — Browser harness setup (renamed per C-05)
- This is a setup ITEM, not a default blocker.
- Setup must be performed before M5 may declare an environmental
  limitation.
- Playwright is installed; regression harness must be exercised.

### B-04 — HRP runtime specification (UNCHANGED but moved forward)
- M6 runtime implementation requires:
  - HRP runtime specification delivered;
  - H.09 / Tier 3 sign-off;
  - Owner runtime gate.
- B-04 remains OPEN. The whole M6 slice is moved to a future task.

## Gate-status table

| Gate | Status | Owner |
|---|---|---|
| G-03C.0 | OPEN — distribution decision | T0 |
| G-03C.1 | OPEN — exact 379/379 parity | T0 |
| G-03C.2 | OPEN — parser separation | T0 |
| G-03C.3 | OPEN — isolated port/mock | T0 |
| G-03C.4 | OPEN — browser harness runs | T0 |
| G-03C.5 | CLOSED_AS_DEFERRED | T0 |

No slice (M1..M5) executes while its corresponding gate is OPEN.

## M6 future gate (placeholder)
- G-03C.6 — Runtime implementation gate.
- Not yet defined. Opens only after HRP runtime specification,
  H.09 / Tier 3 sign-off, and owner runtime gate are aligned.