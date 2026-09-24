# Correction Ledger — CONTRACT-03C.2 r2 (correction batch)

This r2 directory supersedes r1 only on the points listed below.
r1 evidence at `691f6630cb0bde0cdb70e0c315473ae23215a197` is preserved
verbatim and remains a valid audit trail of the original planning
attempt.

## Source
- T0 verdict on r1: CHANGES_REQUIRED (architecture/planning only).
- T1-A base: 691f6630cb0bde0cdb70e0c315473ae23215a197
- No re-survey of inventory; no CRM edits; no candidate install;
  no M1..M6 execution; no publish/tag/release; no runtime, no Docker,
  no VPS, no deploy.

## C-01 Distribution gate
- Drop the "stable npm tag required before local migration" requirement.
- PACKAGE_PUBLICATION remains NOT_EXECUTED.
- Do NOT reference `.scratch-pkg/*.tgz` from any committed package.json —
  that path is local-only and not reproducible across clones.
- M1 records two valid distribution options pending CONTRACT-03C.1
  decision. T1-A does NOT pick A or B before the artifact-pinning
  handoff:
  - Option A: repo-local immutable artifact/reference produced by the
    artifact-pinning task.
  - Option B: replace workspace `packages/contracts` with the full
    additive accepted source in a separate migration PR; keep every
    existing `file:` dependency.
- M1 status: BLOCKED_BY_DISTRIBUTION_DECISION (not "blocked by release
  tag").

## C-02 Root regression
- Root export parity MUST compare the candidate root set against the
  baseline 379-name set with exact equality (=== 379/379).
- Do NOT use `>= 379`. Adding an export to a frozen root is also drift.
- Verify SCHEMA_VERSION exactly (`"1"`).
- Verify PACKAGE_VERSION exactly (`"0.0.8-g0.8-fixes"`).
- Test a set of representative root validators/serializers, not just
  the export count.

## C-03 Adapter semantics
- Replace the planned API with separate parsers. Each parser:
  - uses the exact exported schema from the accepted subpath;
  - returns a safe-parse / discriminated local validation result;
  - does NOT synthesize or fake an HRP wire error when local input
    parsing fails;
  - does NOT duplicate a schema/type;
  - does NOT call a provider.
- Planned parsers (subject to T0 review):
  - `parseTalentContextReadRequest(raw)`
  - `parseTalentContextReadResult(raw)`
  - `parseTalentContextReadError(raw)`
- Three failure modes are explicitly distinguished:
  - local validation failure (parser-returned; not an HRP wire error);
  - valid HRP error envelope (parsed from a real HRP response);
  - transport / runtime failure (raised, never fabricated).

## C-04 Do not couple to IntakeOrchestrator
- Remove the plan to edit `intake-orchestrator.ts`.
- `TalentContextRead` is a separate query boundary, not an intake step.
- M4 proposes an isolated CRM port/service: `TalentContextReadPort`,
  with a deterministic mock implementation.
- Any HTTP route for local UI goes in a separate route mock with:
  - mock-mode guard;
  - actor/org boundary enforcement;
  - no default activation;
  - no canonical mutation.
- Do NOT alter the intake state machine or checkpoint semantics.

## C-05 Browser plan
- Playwright is installed and previously ran green.
- Drop wording that permits `NOT_VERIFIED` by default when Playwright
  is unavailable.
- M5 must:
  - normalize scratch static asset paths;
  - build UI;
  - boot server;
  - run browser regression;
  - target 9/9 or the full existing UI suite.
- An environmental limitation may only be recorded AFTER the harness
  has been correctly set up and STILL fails. Belt-and-braces fallback
  is not allowed.
- Do NOT change product behaviour to mask asset 404s in the scratch
  harness.

## C-06 Runtime slice M6
- Do NOT create `talent-context-read-runtime.ts` with callable
  functions that always throw.
- M6 in the r2 plan is documentation / interface proposal only.
- No production source, no fake runtime tests.
- Runtime implementation opens only after:
  - HRP runtime specification;
  - H.09 / Tier 3 sign-off;
  - Owner runtime gate.
- M6 status: `DEFERRED_SEPARATE_TASK`.

## C-07 Gate cleanup
See `GATE-REGISTER.md` in this r2 directory for the updated register.

Highlights:
- G-03C.0: artifact identity confirmed by T0; ACCEPTED_SHARED present;
  only distribution mechanism from CONTRACT-03C.1 is still pending.
- G-03C.1: exact 379/379 parity, not `>= 379`.
- G-03C.2: parser-separation approval; no synthetic HRP error.
- G-03C.3: isolated read port/mock; no IntakeOrchestrator coupling.
- G-03C.4: browser harness must actually run.
- G-03C.5: CLOSED_AS_DEFERRED; no executable stub.

## C-08 File plan
- M1: no committed package.json/lockfile change is listed yet; the
  actual diff is deferred until distribution mechanism is chosen.
- M3: only isolated adapter/parser files added.
- M4: isolated port/mock/service/test; no edits to intake orchestrator.
- M5: regression only; no UI feature outside scope.
- M6: NO production source file.

## Correspondence with r1
- r1 is preserved at the same branch path
  `reconciliation/crm/CONTRACT-03C/consumer-migration-plan/r1/`.
- r2 replaces r1 as the active plan for review.
- r1 audit-trail entries remain readable for diffing; r2 doc text is
  the canonical record going forward.

## Status
READY FOR T0 MIGRATION PLAN RECHECK.