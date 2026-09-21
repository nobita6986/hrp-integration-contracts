# Thin-Slice Brief — Read-only Talent Context (B.03 priority)

**Slice ID (proposed):** P9/B.03-thin-slice-r1 (read-only Talent context panel).
**Backlog source:** Implementation-Backlog.HRP-Owned-V7.9b-f.md §B.03 Context Panel nhung va authorization; connector hrp-connector.md §6 Read-only identity resolution and §2 HRP -> App context panel.
**Priority:** Read-only path. Per Owner prompt D.2: not intake / merge / case mutation / outbound.
**T0 decision pending:** Yes. This is a proposal; HRP endpoint implementation is NOT opened in this task.

## 1. UI action / use case (CRM-side actual)

- Chatwoot conversation sidebar: select a Talent profile to display summary fields in a side panel.
- Sidebar items: displayName, currentAvailability, currentRelationship (read-only projection), nextAction summary, expectedVersion.
- Behavior: open panel does NOT mutate anything; no review trigger; no intake start; no case open/update/close.
- Reference CRM app (read-only, not modified in this task): apps/context-panel/src/ui/components/talent-panel.tsx, apps/context-panel/src/ui/types.ts, apps/context-panel/src/orchestrator-wire.ts.

## 2. Minimum data needed

CRM-side proposed minimum (T0 HRP to confirm scope):
- canonical laborProfileId (opaque, scoped to organization).
- displayName (allowed field).
- currentAvailability enum (AVAILABILITIES from connector §3, OWNER-approved target values; NOT yet a runtime HRP enum).
- currentRelationship enum (CURRENT_RELATIONSHIPS from connector §3; read-only projection; mutation MUST be rejected).
- nextAction summary: action label + scheduledAt + status (OPEN/DONE/CANCELLED) + version.
- expectedVersion (for optimistic concurrency if any subsequent mutation is ever wired).

PII fields (CCCD, address, raw transcripts) are EXCLUDED from this slice. They belong to H.05 / C.04 / C.05 (residency) which require separate Owner approval and HRP-side delivery.

## 3. Actor, org scope, target resolution, permission/field masking

- Actor: authenticated CRM user with context.read capability (proposed capability key in connector §10).
- Org scope: server-side verified organizationId from authenticated principal; CRM never self-declares org in body.
- Target resolution: canonical laborProfileId; mapping from Chatwoot conversation metadata to canonical ID requires HRP-owned mapping service (HRP-claimed authority in r3 GAP_REPORT §13 mappings.ts disposition TARGET_ONLY). NOT in scope for this slice.
- Permission: object-level permission (CRM user can read only profiles accessible to their org/role); field-level PII visibility must follow connector §2 read allowlist.
- Field masking: CCCD fields hidden; address hidden; raw transcripts hidden; only displayName + enum projections + nextAction summary exposed.

## 4. CRM schema / symbol actual at pinned baseline

CRM baseline: 72643356a0d1355f9dccc3921b47c990ea9c31c1
Frozen contracts package: @hrp-engagement/contracts@0.0.8-g0.8-fixes
Symbols (read from HEAD, not modified):
- packages/contracts/src/commands/profile.ts: LaborProfileSchema, ApplicationSchema.
- packages/contracts/src/enums.ts: AvailabilitySchema, RelationshipSchema (enums).
- packages/contracts/src/primitives.ts: VersionSchema, IsoTimestampSchema, IdSchema.
- packages/contracts/src/commands/queries.ts: QueryReadModelSchema, QueryInputSchema (envelope side only).
- apps/context-panel/src/ui/types.ts: TalentPanel field model.
- apps/context-panel/src/orchestrator-wire.ts: panel wire mapping.
- apps/context-panel/src/ui/mock-api.ts: existing mock provider (T1-A continues to mock per Owner E).

Status (CONTRACT-01 r1 inventory):
- profile.ts -> TARGET_ONLY (HRP-owned semantic; wire side).
- enums.ts -> TARGET_ONLY (wire vocabulary).
- queries.ts -> TARGET_ONLY (envelope only).
- All read-only symbols needed for this slice currently are TARGET_ONLY. ACCEPTED_SHARED = 0 unchanged.

## 5. HRP counterpart evidence

Per HRP r3 THIN_SLICE_CAPABILITY_MATRIX.md (bundle commit 2ee99394):
- Simple Workbench Query (Read): SOURCE_ONLY (C:/CodeApp/HrP/src/domains/talent/labor-profile.read-service.ts, query); Runtime Impl = Yes; Test Exists = Yes; Test Execution State = NOT_VERIFIED; Merged = Yes; Deployed = UNVERIFIED.
- Read-only context by verified target is listed in connector §6 as a query capability the HRP side needs to provide. Not yet present in the r3 GAP_REPORT module list (no entry mapping to the proposed query capability).
- LaborProfile Create/Match (findOrCreateLaborProfile) was SUPERSEDED in supplement a0cd30e: NOT_FOUND_IN_SURVEY_SCOPE at baseline 1059f666. Read-only counterpart findOrCreateLaborProfile does not exist either.
- Per supplement Section F Supersession Ledger: do NOT infer HRP lacks all capability just because one function name is missing.

## 6. Dependency on H tasks

- P9/H.01 (canonical command infrastructure) and P9/H.02 (identity resolution) are upstream dependencies. H.02 must be ACCEPTED before H.08 (context/events/analytics source APIs) can serve this slice with HRP real data.
- P9/H.08 AC requires CurrentRelationship from HRP projection (not chat-constructed). Until H.08 is ACCEPTED and H.02 evidence is delivered, CRM-side panel MUST keep using mock with a clear label.
- P9/H.09 (gateway thật + canonical readiness gate) is the runtime gate that authorizes switching the panel from mock to HRP real. Pin contracts/version/auth endpoints required.

## 7. Mock behavior currently in CRM

- apps/context-panel/src/ui/mock-api.ts provides a deterministic mock with synthetic fields.
- Per Implementation-Backlog.HRP-Owned-V7.9b-f.md §1 (nghiep thu rules): AC must have staging/synthetic evidence; mock pass is NOT provider/HRP DB proof.
- T1-A Chatwoot POC continues using this mock per Owner prompt E (no edits to POC files).

## 8. Conditions sufficient to switch path from mock to HRP real

All of the following must be true before any path moves from mock to HRP real (gate is P9/H.09):
1. P9/H.01/H.02/H.08 PR merged into HRP main and Acceptance recorded with evidence.
2. HRP provides pinned contracts/version/auth endpoints per REC-002 (when REC-002 is APPROVED, not just PROPOSED).
3. HRP staging DB evidence exists for read-only query (no Prisma fallback; CurrentRelationship from projection).
4. Owner approval to flip the flag for this specific read path.
5. Bilateral acceptance (HRP + CRM Tier 0) on the same revision pinning an immutable commit SHA (RECONCILIATION_PROTOCOL §3).

Until all 5 are met, the panel stays on mock with a CLEAR LABEL. Do not silently switch.

## 9. Out of scope for this slice (Owner prompt D.2)

- Intake creation.
- Merge / privileged identity review.
- Case mutation (open / update / close PlacementCase).
- Availability update.
- Interaction record.
- NextAction update.
- Outbound / broadcast / DNC release gate (D.04).
- Analytics facts / BoD aggregates.
- Evidence / residency (CCCD).
- CCCD-resident storage, media scan, retention.

## 10. Client-domain path status

Per Owner prompt D.2: Client domain is NOT yet decided. Until Owner / T0 chốt Client semantics (separate brief), Client panel stays UNAVAILABLE in the slice.

