# CONTRACT-02B r4 — README

## What This Is

CRM T1-B delta proposal integrating HRP T0 design responses D-01 through D-04 (MSG-022, commit a2a5efa9) and bilateral decision proposals for REC-002 and REC-004b.

## What Changed from r3

r3 was a self-contained reconstruction of the thin slice proposal. r4 is a delta that:
- Confirms D-01 through D-04 as AGREED_DIRECTION
- Records CRM T1-B positions on REC-002 (11 items: 10 AGREED/PROPOSED, 1 OPEN)
- Records CRM T1-B positions on REC-004b (2 items: 1 AGREED, 1 PROPOSED)
- Adds wire examples (DRAFT, not claimed to pass frozen schema)
- Adds AC-32 through AC-48
- Adds decision register with status of every design item

r4 does NOT reopen r3 items unless explicitly stated.

## Bundle Contents

| File | Purpose |
|---|---|
| DELTA-PROPOSAL.md | Main delta: confirmed D-01..D-04 + CRM positions |
| REC-002-CRM-PROPOSAL.md | Delegation, binding, effective user, negative cases |
| REC-004B-CRM-PROPOSAL.md | Schemas, error contracts, wire examples, compatibility |
| DESIGN-DECISION-RECORD.md | Status of every design item |
| AC-ADDENDA.md | New AC-32 through AC-48 |
| CORRECTION-LEDGER.md | Changes from r3 and root cause |
| README.md | This file |
| manifest.sha256 | Integrity checksums |

## Provenance

- CRM baseline: 72643356a0d1355f9dccc3921b47c990ea9c31c1
- Frozen package: @hrp-engagement/contracts@0.0.8-g0.8-fixes
- HRP r6 (MSG-022): a2a5efa9f6e22e8beb1e858054a2585d343b4bea
- HRP followup: 8a28678 (REC-002, REC-004b)
- r1: 608d67daf9c0853b79862e72a117cf4bc520015c
- r2: 93a31ce4abc1aa76f5a11b130c79f80447cbdf79
- r3: d971929892209590a5455cc9ecffe7a44ac22f99

## Governance

- ACCEPTED_SHARED = 0
- HRP_IMPLEMENTED = 0
- D-01..D-04 = AGREED_DIRECTION
- REC-001 = OWNER_APPROVED
- REC-002 = OPEN/PROPOSED (OWNER_DECISION_REQUIRED)
- REC-004b = OPEN/PROPOSED (OWNER_DECISION_REQUIRED)
- H.09/Tier 3 gate: unchanged

## What Is NOT in This Revision

- No implementation
- No code in CRM apps or packages
- No frozen contract changes
- No self-promotion to ACCEPTED_SHARED
- No changes to r1, r2, r3
- No MSG sent to HRP

## Stop Condition

READY FOR T0 CRM review. No further action until T0 CRM accepts REC-002 and REC-004b positions.

## Supersession

r4 supersedes r3 (d971929) as the current working revision. r1, r2, r3 remain immutable in Git history.
