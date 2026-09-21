# Acceptance Criteria - r2 detail (revised from r1)

r1 ACCEPTANCE-CRITERIA.md had errors (AC-18 sensitive + wrong 409 + numeric schema version). r2 AC list is authoritative.

Mock tests satisfy ONLY UI display logic. They do NOT satisfy any AC below. HRP route/DB integration evidence is REQUIRED for AC-1..AC-X.

These criteria are for T0 to design AC for the future implementation ticket. They are NOT tests run today.

---

## A. Read-only / no canonical mutation (AC-1..AC-4)

- AC-1: HRP endpoint is idempotent (GET-only OR POST-with-idempotency-key OR other choice consistent with HRP transport policy - CR-2-5). Query payload has no canonical-write side effects.

## B. Valid access (AC-5..AC-10)

- AC-5: With valid Service JWT + valid organizationId (Service JWT authorized) + valid canonical laborProfileId + valid user delegation (if mandated): HRP returns 200 with redacted identitySummary.

## C. Cross-org / object denial (AC-11..AC-13)

- AC-11: Service JWT authorized for orgA; CRM sends organizationId=orgB; HRP returns 403 FORBIDDEN.

## D. Inactive / revoked actor (AC-14..AC-16)

- AC-14: HRP user isActive=false; CRM sends user delegation referencing this user; HRP returns 401 or 403 (auth session error).

## E. Field filtering (AC-17..AC-19)

- AC-17: HRP applies field allowlist server-side; requested fields are returned only if HRP supports them.

## F. Unsupported projections (AC-20..AC-22) - revised (CR-2-6)

- AC-20: When HRP is REQUESTED a field that it does not support (e.g. requested availability on a backend that does not project it), HRP returns 200 with the field omitted AND the field name in unavailableFields enum.

## G. Wire validation (AC-23..AC-26)

- AC-23: Invalid envelope (missing schemaVersion, missing target/external/laborProfileVersion) returns 422.

## H. Response / error / version compatibility (AC-27..AC-31)

- AC-27: 200 with valid envelope passes frozen-contract Zod parse.

NOTE: r1 AC-32 (429/503 retry hints) and AC-33 (schemaVersion end-to-end) collapsed into Layer 6 of PROPOSAL section 3. Future implementation tests should cover them. CR-2-5: NO 409 idempotency conflict.

## I. Mock vs HRP route/DB integration evidence (CR-2-5)

Mock tests (CRM-side today):

Mock tests satisfy ONLY UI display logic (PanelState, error mapping for known codes, mock redaction).

Mock tests do NOT satisfy AC-1..AC-31 (HRP-side evidence required).

Required HRP route/DB integration evidence (future):

## J. RLS-hidden row -> 404 inference (CR-2-4)

HRP r3 §Q-A4 explicitly labels the RLS-hidden-row -> 404 inference as a logical inference, NOT deployed CRM authorization evidence. CRM AC-12 wording reflects this caveat.

## Stop

STOP - awaiting T0 arbitration. AC-1..AC-31 are for T0 design; CRM does NOT run them today.

