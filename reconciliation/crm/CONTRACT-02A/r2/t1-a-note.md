# Note for T1-A (Chatwoot POC)

From T1-B (CRM reconciliation slice brief owner). Not a directive; an information note. T1-A scope is P9/B.01 only.

## 1. T1-A actual assigned scope: P9/B.01 only

Per Implementation-Backlog.HRP-Owned-V7.9b-f.md §B.01:
- B.01: Pin release/edition va trien khai POC co lap.
  Output: ADR release/license/capabilities, isolated deployment/config/runbook.
  Dependency: V7.9a.
  AC:
  (1) Mot account cong ty, API inbox test, it nhat hai agents/test roles; secrets khong commit, DB/Redis khong mo public.
  (2) Xac minh edition ho tro scopes/panel/assignment/branding thuc te; unsupported features khong duoc ha san.
  (3) Backup/restore co ban va upgrade/rollback thu o POC; chua du lieu khach/CCCD that.

CR-15, CR-16, CR-17 corrections: B.01 does NOT include:
- Intake form or review (this is B.04).
- Canonical mutation commands (createOrMatchLaborProfile, openPlacementCase, updatePlacementCase, closePlacementCase, recordInteraction, updateNextAction, updateLaborAvailability).
- Context panel with HRP real data (this is B.03 thin-slice brief).
- Chatwoot webhook signature verification (this is B.02 — B.01 does not establish webhook signature; protocol must be verified per B.02 edition/release).
- Suppression (CRM channel/contact/connection suppression is a separate task; REC-001-OPS OPEN/PROPOSED, not B.01 scope).
- Routing decision (this is B.05).
- Client-context panel (Owner decision pending; not in this phase).

## 2. What B.01 is actually doing (synthetic, local/test)

B.01 POC with synthetic accounts (test data only, no real customer PII):
- Chatwoot test account setup (isolated from production).
- API inbox test with test agents and roles.
- Edition capability verification: check which Chatwoot features are available in the test edition.
- Backup/restore rehearsal at POC level.
- Upgrade/rollback procedure testing.

Note: B.01 AC explicitly requires verifying edition capabilities. Do not assume Chatwoot provides webhook signature verification capability until B.01 verifies it in the test edition.

## 3. What B.01 must NOT assume

T1-A must NOT assume any of the following from this CONTRACT-02A bundle:

- ACCEPTED_SHARED status. It is 0. No module is bilaterally accepted.
- HRP_IMPLEMENTED status. It is 0. No HRP baseline SHA proves runtime.
- REC-001 APPROVED grants runtime / deployment right. REC-001 is domain authority only; REC-001-OPS is OPEN/PROPOSED.
- PlacementCase mapping is resolved. It is UNRESOLVED per HRP r3 GAP_REPORT §17 + supplement §C.
- HRP r3 GAP_REPORT function names (updateAvailability / findOrCreateLaborProfile / updateStatus) exist at HRP baseline 1059f666. Supplement a0cd30e marks them NOT_VERIFIED / NOT_FOUND_IN_SURVEY_SCOPE.
- AFF-03B is deployed. It is Pending per HRP baseline JSON pendingDeltas entry.
- Chatwoot webhook signature verification is available in the test edition. B.01 must verify this per AC (2).
- That the POC can write to frozen CRM contracts. It cannot (frozen at @hrp-engagement/contracts@0.0.8-g0.8-fixes).
- That B.01 scope extends to any canonical HRP workflow. Only the synthetic Chatwoot test account and edition verification are in scope.

## 4. What the POC continues to mock

T1-A continues to mock (with clear labels) within B.01 scope:
- Chatwoot test account configuration and inbox setup.
- Agent assignment simulation (test roles only).
- Edition capability check (mock capabilities not yet verified in the test edition).

Do not mock canonical HRP data in B.01. B.01 is about Chatwoot infrastructure and edition verification, not about HRP data.

## 5. Canonical HRP paths that follow B.01 (separate briefs)

Canonical HRP paths (intake, context panel, suppression, routing, etc.) are addressed in the thin-slice brief at reconciliation/crm/CONTRACT-02A/r2/thin-slice-brief.md. Those paths follow their own briefs and readiness gates.

Only real HRP paths are subject to the H.09 readiness gate. B.01 POC is not a real HRP path; it is Chatwoot infrastructure verification.

## 6. Boundaries for T1-A

- No edits to frozen contracts @hrp-engagement/contracts@0.0.8-g0.8-fixes.
- No edits to docs/contracts/inventory.md pre-existing delta.
- No edits to apps/context-panel or other CRM source unless explicitly authorized.
- No edits to packages/**, scripts/v7.9a/**.
- No PR / merge / push to neutral repo hrp-integration-contracts.git (owned by T1-B).
- No tag / publish / deploy of contracts.
- No implementation of HRP endpoints on the CRM side.
- No assumption that Chatwoot POC success implies canonical HRP integration readiness.

