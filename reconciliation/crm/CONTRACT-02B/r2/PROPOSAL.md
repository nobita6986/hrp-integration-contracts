# CONTRACT-02B r2 - Minimal Talent Read Contract Proposal (revised delta)
From: T1-B (CRM reconciliation slice brief owner)
To: T0 (HRP-CRM reconciliation); CC: T1-A

This is r2, supersedes r1 (commit 608d67daf9c0853b79862e72a117cf4bc520015c). r1 remains immutable. r2 applies T0 corrections (CHANGES_REQUIRED). Read r1 first for context; r2 only revises the affected sections.

Provenance:
- CRM baseline (full SHA): 72643356a0d1355f9dccc3921b47c990ea9c31c1
- CRM frozen package: @hrp-engagement/contracts@0.0.8-g0.8-fixes
- Predecessor (CONTRACT-02A r3): d91d07f517782643666ab01cce78bdf5424073ab
- HRP evidence response r3 (input): 61fd3a4236bd71d891f7e5030beafbd08ccdc505
- HRP baseline (current): a49ceaa83ffa986bf939823a4e9f2c803a0649d6
- HRP baseline (previous, immutable): 1059f6669482efac5b7956ef25d43996ca59d515
- HRP REC-001 decision: 2accd9a183333b412203e3dfb155893579afa47a
- r1 commit: 608d67daf9c0853b79862e72a117cf4bc520015c (immutable)
- r1 manifest (LF): a130b8ce8350b30dd8f84f012158051458a64739aa384bd222c47456beb94

Governance (unchanged from r1):
- REC-001 = OWNER_APPROVED
- REC-001-OPS = OPEN/PROPOSED
- REC-002 (S2S auth) = OPEN/PROPOSED
- REC-003 = OPEN/PROPOSED
- REC-004b = OPEN/PROPOSED
- ACCEPTED_SHARED = 0
- HRP_IMPLEMENTED = 0

---

## 1. Field mapping (revised)

Frozen CRM wire: queries.ts and enums.ts at pinned baseline 72643356. See r1 section 1.1 for full method.

### 1.1 TalentTargetRefSchema gap (CR-2-1)

CRITICAL GAP that r1 missed:

ContextQueryRequestSchema.target is CanonicalTargetRefSchema (discriminated union). CanonicalTargetRefSchema (mappings.ts L275) is a union of:
- TalentTargetRefSchema (mappings.ts L246) for kind=TALENT.
- ClientTargetRefSchema (mappings.ts L255) for kind=CLIENT.

TalentTargetRefSchema REQUIRED fields (frozen, mappings.ts L246-253):
- schemaVersion (SchemaVersionSchema, string literal 1).
- kind (z.literal TALENT).
- laborProfileId (CanonicalIdSchema, opaqueId rule).
- laborProfileVersion (ExpectedVersionSchema, nonnegative integer).

r1 wording assumed CRM sends kind + laborProfileId only. INCOMPLETE; payload fails Zod parse against frozen schema.

### 1.2 Three questions for T0/HRP (CR-2-1)

Q1: CRM lay laborProfileVersion tu dau truoc lan doc dau?
- CRM cannot self-derive: khong phai CRM-owned state.
- CRM cannot default 0: would be a wire-frozen violation.
- CRM cannot use updatedAt: not defined as version semantics.
- Possibilities (PROPOSED, chua quyet):
  (a) HRP returns version in a prior read (not yet implemented);
  (b) HRP grows a read-by-canonical-ID-only variant where target does not need laborProfileVersion;
  (c) contract change makes laborProfileVersion optional OR drops it from request.

Q2: laborProfileVersion semantics?
- Per frozen schema (ExpectedVersionSchema, primitives.ts L38): z.number().int().nonnegative().max(MAX_SAFE_INTEGER). Generic; semantics owned by HRP.
- CRM does NOT infer monotonic concurrency/concurrency token semantics.
- Decision: T0/HRP to declare whether this is audit, concurrency, aging, or something else.

Q3: Required capability / contract change proposal?
- Option A (HRP capability): HRP returns version in a separate read-only path; CRM caches for next request.
- Option B (contract change): laborProfileVersion becomes optional in TalentTargetRefSchema; or schema variant without version exists.
- Option C (separate frozen-schema proposal for read-only query): ContextQueryRequestSchema.target has its own structure that internally maps to a target variant.

CR-2-1 STATUS: synthetic payload in SCRATCH-VALIDATION.md is INVALID pending decision. CRM does NOT auto-fill; does NOT default 0; does NOT use updatedAt; does NOT drop version; does NOT switch to external lookup to avoid gap.

### 1.3 Other field mapping (r1 unchanged)

See r1 section 1.1, 1.2, 1.3, 1.4 at commit 608d67d. The remaining field-mapping table is not changed in r2; only Gap 1.1 (TalentTargetRefSchema) is material to B.03 minimal slice.

laborProfileVersion is a SEPARATE field from snapshotVersion (queries.ts L317 vs mappings.ts L251). They are different concepts in frozen schema. Decision about one does not imply decision about the other.

---


## 2. Minimal slice (revised)

### 2.1 requested-supported vs requested-unsupported vs unrequested (CR-2-6)

Three distinct states per wire projection:

- Requested-supported: CRM hoi X, HRP tra X voi data.
- Requested-unsupported: CRM hoi X nhung HRP khong ho tro; HRP bao unavailable theo contract (unavailableFields enum).
- Unrequested: CRM khong hoi X; HRP khong tra X; khong bao unavailable.

For minimal Talent slice with fieldAllowlist=[identitySummary]:
- identitySummary: REQUESTED. Outcome: requested-supported OR requested-unsupported depending on HRP-side decision (CP1, CP3 below).
- placementCase, availability, currentRelationship, nextAction, recentInteractions, contactability, suppressionSummary: UNREQUESTED. HRP does NOT include them in response; does NOT count them in unavailableFields. CRM UI may show placeholders or hide.

CRM does NOT default to listing all 7 unrequested fields in unavailableFields. unavailableFields is for requested-unsupported, not unrequested.

contactability is NOT in minimal slice (per r1 PROPOSAL section 2.2, kept in r2).

### 2.2 Three-category split per item (CR-2-2)

Each item re-classified into three categories:

| Item | FROZEN REQUIREMENT (source) | SLICE PROPOSAL (this slice) | CONTRACT CHANGE ||---|---|---|---|| identitySummary.displayOnly | z.boolean() REQUIRED (queries.ts L182) | Slice emits literal true if HRP server-side supports | NONE for frozen schema; behavior TBD by HRP || identitySummary.fullNameRedacted | z.string().min(1).max(256).optional() (queries.ts L177) | Slice emits redacted full name; redacted at HRP side | NONE || identitySummary.phoneRedacted | z.string().min(1).max(64).optional() (queries.ts L178) | Slice emits redacted phone ONLY IF HRP returns it; never raw | NONE || identitySummary vs CCCD | CCCD NOT a field of this schema | CCCD is NOT in this slice | NONE || organizationId | OrganizationIdSchema REQUIRED (queries.ts L316) | Slice includes if HRP server-side emits | CP5 PROPOSED: organizationId stays REQUIRED in frozen; HRP grows binding || resolvedAt | IsoTimestampSchema REQUIRED (queries.ts L336) | Slice includes if HRP emits query-time timestamp | CP4 PROPOSED: field stays REQUIRED; HRP emits || snapshotVersion | ExpectedVersionSchema REQUIRED in frozen (queries.ts L317) | Slice excludes if HRP cannot define semantics; preferrably field becomes OPTIONAL pending REC-004b | CP6 PROPOSED || unavailableFields | z.array(z.enum([...8])).max(16).optional() (queries.ts L338-346) | Slice populates for requested-unsupported only | CP3 PROPOSED |
displayOnly is z.boolean() in frozen schema (queries.ts L182). CR-2-2: ghi slice constraint literal true cho slice, khong goi la frozen literal. CRM does NOT claim UI guard bat buoc; UI guard la CRM-side design preference, khong phai wire mandate.

SCHEMA_VERSION literal: enums.ts L210 SCHEMA_VERSION = string 1. Frozen literal is string 1 (khong phai numeric). Acknowledged.

### 2.3 Slice constraints (CR-2-3)

- CCCD not in slice at all (no field in ContextPanelIdentitySummarySchema).
- phoneRedacted optional; if HRP does not return phone, response is valid.
- No raw phone/CCCD in wire (HRP-side redaction).
- If HRP cannot return phone (decides to omit), no automatic promotion of sensitive permission; CRM does NOT request permission upgrade.

### 2.4 Change proposals (revised: CP1..CP6 split by category)

See CHANGE-PROPOSALS.md in this bundle (r2-only file). CP1..CP6 rewritten to FROZEN REQUIREMENT / SLICE PROPOSAL / CONTRACT CHANGE.

---


## 3. Auth/authorization proposal (revised)

### 3.1 Phan biet existing HRP auth voi phan phai xay moi (r1 unchanged)

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

Decision: HRP source domain has user JWT + RLS; it does NOT have CRM S2S auth path. REC-002 remains OPEN/PROPOSED. CRM does NOT propose TTL/credential/algorithm policy here.

### 3.2 CRM-side proposal (NOT a T0 decision) — revised wording

CRM proposes the following auth contract (T0 to arbitrate). These are SLICE PROPOSALS, NOT CONTRACT CHANGE to frozen wire.

Layer 1: Service identity (CRM-to-HRP). PROPOSED.
- CRM holds a Service JWT issued by HRP for CRM-as-a-service. Audience: HRP. Subject: CRM service principal id (opaque, stable per CRM deployment).
- The Service JWT is sent on every CRM-to-HRP request via Bearer header.
- The Service JWT does NOT carry user identity; only service principal.
- The Service JWT lifetime and rotation policy is owned by HRP (REC-002).

Layer 2: User delegation (if needed). PROPOSED.
- CRM optionally forwards the CRM end-user id + delegationRef in the request, mapped to ActorSchema (primitives.ts L86-100): kind=DELEGATED_USER with serviceId + userId + delegationRef.

Layer 3: Organization binding. PROPOSED.
- CRM sends organizationId in QueryScopeSchema (queries.ts L101) for every request. HRP MUST verify the Service JWT is authorized for that organization (server-side).

Layer 4: Canonical object permission. PROPOSED + HRP-owned mechanism.

Layer 5: Field filtering. PROPOSED.

Layer 6: Error behavior. PROPOSED.
- 200: success body.
- 401: missing/invalid Service JWT.
- 403: org/role/delegation denial (with {error: FORBIDDEN, message: non-PII}).
- 404: canonical target not found OR organization hidden (logical inference, HRP r3 caveat applies).
- 422: invalid request envelope.
- 429: rate-limit / temporary.
- 503: HRP temporarily unavailable.

### 3.3 Hard prohibitions

- Do NOT use admin token (cookie hrp_session) as the S2S credential. Admin cookie is HRP user auth, not CRM service auth.

### 3.4 Open questions for T0 (NOT to be answered here)

- Service JWT issuer (HRP-only vs mutual).

---

## 4. Acceptance criteria — revised (r1 superseded)

r1 ACCEPTANCE-CRITERIA.md had errors (CCC-18 + schema version + idempotency). r2 AC list is the only authoritative one. CR-2-3, CR-2-4, CR-2-5, CR-2-6 applied.

## 5. Ownership / dependencies (r1 unchanged)

See r1 section 5 at commit 608d67d. No changes in r2.

---

## 6. Files in this bundle (r2)

- CORRECTION-LEDGER.md: Itemized CR-2-1..CR-2-7 corrections from r1.
- PROPOSAL.md: This document. Sections 1, 2, 3 revise r1; sections 4, 5 reference r1 (no change). Section 6 lists bundle.
- CHANGE-PROPOSALS.md: Itemized CP1..CP6 re-classified as FROZEN REQUIREMENT / SLICE PROPOSAL / CONTRACT CHANGE.
- ACCEPTANCE-CRITERIA.md: AC-1..AC-X (reduced set; AC-18 removed; other ACs revised).
- HRP-FIELD-MAPPING.md: Detail of CRM frozen wire, HRP source, and gap analysis.
- README.md: Provenance, verification, boundaries.
- manifest.sha256: SHA-256 of bundle files.
- SCRATCH-VALIDATION.md: Optional self-check synthetic payload via frozen validators (CRM-side, not HRP runtime evidence).

## 7. Boundaries confirmed (unchanged from r1, plus CR-2-1)

- No edits to frozen CRM contracts @hrp-engagement/contracts@0.0.8-g0.8-fixes.
- No edits to CRM source code.
- No bootstrap / tag / publish / merge / force-push / deploy.
- No opening of HRP endpoint implementation on the CRM side.
- No promotion of any module to ACCEPTED_SHARED.
- No request that HRP build a new endpoint in this task.
- No assumption that HRP source domain lacks all capability based on one route gap.
- No use of updatedAt as snapshotVersion.
- No transmission of raw LaborProfileDetailDto as wire.
- No transmission of raw CCCD/phone to CRM.

## 8. Supersession / revision pinning

- r2 supersedes r1 (commit 608d67d).

## 9. Stop condition

STOP — READY FOR T0 DESIGN REVIEW.

