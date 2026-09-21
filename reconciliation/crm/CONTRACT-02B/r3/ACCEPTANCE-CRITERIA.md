# Acceptance Criteria — CONTRACT-02B r3 (AC-1..AC-31)

These criteria are for T0 to use when designing implementation acceptance criteria. They are NOT tests run today. Mock tests do NOT substitute for HRP route/DB integration evidence.

Mock tests (mock-api.ts, orchestrator-wire.ts) satisfy ONLY UI display logic (PanelState, mock error mapping, mock redaction). They do NOT satisfy any AC below.

---

## AC-1..AC-4: Read-only / no canonical mutation

AC-1: HRP endpoint for this slice is idempotent. Request has no canonical-write side effects. (HRP decides transport: GET, POST-without-mutation, or other idempotent method. GET is one option, not the only option.)
AC-2: No canonical write occurs. No createOrMatch, updateLaborProfile, openPlacementCase, recordInteraction, updateLaborAvailability, updateNextAction.
AC-3: No outbox event emitted on this path. (Audit IS emitted — distinct from outbox.)
AC-4: HRP audit records the read with effectiveAt, recordedAt, actor=Service+User (if delegation mandated), source=INTEGRATION. Audit MUST NOT contain raw PII.

---

## AC-5..AC-10: Valid access

AC-5: With valid Service JWT + valid organizationId (Service JWT authorized for that org) + valid laborProfileId + valid user delegation (if mandated by HRP policy): HRP returns 200 with identitySummary.
AC-6: HRP returns identitySummary.fullNameRedacted if HRP decides to surface full name (optional). Redacted at HRP server-side. CRM does NOT receive raw fullName.
AC-7: HRP returns identitySummary.phoneRedacted if HRP decides to surface phone at all (optional, may be absent). Redacted at HRP server-side. CRM does NOT receive raw phone.
AC-8: HRP returns identitySummary.displayOnly=true literal (slice constraint, per CP1).
AC-9: HRP returns organizationId in response (matching verified CRM-sent organizationId).
AC-10: HRP returns resolvedAt as ISO-8601 string with explicit UTC offset.

---

## AC-11..AC-13: Cross-org / object denial

AC-11: Service JWT authorized for orgA; CRM sends organizationId=orgB; HRP returns 403 FORBIDDEN.
AC-12: Service JWT authorized for orgA; CRM sends valid orgA but laborProfileId is in orgB (or RLS-hidden); HRP returns 404 NOT_FOUND. (This is PROPOSED per HRP r3 inference about RLS behavior; not confirmed as deployed evidence for the S2S CRM path. See Gap 4 in PROPOSAL.)
AC-13: Service JWT authorized for orgA; CRM sends laborProfileId that does not exist; HRP returns 404 NOT_FOUND.

---

## AC-14..AC-16: Inactive / revoked actor

AC-14: HRP user isActive=false; CRM sends user delegation referencing this user; HRP returns 401 or 403.
AC-15: Service principal revoked (JWT expired or revoked per HRP policy); HRP returns 401.
AC-16: User delegation invalid or expired (if delegation mandatory per HRP policy); HRP returns 403.

---

## AC-17..AC-19: Field filtering

AC-17: HRP applies field allowlist server-side when fieldAllowlist is set in request. Requested-supported fields are returned. Requested-unsupported fields are absent AND listed in unavailableFields. Unrequested fields are absent and NOT in unavailableFields.
AC-18: HRP does NOT return raw phone, raw CCCD, or cccdNumberRedacted on this slice. Receiving any of these = wire violation.
AC-19: Phone is redacted at HRP side; receiving unmasked = wire violation.

---

## AC-20..AC-22: Wire validation

AC-20: Invalid envelope (missing schemaVersion, missing target, missing laborProfileVersion) returns 422.
AC-21: Strict mode rejects unknown fields (frozen schemas are .strict()).
AC-22: Invalid enum (unknown fieldAllowlist member) returns 422.

---

## AC-23..AC-26: Response / error / version compatibility

AC-23: 200 with valid envelope passes frozen-contract Zod parse for ContextPanelResultSchema.
AC-24: Error envelope {error, message} is handled by CRM UI error adapter. This adapter is NOT a shared wire contract (see Gap 4 in PROPOSAL).
AC-25: 401/403/404/422/429/503 have appropriate error codes. No 409 idempotency conflict on this query slice. (Queries are idempotent; idempotencyKey is not in ContextQueryRequestSchema.)
AC-26: schemaVersion literal is preserved as string 1 end-to-end (SCHEMA_VERSION = string 1, enums.ts L210; NOT numeric 1).

---

## AC-27..AC-31: Required HRP route/DB integration evidence (NOT mock)

Mock tests (mock-api.ts, orchestrator-wire.ts) do NOT satisfy any of AC-27..AC-31.

AC-27: HRP staging DB with synthetic LaborProfile rows — verified by HRP-side test suite.
AC-28: HRP staging route returning wire-compatible ContextPanelResultSchema envelope — verified by HRP-side test suite.
AC-29: HRP staging Service JWT issuance + verification — verified by HRP-side test suite.
AC-30: HRP staging organization-binding + user-delegation verification (per delegation policy HRP decides) — verified by HRP-side test suite.
AC-31: End-to-end: CRM mock replaced with real call to HRP staging; verify AC-1 through AC-26.

---

## Stop

STOP — awaiting T0 arbitration. AC-1..AC-31 are for T0 design; CRM does NOT run them today.