# Note for T1-A (Chatwoot POC)

From T1-B (CRM reconciliation slice brief owner). Not a directive; an information note. T1-A continues the Chatwoot POC scope unchanged.

## 1. Fields / capabilities being simulated by the POC (and their limits)

Per Implementation-Backlog.HRP-Owned-V7.9b-f.md §B.01-B.06 and the thin-slice brief at reconciliation/crm/CONTRACT-02A/r1/thin-slice-brief.md, the POC is allowed to mock the following, with clear labels:

- Talent context panel: displayName, currentAvailability (enum), currentRelationship (enum), nextAction summary.
- Chatwoot inbox + assignment labels (subject to B.01 edition verification).
- Inbound event authority (B.02) using Chatwoot webhook signature verification at POC.
- Local suppression at channel/contact/connection level (CRM-side only, per REC-001 APPROVED scope).

Limits:

- CCCD / address / raw transcript fields: NOT in POC; residency C.05 not delivered.
- Canonical mutation commands (createOrMatchLaborProfile, openPlacementCase, updatePlacementCase, closePlacementCase, recordInteraction, updateNextAction, updateLaborAvailability): NOT in POC; require P9/H tasks delivered and H.09 gate.
- Outbound / broadcast / DNC release: NOT in POC; D.04 not delivered.
- Analytics / BoD aggregate: NOT in POC; Phase 10 backlog separate.
- Client-context panel: UNAVAILABLE in POC; Client domain not chot by Owner.

## 2. Items in the new CRM-side CONTRACT-02A bundle that POC must NOT assume

T1-A must NOT assume any of the following from this CONTRACT-02A bundle:

- ACCEPTED_SHARED status. It is 0. No module is bilaterally accepted.
- HRP_IMPLEMENTED status. It is 0. No HRP baseline SHA proves runtime.
- That REC-001 APPROVED grants runtime / deployment right. REC-001 is domain authority only; REC-001-OPS is OPEN/PROPOSED.
- That PlacementCase mapping is resolved. It is UNRESOLVED (per HRP r3 GAP_REPORT §17 + supplement §C + Owner prompt B carry-forward).
- That HRP r3 GAP_REPORT function names (updateAvailability / findOrCreateLaborProfile / updateStatus) exist at HRP baseline 1059f666. Supplement a0cd30e marks them NOT_VERIFIED / NOT_FOUND_IN_SURVEY_SCOPE.
- That HRP r3 SUPERSEDED claims are still valid. They have been replaced by the supplement.
- That AFF-03B is deployed. It is Pending (HRP baseline JSON pendingDeltas entry).
- That the B.03 read-only Talent panel is ready to switch from mock to HRP real. P9/H.09 gate has not opened.
- That the POC can write to frozen CRM contracts. It cannot (frozen at @hrp-engagement/contracts@0.0.8-g0.8-fixes).
- That Owner approval of REC-001 carries forward to REC-001-OPS implementation. It does not.

## 3. Items the POC continues to mock (until further notice)

T1-A continues to mock with clear labels:
- Canonical read-only Talent context.
- Inbound event authority (until B.02 Chatwoot webhook verification path is real).
- Local suppression (until REC-001-OPS is decided and CRM-side implementation is approved).
- Routing decision (until B.05).
- Intake / review / merge / case lifecycle (until P9/H tasks deliver + B.04 / B.06).

## 4. Boundaries for the POC

- No edits to frozen contracts.
- No edits to apps/context-panel source unless explicitly authorized by Owner / T0.
- No edits to scripts/v7.9a/ files.
- No edits to docs/contracts/inventory.md pre-existing delta.
- No PR / merge / push to neutral repo hrp-integration-contracts.git (this is owned by T1-B / reconciliation slice work).
- No tag / publish / deploy of contracts.

## 5. Hand-off expectations

- T1-A continues independently within the POC scope.
- T1-B does not request POC pause, restart, or merge with reconciliation slice.
- If T1-A finds new evidence during POC that affects any item in section 2 above, T1-A writes a note back to T1-B; T1-B reflects it in a future CONTRACT-02A bundle revision.

