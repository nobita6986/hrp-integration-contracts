# Thin-Slice Brief — Read-only Talent Context (B.03 priority)

Slice ID (proposed): P9/B.03-thin-slice-r1 (read-only Talent context panel).
Backlog source: Implementation-Backlog.HRP-Owned-V7.9b-f.md §B.03; connector hrp-connector.md §6.
Priority: Read-only path. Per Owner prompt D.2: not intake / merge / case mutation / outbound.
T0 decision pending: Yes. This is a proposal; HRP endpoint implementation is NOT opened in this task.

CRM baseline pinned: 72643356a0d1355f9dccc3921b47c990ea9c31c1
Frozen contracts package: @hrp-engagement/contracts@0.0.8-g0.8-fixes

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
- expectedVersion (ExpectedVersionSchema from primitives.ts line 40). Available in the result envelope; NOT required for a read-only initial query.
- contactability indicator (per ContextPanelContactabilitySchema): available if HRP returns it.
- suppressionSummary (per ContextPanelSuppressionSummarySchema): available if HRP returns it; see §6 for REC-001 caveats.

Unavailable projections for this slice (not requested):
- PlacementCase stage/status (UNRESOLVED per HRP r3 GAP_REPORT §17 + supplement §C). This is a separate path.
- raw interactions / transcripts (PII and out of scope for read-only summary panel).
- evidence refs / CCCD (residency gate C.04-C.05 not delivered).
- routing / assignment data (routing authority is separate, per B.05).

## 3. Actor, org scope, target resolution, permission/field masking

- Actor: authenticated CRM user with context.read capability (proposed capability key in connector §10; not yet verified).
- Org scope: server-side verified organizationId from authenticated principal; CRM never self-declares org in body.
- Target resolution: CRM must resolve conversation -> canonical laborProfileId. This integration mapping (Chatwoot conversation -> canonical ID) is a CRM integration concern. The mapping does NOT grant read authorization to the canonical target. Authorization comes from HRP query, not from the CRM-side mapping.
- Permission: object-level permission is enforced server-side by HRP per REC-002 design. CRM does NOT self-enforce object-level authorization on canonical targets.
- PII note: displayName is personal data even without CCCD. POC uses synthetic data. PII classification is not removed by the absence of CCCD. Field-level visibility must be enforced server-side regardless of synthetic POC data.

## 4. CRM schema / symbol actual at pinned baseline

All symbols below are sourced from the pinned CRM baseline (HEAD 72643356, not a fresh HEAD). Every field claim cites a line range. Each symbol was read directly from source, not via grep alone.

### 4.1 Request schema for read context (ContextQueryRequestSchema)

File: packages/contracts/src/commands/queries.ts
Line: 131

Excerpt from the pinned Git blob at baseline 72643356 (line 131-167):

    export const ContextQueryRequestSchema = z
      .object({
        schemaVersion: SchemaVersionSchema,
        scope: QueryScopeSchema,
        /** hoặc Client canonical id */
        target: CanonicalTargetRefSchema.optional(),
        /** External contact (Chatwoot/Zalo) để resolve canonical target */
        external: ExternalContactRefSchema.optional(),
        /**
         * Field allowlist — server nằm trong allowlist.
         */
        fieldAllowlist: z.array(z.enum([...8 enum members])).max(16).optional(),
      })
      .strict()
      .superRefine((val, ctx) => {
        // Phải có target hoặc external (một trong hai).
        if (!val.target && !val.external) { ... }
      });

Notes:
- This schema requires either target (canonical) or external (provider ref); both can be supplied but at least one is required (source comment line 162-166).
- fieldAllowlist uses 8 enum members: identitySummary, placementCase, availability, currentRelationship, nextAction, recentInteractions, contactability, suppressionSummary.
- QueryScopeSchema is required (line 132); fields: schemaVersion, organizationId, actor, asOfVersion (optional), provider (optional), connectionId (optional), commandId (optional), idempotencyKey (optional) — line 102-122.

### 4.2 Response schema (ContextPanelResultSchema)

File: packages/contracts/src/commands/queries.ts
Line: 312-352

Excerpt (line 312-352):

    export const ContextPanelResultSchema = z
      .object({
        schemaVersion: SchemaVersionSchema,
        organizationId: OrganizationIdSchema,
        snapshotVersion: ExpectedVersionSchema,
        target: CanonicalTargetRefSchema.optional(),
        identitySummary: ContextPanelIdentitySummarySchema.optional(),
        placementCase: ContextPanelPlacementCaseSchema.optional(),
        availability: ContextPanelAvailabilitySchema.optional(),
        currentRelationship: ContextPanelCurrentRelationshipSchema.optional(),
        nextAction: ContextPanelNextActionSummarySchema.optional(),
        recentInteractions: z.array(ContextPanelRecentInteractionSchema).max(16).optional(),
        contactability: ContextPanelContactabilitySchema.optional(),
        suppressionSummary: ContextPanelSuppressionSummarySchema.optional(),
        resolvedAt: IsoTimestampSchema,
        unavailableFields: z.array(z.enum([...same 8 members])).max(16).optional(),
      })
      .strict();

Notes:
- All field summaries are optional and are returned only if they are in the request fieldAllowlist (source comment line 327).
- unavailableFields lists the same 8 enum members as fieldAllowlist.


### 4.3 Identity summary sub-schema

File: packages/contracts/src/commands/queries.ts
Line: 172-184

Excerpt (line 172-184):

    export const ContextPanelIdentitySummarySchema = z
      .object({
        schemaVersion: SchemaVersionSchema,
        fullNameRedacted: z.string().min(1).max(256).optional(),
        phoneRedacted: z.string().min(1).max(64).optional(),
        /** Display only — KHÔNG phải canonical handle. */
        displayOnly: z.boolean(),
      })
      .strict();

Notes:
- Identity summary fields are REDACTED (fullNameRedacted, phoneRedacted) at the wire layer.
- displayOnly is REQUIRED (boolean, no default; literal type).
- These fields are designed for UI display; they are NOT canonical handles and MUST NOT be used as targets for mutation (source comment line 178-179).

### 4.4 Placement case summary sub-schema

File: packages/contracts/src/commands/queries.ts
Line: 185-225 (with refine block)

Excerpt (line 185-225):

    export const ContextPanelPlacementCaseSchema = z
      .object({
        schemaVersion: SchemaVersionSchema,
        placementCaseId: CanonicalIdSchema,
        placementCaseVersion: ExpectedVersionSchema,
        stage: PlacementCaseStageSchema.optional(),
        closedStatus: ClosedCaseStatusSchema.optional(),
        closeReason: CaseCloseReasonSchema.optional(),
        aggregateVersion: ExpectedVersionSchema,
      })
      .strict()
      .superRefine((val, ctx) => {
        if (val.closedStatus === CLOSED_CASE_STATUS && !val.closeReason) { ... }
        if (val.closeReason && val.closedStatus !== CLOSED_CASE_STATUS) { ... }
        if (val.stage && val.closedStatus === CLOSED_CASE_STATUS) { ... }
      });

Notes:
- placementCaseId and placementCaseVersion are required (CanonicalIdSchema, ExpectedVersionSchema).
- stage is OPTIONAL; closedStatus is OPTIONAL; closeReason is OPTIONAL.
- aggregateVersion is REQUIRED.
- Refinement enforces: closedStatus=CLOSED requires closeReason; closeReason requires CLOSED; CLOSED cases cannot have a stage.
- Per §6 below, PlacementCase mapping is UNRESOLVED for this slice.

### 4.5 Availability summary sub-schema

File: packages/contracts/src/commands/queries.ts
Line: 226-239

Excerpt (line 226-239):

    export const ContextPanelAvailabilitySchema = z
      .object({
        schemaVersion: SchemaVersionSchema,
        availability: AvailabilitySchema,
        availableFromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u).optional(),
        aggregateVersion: ExpectedVersionSchema,
        contactabilityVersion: ExpectedVersionSchema.optional(),
      })
      .strict();

Notes:
- availability is REQUIRED (AvailabilitySchema from enums.ts line 106).
- availableFromDate is OPTIONAL (YYYY-MM-DD format if provided).
- aggregateVersion is REQUIRED.
- contactabilityVersion is OPTIONAL.

### 4.6 Current relationship summary sub-schema

File: packages/contracts/src/commands/queries.ts
Line: 241-250

Excerpt (line 241-250):

    export const ContextPanelCurrentRelationshipSchema = z
      .object({
        schemaVersion: SchemaVersionSchema,
        currentRelationship: CurrentRelationshipSchema,
        readonly: z.literal(true),
      })
      .strict();

Notes:
- currentRelationship is REQUIRED (CurrentRelationshipSchema from enums.ts line 125).
- readonly is REQUIRED literal true. The schema is a read-only projection; mutation requests must be rejected by runtime (HRP gate).
- CURRENT_RELATIONSHIP_READONLY = true flag exists in enums.ts line 140.

### 4.7 NextAction summary sub-schema

File: packages/contracts/src/commands/queries.ts
Line: 252-263

Excerpt (line 252-263):

    export const ContextPanelNextActionSummarySchema = z
      .object({
        schemaVersion: SchemaVersionSchema,
        nextActionId: CanonicalIdSchema,
        nextActionVersion: ExpectedVersionSchema,
        status: NextActionStatusSchema,
        scheduledAt: IsoTimestampSchema.optional(),
        dueAt: IsoTimestampSchema.optional(),
        snoozeMode: z.enum([ACTIVE, SNOOZED, DISMISSED]).optional(),
      })
      .strict();

Notes:
- nextActionId, nextActionVersion, status are REQUIRED.
- scheduledAt, dueAt, snoozeMode are OPTIONAL.
- snoozeMode enum is z.enum([ACTIVE, SNOOZED, DISMISSED]) — distinct from NextActionStatusSchema.

### 4.8 Contactability summary sub-schema

File: packages/contracts/src/commands/queries.ts
Line: 288-296

Excerpt (line 288-296):

    export const ContextPanelContactabilitySchema = z
      .object({
        schemaVersion: SchemaVersionSchema,
        dispatchOutcome: z.enum([AUTHORIZED, SUPPRESSED, UNKNOWN]),
        reasonCode: z.string().min(1).max(64),
        freshnessAt: IsoTimestampSchema,
      })
      .strict();

Notes:
- dispatchOutcome is REQUIRED; values: AUTHORIZED, SUPPRESSED, UNKNOWN (fail closed per source comment line 290).
- reasonCode is REQUIRED.
- freshnessAt is REQUIRED.

### 4.9 Suppression summary sub-schema (CORRECTED per CR-2-2)

File: packages/contracts/src/commands/queries.ts
Line: 299-310

Excerpt (line 299-310):

    export const ContextPanelSuppressionSummarySchema = z
      .object({
        schemaVersion: SchemaVersionSchema,
        /** Active suppression version. */
        suppressionEventId: z.string().min(1).max(128).optional(),
        reason: z.string().min(1).max(64),
        /** Server-set timestamp suppression commit. */
        committedAt: IsoTimestampSchema,
        /** cắt-off fence — runtime HRP gate check fence token. */
        fenceCutOffAt: IsoTimestampSchema.optional(),
      })
      .strict();

Notes:
- Actual fields: schemaVersion, suppressionEventId (optional), reason (required), committedAt (required), fenceCutOffAt (optional).
- The r2 brief listed a different shape (suppressedBySources[], authorizedUntil). That shape was INVENTED and is NOT in the source. CORRECTED in r3.

### 4.10 Identity preview schema (OUT OF SCOPE for B.03)

File: packages/contracts/src/commands/queries.ts
Line: 361-376

Excerpt (line 361-376):

    export const ReadOnlyIdentityPreviewRequestSchema = z
      .object({
        schemaVersion: SchemaVersionSchema,
        scope: QueryScopeSchema,
        /** Signals — KHÔNG đủ để ép tạo NEW_PROFILE. */
        signals: z.object({
          phoneNormalized: z.string().min(8).max(15).optional(),
          citizenIdLast4: z.string().regex(/^\d{4}$/u).optional(),
          fullNameNormalized: z.string().min(1).max(128).optional(),
        }).strict(),
      })
      .strict();

Notes:
- This schema is for identity preview by signals (phone/citizenIdLast4/fullName). It is a DIFFERENT request than reading context by canonical target.
- The r2 brief incorrectly cited this as the read-context request. CORRECTED in r3: ContextQueryRequestSchema (queries.ts L131) is the actual read-context request.
- ReadOnlyIdentityPreviewRequestSchema is NOT used by the B.03 read-only context panel; it is used by the identity-preview path which is a separate brief.

### 4.11 Profile update schemas (NOT used for read-only slice)

File: packages/contracts/src/commands/profile.ts
Line: 65, 93-118

Excerpt (line 65, 93-118):

    export const PROFILE_PATCH_WHITELIST = Object.freeze([
      fullName, phone, dob, citizenAddress, contactAddress, gender, emergencyContact,
    ]);
    export const ProfilePatchSchema = z.record(z.string(), PatchFieldSchema)
      .superRefine((obj, ctx) => { ... });
    export const UpdateLaborProfileInputSchema = z.object({
      organizationId: OrganizationIdSchema,
      laborProfileId: CanonicalIdSchema,
      expectedVersion: ExpectedVersionSchema,
      patch: ProfilePatchSchema,
      fillMissingOnly: z.literal(true),
      evidenceRefs: EvidenceRefListSchema.optional(),
      submissionRevisionId: z.string().min(1).max(128).optional(),
    }).strict();

Notes:
- These are MUTATION DTOs. B.03 is a read-only slice; these schemas are referenced for completeness only, not used at runtime by the panel.
- They are listed here to distinguish the read-only path (B.03) from the mutation path (B.04 / H.03).

### 4.12 Primitives referenced

File: packages/contracts/src/primitives.ts
Line: 28, 40, 54

Excerpt (line 28, 40, 54):

    export const CanonicalIdSchema = opaqueId(canonical id, 128);
    export const ExpectedVersionSchema = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
    export const IsoTimestampSchema = z.string().min(20).max(40).datetime({ offset: true });

### 4.13 Fabricated names confirmed NOT to exist at baseline

Verified by grep against HEAD 72643356. None of the following symbols exist in any source file:

- LaborProfileSchema: DOES NOT EXIST
- ApplicationSchema: DOES NOT EXIST
- RelationshipSchema: DOES NOT EXIST
- VersionSchema: DOES NOT EXIST
- IdSchema: DOES NOT EXIST
- QueryReadModelSchema: DOES NOT EXIST
- QueryInputSchema: DOES NOT EXIST
- ContextQueryResultSchema: DOES NOT EXIST (the actual response schema is ContextPanelResultSchema)
- suppressedBySources[] / authorizedUntil fields on ContextPanelSuppressionSummarySchema: NOT IN SOURCE

Status (per CONTRACT-01 r1 inventory): profile.ts TARGET_ONLY, queries.ts TARGET_ONLY, enums.ts TARGET_ONLY. ACCEPTED_SHARED = 0.

## 5. HRP counterpart evidence

Per HRP r3 THIN_SLICE_CAPABILITY_MATRIX.md (bundle commit 2ee99394):
- Simple Workbench Query (Read): SOURCE_ONLY at C:/CodeApp/HrP/src/domains/talent/labor-profile.read-service.ts. Runtime Impl = Yes. Test Exists = Yes. Test Execution State = NOT_VERIFIED. Merged = Yes. Deployed = UNVERIFIED.
- No entry in the r3 GAP_REPORT module list maps directly to the proposed ContextQueryRequest/ContextPanelResult query capability. This is a gap (see hrp-questions Q-A1).
- Per supplement a0cd30e §D: updateAvailability, findOrCreateLaborProfile, updateStatus were SUPERSEDED as NOT_FOUND_IN_SURVEY_SCOPE at baseline 1059f666. Do NOT infer HRP lacks all capability because one function name is missing.

## 6. Dependencies and gate acknowledgment

Backlog-level milestone dependencies (from Implementation-Backlog.HRP-Owned-V7.9b-f.md §1) — KEPT as backlog input for T0 arbitration; NOT self-promoted by Coder to a gate on this slice:
- P9/H.01 (canonical command infrastructure) precedes H.02.
- P9/H.02 (identity resolution) precedes H.08.
- P9/H.08 (context/events/analytics source APIs) precedes H.09.
- P9/H.09 (gateway thật + canonical readiness gate) is the readiness gate that authorizes switching from mock to HRP real.

Real path requirements (REQUIREMENT, not milestone acceptance — to be confirmed by T0):
- Auth design for the slice accepted (REC-002 currently OPEN/PROPOSED; OPEN/PROPOSED is not sufficient).
- Implementation evidence gathered for the read endpoint.
- Slice readiness gate cleared (H.09 or earlier equivalent for this specific path).

Planning/mock path (for this slice brief): NOT blocked by milestone acceptance or REC-002 status. Mock/CRM-side work can proceed.

Per Owner prompt D.2: AFF-03B is NOT a blocker for B.03 or B.04. AFF-03B blocks its own path (Public Apply intake). Read-only context panel is not blocked by it.

## 7. Mock behavior currently in CRM

- apps/context-panel/src/ui/mock-api.ts provides a deterministic mock with synthetic fields.
- apps/context-panel/src/orchestrator-wire.ts maps mock results to PanelState discriminated union.
- POC uses synthetic data. Synthetic data does not contain personal data. This is a POC limitation, not a data classification change.
- Per Implementation-Backlog.HRP-Owned-V7.9b-f.md §1: AC must have staging/synthetic evidence; mock pass is NOT provider/HRP DB proof.

## 8. Conditions sufficient to switch path from mock to HRP real

Before any path moves from mock to HRP real, ALL of the following must be true (T0 to arbitrate any open point):
1. Auth design for the slice accepted (REC-002 accepted; OPEN/PROPOSED is not sufficient).
2. Implementation evidence for the read endpoint.
3. HRP staging DB evidence for the read path.
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
- Identity preview by signals (ReadOnlyIdentityPreviewRequestSchema path is separate).

## 10. Client-domain path status

Per Owner prompt D.2: Client domain is NOT yet decided. Until Owner / T0 chot Client semantics, Client panel stays UNAVAILABLE in this slice. Not suppressed; just not in scope for this round.
