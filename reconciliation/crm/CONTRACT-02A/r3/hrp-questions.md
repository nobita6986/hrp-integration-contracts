# Questions for HRP (T0 HRP) — Read-Only Slice Priority

Source: CRM CONTRACT-02A r3 (supersedes r2 dd8c048, supersedes r1 89dabd9)
Scope: Only questions blocking the P9/B.03 read-only Talent context panel.
Layer A = HRP technical evidence. Layer B = two-T0 design.

Questions NOT in this round (per Owner prompt D.3 and T0 review of r2):
- PlacementCase transition mapping: moved to backlog reference.
- AFF-03B deployment status: moved to backlog reference.
- REC-001-OPS (TTL, sync, resync, recovery, unavailable): moved to backlog reference; not reopened.
- REC-004b enum compatibility: moved to backlog reference.
- Client-domain timing: DEFERRED beyond current task scope.
- KPI/Phase10 ordering: DEFERRED beyond current task scope.
- Bilateral acceptance mechanism: already agreed per RECONCILIATION_PROTOCOL; HRP can use existing protocol directly.
- Q-A5 suppression indicator: DEFERRED/optional. CRM does not conclude where union is evaluated.

## Layer A: HRP technical evidence

### Q-A1. Read-only Talent context query endpoint

Decision-ID: NEW-Q-A1
Question: Does HRP provide a read-only query endpoint that accepts a ContextQueryRequestSchema (CRM packages/contracts/src/commands/queries.ts L131) and returns a ContextPanelResultSchema (queries.ts L312) equivalent?

Evidence reference:
- CRM side: ContextQueryRequestSchema (queries.ts L131) accepts scope (QueryScopeSchema L100), target (CanonicalTargetRefSchema.optional()), external (ExternalContactRefSchema.optional()), fieldAllowlist (8 enum members).
- CRM side: ContextPanelResultSchema (queries.ts L312) returns organizationId, snapshotVersion, target, identitySummary, placementCase, availability, currentRelationship, nextAction, recentInteractions, contactability, suppressionSummary, resolvedAt, unavailableFields.
- HRP r3 THIN_SLICE_CAPABILITY_MATRIX.md (bundle commit 2ee99394) lists Simple Workbench Query as SOURCE_ONLY (labor-profile.read-service.ts); Runtime Impl = Yes; Test Exists = Yes; Test Execution State = NOT_VERIFIED; Deployed = UNVERIFIED.
- HRP r3 GAP_REPORT has no entry directly mapping to ContextQueryRequestSchema / ContextPanelResultSchema. This is a gap.

Requested action:
(a) Confirm whether the labor-profile.read-service.ts (or a successor) serves a request envelope compatible with ContextQueryRequestSchema, or whether a new endpoint is needed.
(b) Provide the actual endpoint path and HTTP method.
(c) Provide pinned source evidence (commit SHA + line range) that the response envelope matches ContextPanelResultSchema field-by-field.
(d) Identify which field summaries are guaranteed vs returned-as-unavailable vs not supported.

### Q-A2. Field projection allowlist for read-only context

Decision-ID: NEW-Q-A2
Question: For each field summary in ContextPanelResultSchema, what does HRP return?

Evidence reference:
- CRM field summaries are listed in §4.2-4.9 of thin-slice-brief.md with their actual shapes from queries.ts L131-352.
- Field allowlist uses 8 enum members (queries.ts L146-153): identitySummary, placementCase, availability, currentRelationship, nextAction, recentInteractions, contactability, suppressionSummary.
- HRP r3 THIN_SLICE_CAPABILITY_MATRIX.md does not specify field-level allowlist.

Requested action:
(a) For each of the 8 field enum members, state whether HRP supports returning that summary (and under what conditions).
(b) Confirm whether currentRelationship is returned with the readonly: true literal marker (queries.ts L247).
(c) Confirm whether identitySummary fields are redacted at the wire layer (fullNameRedacted, phoneRedacted; queries.ts L177-178).
(d) Identify any field where the HRP shape differs from the CRM source definition.

### Q-A3. Auth / organization / object authorization for read-only query

Decision-ID: tied to REC-002 (OPEN/PROPOSED)
Question: How does HRP enforce that the CRM service identity is authorized to read a specific organization and canonical target, and how is object-level authorization enforced?

Evidence reference:
- REC-002 (HRP r3 RECONCILIATION_DECISIONS.md boundary 3) proposes Service JWT with audience HRP, org binding via Service Account. Status PROPOSED.
- CRM QueryScopeSchema (queries.ts L102) requires organizationId + actor in request.
- Connector §10 proposes capability groups including context.read.
- Per Owner prompt on r2 review: canonical object authorization MUST be enforced server-side by HRP. Not a choice between server-side and client-side.

Requested action:
(a) Provide the auth credential type expected by HRP for this read endpoint (Service JWT, mTLS, etc.).
(b) Provide source evidence (pinned commit + line range) showing how HRP validates the CRM service identity.
(c) Provide source evidence showing how HRP enforces object-level authorization for the canonical target (e.g., RLS, ACL check, organization binding).
(d) State whether REC-002 design is sufficient or whether additional decisions are needed before this read path can be opened.

### Q-A4. Response / error / version compatibility for read-only query

Decision-ID: NEW-Q-A4 (adjacent to REC-002 / REC-004b)
Question: What HTTP status codes and error shapes does HRP return for the read-only query, and how is snapshotVersion used?

Evidence reference:
- CRM ContextPanelResultSchema (queries.ts L312) defines unavailableFields discriminator (L338-346) listing the 8 enum members that may be returned as unavailable without being errors.
- Connector §5 proposes HTTP mapping: 200 result/replay, 400/422 invalid request, 401/403 auth, 409 version/idempotency/policy conflict, 429/503 temporary.
- REC-004b (HRP r3 RECONCILIATION_DECISIONS.md) is OPEN/PROPOSED for enum/error compatibility.
- Per Owner prompt on r2 review: snapshotVersion is what HRP returns; concurrency/cache policy is HRP-owned. Do not assume monotonicity or generic cache semantics.

Requested action:
(a) Confirm whether HRP returns 200 with unavailableFields populated when a field cannot be resolved, or returns an error.
(b) Confirm the error response shape when HRP returns 403 (forbidden) vs 404 (not found).
(c) Describe what snapshotVersion represents in the HRP response (semantic of the value, not assumed monotonicity).
(d) Identify any client-side concurrency or cache policy that the CRM should adopt.

### Q-A5. Suppression indicator (DEFERRED / OPTIONAL)

Decision-ID: DEFERRED (was Q-A5 in r2; moved to DEFERRED per T0 review of r2)
Status: This question is OPTIONAL and not blocking the read-only slice. It is preserved here for completeness and to allow HRP to provide an answer at their discretion.

Note: CRM does NOT conclude where the union of CRM-channel and HRP-canonical suppression is evaluated. CRM does NOT reopen REC-001-OPS. CRM does NOT propose changes to the suppression summary schema (queries.ts L299-310: schemaVersion, suppressionEventId, reason, committedAt, fenceCutOffAt).

If HRP wishes to clarify for the record (optional):
(a) Is the suppression summary returned in the read-only context query response?
(b) What does suppressionEventId / reason / committedAt / fenceCutOffAt represent?
(c) Is the contactability indicator (dispatchOutcome = AUTHORIZED / SUPPRESSED / UNKNOWN) the union result or a single source?
(d) Are there scope constraints on suppression return based on the actor / organization?

## Layer B: Two-T0 design

No Layer B questions for this round. The bilateral acceptance mechanism is already agreed (RECONCILIATION_PROTOCOL §1-3). HRP can use the existing protocol directly for their response to Q-A1 through Q-A4.

## What CRM does NOT ask in this round

- CRM does NOT ask HRP to implement all 28 wire modules.
- CRM does NOT ask HRP to release tagged contracts.
- CRM does NOT ask HRP core DB credentials.
- CRM does NOT ask changes to frozen contracts @hrp-engagement/contracts@0.0.8-g0.8-fixes.
- CRM does NOT ask for force-push, merge to main, or bootstrap of neutral package.
- CRM does NOT ask HRP to resolve PlacementCase mapping, AFF-03B, REC-001-OPS, REC-004b in this round. These are acknowledged as backlog items but do not block the read-only slice.
- CRM does NOT ask Client-domain timing or KPI/Phase10 ordering. These are DEFERRED beyond current task scope.
- CRM does NOT self-decide where the suppression union is evaluated. That question is OPEN/OWNER and not asked here.
- CRM does NOT assume snapshotVersion is a generic concurrency/cache token. Concurrency/cache policy is HRP-owned.

