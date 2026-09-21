# Thin-Slice Brief — Read-only Talent Context (B.03 priority)

**Slice ID (proposed):** P9/B.03-thin-slice-r1 (read-only Talent context panel).
**Backlog source:** Implementation-Backlog.HRP-Owned-V7.9b-f.md §B.03; connector hrp-connector.md §6 ( read-only identity resolution and §2 HRP -> App context panel).
**Priority:** Read-only path. Per Owner prompt D.2: not intake / merge / case mutation / outbound.
**T0 decision pending:** Yes. This is a proposal; HRP endpoint implementation is NOT opened in this task.

## 1. UI action / use case (CRM-side actual)

- Chatwoot conversation sidebar: select a Talent profile to display summary fields in a side panel.
- Sidebar displays: displayName, currentAvailability (enum), currentRelationship (enum), nextAction summary (if returned), and an optional suppression/contactability indicator (if returned).
- Behavior: open panel does NOT mutate anything; no review trigger; no intake start; no case open/update/close.
- CRM source (read-only, not modified in this task): apps/context-panel/src/ui/components/talent-panel.tsx, apps/context-panel/src/ui/types.ts, apps/context-panel/src/orchestrator-wire.ts.

## 2. Minimum data needed vs optional/unavailable projections

Minimum data for initial read (REQUIRED by the read operation):
- canonical laborProfileId (opaque, scoped to organization). This is the lookup key. The slice reads BY canonical ID; it does not establish the ID.
- displayName (string, personal data — see §3 PII note).

Available in ContextPanelResult if returned by HRP (OPTIONAL fields; HRP decides whether each projection is available):
- currentAvailability enum (AVAILABILITIES from enums.ts, OWNER-approved target values).
- currentRelationship enum (CURRENT_RELATIONSHIPS from enums.ts; read-only projection; mutation MUST be rejected per enums.ts CURRENT_RELATIONSHIP_READONLY flag).
- nextAction summary: action label, scheduledAt, status (OPEN/DONE/CANCELLED), version. Available if HRP returns it; NOT a requirement for the initial read.
- expectedVersion (ExpectedVersionSchema from primitives.ts, line 40). Available in the result envelope for concurrency tracking; NOT required for a read-only initial query.
- contactability indicator (suppression summary): available if HRP returns it per REC-001 domain authority (HRP-owned canonical-person suppression).

Unavailable projections for this slice (not requested):
- PlacementCase stage/status (UNRESOLVED per HRP r3 GAP_REPORT §17 + supplement §C). This is a separate path.
- raw interactions / transcripts (PII and out of scope for read-only summary panel).
- evidence refs / CCCD (residency gate C.04-C.05 not delivered).
- routing / assignment data (routing authority is separate, per B.05).

## 3. Actor, org scope, target resolution, permission/field masking

- Actor: authenticated CRM user with context.read capability (proposed capability key in connector §10; not yet verified).
- Org scope: server-side verified organizationId from authenticated principal; CRM never self-declares org in body.
- Target resolution: CRM must resolve conversation -> canonical laborProfileId. This integration mapping (Chatwoot conversation -> canonical ID) is NOT an HRP-owned object; it is a CRM integration concern. The mapping does NOT grant read authorization to the canonical target. Authorization comes from HRP query, not from the CRM-side mapping.
- Permission: object-level permission server-side; CRM user can read only profiles accessible to their org/role.
- PII note: displayName is personal data even without CCCD. POC uses synthetic data (CR-2 correction). PII classification is not removed by the absence of CCCD. Field-level visibility must be enforced server-side regardless of synthetic POC data.

## 4. CRM schema / symbol actual at pinned baseline (CR-1 correction)

CRM baseline: 72643356a0d1355f9dccc3921b47c990ea9c31c1
Frozen contracts package: @hrp-engagement/contracts@0.0.8-g0.8-fixes

Symbols verified from source (all grep evidence from HEAD, not fabricated names):

packages/contracts/src/primitives.ts (first 10 lines):
  Line 40: ExpectedVersionSchema = z.number().int().nonnegative()
  Line 54: IsoTimestampSchema = z.string().datetime({ offset: true })
  Line 28: CanonicalIdSchema = opaqueId(canonical id, 128)

packages/contracts/src/enums.ts (lines 100-130):
  Line 100: AVAILABILITIES = [AVAILABLE_NOW, AVAILABLE_FROM_DATE, NOT_AVAILABLE, DO_NOT_CONTACT, UNKNOWN]
  Line 106: AvailabilitySchema = z.enum(AVAILABILITIES)
  Line 120: CURRENT_RELATIONSHIPS = [NEVER_WORKED, WORKING_VIA_HRP, FORMER_HRP_WORKER, WORKING_EXTERNAL, UNKNOWN]
  Line 125: CurrentRelationshipSchema = z.enum(CURRENT_RELATIONSHIPS)
  Line 127: CURRENT_RELATIONSHIP_READONLY = true (marker flag, enums.ts line 140)
  Line 150: NextActionStatusSchema = z.enum([OPEN, DONE, CANCELLED])

packages/contracts/src/commands/profile.ts (lines 93-118):
  Line 93: ProfilePatchSchema = z.record(z.string(), PatchFieldSchema) with whitelist validation
  Line 65: PROFILE_PATCH_WHITELIST = Object.freeze([fullName, phone, dob, ...])
  Line 94: ProfilePatch type alias = z.infer<typeof ProfilePatchSchema>
  Line 99: UpdateLaborProfileInputSchema = z.object({ organizationId, laborProfileId, expectedVersion, patch: ProfilePatchSchema, fillMissingOnly: z.literal(true), ... })
  Line 97: UpdateLaborProfileInput type alias = z.infer<typeof UpdateLaborProfileInputSchema>

packages/contracts/src/commands/queries.ts (lines 312-352):
  Line 312: ContextPanelResultSchema = z.object({ schemaVersion, organizationId, snapshotVersion, target: CanonicalTargetRefSchema.optional(), identitySummary.optional(), placementCase.optional(), availability.optional(), currentRelationship.optional(), nextAction.optional(), recentInteractions[].optional(), contactability.optional(), suppressionSummary.optional(), resolvedAt, unavailableFields.optional() })
  Line 352: ContextPanelResult type alias = z.infer<typeof ContextPanelResultSchema>
  Lines 230-260: ContextPanelAvailabilitySchema, ContextPanelCurrentRelationshipSchema, ContextPanelNextActionSummarySchema (sub-schemas within ContextPanelResult)
  Line 250: ContextPanelCurrentRelationshipSchema = z.object({ schemaVersion, currentRelationship: CurrentRelationshipSchema, readonly: z.literal(true) })
  Line 255: ContextPanelNextActionSummarySchema = z.object({ nextActionId, nextActionVersion, status: NextActionStatusSchema, scheduledAt.optional(), dueAt.optional(), snoozeMode.optional() })
  Lines 100-115: QueryScopeSchema (organizationId required, actor required, asOfVersion.optional(), provider.optional(), connectionId.optional())
  Lines 68-79: CursorPaginationInputSchema, CursorPaginationOutputSchema
  Lines 361-385: ReadOnlyIdentityPreviewRequestSchema (read-only preview; does NOT mutate; canonical ids returned are for preview only)

apps/context-panel/src/ui/types.ts (lines 10-25):
  Line 18: ContextPanelResult type re-exported from @hrp-engagement/contracts
  Lines 50-70: PanelState discriminated union (loading, empty, forbidden, unresolved, stale, timeout, error, partial, success)

Fabricated names that do NOT exist at baseline (listed in r1 §4, corrected here):
  - LaborProfileSchema: DOES NOT EXIST (no such symbol at baseline)
  - ApplicationSchema: DOES NOT EXIST (no such symbol at baseline)
  - RelationshipSchema: DOES NOT EXIST (no such symbol at baseline)
  - VersionSchema: DOES NOT EXIST (no such symbol at baseline)
  - IdSchema: DOES NOT EXIST (no such symbol at baseline)
  - QueryReadModelSchema: DOES NOT EXIST (no such symbol at baseline)
  - QueryInputSchema: DOES NOT EXIST (no such symbol at baseline)

Status (CONTRACT-01 r1 inventory): profile.ts TARGET_ONLY, queries.ts TARGET_ONLY, enums.ts TARGET_ONLY. ACCEPTED_SHARED = 0.

## 5. HRP counterpart evidence

Per HRP r3 THIN_SLICE_CAPABILITY_MATRIX.md (bundle commit 2ee99394):
- Simple Workbench Query (Read): SOURCE_ONLY at C:/CodeApp/HrP/src/domains/talent/labor-profile.read-service.ts, query function. Runtime Impl = Yes. Test Exists = Yes. Test Execution State = NOT_VERIFIED. Merged = Yes. Deployed = UNVERIFIED.
- No entry in the r3 GAP_REPORT module list maps directly to the proposed ContextPanelResult query capability. This is a gap: the wire query contract (ContextPanelResultSchema) exists on the CRM side but has no confirmed HRP counterpart in GAP_REPORT §14-16.
- Per supplement a0cd30e §D: updateAvailability, findOrCreateLaborProfile, updateStatus were SUPERSEDED as NOT_FOUND_IN_SURVEY_SCOPE at baseline 1059f666. Do NOT infer HRP lacks all capability because one function name is missing.

## 6. Dependencies and gate acknowledgment

Milestone-level backlog dependencies (from Implementation-Backlog.HRP-Owned-V7.9b-f.md §1):
- P9/H.01 (canonical command infrastructure) must be ACCEPTED before H.02.
- P9/H.02 (identity resolution) must be ACCEPTED before H.08.
- P9/H.08 (context/events/analytics source APIs) must be ACCEPTED before H.09.
- P9/H.09 (gateway thật + canonical readiness gate) is the readiness gate that authorizes switching from mock to HRP real.

This thin-slice brief is planning work for the read-only path. The slice does not require H.01/H.02/H.08 to be complete before planning can start. But the mock-to-real switch requires all four milestones to be ACCEPTED, ending with H.09.

Per Owner prompt D.2 and CR-6: AFF-03B is NOT a blocker for B.03 or B.04. AFF-03B blocks its own path (Public Apply intake). Read-only context panel is not blocked by it.

## 7. Mock behavior currently in CRM

- apps/context-panel/src/ui/mock-api.ts provides a deterministic mock with synthetic fields.
- apps/context-panel/src/orchestrator-wire.ts maps mock results to PanelState discriminated union.
- POC uses synthetic data. Synthetic data does not contain personal data (CR-2). This is a POC limitation, not a data classification change.
- Per Implementation-Backlog.HRP-Owned-V7.9b-f.md §1: AC must have staging/synthetic evidence; mock pass is NOT provider/HRP DB proof.

## 8. Conditions sufficient to switch path from mock to HRP real (H.09 gate)

All of the following must be true before any path moves from mock to HRP real:
1. P9/H.01/H.02/H.08 milestones have been ACCEPTED with evidence. (This does not require every field to be implemented; it requires the milestones to be accepted.)
2. HRP provides pinned contracts/version/auth endpoints. (REC-002 must be at least OPEN; PROPOSED is not sufficient for production.)
3. HRP staging DB evidence exists for read-only query (no Prisma fallback; CurrentRelationship from HRP projection).
4. Owner approval to flip the flag for this specific read path.
5. Bilateral acceptance on the same immutable commit SHA pinning (RECONCILIATION_PROTOCOL §3).

Until all 5 are met, the panel stays on mock with a CLEAR LABEL. Do not silently switch.

## 9. Out of scope for this slice (Owner prompt D.2)

- Intake creation (B.04 path).
- Merge / privileged identity review (H.03 path).
- PlacementCase mutation (open / update / close). Mapping UNRESOLVED per HRP r3 GAP_REPORT §17.
- Availability update.
- Interaction record.
- NextAction update (this slice reads nextAction summary; it does not update it).
- Outbound / broadcast / DNC release gate (D.04 path).
- Analytics facts / BoD aggregates (Phase 10 backlog).
- Evidence / CCCD residency (C.04-C.05 not delivered).
- Client context panel (Owner decision pending; see t1-a-note.md).

## 10. Client-domain path status

Per Owner prompt D.2: Client domain is NOT yet decided. Until Owner / T0 chot Client semantics, Client panel stays UNAVAILABLE in this slice. Not suppressed; just not in scope for this round.

