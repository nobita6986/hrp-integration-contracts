# Questions for HRP (T0 HRP) — Read-Only Slice Priority

Source: CRM CONTRACT-02A r2
Scope: Only questions blocking the P9/B.03 read-only Talent context panel.
Layer A = HRP technical evidence. Layer B = two-T0 design.

Questions NOT in this round (per Owner prompt D.3):
- PlacementCase transition mapping: moved to backlog reference.
- AFF-03B deployment status: moved to backlog reference.
- REC-001-OPS (TTL, sync, resync, recovery, unavailable): moved to backlog reference.
- REC-004b enum compatibility: moved to backlog reference.
- Client-domain timing: DEFERRED beyond current task scope.
- KPI/Phase10 ordering: DEFERRED beyond current task scope.
- Bilateral acceptance mechanism: already agreed per RECONCILIATION_PROTOCOL; HRP can use existing protocol directly.

## Layer A: HRP technical evidence

### Q-A1. Read-only Talent context query endpoint

Decision-ID: NEW-Q-A1
Question: Does HRP provide a read-only query endpoint that returns a result equivalent to the CRM ContextPanelResultSchema (packages/contracts/src/commands/queries.ts, line 312)?

Evidence reference:
- CRM side: ContextPanelResultSchema (queries.ts L312-352) defines the envelope shape including identitySummary, availability, currentRelationship, nextAction summary, contactability, suppressionSummary, unavailableFields discriminator.
- CRM side: ReadOnlyIdentityPreviewRequestSchema (queries.ts L361-385) defines the read-only preview request shape.
- CRM side: QueryScopeSchema (queries.ts L100-115) requires organizationId + actor.
- HRP r3 THIN_SLICE_CAPABILITY_MATRIX.md (bundle commit 2ee99394) lists Simple Workbench Query as SOURCE_ONLY (labor-profile.read-service.ts); Runtime Impl = Yes; Test Execution State = NOT_VERIFIED; Deployed = UNVERIFIED.
- HRP r3 GAP_REPORT has no entry directly mapping to ContextPanelResultSchema. This is a gap.

Requested action:
(a) Confirm whether the labor-profile.read-service.ts (or a successor) serves the ContextPanelResult envelope shape, or whether a new endpoint is needed.
(b) Provide the actual endpoint path and HTTP method.
(c) Confirm which fields in ContextPanelResult are guaranteed vs optional in the HRP response.
(d) Confirm which fields are returned as unavailable vs as errors.

### Q-A2. Field projection allowlist for read-only context

Decision-ID: NEW-Q-A2
Question: What fields does HRP return in the identitySummary / availability / currentRelationship projection for a read-only query?

Evidence reference:
- CRM ContextPanelResultSchema (queries.ts L312) defines: identitySummary (ContextPanelIdentitySummarySchema), availability (ContextPanelAvailabilitySchema), currentRelationship (ContextPanelCurrentRelationshipSchema).
- CRM enums.ts defines AVAILABILITIES (L100), CURRENT_RELATIONSHIPS (L120), CURRENT_RELATIONSHIP_READONLY flag (L140).
- CRM profile.ts defines PROFILE_PATCH_WHITELIST (L59-65) and update semantics.
- HRP r3 THIN_SLICE_CAPABILITY_MATRIX.md does not specify field-level allowlist for read-only projections.

Requested action:
(a) Confirm which identity fields HRP returns in identitySummary (does it include fullName, phone, dob, gender, or a subset?).
(b) Confirm whether availability and currentRelationship are returned in the same response or queried separately.
(c) Confirm whether currentRelationship carries the readonly: true marker from ContextPanelCurrentRelationshipSchema (L250).
(d) Confirm whether snapshotVersion is returned for optimistic concurrency.

### Q-A3. Auth / organization / object authorization for read-only query

Decision-ID: tied to REC-002 (OPEN/PROPOSED)
Question: How does HRP verify that the CRM service identity is authorized to read a specific organization and canonical target?

Evidence reference:
- REC-002 (HRP r3 RECONCILIATION_DECISIONS.md boundary 3) proposes Service JWT with audience HRP, org binding via Service Account. Status PROPOSED.
- CRM QueryScopeSchema (queries.ts L100) requires organizationId + actor in request.
- connector §10 proposes capability groups including context.read.
- HRP r3 RECONCILIATION_DECISIONS.md §REC-002 states: Issuer: CRM / Audience: HRP. Verification authority: HRP Gateway. Org/Connection binding: hardwired via Service Account.

Requested action:
(a) Confirm whether the read-only query requires a service JWT or a different credential.
(b) Confirm whether HRP validates the CRM service identity against a registered service account, or a different mechanism.
(c) Confirm whether object-level permission (CRM user can only read profiles accessible to their org/role) is enforced server-side by HRP or client-side by CRM.

### Q-A4. Response / error / version compatibility for read-only query

Decision-ID: NEW-Q-A4 (adjacent to REC-002 / REC-004b)
Question: What HTTP status codes and error shapes does HRP return for the read-only query?

Evidence reference:
- CRM ContextPanelResultSchema (queries.ts L312) defines unavailableFields discriminator (L338-346) listing fields that may be returned as unavailable without being errors.
- connector §5 proposes HTTP mapping: 200 result/replay, 400/422 invalid request, 401/403 auth, 409 version/idempotency/policy conflict, 429/503 temporary.
- REC-004b (HRP r3 RECONCILIATION_DECISIONS.md) is OPEN/PROPOSED for enum/error compatibility.

Requested action:
(a) Confirm whether HRP returns 200 with unavailableFields populated when a field cannot be resolved, or returns an error.
(b) Confirm the error response shape when HRP returns 403 (forbidden) vs 404 (not found).
(c) Confirm whether snapshotVersion is monotonically increasing across reads (for cache invalidation).

### Q-A5. Suppression union shape for read-only contactability indicator

Decision-ID: tied to REC-001 (APPROVED domain authority; REC-001-OPS OPEN/PROPOSED)
Question: Per REC-001 domain authority, HRP owns canonical-person suppression within org. What does the CRM read-only contactability indicator field show?

Evidence reference:
- REC-001 APPROVED scope: HRP owns canonical-person suppression within org. Effective deny = union. Suppression does not block read workflows.
- REC-001-OPS: TTL, sync, resync, recovery, unavailable behavior OPEN/PROPOSED. NOT resolved by this question.
- CRM ContextPanelSuppressionSummarySchema (queries.ts L280-310) defines: suppressedBySources[], authorizedUntil, fenceCutOffAt. suppressedBySources includes CRM-channel and HRP-canonical entries.

Requested action:
(a) Confirm whether HRP returns the suppression summary in the read-only query response.
(b) Confirm whether the union of CRM + HRP suppression is evaluated server-side or client-side (CRM-side union is the intent per REC-001, but HRP must confirm it returns the canonical-person suppression).
(c) Confirm whether the contactability indicator is a boolean (suppressed/not-suppressed) or the full suppressedBySources array.

## Layer B: Two-T0 design

No Layer B questions for this round. The bilateral acceptance mechanism is already agreed (RECONCILIATION_PROTOCOL §1-3). HRP can use the existing protocol directly for their response to Q-A1 through Q-A5.

## What CRM does NOT ask in this round

- CRM does NOT ask HRP to implement all 28 wire modules.
- CRM does NOT ask HRP to release tagged contracts.
- CRM does NOT ask HRP core DB credentials.
- CRM does NOT ask changes to frozen contracts @hrp-engagement/contracts@0.0.8-g0.8-fixes.
- CRM does NOT ask for force-push, merge to main, or bootstrap of neutral package.
- CRM does NOT ask HRP to resolve PlacementCase mapping, AFF-03B, REC-001-OPS, REC-004b in this round. These are acknowledged as backlog items but do not block the read-only slice.
- CRM does NOT ask Client-domain timing or KPI/Phase10 ordering. These are DEFERRED beyond current task scope.
