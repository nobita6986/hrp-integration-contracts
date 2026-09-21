# Scratch Validation — CONTRACT-02B r3

## Status

NOT_RUN. This file documents the approach and expected result. The actual Zod parse was not run.

## Approach

Step 1: Import frozen schemas from packages/contracts (or equivalent compiled).
Step 2: Construct synthetic request payload with fields set per PROPOSAL design.
Step 3: Parse via ContextQueryRequestSchema.parse(payload). Record: VALID, INVALID, or INVALID_PENDING_DECISION.
Step 4: Construct synthetic response payload. Parse via ContextPanelResultSchema.parse(response). Record result.
Step 5: If any field is INVALID_PENDING_DECISION, document the specific missing decision.

## Synthetic request (sketch)

Fields:
- schemaVersion: string literal 1
- target: { schemaVersion: 1, kind: TALENT, laborProfileId: <canonical id placeholder>, laborProfileVersion: <placeholder — INVALID_PENDING_DECISION: Gap 1 not resolved }
- scope: { organizationId: org-test-001, actor: { kind: SERVICE, serviceId: crm-svc-001 } }
- fieldAllowlist: [identitySummary]

## Synthetic response (sketch)

Fields:
- schemaVersion: string literal 1
- organizationId: org-test-001
- snapshotVersion: <placeholder — INVALID_PENDING_DECISION: Gap 2 not resolved; Option B would make this optional>
- resolvedAt: ISO-8601 string with offset
- identitySummary: { schemaVersion: 1, fullNameRedacted: Ng*** V*** A, displayOnly: true }
- unavailableFields: [] (if identitySummary is supported)

## Expected result (NOT RUN)

Without resolution of Gap 1 (laborProfileVersion source):
The synthetic request will fail ContextQueryRequestSchema.parse() with a missing required field error for laborProfileVersion.
Expected: INVALID_PENDING_DECISION (missing Gap 1 decision).

This is expected behavior — the payload is intentionally invalid to document the missing decision, not a runtime failure.

## Distinction

Synthetic fixture vs sourced data:
- Synthetic fixture: constructed for this scratch test. LaborProfile IDs, version numbers, timestamps are placeholders.
- Sourced data: would come from HRP actual read or CRM prior-step result.

The scratch uses synthetic fixtures only. No sourced data from HRP runtime was used in this scratch.

## Note on this file

This file IS part of the bundle (listed in README and covered by manifest.sha256). It is labeled NOT_RUN because the actual Zod parse was not executed. If the scratch is run in the future, this file should be updated to record the actual command and result.

---

## Stop

STOP — scratch validation is CRM-side only; result is NOT HRP runtime evidence.