# CONTRACT-02B r5 - README

## What This Is

Narrow delta from r4 (29e1fa4) correcting UTF-8 BOM and adding two refined proposal documents for HRP response.

## Bundle Contents

| File | Purpose |
|---|---|
| DELTA-PROPOSAL.md | Summary of delta from r4 |
| REC-002-HRP-REQUEST.md | Requests HRP proposals on delegation, binding, revoke/retry |
| REC-004B-ERROR-CONTRACT-CLARIFICATION.md | Clarifies additive error codes are query-specific, not in frozen schema |
| REPLAY-VS-RETRY.md | Distinguishes replay token from query retry |
| CORRECTION-LEDGER.md | Encoding correction narrative |
| README.md | This file |
| manifest.sha256 | SHA-256 of all files (raw bytes) |

## Encoding

- UTF-8, NO BOM, LF line endings only.
- Verified via raw byte inspection: first byte is `#` (0x23), not BOM (0xEF 0xBB 0xBF).
- Manifest computed from raw bytes.

## Status of Items

### AGREED_DIRECTION

- D-01: additive read query schema (no laborProfileVersion)
- D-02: additive read result schema (no snapshotVersion, resolvedAt is query-time marker)
- D-03: S2S auth + DELEGATED_USER mandatory + effective user + org binding server-side
- D-04: error envelope structure (reuse frozen codes; query-specific union for additive)

### PROPOSED (awaiting bilateral acceptance)

- REC-002: all auth details (algorithm, TTL, rotation, revocation, replay/jti, delegation transport, role mapping)
- REC-004b: additive enum approach (A vs B) and naming

### OPEN

- Delegation proof transport mechanism (HRP decision)
- Service-user-org-request binding mechanism (HRP decision)
- Revocation and retry semantics (HRP decision)
- Role allowlist (HRP must confirm or revise)

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