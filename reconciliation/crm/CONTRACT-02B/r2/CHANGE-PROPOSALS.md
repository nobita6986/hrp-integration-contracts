# Change Proposals (CONTRACT-02B r2) - revised from r1

r1 CP1..CP6 are re-classified below using three categories (CR-2-2):

- FROZEN REQUIREMENT: source is requiring what.
- SLICE PROPOSAL: behavior proposed for read-only Talent slice.
- CONTRACT CHANGE: actually changes schema/semantics.

For most items, CONTRACT CHANGE is NONE on frozen schemas. Behavior contingent on HRP-side decisions.

---

## CP1. identitySummary.displayOnly: true on this slice

FROZEN REQUIREMENT:
- ContextPanelIdentitySummarySchema.displayOnly is z.boolean() (queries.ts L182). REQUIRED boolean; either value permitted.

SLICE PROPOSAL:

CONTRACT CHANGE:

---

## CP2. identitySummary fields must be server-redacted

FROZEN REQUIREMENT:

SLICE PROPOSAL (revised per CR-2-3):

CONTRACT CHANGE:

---

## CP3. unavailableFields discriminator - requested-unsupported only

FROZEN REQUIREMENT:

SLICE PROPOSAL (revised per CR-2-6):

CONTRACT CHANGE:

---

## CP4. resolvedAt timestamp on query time

FROZEN REQUIREMENT:

SLICE PROPOSAL:

CONTRACT CHANGE:

---

## CP5. organizationId in response, verified by HRP server-side

FROZEN REQUIREMENT:

SLICE PROPOSAL:

CONTRACT CHANGE:

---

## CP6. snapshotVersion semantics: PROPOSED, not yet chot

FROZEN REQUIREMENT:

SLICE PROPOSAL:

CONTRACT CHANGE (PROPOSED):

---

## CP7. REC-002 acceptance for this read path

FROZEN REQUIREMENT:

SLICE PROPOSAL:

CONTRACT CHANGE:

---

## CP8. REC-004b enum/error compatibility policy

FROZEN REQUIREMENT:

SLICE PROPOSAL:

CONTRACT CHANGE:

---

## What CRM does NOT propose

- CRM does NOT propose HRP build a new S2S endpoint in this task.
- CRM does NOT propose HRP change existing GET /api/admin/labor-profiles/[id] in this task.

## Stop

STOP - awaiting T0 arbitration on CP1..CP8 with three-category split.

