# Scratch Validation - r2 (self-check on synthetic payload)

Per T0 approval (CHANGES_REQUIRED message, items 7): CRM MAY self-check proposed synthetic payload bang frozen validators trong scratch, khong sua contracts, khong coi ket qua la HRP runtime evidence.

This file shows a sketch of such self-check. Kept short; actual run would compile packages/contracts/dist and Zod-parse a synthetic payload.

## 1. Approach (sketch)

Step 1: import frozen schemas from packages/contracts (or equivalent compiled form).

Step 2: construct synthetic payload with proposal field set.

Step 3: parse via ContextQueryRequestSchema.parse(payload); record result.

Step 4: construct synthetic response; parse via ContextPanelResultSchema.parse(response); record result.

## 2. Synthetic payload (NOT for distribution - scratch only)

Request: 
- organizationId: 0rg-test-acme

Response: 

## 3. Expected result of self-check

Without decision on Q1 (Q-A1: laborProfileVersion source), the synthetic request payload will fail Zod parse on missing laborProfileVersion. Mark this expected result as INPUT_MISSING_DECISION, not runtime failure.

After T0/HRP decides Q1, the payload can be refined and self-check performed again. Until then, synthetic payload is INVALID pending decision.

## 4. What CRM does NOT do in this scratch

No actual run is provided in this bundle (out of scope for evidence bundle - testing/QA is a separate task).

## Stop

STOP - scratch self-check is for CRM-side validation only, not part of bundle manifest content; not used to assert HRP capability.

