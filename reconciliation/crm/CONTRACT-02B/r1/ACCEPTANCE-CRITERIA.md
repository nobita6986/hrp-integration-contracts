# Acceptance Criteria — Detailed (CONTRACT-02B r1)

These criteria are for T0 to use when designing AC for the future implementation ticket. They are NOT tests run today. Mock tests are explicitly NOT a substitute for HRP route/DB integration evidence.

---

## A. Read-only / no mutation (AC-1..AC-4)

- AC-1: HRP endpoint is GET-only. No POST/PUT/PATCH/DELETE.
- AC-2: No canonical write occurs. No createOrMatch, no updateLaborProfile, no openPlacementCase, no recordInteraction, no updateLaborAvailability, no updateNextAction.
- AC-3: No outbox event is emitted on this path. (Audit IS emitted — distinct from outbox.)
- AC-4: HRP audit records the read with effectiveAt, recordedAt, actor=Service+User (delegated), source=INTEGRATION. Audit MUST NOT contain raw PII (phone/CCCD/fullName raw).

## B. Valid access (AC-5..AC-10)

- AC-5: With valid Service JWT + valid organizationId (Service JWT authorized) + valid canonical laborProfileId + valid user delegation: HRP returns 200 with redacted identitySummary.
- AC-6: HRP returns identitySummary fields as REDACTED per HRP policy; CRM does NOT receive raw phone/CCCD.
- AC-7: HRP returns identitySummary.displayOnly:true literal.
- AC-8: HRP returns organizationId in response (matches CRM-sent organizationId after HRP verification).
- AC-9: HRP returns resolvedAt timestamp (IsoTimestampSchema, ISO-8601 with explicit UTC offset).
- AC-10: HRP returns unavailableFields enum populated when a field is unsupported.

## C. Cross-org / object denial (AC-11..AC-13)

- AC-11: Service JWT authorized for orgA; CRM sends organizationId=orgB; HRP returns 403 FORBIDDEN (NOT 404, NOT 200).
- AC-12: Service JWT authorized for orgA; CRM sends valid orgA but canonical laborProfileId is in orgB; HRP returns 404 NOT_FOUND (RLS hidden).
- AC-13: Service JWT authorized for orgA; CRM sends canonical laborProfileId that does not exist anywhere; HRP returns 404 NOT_FOUND.

## D. Inactive / revoked actor (AC-14..AC-16)

- AC-14: HRP user isActive=false in DB; CRM sends user delegation referencing this user; HRP returns 401 or 403 (auth session error path).
- AC-15: Service principal is revoked (JWT expired or revoked per HRP policy); HRP returns 401.
- AC-16: User delegation is invalid or expired; HRP returns 403.

## E. Field masking (AC-17..AC-19)

- AC-17: Caller does NOT have CAN_VIEW_WORKER_SENSITIVE equivalent for service principal; HRP returns phoneRedacted + cccdNumberRedacted (or omits).
- AC-18: Caller has CAN_VIEW_WORKER_SENSITIVE; HRP returns full values (OUT OF SCOPE for B.03 minimal slice; CRM does NOT want unmasked phone/CCCD on the panel).
- AC-19: Phone/CCCD are redacted at the HRP side; receiving them unmasked is a wire violation.

## F. Unsupported projections (AC-20..AC-22)

- AC-20: When HRP does not support a field (e.g. availability), HRP returns 200 with the field omitted AND the field name in unavailableFields enum.
- AC-21: HRP does NOT return 500 for unsupported projections.
- AC-22: HRP does NOT return null for required frozen fields (organizationId, resolvedAt, schemaVersion, displayOnly).

## G. Wire validation (AC-23..AC-26)

- AC-23: Invalid envelope (e.g. missing schemaVersion, missing target/external) returns 422.
- AC-24: Strict mode rejects unknown fields (frozen schemas are .strict()).
- AC-25: Invalid enum (e.g. unknown fieldAllowlist member) returns 422.
- AC-26: schemaVersion mismatch returns 422 or 409 (REC-004b territory).

## H. Response / error / version compatibility (AC-27..AC-33)

- AC-27: 200 with valid envelope passes frozen-contract Zod parse.
- AC-28: Error envelope {error, message} is parseable by CRM UI error mapping (mock-api.ts ApiErrorCode).
- AC-29: 401 returns error code UNAUTHORIZED, message includes reason (non-PII).
- AC-30: 403 returns error code FORBIDDEN, message non-PII.
- AC-31: 404 returns error code NOT_FOUND, message non-PII.
- AC-32: 429/503 returns retry hints (CRM respects).
- AC-33: Wire schemaVersion is preserved end-to-end (frozen literal 1).

## I. Mock tests vs HRP route/DB integration evidence

Mock tests (CRM-side today):
- mock-api.ts (apps/context-panel/src/ui/mock-api.ts) — deterministic synthetic responses.
- orchestrator-wire.ts (apps/context-panel/src/orchestrator-wire.ts) — maps mock to PanelState.
- Unit tests for masking/unmasking in mock path.

Mock tests satisfy:
- UI display logic.
- PanelState state machine correctness.
- Error mapping for known error codes.
- Mock redaction (UI-side mock) is a UI test, NOT a wire test.

Mock tests DO NOT satisfy (REQUIRED HRP route/DB integration evidence):
- AC-1..AC-4 (HRP-side audit / no outbox).
- AC-5..AC-10 (HRP wire response shape).
- AC-11..AC-13 (cross-org denial — RLS in PostgreSQL, not mock).
- AC-14..AC-16 (HRP user isActive check against DB).
- AC-17..AC-19 (HRP redaction policy server-side).
- AC-20..AC-22 (HRP unavailableFields population).
- AC-23..AC-26 (HRP wire Zod parse).
- AC-27..AC-33 (HRP-side error/version compatibility).

Required HRP route/DB integration evidence (future):
- HRP staging DB with synthetic LaborProfile rows.
- HRP staging route returning wire-compatible envelope.
- HRP staging Service JWT issuance + verification.
- HRP staging organization-binding + user-delegation verification.
- HRP staging LaborProfile RLS policy covering service principal / delegated user.
- HRP staging field-redaction policy returning redacted phone/CCCD.
- HRP staging unavailableFields population.
- End-to-end test: CRM mock replaced; real CRM mock-API call against HRP staging; verify AC-1..AC-33.

CRM does NOT promote mock tests to AC for real path. Mock pass is NOT provider/HRP DB proof (per Implementation-Backlog.HRP-Owned-V7.9b-f.md §1).

## J. Independent Auditor (gate before real path)

Per established protocol, independent Auditor MUST pass:
- Wire envelope Zod parse against frozen schemas (CRM-side test suite).
- HRP route/DB integration evidence (HRP-side test suite).
- Cross-org denial test (AC-11, AC-12).
- Inactive actor test (AC-14).
- Field redaction test (AC-17, AC-19).
- Unsupported projection test (AC-20).

Mock tests do NOT replace these.

## Stop

STOP — awaiting T0 arbitration. AC list is for T0 design; CRM does NOT run AC-1..AC-33 today.
