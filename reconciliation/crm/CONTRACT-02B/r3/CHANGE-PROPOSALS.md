# Change Proposals — CONTRACT-02B r3

Self-contained detail for CP1..CP8. Each has FROZEN REQUIREMENT / SLICE PROPOSAL / CONTRACT CHANGE.

---

## CP1. identitySummary.displayOnly — slice emits true

FROZEN REQUIREMENT:
ContextPanelIdentitySummarySchema.displayOnly is z.boolean() (queries.ts L182).
z.boolean() permits true or false. The literal true is NOT mandated by the schema.
UI guard behavior is CRM-side design preference, not a frozen wire mandate.

SLICE PROPOSAL:
On the B.03 minimal Talent-read slice, HRP emits displayOnly=true literal when identitySummary is present.
This is a slice constraint, not a frozen-schema change.

CONTRACT CHANGE: NONE.

Decision owner: T0 + HRP. HRP may decline; if declined, slice behavior is TBD.

---

## CP2. identitySummary.redacted fields — server-side redaction

FROZEN REQUIREMENT:
ContextPanelIdentitySummarySchema.fullNameRedacted: z.string().min(1).max(256).optional() (queries.ts L177).
ContextPanelIdentitySummarySchema.phoneRedacted: z.string().min(1).max(64).optional() (queries.ts L178).
CCCD is NOT a field in ContextPanelIdentitySummarySchema. There is no cccdNumberRedacted field.

SLICE PROPOSAL:
- HRP returns fullNameRedacted (redacted at HRP server-side) if HRP decides to surface full name.
- HRP returns phoneRedacted ONLY IF HRP decides to surface phone at all. Field is optional in frozen schema; HRP may omit.
- HRP returns NO raw phone, NO cccdNumber, NO cccdNumberRedacted on this slice.
- If HRP cannot return phone (decides to omit), HRP returns response without phoneRedacted field.
- CRM does NOT interpret absence of phoneRedacted as a reason to request a permission upgrade.

CONTRACT CHANGE: NONE. No cccd field is added to this schema.

Decision owner: T0 + HRP (HRP decides whether to surface phone at all).

---

## CP3. unavailableFields — for requested-unsupported only

FROZEN REQUIREMENT:
ContextPanelResultSchema.unavailableFields: z.array(z.enum([...8 members])).max(16).optional() (queries.ts L338-346).
The 8 enum members correspond to fieldAllowlist values. Frozen schema does not define when HRP MUST populate it.

SLICE PROPOSAL: Three states:
- Requested-supported: CRM asks for X, HRP returns X with data. unavailableFields does not include X.
- Requested-unsupported: CRM asks for X, HRP does not support X. HRP returns 200 with X omitted AND includes X in unavailableFields enum.
- Unrequested: CRM does not ask for Y. HRP does not return Y, does not include Y in unavailableFields. Y is absent from both response body and unavailableFields array.

For B.03 minimal slice with fieldAllowlist=[identitySummary]:
- identitySummary: REQUESTED. If HRP supports it: unavailableFields does not include identitySummary. If HRP does not: unavailableFields=[identitySummary].
- placementCase, availability, currentRelationship, nextAction, recentInteractions, contactability, suppressionSummary: all UNREQUESTED. Not listed in unavailableFields.

CONTRACT CHANGE: NONE.

Decision owner: T0 + HRP (to confirm this behavior).

---

## CP4. resolvedAt — query-time timestamp

FROZEN REQUIREMENT:
ContextPanelResultSchema.resolvedAt: IsoTimestampSchema REQUIRED (queries.ts L336).
IsoTimestampSchema (primitives.ts L62-66): z.string().min(20).max(40).datetime({ offset: true }).

SLICE PROPOSAL:
HRP emits resolvedAt = ISO-8601 string with explicit UTC offset at query processing time.
Missing resolvedAt = INVALID response against frozen schema.

CONTRACT CHANGE: NONE. Field stays REQUIRED in frozen schema.

Decision owner: T0 + HRP. HRP must emit this field.

---

## CP5. organizationId — required, HRP-verified

FROZEN REQUIREMENT:
ContextPanelResultSchema.organizationId: OrganizationIdSchema REQUIRED (queries.ts L316).
OrganizationIdSchema (primitives.ts L35): opaqueId(organizationId, 64). Missing = Zod parse failure.

SLICE PROPOSAL:
- HRP verifies organizationId from the Service JWT authorization set (server-side).
- HRP returns organizationId in the response, matching the verified CRM-sent organizationId.
- HRP denies cross-org requests (403 FORBIDDEN).
- organizationId is NOT self-declared by CRM body without HRP server-side verification.

CONTRACT CHANGE: NONE. Field stays REQUIRED. HRP must grow AuthContext to include organizationId.

Decision owner: T0 + HRP (Gap 3 — REC-002 acceptance).

---

## CP6. snapshotVersion — semantics unresolved

FROZEN REQUIREMENT:
ContextPanelResultSchema.snapshotVersion: ExpectedVersionSchema REQUIRED in frozen (queries.ts L317).
ExpectedVersionSchema (primitives.ts L38): z.number().int().nonnegative().max(MAX_SAFE_INTEGER).

HRP position: no snapshotVersion in LaborProfileDetailDto; updatedAt is NOT defined as snapshot/concurrency/cache token (HRP r3 §Q-A4).

Option A (HRP capability): HRP defines snapshotVersion semantics and emits it. CRM passes through without interpretation.
Option B (contract change — CRM preference): make snapshotVersion optional in frozen ContextPanelResultSchema.

CRM preference: Option B. Rationale: HRP r3 explicitly states no semantics; asking HRP to invent semantics for this slice is out-of-scope. A contract change to make the field optional is the legitimate path.
CRM does NOT propose using updatedAt as a substitute.

Impact if unresolved: Every ContextPanelResult fails Zod parse. B.03 cannot proceed.

CONTRACT CHANGE (PROPOSED under Option B): make snapshotVersion optional in ContextPanelResultSchema.

Decision owner: T0 (CRM freeze owner) + HRP (implementation).

---

## CP7. REC-002 acceptance for this read path

FROZEN REQUIREMENT:
REC-002 = OPEN/PROPOSED. Source: HRP r3 BASELINE-DELTA.md. HRP has user JWT + LaborProfile RLS. No CRM S2S auth path.

SLICE PROPOSAL:
For B.03 real path: Service JWT + audience HRP + service principal + delegation policy (HRP decision: mandatory or optional) + organization binding + object permission mechanism (HRP-owned choice) + field redaction policy. All remain PROPOSED until REC-002 is accepted for this specific path.

CONTRACT CHANGE: NONE. REC-002 acceptance is a governance decision, not a schema change.

Decision owner: T0 + HRP (independent Auditor for this path).

---

## CP8. REC-004b — enum/error compatibility

FROZEN REQUIREMENT:
Frozen schemas are .strict() (queries.ts L160 etc.).
Enum values must match across versions (AvailabilitySchema, enums.ts L101).
Wire schemaVersion literal is string 1 (SCHEMA_VERSION = string 1, enums.ts L210 — NOT numeric 1).

SLICE PROPOSAL:
- HRP error codes (FORBIDDEN, NOT_FOUND, INTERNAL, etc.) map to CRM-side error handling (see Gap 4).
- Enum values returned by HRP must match frozen schema enum values. No extension without a change proposal.
- schemaVersion literal preserved as string 1 end-to-end.
- 401 for auth failure. 422 for envelope validation. No 409 idempotency conflict on this query slice (queries are idempotent; idempotencyKey not in ContextQueryRequestSchema).

CONTRACT CHANGE: NONE. Policy decision by T0 + HRP.

---

## What CRM does NOT propose

- CRM does NOT propose HRP build a new S2S endpoint in this task.
- CRM does NOT propose HRP change existing GET /api/admin/labor-profiles/[id] in this task.
- CRM does NOT propose scope creep on frozen wire.
- CRM does NOT propose adding cccdNumberRedacted to identity summary.
- CRM does NOT propose substituting updatedAt for snapshotVersion.
- CRM does NOT propose TTL/credential/algorithm policy (REC-002 territory).
- CRM does NOT auto-fill laborProfileVersion with 0/updatedAt/external lookup.
- CRM does NOT claim UI ApiErrorCode is a shared wire contract.
- CRM does NOT claim RLS-hidden-row-to-404 is confirmed deployed evidence for the S2S CRM path.

---

## Stop

STOP — awaiting T0 arbitration on CP1..CP8.