# CORRECTION-LEDGER — CONTRACT-02B r4

## Root Cause

r3 was a self-contained reconstruction built to address r2 build errors. r4 is a delta built on top of r3, integrating new HRP responses.

## Changes from r3

### 1. Design Direction Integration

Incorporated HRP T0 design responses D-01 through D-04 from MSG-022 (commit a2a5efa9). Each confirmed as AGREED_DIRECTION.

### 2. New Document Added: DELTA-PROPOSAL.md

Main delta document recording confirmed design direction and CRM positions.

### 3. New Document Added: REC-002-CRM-PROPOSAL.md

Detailed CRM positions on delegation model, effective user resolution, organization binding, and negative acceptance cases.

### 4. New Document Added: REC-004B-CRM-PROPOSAL.md

Detailed CRM positions on schema shapes, error contracts, wire examples, and consumer/parser impact.

### 5. New Document Added: DESIGN-DECISION-RECORD.md

Status tracker for every design item. Closed items documented.

### 6. New Document Added: AC-ADDENDA.md

AC-32 through AC-48 added, covering new design decisions.

### 7. Wire Examples Added

Wire examples added in DELTA-PROPOSAL.md and REC-004B-CRM-PROPOSAL.md. All marked DRAFT. Not claimed to pass frozen schema parse.

### 8. Error Code Status Clarified

NOT_FOUND and INTERNAL_ERROR explicitly marked as PROPOSED (pending REC-004b). VALIDATION_ERROR, AUTHENTICATION_REQUIRED, FORBIDDEN, RATE_LIMITED, DEPENDENCY_UNAVAILABLE marked as AGREED.

### 9. Negative Acceptance Table

Table of denial conditions added in REC-002-CRM-PROPOSAL.md. All 13 conditions agreed.

### 10. Governance Flags Updated

- REC-002 and REC-004b added with OPEN/PROPOSED status
- D-01..D-04 added as AGREED_DIRECTION
- REC-001-OPS added as OPEN/PROPOSED

## Content NOT Changed from r3

- AC-1 through AC-31 from r3 remain unchanged
- HRP-FIELD-MAPPING.md from r3 remains unchanged
- SCRATCH-VALIDATION.md from r3 remains unchanged (NOT_RUN)
- r3 provenance and manifest references unchanged

## Files in Bundle

1. DELTA-PROPOSAL.md (8534B)
2. REC-002-CRM-PROPOSAL.md (7846B)
3. REC-004B-CRM-PROPOSAL.md (10675B)
4. DESIGN-DECISION-RECORD.md (4097B)
5. AC-ADDENDA.md (5977B)
6. CORRECTION-LEDGER.md (this file)
7. README.md
8. manifest.sha256

## Encoding

All files: UTF-8, LF line endings. No BOM. No null bytes. No Vietnamese character corruption (verified via hex check on sampled content).
