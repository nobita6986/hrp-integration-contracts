# Questions for HRP (T0 HRP)

Each question has a Decision-ID (mapping to REC-* or new), evidence reference, requested action, and the layer (HRP technical / two-T0 design / Owner business).
Per Owner prompt D.3: do NOT ask HRP to implement all 28 modules. Only ask what is needed for the P9/B.03 read-only slice and adjacent open decisions.

## Layer A: HRP technical evidence needed

### Q1. Read-only Talent context query capability
- Decision-ID: NEW-Q-001 (or fold into REC-002 / REC-003 when decided).
- Question: Does HRP provide a read-only query endpoint that returns canonical LaborProfile + currentAvailability + currentRelationship + nextAction summary by canonical laborProfileId? Source: connector hrp-connector.md §6 (read-only identity resolution, read contactability, read allowed transitions/capabilities).
- Evidence reference: HRP r3 THIN_SLICE_CAPABILITY_MATRIX.md (bundle commit 2ee99394) lists Simple Workbench Query as SOURCE_ONLY at C:/CodeApp/HrP/src/domains/talent/labor-profile.read-service.ts; Runtime Impl = Yes; Test Execution State = NOT_VERIFIED; Deployed = UNVERIFIED.
- Requested action: Provide (a) endpoint path, (b) pinned contract version, (c) authentication method (which is itself gated by REC-002 PROPOSED), (d) field allowlist for the read path, (e) evidence that currentRelationship comes from HRP projection not a chat-side construct.
- Why CRM cannot proceed without it: B.03 Context Panel AC requires CurrentRelationship from HRP projection; chat-constructed values would violate H.08.

### Q2. PlacementCase mapping status
- Decision-ID: tied to REC-001 carry-forward correction.
- Question: Per Owner prompt B carry-forward: HRP owns canonical PlacementCase lifecycle (APPROVED in CRM-HRP-MSG-008), but wire mapping between CRM intendedStage (NEW/CONTACTING/.../READY_TO_START) and HRP status (OPEN/IN_PROGRESS/READY_TO_PLACE/CLOSED) is UNRESOLVED. What is the proposed mapping? Source: HRP r3 GAP_REPORT §17, supplement CLAIM_VERIFICATION.md §C.
- Evidence reference: HRP r3 GAP_REPORT §17 explicitly states UNRESOLVED mapping status; supplement §C re-affirms; supplement §C also notes that canonical authority proposal is not yet bilaterally accepted.
- Requested action: Provide (a) proposed CRM-intendedStage -> HRP-status mapping (table), (b) which mapping actions would require an HRP transition (write) vs which are projection-only (read), (c) which transitions are HRP-rejected (e.g., CLOSED with reason UNREACHABLE cannot auto-trigger from a single no-answer).
- Why CRM cannot proceed without it: CRM may not invent the mapping; this is HRP-owned authority. Until provided, CRM-side intendedStage remains a CRM-only operational request field with no canonical effect.

### Q3. Aff-03B pending delta deployment
- Decision-ID: HRP-CRM-REC-002 / -003 adjacent; not blocking this slice but relevant.
- Question: HRP r3 GAP_REPORT §10 marks Public Apply (AFF-03B) as Pending SHA 1c08ecddd10564e0372f4146cf3527b5b21d4351 (merged = No, deployed = No). What is the deployment status and is RLS 42501 fix included?
- Evidence reference: HRP r3 hrp-contract-baseline.json pendingDeltas array entry.
- Requested action: Update HRP baseline JSON when AFF-03B is merged and deployed. Update Capability Matrix testExecutionState.
- Why this matters: AFF-03B unblocks Public Apply path; not in B.03 thin slice but adjacent to intake path B.04. CRM keeps B.04 disabled until this is ACCEPTED.

### Q4. HRP-symbol NOT_FOUND_IN_SURVEY_SCOPE clarification
- Decision-ID: NEW-Q-004 (supplement-driven).
- Question: Supplement F Supersession Ledger marks updateAvailability / findOrCreateLaborProfile / updateStatus as NOT_VERIFIED / NOT_FOUND_IN_SURVEY_SCOPE at HRP baseline 1059f666. The supplement explicitly warns: do NOT infer HRP lacks all capability just because one function name is missing. Are there renamed or split functions in the same domain (availability / intake / placement-case) at the same baseline?
- Evidence reference: supplement CLAIM_VERIFICATION.md §D HRP Symbol Verification table; §F Supersession Ledger.
- Requested action: Provide (a) the actual HRP source file path(s) that implement availability mutation, intake creation, and PlacementCase status transition at baseline 1059f666, (b) the canonical exported symbol name(s), (c) any HRP-side runtime evidence that the functions are wired (entrypoint + actor + tx).
- Why this matters: CRM GAP_REPORT §4 / §9 / §17 still cite function names that no longer match HRP source. CRM cannot plan availability / intake / case migration paths until the real symbol names are known.

## Layer B: Two-T0 design

### Q5. Bilateral acceptance mechanism for read-only slice
- Decision-ID: NEW-Q-005 (operationalizes RECONCILIATION_PROTOCOL §2 / §3).
- Question: When HRP and CRM Tier 0 both pin the same immutable commit SHA for the B.03 read-only slice acceptance, what is the message-ID sequence? Owner prompt specifies non-automated, Tier-0-to-Tier-0 via Owner. Source: RECONCILIATION_PROTOCOL §1 / §2.
- Evidence reference: RECONCILIATION_PROTOCOL.md in HRP r3 bundle.
- Requested action: Agree on (a) message-ID convention for next round (propose HRP-CRM-MSG-007 -> CRM-HRP-MSG-008 etc. to follow observed numbering), (b) the exact pinning rule for ACCEPTED_SHARED on a read-only query capability.
- Why this matters: Without an agreed mechanism, ACCEPTED_SHARED cannot be reached bilaterally. CRM keeps ACCEPTED_SHARED = 0 in the meantime.

### Q6. REC-001-OPS operational scope
- Decision-ID: HRP-CRM-REC-001-OPS (Owner prompt B explicitly separates this from REC-001 APPROVED).
- Question: For suppression union semantics (CRM channel/contact/connection + HRP canonical-person within org), what is the proposed operational shape for: cache TTL, propagation, invalidation, resync, recovery, unavailable behavior?
- Evidence reference: HRP r3 RECONCILIATION_DECISIONS.md §HRP-CRM-REC-001 (status OWNER_DECISION_BLOCKED, RECOMMENDED_OPTION lists all of these as pending); HRP REC-001 DECISION.md marks REC-001-OPS as OPEN/PROPOSED.
- Requested action: Draft a joint operational proposal (HRP + CRM Tier 0) covering the six dimensions listed in the HRP REC-001 RECOMMENDED_OPTION. Submit to Owner for separate decision.
- Why this matters: REC-001 is approved but not implementable until REC-001-OPS is decided. Do not treat REC-001 approval as deployment right (per HRP REC-001 DECISION.md System Boundaries section).

### Q7. REC-004b enum compatibility policy
- Decision-ID: HRP-CRM-REC-004b (OPEN/PROPOSED).
- Question: For wire enum values that the Owner pinned (PLACEMENT_CASE_STAGES, AVAILABILITIES, CURRENT_RELATIONSHIPS, CASE_CLOSE_REASONS in connector §3), what is the proposed compatibility policy when (a) HRP adds a new enum value, (b) CRM parses unknown value, (c) a closed-Zod consumer exists?
- Evidence reference: HRP r3 RECONCILIATION_DECISIONS.md §HRP-CRM-REC-004b.
- Requested action: Joint proposal on compatibility window, codegen policy, and deprecation cadence.
- Why this matters: B.03 slice reads AVAILABILITIES + CURRENT_RELATIONSHIPS. Without a policy, HRP adding a value can silently break CRM Zod parsing.

## Layer C: Owner business decision

### Q8. Client-domain thin slice timing
- Decision-ID: NEW-Q-008 (Owner prompt D.2: Client domain chua duoc chot).
- Question: When does Owner intend to chot Client semantics for a parallel thin slice? What are the proposed fields (displayName, currentOpportunity, currentClientRelationship) and authority boundaries?
- Evidence reference: HRP r3 GAP_REPORT §1 (ClientContact, SalesOpportunity, ClientInteraction, ClientNextAction all NOT_FOUND_IN_SURVEY_SCOPE at baseline 1059f666).
- Requested action: Owner decision on (a) which Client symbols belong to HRP authority vs CRM authority, (b) order of Client slice relative to Talent slice.
- Why this matters: CRM-side Client panel stays UNAVAILABLE until decided.

### Q9. KPI / planning modules ordering
- Decision-ID: NEW-Q-009 (referenced in Implementation-Backlog.HRP-Owned-V7.9b-f.md §121).
- Question: KPI / planning modules are noted as pending domain decisions. When does Owner intend to chot module-level authority (canonical vs derived) so that the analytics / BoD work in Phase 10 backlog has a stable base?
- Evidence reference: Backlog §121 explicit note that KPI/planning modules need separate domain decisions / PR.
- Requested action: Owner decision on (a) canonical KPI source authority, (b) when Phase 10 backlog can start.

## What this list does NOT ask

- CRM does NOT ask HRP to implement all 28 wire modules.
- CRM does NOT ask HRP to release tagged contracts.
- CRM does NOT request HRP core DB credentials.
- CRM does NOT request any change to frozen contracts @hrp-engagement/contracts@0.0.8-g0.8-fixes.
- CRM does NOT request force-push, merge to main, or bootstrap of neutral package.

