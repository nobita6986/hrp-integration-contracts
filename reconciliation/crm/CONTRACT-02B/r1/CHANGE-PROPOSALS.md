# Change Proposals (CONTRACT-02B r1)

These are CRM-side change proposals for T0 arbitration. CRM does NOT self-apply any change. Each proposal cites frozen schema + HRP-side gap.

---

## CP1. HRP MUST emit displayOnly:true literal in identitySummary

Frozen schema: ContextPanelIdentitySummarySchema (queries.ts L172-184). Field displayOnly is z.boolean() — REQUIRED.
HRP gap: HRP returns fullName/phone (masked or full); does NOT emit displayOnly literal.
CRM impact: UI guard in apps/context-panel/src/ui/types.ts PanelState references ContextPanelResult; UI must enforce displayOnly=true at runtime (UI must NOT use identitySummary fields as mutation targets).
Decision: T0 to confirm whether HRP emits displayOnly:true literal on this slice. The literal true is required; z.boolean() permits either, but CRM UI requires true.

---

## CP2. HRP MUST redact phone/CCCD server-side

Frozen schema: ContextPanelIdentitySummarySchema (queries.ts L177-178). Fields fullNameRedacted and phoneRedacted are z.string().min(1).max(N).optional() — REQUIRED if phone/CCCD are surfaced.
HRP gap: HRP uses CAN_VIEW_WORKER_SENSITIVE for unmasking (read-service.ts L183-L245); unmasked values flow to caller. CRM does NOT want unmasked phone/CCCD on the B.03 minimal slice.
CRM impact: CRM does NOT redact on its side. CRM UI mock (apps/context-panel/src/orchestrator-wire.ts L1129-1131) shows redacted values; receiving unmasked would break UI.
Decision: T0 to confirm whether HRP returns redacted phone/CCCD on this slice, OR whether the slice is restricted to a stricter subset of callers.

---

## CP3. HRP MUST populate unavailableFields enum when a field is not supported

Frozen schema: ContextPanelResultSchema.unavailableFields (queries.ts L338-346). Field is z.array(z.enum([...8])).max(16).optional() — OPTIONAL.
HRP gap: HRP does NOT emit unavailableFields today.
CRM impact: UI mock returns PanelState kind=partial or kind=success with unavailableFields surfaced; CRM UI uses this to render placeholders.
Decision: T0 to confirm whether HRP populates unavailableFields when a field is unsupported. This is the right wire pattern; it lets the wire stay envelope-shaped rather than per-call shape.

---

## CP4. HRP MUST emit resolvedAt timestamp

Frozen schema: ContextPanelResultSchema.resolvedAt (queries.ts L336). Field is IsoTimestampSchema — REQUIRED.
HRP gap: HRP DTO has createdAt/updatedAt but no query-time resolvedAt.
CRM impact: CRM UI logs and observability depend on resolvedAt; required by frozen schema.
Decision: T0 to confirm whether HRP emits resolvedAt at query time. ISO-8601 with explicit UTC offset (IsoTimestampSchema L62-66).

---

## CP5. HRP MUST emit organizationId in response

Frozen schema: ContextPanelResultSchema.organizationId (queries.ts L316). Field is OrganizationIdSchema — REQUIRED.
HRP gap: HRP source confirms AuthContext has no organizationId; route does not return org (SOURCE-EVIDENCE.md Check 2).
CRM impact: Wire envelope requires organizationId; CRM-side logging and audit use it.
Decision: T0 to confirm whether HRP grows org binding (REC-002 acceptance) AND emits org in response, OR whether the wire is updated to make organizationId optional. CRM does NOT want body-self-declared org.

---

## CP6. HRP MUST emit a snapshotVersion OR frozen schema field becomes optional

Frozen schema: ContextPanelResultSchema.snapshotVersion (queries.ts L317). Field is ExpectedVersionSchema — REQUIRED in frozen contract.
HRP gap: HRP confirms no snapshotVersion. updatedAt exists in DTO but is NOT defined as a snapshot/concurrency/cache token (HRP r3 Q-A4).
CRM impact: snapshotVersion semantics is HRP-owned; CRM does NOT use updatedAt as substitute.
Decision: T0 to confirm whether (a) HRP defines and emits snapshotVersion with semantics, OR (b) the frozen schema is updated to make snapshotVersion optional. CRM does NOT propose using updatedAt.

---

## CP7. REC-002 acceptance for this read path

Background: REC-002 (S2S Auth) = OPEN/PROPOSED at HRP baseline a49ceaa.

Required for B.03 real path:
- Service JWT issuance + verification.
- Audience HRP for service JWT.
- Service principal id (opaque, stable per CRM deployment).
- User delegation validation (kind=DELEGATED_USER ActorSchema).
- Organization binding (organizationId in AuthContext).
- LaborProfile RLS extension for service principal / delegated user.
- Field redaction policy equivalent for service principal.

Decision: T0 to accept REC-002 design for this specific read path; do NOT auto-promote REC-002 to ACCEPTED for all paths.

---

## CP8. REC-004b enum/error compatibility policy

Background: REC-004b = OPEN/PROPOSED.

For this read path:
- HRP error codes (FORBIDDEN, NOT_FOUND, INTERNAL) map to CRM ApiErrorCode.
- enum values returned by HRP must match CRM frozen enum values (e.g. AvailabilitySchema, CurrentRelationshipSchema).
- Wire schemaVersion literal (1) must be preserved end-to-end.

Decision: T0 to set policy for enum/error compatibility; CRM does NOT self-define policy here.

---

## What CRM does NOT propose

- CRM does NOT propose HRP build a new S2S endpoint in this task.
- CRM does NOT propose HRP change existing GET /api/admin/labor-profiles/[id] for this slice; it is HRP-owned to decide whether the existing route can be adapted or a new one is required.
- CRM does NOT propose changes to the frozen wire that are not strictly necessary (no scope creep).
- CRM does NOT propose removing displayOnly from the schema; it is required by UI guard.
- CRM does NOT propose substituting updatedAt for snapshotVersion; semantics is HRP-owned.
- CRM does NOT propose TTL/credential/algorithm policy (REC-002 territory).

## Stop

STOP — awaiting T0 arbitration on CP1..CP8.
