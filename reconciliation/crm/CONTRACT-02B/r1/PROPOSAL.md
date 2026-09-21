# CONTRACT-02B — Minimal Talent Read Contract Proposal (r1)

From: T1-B (CRM reconciliation slice brief owner)
To: T0 (HRP-CRM reconciliation); CC: T1-A
Scope: Minimal read-only Talent contract for HRP-CRM B.03 real path (planning only; no code, no frozen-contract changes, no consumer migration).

Provenance:
- CRM baseline (full SHA): 72643356a0d1355f9dccc3921b47c990ea9c31c1
- CRM frozen package: @hrp-engagement/contracts@0.0.8-g0.8-fixes
- CRM CONTRACT-02A r3 (predecessor): d91d07f517782643666ab01cce78bdf5424073ab
- HRP evidence response r3 (input): 61fd3a4236bd71d891f7e5030beafbd08ccdc505
- HRP baseline (current): a49ceaa83ffa986bf939823a4e9f2c803a0649d6
- HRP baseline (previous, immutable): 1059f6669482efac5b7956ef25d43996ca59d515
- HRP REC-001 decision: 2accd9a183333b412203e3dfb155893579afa47a

Governance:
- REC-001 = OWNER_APPROVED (domain authority)
- REC-001-OPS = OPEN/PROPOSED
- REC-002 (S2S auth) = OPEN/PROPOSED
- REC-003 = OPEN/PROPOSED
- REC-004b = OPEN/PROPOSED
- ACCEPTED_SHARED = 0
- HRP_IMPLEMENTED = 0

This proposal is a CRM-side document for T0 arbitration; it does NOT speak for HRP T0 or independent Auditor.

---

## 1. Field mapping — frozen CRM wire vs HRP existing capability

### 1.1 Method

CRM-side frozen wire (queries.ts and enums.ts at pinned CRM baseline 72643356):
- ContextQueryRequestSchema (queries.ts L131) — request envelope.
- ContextPanelResultSchema (queries.ts L312) — response envelope.
- Sub-schemas: ContextPanelIdentitySummarySchema (L172), ContextPanelPlacementCaseSchema (L185), ContextPanelAvailabilitySchema (L226), ContextPanelCurrentRelationshipSchema (L241), ContextPanelNextActionSummarySchema (L252), ContextPanelContactabilitySchema (L288), ContextPanelSuppressionSummarySchema (L299).
- Primitives: SchemaVersionSchema, QueryScopeSchema (L101), CanonicalIdSchema, ExpectedVersionSchema, IsoTimestampSchema, ActorSchema (USER/SERVICE/DELEGATED_USER), CommandSourceSchema (HRP_UI/INTEGRATION), AvailabilitySchema, CurrentRelationshipSchema, PlacementCaseStageSchema, ClosedCaseStatusSchema, CaseCloseReasonSchema, NextActionStatusSchema (enums.ts).

HRP-side existing capability (per SOURCE-EVIDENCE.md from HRP response r3 at commit 61fd3a42, baseline a49ceaa):
- HTTP method/path: GET /api/admin/labor-profiles/[id]
- Source symbols: ADMIN_ROLES, GET, getLaborProfileDetail, LaborProfileDetailDto, resolveEffectivePermissions, withDbContext, getAuthContext.
- DTO (LaborProfileDetailDto) source: src/domains/talent/labor-profile.read-service.ts (L135-L176 + service method L178-L247).
- Permission gating: resolveEffectivePermissions includes CAN_VIEW_WORKER_SENSITIVE; phone/CCCD masking depends on this gate.
- Auth: cookie hrp_session / Bearer HS256; getAuthContext decodes JWT, looks up User in DB, checks isActive; role taken from DB.
- Route role allowlist: ADMIN_ROLES = {ADMIN, HR_MANAGER, HR_STAFF}.
- LaborProfile RLS: migration 20260908150001_v6_phase1a_labor_profile_rls (FORCE ROW LEVEL SECURITY); policy hrp_labor_profile_scope by role/user/Worker relationship.

### 1.2 Mapping table — existing / needs-adapter / unsupported / decision-required

| CRM wire field (frozen) | HRP existing | Status | Decision required |
|---|---|---|---|
| ContextQueryRequestSchema.target (CanonicalTargetRefSchema.optional()) — canonical laborProfileId or client ID | GET /api/admin/labor-profiles/[id] URL param id | EXISTING (canonical path) | None for routing param. Canonical ID must come from server-side mapping, not from CRM body alone. |
| ContextQueryRequestSchema.external (ExternalContactRefSchema.optional()) — provider/connection/externalAccountId/externalConversationId | Not in HRP route/service path | UNSUPPORTED in current route | Needs decision: external to canonical mapping either at CRM (no HRP endpoint) or as new HRP route; HRP r3 confirms no current endpoint matches. |
| ContextQueryRequestSchema.scope (QueryScopeSchema) — schemaVersion, organizationId, actor, asOfVersion, provider, connectionId, commandId, idempotencyKey | HRP route has no scope envelope; AuthContext has no organizationId; request is single-id URL + cookie | NEEDS ADAPTER (full new auth/scope) | REC-002 acceptance. HRP confirms current route has no organizationId, no service identity, no CRM S2S auth. |
| ContextQueryRequestSchema.fieldAllowlist (8 enum members) | Not in HRP response | NEEDS ADAPTER (response shaping) | Decision: which fields are HRP-supported as 200, which are returned-as-unavailable, which are 403. |
| ContextPanelResultSchema.identitySummary (fullNameRedacted?, phoneRedacted?, displayOnly: true) | HRP returns id, fullName, phone (masked or full per CAN_VIEW_WORKER_SENSITIVE), cccdNumber (same), completeness, identityVerification | NEEDS ADAPTER (DTO to wire mapping + masking convention) | Decision: HRP does NOT produce fullNameRedacted/phoneRedacted/literal displayOnly: true. Adapter at CRM would have to redact. But adapter-on-CRM-side means redaction logic lives in CRM; HRP should still enforce server-side. |
| ContextPanelResultSchema.placementCase (id, stage, closedStatus, closeReason, aggregateVersion) | HRP returns placementCases: [{id, status}][] — internal detail | PARTIAL EXISTING (different shape); transition/wire mapping is OUT_OF_SCOPE_THIS_ROUND per HRP r3 | Decision: either drop placementCase from this slice or include with explicit shape gap; CRM does NOT add wire fields. |
| ContextPanelResultSchema.availability (AvailabilitySchema + availableFromDate + aggregateVersion + contactabilityVersion) | HRP has no canonical response field | UNSUPPORTED | Decision: return as unavailable per frozen contract, OR defer until HRP capability exists. |
| ContextPanelResultSchema.currentRelationship (CurrentRelationshipSchema + readonly: true) | HRP has no CRM enum projection; no readonly marker | UNSUPPORTED | Same as availability. |
| ContextPanelResultSchema.nextAction | HRP has no nextAction in current response | UNSUPPORTED | Same. |
| ContextPanelResultSchema.recentInteractions | HRP treats intakes/submissions as NOT equivalent to CRM interactions | UNSUPPORTED | Same. |
| ContextPanelResultSchema.contactability (dispatchOutcome + reasonCode + freshnessAt) | HRP has no canonical projection | UNSUPPORTED | Same. |
| ContextPanelResultSchema.suppressionSummary | DEFERRED (per HRP Q-A5); no suppression projection in current response | DEFERRED | Same. |
| ContextPanelResultSchema.snapshotVersion (ExpectedVersionSchema) | Not in HRP response. updatedAt exists in DTO but is NOT defined as a snapshot/concurrency/cache token. | UNRESOLVED (HRP r3 Q-A4) | Decision: do NOT use updatedAt as snapshotVersion; semantics not defined. |
| ContextPanelResultSchema.unavailableFields (8 enum members discriminator) | HRP has no such field | UNSUPPORTED | Decision: this is the right pattern per frozen contract; HRP should grow support to populate this discriminator when fields are unsupported. |
| Error shapes: 200/401/403/404/500 with {error, message} | HRP route uses {error, message} with codes FORBIDDEN/NOT_FOUND/INTERNAL etc. | EXISTING (close fit) | Decision: keep error shape similar; map to CRM error codes for UI. |
| RLS-hidden row to 404 (logical inference) | HRP route uses findUnique + null to 404; RLS FORCE; PostgreSQL behavior consistent | EXISTING (with inference caveat) | HRP r3 Q-A4 explicitly labels this as inference, NOT deployed CRM authorization evidence. CRM must not claim it as runtime evidence. |

### 1.3 What this means concretely

- Existing capability is one route: GET /api/admin/labor-profiles/[id].
- It returns LaborProfileDetailDto (internal shape) — NOT a Context Panel envelope.
- It uses cookie/Bearer HS256 user JWT (NOT service JWT, no audience, no org binding).
- It has no CRM service identity, no organization scope, no canonical object-permission binding for CRM.
- It has no field allowlist, no unavailableFields, no snapshotVersion.
- It exposes phone/CCCD depending on a permission key CAN_VIEW_WORKER_SENSITIVE (different model from CRM wire redacted/fullName+phone).
- It has no placement stage/availability/currentRelationship/nextAction projections.

Conclusion: HRP has 1 internal Talent Read endpoint with shape that does NOT match CRM frozen wire. B.03 real path is a GAP. CRM does NOT propose HRP build a new endpoint in this task; CRM proposes change-proposals for T0 arbitration.

### 1.4 Hard prohibitions

- Do NOT transmit raw LaborProfileDetailDto as wire.
- Do NOT transmit raw CCCD/phone to CRM.
- Do NOT use updatedAt as snapshotVersion.
- Do NOT add wire fields beyond the frozen contract to compensate for HRP gaps.
- Do NOT create a local CRM-side DTO named e.g. TalentContextView or TalentReadEnvelope to mirror HRP DTO.

---
## 2. Minimal read-only slice — proposal

### 2.1 Scope of minimal slice

Target: open a Chatwoot sidebar showing read-only Talent context for an existing conversation. CRM has already resolved conversation to a canonical laborProfileId (out of scope for this slice: the mapping service). The panel queries HRP for that canonical ID and renders the wire response.

Minimal UI needs (per CRM-side context-panel mock):
- Display name (redacted for PII).
- Display phone (redacted for PII).
- An HRP-issued current availability indicator if HRP returns it.
- A displayOnly literal flag (true).
- Optional: contactability indicator if HRP returns it (per HRP r3, no projection today).
- Optional: suppressionSummary if HRP returns it (DEFERRED).

Minimal wire needs (mapped to frozen CRM wire):
- ContextQueryRequestSchema.target = { kind: TALENT, laborProfileId: <canonical id> }.
- fieldAllowlist = [identitySummary] (minimal) OR identitySummary + contactability (if HRP supports).
- ContextPanelResultSchema.organizationId, .target, .identitySummary, .resolvedAt, .unavailableFields.

### 2.2 What is allowed in the response

For this minimal slice, ONLY the following wire projections are allowed (others returned as unavailable per frozen contract):

ALLOWED (must come from HRP):
- identitySummary: schemaVersion + fullNameRedacted + phoneRedacted + displayOnly:true. Phone/CCCD MUST be redacted at the HRP side, not at the CRM side. The frozen schema literal displayOnly:true is REQUIRED; HRP MUST emit this literal on this slice.

RETURNED-AS-UNAVAILABLE (per frozen contract unavailableFields enum, populated by HRP):
- placementCase
- availability
- currentRelationship
- nextAction
- recentInteractions
- contactability
- suppressionSummary (Q-A5 DEFERRED)

### 2.3 Change proposals — frozen schema gap analysis

CRM does NOT self-modify the frozen schema. The following are PROPOSALS for T0 arbitration; each is listed with frozen-schema-implications and HRP-side gap.

CHANGE-PROPOSAL-CP1: HRP MUST emit displayOnly:true literal in identitySummary.
- Frozen schema: ContextPanelIdentitySummarySchema.displayOnly is z.boolean() (L182). The literal true is REQUIRED for the CRM UI guard (UI must NOT use identitySummary fields as mutation targets).
- HRP-side gap: today HRP returns fullName/phone as plain strings (possibly masked). HRP does NOT emit a displayOnly literal.
- Decision: T0 to confirm whether HRP can emit displayOnly:true literal on the slice, OR whether the field needs to be added (it already exists).

CHANGE-PROPOSAL-CP2: HRP MUST redact phone/CCCD server-side.
- Frozen schema: fullNameRedacted and phoneRedacted are z.string().min(1).max(N).optional(); redacted form is required for CRM UI safety.
- HRP-side gap: HRP uses a permission gate CAN_VIEW_WORKER_SENSITIVE for unmasking; this is a different model from CRM wire (which is always-redacted).
- Decision: T0 to confirm whether HRP can return redacted phone/CCCD in this slice, OR whether the slice is restricted to a stricter subset of users. CRM does NOT want unmasked phone/CCCD on this slice.

CHANGE-PROPOSAL-CP3: HRP MUST populate unavailableFields enum when a field is not supported.
- Frozen schema: ContextPanelResultSchema.unavailableFields is z.array(z.enum([...8 members])).max(16).optional() (L338-346).
- HRP-side gap: today HRP has no unavailableFields field.
- Decision: T0 to confirm whether HRP can populate this discriminator when a field is unsupported. This is the right wire pattern.

CHANGE-PROPOSAL-CP4: HRP MUST emit resolvedAt timestamp.
- Frozen schema: ContextPanelResultSchema.resolvedAt is IsoTimestampSchema (L336). REQUIRED.
- HRP-side gap: HRP does not currently emit a resolvedAt in LaborProfileDetailDto (DTO has createdAt/updatedAt but not a query resolvedAt).
- Decision: T0 to confirm whether HRP emits resolvedAt at query time.

CHANGE-PROPOSAL-CP5: HRP MUST emit organizationId in response.
- Frozen schema: ContextPanelResultSchema.organizationId is OrganizationIdSchema (L316). REQUIRED.
- HRP-side gap: HRP source confirms AuthContext has no organizationId; route does not return org.
- Decision: T0 to confirm whether HRP grows org binding (REC-002) AND emits org in response, OR whether the wire is changed. CRM does NOT want body-self-declared org.

CHANGE-PROPOSAL-CP6: HRP MUST emit a snapshotVersion OR the field becomes optional.
- Frozen schema: ContextPanelResultSchema.snapshotVersion is ExpectedVersionSchema (L317). REQUIRED in frozen contract.
- HRP-side gap: HRP confirms it does NOT have snapshotVersion. updatedAt exists but is NOT defined as snapshot/concurrency/cache token.
- Decision: T0 to confirm whether (a) HRP defines and emits snapshotVersion, OR (b) the frozen schema is updated to make snapshotVersion optional. CRM does NOT propose using updatedAt.

### 2.4 Negative evidence (what CRM does NOT propose)

CRM does NOT propose:
- New shared DTO between CRM and HRP (e.g. TalentReadView).
- CRM-side redaction of phone/CCCD (HRP MUST redact server-side).
- CRM-side substitution of updatedAt for snapshotVersion.
- New schema fields beyond frozen to compensate for HRP gaps.
- HRP building a new S2S endpoint in this task.
- Concluding that HRP source domain lacks ALL capability because one route does not match the wire. HRP r3 confirms this explicitly in BASELINE-DELTA.md.

---
## 3. Auth/authorization proposal

### 3.1 Phân biệt existing HRP auth với phần phải xây mới

EXISTING in HRP (per SOURCE-EVIDENCE.md):
- cookie hrp_session / Bearer token HS256 (jwt.ts L11-L12, L34-L39, L59-L72).
- Claims: sub, role. NO audience, NO issuer, NO service identity, NO organizationId (jwt.ts; auth-context.ts L20-L27, L51-L97).
- AuthContext has userId, role, vendorId; isActive check; DB-driven role lookup (auth-context.ts L57-L68).
- withDbContext sets transaction-local GUCs; rls-context.ts L45-L74.
- LaborProfile RLS FORCE (migration 20260908150001_v6_phase1a_labor_profile_rls).

TO BE BUILT for CRM S2S path (per HRP r3 Q-A3 GAPs):
- CRM service identity (separate from human user).
- JWT audience HRP for service accounts (NOT user JWT).
- Service-account binding (CRM tenant + service principal).
- organizationId in AuthContext (currently absent).
- Trusted organization scope in request (currently absent in route/service).
- Evidence: CRM service identity to organization to canonical target authorization chain.

Decision: HRP source domain has user JWT + RLS; it does NOT have CRM S2S auth path. REC-002 remains OPEN/PROPOSED. CRM does NOT propose a TTL/credential/algorithm policy here; that is REC-002 territory for T0.

### 3.2 CRM-side proposal (NOT a T0 decision)

CRM proposes the following auth contract (T0 to arbitrate):

Layer 1 — Service identity (CRM-to-HRP):
- CRM holds a Service JWT issued by HRP for CRM-as-a-service. Audience: HRP. Subject: CRM service principal id (opaque, stable per CRM deployment).
- The Service JWT is sent on every CRM-to-HRP request via Bearer header.
- The Service JWT does NOT carry user identity; only service principal.
- The Service JWT lifetime and rotation policy is owned by HRP (REC-002).

Layer 2 — User delegation (if needed):
- CRM optionally forwards the CRM end-user id + delegationRef in the request, mapped to ActorSchema (primitives.ts L86-100): kind=DELEGATED_USER with serviceId + userId + delegationRef.
- HRP MUST validate the delegationRef server-side against the Service JWT and the user identity.
- If the user delegation is missing or invalid, HRP MUST reject.
- The delegationRef lifetime and validity is owned by HRP (REC-002).

Layer 3 — Organization binding:
- CRM sends organizationId in QueryScopeSchema (queries.ts L101) for every request. HRP MUST verify the Service JWT is authorized for that organization (server-side).
- HRP MUST reject requests where organizationId is not in the Service JWT authorization set.
- Cross-organization queries are denied by HRP server-side.
- organizationId is NOT self-declared by CRM body alone; HRP MUST reject mismatches.

Layer 4 — Canonical object permission:
- HRP MUST enforce object-level visibility using existing LaborProfile RLS (migration 20260908150001) for canonical laborProfileId.
- The RLS policy MAY need to be extended to include service principal / delegated user, not just human user.
- HRP MUST deny if RLS returns null (returns 404 NOT_FOUND, consistent with current route behavior).

Layer 5 — Field filtering:
- HRP MUST apply field allowlist server-side (when fieldAllowlist is set in request).
- HRP MUST redact sensitive fields (fullName, phone, cccdNumber) server-side based on HRP policy (CAN_VIEW_WORKER_SENSITIVE equivalent for service principal).
- HRP MUST populate unavailableFields enum when a field is not supported.
- CRM does NOT redact on its side; receiving redacted wire is the only acceptable response.

Layer 6 — Error behavior:
- 200: success body.
- 401: missing/invalid Service JWT.
- 403: org/role/delegation denial (with {error: FORBIDDEN, message: ...}).
- 404: canonical target not found OR RLS-hidden row (logical inference, HRP r3 caveat applies).
- 422: invalid request envelope.
- 409: idempotency conflict (when idempotencyKey is added to wire — currently absent in ContextQueryRequestSchema; this is a CHANGE-PROPOSAL).
- 429: rate-limit / temporary.
- 503: HRP temporarily unavailable.

### 3.3 Hard prohibitions

- Do NOT use admin token (cookie hrp_session) as the S2S credential. Admin cookie is HRP user auth, not CRM service auth.
- Do NOT share JWT secret between user auth and service auth.
- Do NOT have CRM self-declare organizationId without HRP verifying it against Service JWT.
- Do NOT allow CRM to direct-query HRP database (e.g., Prisma URL, raw SQL).
- Do NOT define TTL/credential rotation policy here (REC-002 territory).

### 3.4 Open questions for T0 (NOT to be answered here)

- Service JWT issuer (HRP-only vs mutual).
- Service JWT lifetime / rotation policy.
- Audience claim format.
- User delegation validation reference (HRP-internal vs shared).
- Service principal authorization set caching (Redis? in-memory?).
- Cross-org RLS policy shape for service principal.
- Field-allowlist enforcement: deny vs populate unavailableFields.

---
## 4. Acceptance criteria for future implementation

This section lists criteria T0 may use when designing AC for the implementation ticket. They are NOT tests run today.

### 4.1 Read-only / no mutation
- AC-1: The HRP endpoint is GET-only (idempotent, no side effects). Existing GET /api/admin/labor-profiles/[id] satisfies this.
- AC-2: No canonical write occurs on this path (no createOrMatch, no updateLaborProfile, no openPlacementCase, no recordInteraction).
- AC-3: No outbox event is emitted on this path.
- AC-4: HRP audit records the read (effectiveAt, recordedAt, actor=Service+User, source=INTEGRATION).

### 4.2 Valid access
- AC-5: With valid Service JWT + valid organizationId (Service JWT authorized) + valid canonical laborProfileId + valid user delegation: HRP returns 200 with redacted identitySummary.
- AC-6: HRP returns identitySummary fields as REDACTED per HRP policy; CRM does NOT receive raw phone/CCCD.
- AC-7: HRP returns identitySummary.displayOnly:true literal.
- AC-8: HRP returns organizationId in response (matches CRM-sent organizationId after HRP verification).
- AC-9: HRP returns resolvedAt timestamp (IsoTimestampSchema).
- AC-10: HRP returns unavailableFields enum populated when a field is unsupported.

### 4.3 Cross-org / object denial
- AC-11: Service JWT authorized for orgA; CRM sends organizationId=orgB; HRP returns 403 FORBIDDEN (NOT 404, NOT 200).
- AC-12: Service JWT authorized for orgA; CRM sends valid orgA but canonical laborProfileId is in orgB; HRP returns 404 NOT_FOUND (RLS hidden).
- AC-13: Service JWT authorized for orgA; CRM sends canonical laborProfileId that does not exist anywhere; HRP returns 404 NOT_FOUND.

### 4.4 Inactive / revoked actor
- AC-14: HRP user isActive=false in DB; CRM sends user delegation referencing this user; HRP returns 401 or 403 (auth session error path).
- AC-15: Service principal is revoked (JWT expired or revoked per HRP policy); HRP returns 401.
- AC-16: User delegation is invalid or expired; HRP returns 403.

### 4.5 Field masking
- AC-17: Caller does NOT have CAN_VIEW_WORKER_SENSITIVE equivalent for service principal; HRP returns phoneRedacted + cccdNumberRedacted (or omits).
- AC-18: Caller has CAN_VIEW_WORKER_SENSITIVE; HRP returns full values (but THIS IS OUT OF SCOPE for the B.03 minimal slice — CRM does NOT want unmasked phone/CCCD on the panel).
- AC-19: Phone/CCCD are redacted at the HRP side; receiving them unmasked is a wire violation.

### 4.6 Unsupported projections
- AC-20: When HRP does not support a field (e.g. availability), HRP returns 200 with the field omitted AND the field name in unavailableFields enum.
- AC-21: HRP does NOT return 500 for unsupported projections.
- AC-22: HRP does NOT return null for required frozen fields (organizationId, resolvedAt, schemaVersion, displayOnly).

### 4.7 Wire validation
- AC-23: Invalid envelope (e.g. missing schemaVersion, missing target/external) returns 422.
- AC-24: Strict mode rejects unknown fields (frozen schemas are .strict()).
- AC-25: Invalid enum (e.g. unknown fieldAllowlist member) returns 422.
- AC-26: schemaVersion mismatch returns 422 (or 409, REC-004b territory).

### 4.8 Response / error / version compatibility
- AC-27: 200 with valid envelope passes frozen-contract Zod parse.
- AC-28: Error envelope {error, message} is parseable by CRM UI error mapping (mock-api.ts ApiErrorCode).
- AC-29: 401 returns error code UNAUTHORIZED, message includes reason.
- AC-30: 403 returns error code FORBIDDEN, message non-PII.
- AC-31: 404 returns error code NOT_FOUND, message non-PII.
- AC-32: 429/503 returns retry hints (CRM respects).
- AC-33: Wire schemaVersion is preserved end-to-end (frozen literal 1).

### 4.9 Mock tests vs HRP route/DB integration evidence

MOCK-only evidence (CRM-side today):
- mock-api.ts (apps/context-panel/src/ui/mock-api.ts) provides deterministic synthetic responses.
- orchestrator-wire.ts (apps/context-panel/src/orchestrator-wire.ts) maps mock to PanelState.
- Unit tests for masking / unmasking in mock path.
- Mock tests satisfy UI display logic only. They do NOT satisfy any of AC-5 through AC-32.

REQUIRED HRP route / DB integration evidence (future, when real path opens):
- HRP staging DB with synthetic LaborProfile rows.
- HRP staging route GET /api/admin/labor-profiles/[id] (or successor) returning wire-compatible envelope.
- HRP staging Service JWT issuance + verification.
- HRP staging organization-binding + user-delegation verification.
- HRP staging LaborProfile RLS policy covering service principal / delegated user.
- HRP staging field-redaction policy returning redacted phone/CCCD.
- HRP staging unavailableFields population.
- End-to-end test: CRM mock replaced; real CRM mock-API call against HRP staging; verify AC-1 through AC-33.

Mock tests are NOT a substitute for HRP route/DB integration evidence. They are evidence only for the CRM mock panel behavior. CRM does NOT promote mock tests to AC for real path.

---
## 5. Ownership / dependencies

### 5.1 Ownership map

HRP-owned:
- S2S endpoint envelope (or shape that fits ContextQueryRequestSchema / ContextPanelResultSchema).
- Service JWT issuance + verification.
- User delegation validation.
- Organization binding.
- LaborProfile RLS policy (extension to service principal / delegated user).
- Field redaction policy (server-side; CRM NEVER redacts on its side).
- unavailableFields population.
- Audit trail for the read.

CRM-owned:
- Chatwoot integration mapping (conversation -> canonical laborProfileId) — out of scope for this slice (separate task).
- Context Panel UI rendering (apps/context-panel/src/ui/).
- PanelState state machine (apps/context-panel/src/ui/types.ts).
- Mock API for development (apps/context-panel/src/ui/mock-api.ts).
- CRM-side request construction (uses ContextQueryRequestSchema; CRM does NOT extend frozen schema).
- CRM-side response validation against frozen schemas (Zod parse).

Joint (decision required):
- Frozen-contract changes (CHANGE-PROPOSAL-CP1..CP6 in §2.3).
- REC-002 acceptance criteria.
- REC-004b (enum/error compatibility) policy.

### 5.2 Dependencies for the read path

REAL path (must-have):
- REC-002 acceptance: Service JWT design accepted.
- HRP implementation: S2S endpoint (or shape adapter) + Service JWT issuance + organization binding + RLS extension + field redaction + unavailableFields population.
- CRM implementation: Service JWT cache + request construction + Zod parse of response + error mapping.
- H.09 readiness gate: HRP-owned staging DB + integration evidence.
- Owner approval: explicit flip for the real path.

NOT required for the read path:
- Outbound/broadcast (D.04).
- Outbox publisher (H.07).
- Suppression OPS (REC-001-OPS).
- Client-domain path (Owner decision pending).
- KPI/Phase10 ordering (V7.10 backlog).
- AFF-03B Public Apply intake (separate B.04 path).
- Privileged merge / H.03 path.
- Update / close case (separate B.05).
- Availability update (separate).
- Interaction record (separate).

### 5.3 H.09 readiness gate

H.09 (per Implementation-Backlog.HRP-Owned-V7.9b-f.md §H.09) is the canonical readiness gate:
- Pin contracts/version/auth endpoints.
- Tests fixture mock/real tương thích result/error semantics.
- Shared fixture validation/report.
- Real path DOES NOT open until H.09 PASS for the read path specifically (independent of other paths).

### 5.4 Independent audit boundary

Per the established protocol, independent Auditor MUST pass:
- Wire envelope Zod parse against frozen schemas (CRM-side test suite).
- HRP route/DB integration evidence (HRP-side test suite).
- Cross-org denial test.
- Inactive actor test.
- Field redaction test.
- Unsupported projection test (unavailableFields population).

Mock tests are not sufficient. They satisfy UI display logic only.

### 5.5 Open backlog items (NOT scope for this slice)

- Chatwoot integration mapping (conversation -> canonical laborProfileId). Separate task. Not owned by T1-B.
- Client context panel. Owner decision pending.
- PlacementCase mapping (HRP r3 GAP_REPORT §17 + supplement §C: UNRESOLVED).
- Affinity / public apply (AFF-03B / AFF-03C). Out of scope.
- Suppression OPS (REC-001-OPS). OPEN/PROPOSED.
- Analytics / BoD (V7.10). Phase 10 backlog.

---

## 6. Files in this bundle

- PROPOSAL.md: This document. Sections 1-5.
- HRP-FIELD-MAPPING.md: Detailed mapping table with line references.
- CHANGE-PROPOSALS.md: Itemized change proposals for frozen schema + HRP gaps.
- ACCEPTANCE-CRITERIA.md: Detailed acceptance criteria for future implementation.
- README.md: Bundle provenance + verification.
- manifest.sha256: SHA-256 of bundle files (UTF-8, LF, no BOM). Excludes itself.

## 7. Boundaries confirmed

- No edits to frozen CRM contracts @hrp-engagement/contracts@0.0.8-g0.8-fixes.
- No edits to CRM source code (apps/**, packages/**, scripts/v7.9a/**).
- No bootstrap / tag / publish / merge / force-push / deploy.
- No opening of HRP endpoint implementation on the CRM side.
- No promotion of any module to ACCEPTED_SHARED.
- No request that HRP build a new endpoint in this task.
- No assumption that HRP source domain lacks all capability based on one route gap.
- No use of updatedAt as snapshotVersion.
- No transmission of raw LaborProfileDetailDto as wire.
- No transmission of raw CCCD/phone to CRM.
- No CRM-side redaction (HRP redacts server-side).
- No self-decision on TTL / credential / algorithm policy (REC-002 territory).

## 8. Supersession / revision pinning

- r1 supersedes nothing in the same bundle path; first revision.
- Predecessor (CONTRACT-02A r3): d91d07f (immutable in Git history).
- Input (HRP response r3): 61fd3a4 (immutable in Git history).
- No force-push per RECONCILIATION_PROTOCOL §3.

## 9. Stop condition

STOP — READY FOR T0 DESIGN REVIEW.
Await T0 arbitration on:
- CHANGE-PROPOSAL-CP1..CP6.
- REC-002 acceptance criteria for this read path.
- Field-allowlist behavior (deny vs unavailableFields).
- Whether B.03 real path uses existing GET /api/admin/labor-profiles/[id] with adapter, OR a new S2S endpoint is required.

No further action until T0 verdict.
