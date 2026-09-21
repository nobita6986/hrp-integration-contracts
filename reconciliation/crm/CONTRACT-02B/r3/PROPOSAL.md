# CONTRACT-02B r3 — Minimal Talent Read Contract Proposal (self-contained)

From: T1-B (CRM reconciliation slice brief owner)
To: T0 (HRP-CRM reconciliation); CC: T1-A

This is r3. r1 (608d67d) and r2 (93a31ce) are immutable Git history; their content is incorporated here and superseded. r3 is self-contained: readers do NOT need to combine r1 and r2 to derive the design.

r3 applies all corrections from T0 review of r1 and r2: CR-2-1 through CR-2-7, plus genuine content for CP1..CP8, AC-1..AC-31, and four gap analyses.

Provenance:
- CRM baseline (full SHA): 72643356a0d1355f9dccc3921b47c990ea9c31c1
- CRM frozen package: @hrp-engagement/contracts@0.0.8-g0.8-fixes
- CONTRACT-02A r3 (predecessor): d91d07f517782643666ab01cce78bdf5424073ab
- HRP evidence response r3: 61fd3a4236bd71d891f7e5030beafbd08ccdc505
- HRP baseline (current): a49ceaa83ffa986bf939823a4e9f2c803a0649d6
- HRP REC-001 decision: 2accd9a183333b412203e3dfb155893579afa47a
- r1 (immutable): 608d67daf9c0853b79862e72a117cf4bc520015c
- r2 (immutable): 93a31ce4abc1aa76f5a11b130c79f80447cbdf79

Governance:
- REC-001 = OWNER_APPROVED
- REC-001-OPS = OPEN/PROPOSED
- REC-002 (S2S auth) = OPEN/PROPOSED
- REC-003 = OPEN/PROPOSED
- REC-004b = OPEN/PROPOSED
- ACCEPTED_SHARED = 0
- HRP_IMPLEMENTED = 0

Note on HRP_IMPLEMENTED=0: this flag means the CRM-compatible S2S Talent-read slice is not confirmed implemented. It does NOT contradict the existing HRP internal GET /api/admin/labor-profiles/[id] endpoint, which is evidenced at SOURCE-EVIDENCE.md and has been surveyed.

---

## Section 1: Four Critical Gaps

Each gap has: (a) frozen requirement, (b) options with CRM preference, (c) impact if unresolved, (d) who decides.

### Gap 1: TalentTargetRefSchema — laborProfileVersion

Frozen requirement:
TalentTargetRefSchema (mappings.ts L246-253) is strict() and requires:
schemaVersion (string literal 1), kind=TALENT, laborProfileId (CanonicalIdSchema), laborProfileVersion (ExpectedVersionSchema, nonnegative integer).

Q1: CRM lay laborProfileVersion tu dau truoc lan doc dau?
- CRM cannot self-derive: not CRM-owned state.
- CRM cannot default 0: wire-violation if semantics is not zero.
- CRM cannot use updatedAt: HRP r3 confirms updatedAt is NOT defined as a snapshot/concurrency/cache token.

Options:
Option A: HRP returns version in a prior read (e.g., conversation-to-canonical mapping step). CRM caches for subsequent query.
Option B: HRP grows a read-by-ID-only variant where target = {laborProfileId} and server reads current version internally. No version in request.
Option C: contract change — make laborProfileVersion optional in TalentTargetRefSchema for this slice.
Option D: contract change — separate query request schema for read-only (no version in target).

CRM preference: Option B or C. Option A requires new HRP endpoint. Option D requires frozen-schema change. Option B keeps current schema intact while providing an HRP-owned workaround.

Impact if unresolved: Every ContextQueryRequest payload fails Zod parse against frozen TalentTargetRefSchema. B.03 slice cannot proceed.

Who decides: T0 + HRP (HRP owns the endpoint design).

CRM position: does NOT auto-fill with 0; does NOT substitute updatedAt; does NOT drop version without contract change; does NOT switch to external lookup to avoid gap.

### Gap 2: snapshotVersion — no HRP semantics defined

Frozen requirement:
ContextPanelResultSchema.snapshotVersion (queries.ts L317) is ExpectedVersionSchema REQUIRED in frozen. ExpectedVersionSchema (primitives.ts L38): z.number().int().nonnegative().max(MAX_SAFE_INTEGER).

HRP r3 position: no snapshotVersion in LaborProfileDetailDto; updatedAt exists but is NOT defined as snapshot/concurrency/cache token. REC-004b = OPEN/PROPOSED.

Options:
Option A: HRP defines snapshotVersion semantics (audit/concurrency/aging) and emits it. CRM passes through without interpretation.
Option B: contract change — make snapshotVersion optional in ContextPanelResultSchema for this slice. CRM proposes this because HRP r3 explicitly states no semantics today.

CRM preference: Option B. Rationale: HRP r3 explicitly states no snapshotVersion semantics; asking HRP to invent semantics for this slice is out-of-scope. Making the field optional is the legitimate change proposal.

Impact if unresolved: Every ContextPanelResult fails Zod parse. B.03 cannot proceed.

Who decides: T0 (CRM freeze owner) + HRP (implementation).

CRM position: does NOT substitute updatedAt for snapshotVersion. These are separate fields with separate semantics. The frozen schema distinguishes them for a reason.

### Gap 3: Trusted auth — S2S service identity, org binding, object permission

Frozen requirement:
QueryScopeSchema.actor (primitives.ts L86-100) accepts USER, SERVICE, or DELEGATED_USER. OrganizationIdSchema (primitives.ts L35) is opaqueId(organizationId, 64). ContextPanelResultSchema.organizationId is REQUIRED (queries.ts L316).

HRP r3 position: no S2S service identity, no JWT audience HRP, no organizationId in AuthContext, no service-account binding. HRP route uses user JWT (cookie hrp_session / Bearer HS256) for ADMIN/HR_MANAGER/HR_STAFF only. REC-002 = OPEN/PROPOSED.

CRM S2S proposal (consistent with CR-2-5):
Layer 1 — Service JWT: CRM holds a Service JWT issued by HRP. Audience = HRP. Subject = CRM service principal (opaque, stable).
Layer 2 — Delegation (PROPOSED — policy not chot): if HRP mandates delegation for this slice, missing delegation = reject. If HRP mandates delegation is optional, request proceeds with service-only identity. CRM does NOT pre-decide which policy. Delegation policy = HRP decision.
Layer 3 — Organization binding (PROPOSED): CRM sends organizationId in scope. HRP verifies Service JWT is authorized for that org. Cross-org = reject (403).
Layer 4 — Object permission (HRP-owned mechanism): HRP enforces object-level visibility. HRP chooses the mechanism (RLS extension, ACL layer, query-time check). CRM does NOT require RLS specifically. If permission denied: 404 NOT_FOUND (org scope) or 403 FORBIDDEN (authorization) — HRP chooses.

Who decides: T0 + HRP. REC-002 acceptance for this read path is a prerequisite for B.03 real path.

CRM position: does NOT use admin token (hrp_session cookie) as S2S credential; does NOT share JWT secret; does NOT direct-query HRP DB; does NOT self-declare organizationId without HRP verification; does NOT use client-side masking as a substitute for HRP authorization.

### Gap 4: Shared error mapping — no frozen error envelope

Frozen requirement:
queries.ts has ContextPanelResultSchema (L312) for 200 success. There is no frozen shared error sub-schema in queries.ts for 4xx/5xx. Frozen schemas are .strict().

HRP r3 position: route returns {error, message} with codes FORBIDDEN/NOT_FOUND/INTERNAL. ApiErrorCode (mock-api.ts L82-100) is CRM mock-only, not a shared wire contract.

CRM proposal:
- HRP error codes (FORBIDDEN, NOT_FOUND, INTERNAL) are proposed as standard for this slice. 401 for auth failure. 422 for envelope validation. 429/503 for temporary/retry.
- CRM UI maps these to PanelState kinds (forbidden, error, timeout, etc.).
- TypeScript union parseability or UI mapping parseability is NOT equivalent to frozen wire validation. These are separate concerns.
- RLS-hidden-row leading to 404 is a logical inference (HRP r3 §Q-A4). This is NOT confirmed deployed evidence for the CRM/S2S path. AC-12 reflects this as PROPOSED.

Who decides: T0 (shared error envelope definition).

---

## Section 2: Change Proposals (CP1..CP8)

Each proposal: FROZEN REQUIREMENT / SLICE PROPOSAL / CONTRACT CHANGE.

### CP1. identitySummary.displayOnly — slice emits true

FROZEN REQUIREMENT:
ContextPanelIdentitySummarySchema.displayOnly is z.boolean() (queries.ts L182). The literal true is NOT mandated by the schema; z.boolean() permits false. UI guard behavior (not treating displayOnly=false fields as mutation targets) is CRM-side design preference, not a frozen wire mandate.

SLICE PROPOSAL:
On the B.03 minimal Talent-read slice, HRP emits displayOnly=true literal when identitySummary is present. This is a slice constraint, not a frozen-schema change.

CONTRACT CHANGE: NONE.

Decision owner: T0 + HRP. HRP may decline; if declined, slice behavior is TBD.

### CP2. identitySummary.redacted fields — server-side redaction

FROZEN REQUIREMENT:
ContextPanelIdentitySummarySchema.fullNameRedacted: z.string().min(1).max(256).optional() (queries.ts L177).
ContextPanelIdentitySummarySchema.phoneRedacted: z.string().min(1).max(64).optional() (queries.ts L178).
CCCD is NOT a field in ContextPanelIdentitySummarySchema. There is no cccdNumberRedacted field in this schema.

SLICE PROPOSAL:
- HRP returns fullNameRedacted (redacted at HRP server-side) if HRP decides to surface full name.
- HRP returns phoneRedacted ONLY IF HRP decides to surface phone at all (field is optional in frozen schema; HRP may omit).
- HRP returns NO raw phone, NO cccdNumber, NO cccdNumberRedacted on this slice.
- If HRP cannot return phone (decides to omit), HRP returns response without phoneRedacted field. CRM does NOT interpret this as a reason to request a permission upgrade.

CONTRACT CHANGE: NONE. No cccd field is added to this schema.

Decision owner: T0 + HRP (HRP decides whether to surface phone at all).

### CP3. unavailableFields — for requested-unsupported only

FROZEN REQUIREMENT:
ContextPanelResultSchema.unavailableFields: z.array(z.enum([...8 members])).max(16).optional() (queries.ts L338-346). The 8 enum members correspond to fieldAllowlist values. The frozen schema does not define when HRP MUST populate it.

SLICE PROPOSAL:
Three states:
- Requested-supported: CRM asks for X, HRP returns X with data. unavailableFields does not include X.
- Requested-unsupported: CRM asks for X, HRP does not support X. HRP returns 200 with X omitted AND includes X in unavailableFields enum. This is the correct wire pattern for unsupported-requested fields.
- Unrequested: CRM does not ask for Y. HRP does not return Y, does not include Y in unavailableFields. Y is absent from both the response body and the unavailableFields array.

For B.03 minimal slice with fieldAllowlist=[identitySummary]:
- identitySummary: REQUESTED. If HRP supports: unavailableFields does not include identitySummary. If HRP does not: unavailableFields=[identitySummary].
- placementCase, availability, currentRelationship, nextAction, recentInteractions, contactability, suppressionSummary: all UNREQUESTED. They are NOT listed in unavailableFields. Absent from both response body and unavailableFields array.

CONTRACT CHANGE: NONE.

Decision owner: T0 + HRP (to confirm this behavior).

### CP4. resolvedAt — query-time timestamp

FROZEN REQUIREMENT:
ContextPanelResultSchema.resolvedAt: IsoTimestampSchema REQUIRED (queries.ts L336). IsoTimestampSchema (primitives.ts L62-66): z.string().min(20).max(40).datetime({ offset: true }). ISO-8601 with explicit UTC offset.

SLICE PROPOSAL:
HRP emits resolvedAt = ISO-8601 string with explicit UTC offset at query processing time. Missing resolvedAt = INVALID response against frozen schema.

CONTRACT CHANGE: NONE. Field stays REQUIRED in frozen schema.

Decision owner: T0 + HRP. HRP must emit this field.

### CP5. organizationId — required, HRP-verified

FROZEN REQUIREMENT:
ContextPanelResultSchema.organizationId: OrganizationIdSchema REQUIRED (queries.ts L316). OrganizationIdSchema (primitives.ts L35): opaqueId(organizationId, 64). Missing organizationId = Zod parse failure.

SLICE PROPOSAL:
- HRP verifies organizationId from the Service JWT authorization set (server-side).
- HRP returns organizationId in the response, matching the verified CRM-sent organizationId.
- HRP denies cross-org requests (403 FORBIDDEN).
- organizationId is NOT self-declared by CRM body without HRP server-side verification.

CONTRACT CHANGE: NONE. Field stays REQUIRED. HRP must grow AuthContext to include organizationId.

Decision owner: T0 + HRP (Gap 3 — REC-002 acceptance).

### CP6. snapshotVersion — semantics unresolved

FROZEN REQUIREMENT:
ContextPanelResultSchema.snapshotVersion: ExpectedVersionSchema REQUIRED in frozen (queries.ts L317). ExpectedVersionSchema (primitives.ts L38): z.number().int().nonnegative().max(MAX_SAFE_INTEGER).

HRP position: no snapshotVersion in LaborProfileDetailDto; updatedAt exists but is NOT defined as snapshot/concurrency/cache token (HRP r3 §Q-A4).

Option A (HRP capability): HRP defines snapshotVersion semantics and emits it. CRM passes through without interpretation.
Option B (contract change — CRM preference): make snapshotVersion optional in frozen ContextPanelResultSchema. HRP r3 explicitly states no semantics; asking HRP to invent semantics for this slice is out-of-scope. A contract change to make the field optional is the legitimate path.

CRM preference: Option B. CRM does NOT propose using updatedAt as a substitute.

Impact if unresolved: Every ContextPanelResult fails Zod parse. B.03 cannot proceed.

Decision owner: T0 (CRM freeze owner) + HRP (implementation).

### CP7. REC-002 acceptance for this read path

FROZEN REQUIREMENT:
REC-002 = OPEN/PROPOSED. Source: HRP r3 BASELINE-DELTA.md. HRP has user JWT + LaborProfile RLS. No CRM S2S auth path.

SLICE PROPOSAL:
For B.03 real path: Service JWT + audience HRP + service principal + delegation policy (HRP decision: mandatory or optional) + organization binding + object permission mechanism (HRP-owned choice) + field redaction policy. All remain PROPOSED until REC-002 is accepted for this specific path.

CONTRACT CHANGE: NONE. REC-002 acceptance is a governance decision, not a schema change.

Decision owner: T0 + HRP (independent Auditor for this path).

### CP8. REC-004b — enum/error compatibility

FROZEN REQUIREMENT:
Frozen schemas are .strict() (queries.ts L160 etc.). Enum values must match across versions (AvailabilitySchema, enums.ts L101). Wire schemaVersion literal is string 1 (SCHEMA_VERSION = string 1, enums.ts L210 — NOT numeric 1).

SLICE PROPOSAL:
- HRP error codes (FORBIDDEN, NOT_FOUND, INTERNAL, etc.) map to CRM-side error handling (see Gap 4).
- Enum values returned by HRP must match frozen schema enum values. No extension without a change proposal.
- schemaVersion literal preserved end-to-end as string 1.
- 401 for auth failure. 422 for envelope validation. No 409 idempotency conflict on this query slice (queries are idempotent by nature; idempotencyKey is not in ContextQueryRequestSchema).

CONTRACT CHANGE: NONE. Policy decision by T0 + HRP.

---

## Section 3: Acceptance Criteria (AC-1..AC-31)

These are for T0 to use when designing implementation acceptance criteria. They are NOT tests run today. Mock tests do NOT substitute for HRP route/DB integration evidence.

### AC-1..AC-4: Read-only / no canonical mutation

AC-1: HRP endpoint for this slice is idempotent. Request has no canonical-write side effects. (HRP decides transport: GET, POST-without-mutation, or other idempotent method; GET is one option, not the only option.)
AC-2: No canonical write occurs. No createOrMatch, updateLaborProfile, openPlacementCase, recordInteraction, updateLaborAvailability, updateNextAction.
AC-3: No outbox event emitted on this path. (Audit IS emitted — distinct from outbox.)
AC-4: HRP audit records the read with effectiveAt, recordedAt, actor=Service+User (if delegation mandated), source=INTEGRATION. Audit MUST NOT contain raw PII.

### AC-5..AC-10: Valid access

AC-5: With valid Service JWT + valid organizationId (Service JWT authorized for that org) + valid laborProfileId + valid user delegation (if mandated by HRP policy): HRP returns 200 with identitySummary.
AC-6: HRP returns identitySummary.fullNameRedacted if HRP decides to surface full name (optional). Redacted at HRP server-side. CRM does NOT receive raw fullName.
AC-7: HRP returns identitySummary.phoneRedacted if HRP decides to surface phone at all (optional, may be absent). Redacted at HRP server-side. CRM does NOT receive raw phone.
AC-8: HRP returns identitySummary.displayOnly=true literal (slice constraint, per CP1).
AC-9: HRP returns organizationId in response (matching verified CRM-sent organizationId).
AC-10: HRP returns resolvedAt as ISO-8601 string with explicit UTC offset.

### AC-11..AC-13: Cross-org / object denial

AC-11: Service JWT authorized for orgA; CRM sends organizationId=orgB; HRP returns 403 FORBIDDEN.
AC-12: Service JWT authorized for orgA; CRM sends valid orgA but laborProfileId is in orgB (or RLS-hidden); HRP returns 404 NOT_FOUND. (This is PROPOSED per HRP r3 inference; not confirmed as deployed evidence for the S2S CRM path. See Gap 4.)
AC-13: Service JWT authorized for orgA; CRM sends laborProfileId that does not exist; HRP returns 404 NOT_FOUND.

### AC-14..AC-16: Inactive / revoked actor

AC-14: HRP user isActive=false; CRM sends user delegation referencing this user; HRP returns 401 or 403.
AC-15: Service principal revoked (JWT expired or revoked per HRP policy); HRP returns 401.
AC-16: User delegation invalid or expired (if delegation mandatory per HRP policy); HRP returns 403.

### AC-17..AC-19: Field filtering

AC-17: HRP applies field allowlist server-side when fieldAllowlist is set in request. Requested-supported fields are returned. Requested-unsupported fields are absent AND listed in unavailableFields. Unrequested fields are absent and NOT in unavailableFields.
AC-18: HRP does NOT return raw phone, raw CCCD, or cccdNumberRedacted on this slice. Receiving any of these = wire violation.
AC-19: Phone is redacted at HRP side; receiving unmasked = wire violation.

### AC-20..AC-22: Wire validation

AC-20: Invalid envelope (missing schemaVersion, missing target, missing laborProfileVersion) returns 422.
AC-21: Strict mode rejects unknown fields (frozen schemas are .strict()).
AC-22: Invalid enum (unknown fieldAllowlist member) returns 422.

### AC-23..AC-26: Response / error / version compatibility

AC-23: 200 with valid envelope passes frozen-contract Zod parse for ContextPanelResultSchema.
AC-24: Error envelope {error, message} is handled by CRM UI error adapter. This adapter is NOT a shared wire contract (see Gap 4).
AC-25: 401/403/404/422/429/503 have appropriate error codes. No 409 idempotency conflict on this query slice (queries are idempotent; idempotencyKey not in ContextQueryRequestSchema).
AC-26: schemaVersion literal is preserved as string 1 end-to-end.

### AC-27..AC-31: Required HRP route/DB integration evidence (NOT mock)

AC-27: HRP staging DB with synthetic LaborProfile rows — verified by HRP-side test suite.
AC-28: HRP staging route returning wire-compatible ContextPanelResultSchema envelope — verified by HRP-side test suite.
AC-29: HRP staging Service JWT issuance + verification — verified by HRP-side test suite.
AC-30: HRP staging organization-binding + user-delegation verification (per delegation policy HRP decides) — verified by HRP-side test suite.
AC-31: End-to-end: CRM mock replaced with real call to HRP staging; verify AC-1 through AC-26.

Note on mock tests: mock-api.ts and orchestrator-wire.ts provide deterministic UI-level behavior. They satisfy PanelState state machine, mock error mapping, and mock redaction only. They do NOT satisfy AC-1 through AC-26.

---

## Section 4: Boundaries

Confirmed:
- No edits to frozen CRM contracts @hrp-engagement/contracts@0.0.8-g0.8-fixes.
- No edits to CRM source code (apps/**, packages/**, scripts/**).
- No bootstrap / tag / publish / merge / force-push / deploy.
- No opening of HRP endpoint implementation on the CRM side.
- No independent Auditor PASS.
- No promotion of any module to ACCEPTED_SHARED.
- No request that HRP build a new endpoint in this task.
- No assumption that HRP source domain lacks all capability based on one route gap.
- No use of updatedAt as snapshotVersion.
- No transmission of raw LaborProfileDetailDto as wire.
- No transmission of raw CCCD or phone to CRM.
- No CRM-side redaction (HRP redacts server-side).
- No self-decision on TTL / credential / algorithm policy (REC-002 territory).
- No auto-fill of laborProfileVersion with 0 or updatedAt without a contract change.
- No claim that UI ApiErrorCode is a shared wire contract.
- No claim that RLS-hidden-row-to-404 is confirmed deployed evidence for the S2S CRM path.

---

## Section 5: Files in This Bundle

- PROPOSAL.md: This document. Sections 1-5.
- CHANGE-PROPOSALS.md: CP1..CP8 detail with full body.
- ACCEPTANCE-CRITERIA.md: AC-1..AC-31 with full body.
- HRP-FIELD-MAPPING.md: Pinned source line references for all cited schemas and symbols.
- CORRECTION-LEDGER.md: Itemized corrections from r1/r2 and what r3 does differently.
- SCRATCH-VALIDATION.md: Approach and expected result for CRM-side Zod self-check (NOT_RUN).
- README.md: Provenance, verification, boundaries.
- manifest.sha256: SHA-256 of bundle files.

---

## Section 6: Supersession

- r3 supersedes r1 (608d67d) and r2 (93a31ce).
- r1 and r2 remain immutable in Git history.
- No force-push per RECONCILIATION_PROTOCOL section 3.

---

## Section 7: Stop Condition

STOP — READY FOR T0 DESIGN REVIEW.
Awaiting T0 arbitration on:
- Gap 1 (laborProfileVersion source) — Options A/B/C/D.
- Gap 2 (snapshotVersion) — Options A/B.
- Gap 3 (REC-002 acceptance for this read path).
- Gap 4 (shared error envelope definition).
- CP1..CP8 (all eight change proposals).
No further action until T0 verdict.
