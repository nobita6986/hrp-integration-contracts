# CONTRACT-02B r6 - README

## What This Is

Narrow correction over r5 (4f8609bda71f13c65fde5b10834e102c50ecd8cb). r6 fixes CRM position on REC-004b (now: query-specific error contract; NOT prefer additive global enum), clarifies verdict provenance (r4 audited PASS; r5 NOT inherited), and provides full SHA references.

## Verdict Provenance


| Revision | Verdict |
|---|---|
| r4 (29e1fa40190fbfd8bb7ffab8bfe23fe35a04e59b) | audited PASS at T0 |
| r5 (4f8609bda71f13c65fde5b10834e102c50ecd8cb) | NOT inherited |
| r6 (this revision) | narrow delta with evidence specific to r6; audit status pending |

## Bundle Contents


| File | Purpose |
|---|---|
| DELTA-PROPOSAL.md | Summary of delta from r5 |
| REC-004B-ERROR-CONTRACT-CLARIFICATION.md | CRM position: query-specific error contract |
| REC-002-HRP-REQUEST.md | HRP proposes mechanism; CRM evaluates consumer compatibility |
| REPLAY-VS-RETRY.md | Replay token vs query retry |
| CORRECTION-LEDGER.md | Documents r5 content issue and r6 correction |
| MANIFEST-REFERENCES.md | Full SHA references for r1..r5 + r6 |
| README.md | This file |
| manifest.sha256 | SHA-256 of r6 files (raw bytes) |

## Encoding

- UTF-8, NO BOM, LF line endings only.
- Verified via raw byte inspection: first byte is `#` (0x23), not BOM.
- Manifest computed from raw bytes.

## Status of Items

### AGREED_DIRECTION

- D-01: additive read query schema (no laborProfileVersion)
- D-02: additive read result schema (no snapshotVersion, resolvedAt is query-time marker)
- D-03: S2S auth + DELEGATED_USER mandatory + effective user + org binding server-side
- D-04: error envelope structure (reuse frozen codes; query-specific contract for additive)

### PROPOSED (awaiting bilateral acceptance)

- REC-002: HRP proposes mechanism; CRM evaluates consumer compatibility.
- REC-004b: query-specific error contract. Exact shape/naming/package placement require bilateral acceptance. NOT_FOUND/INTERNAL_ERROR are proposals.

### OPEN

- Delegation proof transport mechanism (HRP proposes; CRM evaluates).
- Service-user-org-request binding mechanism (HRP proposes; CRM evaluates).
- Revocation and retry semantics (HRP proposes; CRM evaluates).
- Role policy (HRP proposes; CRM evaluates).

### Closed

- laborProfileVersion gap (D-01)
- snapshotVersion gap (D-02)
- resolvedAt semantics (D-02)
- DELEGATED_USER mandatory (D-03)
- phone/CCCD exclusion (D-03)
- ApiErrorCode not wire authority (D-04)
- displayOnly semantics (D-03)
- SCHEMA_VERSION string type (frozen contract)

## Governance

- ACCEPTED_SHARED = 0
- HRP_IMPLEMENTED = 0
- H.09/Tier 3 gate unchanged

## What CRM Will Not Do

- Open any endpoint
- Modify frozen contracts
- Modify CRM apps/packages
- Modify VPS
- Merge/tag/publish
- Send MSG on behalf of T0
- Promote ACCEPTED_SHARED