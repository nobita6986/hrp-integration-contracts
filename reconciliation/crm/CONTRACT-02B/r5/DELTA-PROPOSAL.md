# CONTRACT-02B r5 - Delta from r4: Encoding Correction + Refined REC-002/REC-004b

From: T1-B (CRM)
To: T0 (HRP-CRM reconciliation)

r5 is a NARROW delta over r4 (29e1fa4). r4 is correct on substance but contains a UTF-8 BOM on every Markdown file as a result of PowerShell `Out-File -Encoding UTF8`. r5 corrects encoding and adds two refined proposal documents.

## Delta from r4

1. Encoding correction: removed UTF-8 BOM from all 7 Markdown files; verified all bytes are LF-only (no CR) and no NUL bytes.
2. Manifest regenerated from raw bytes (LF, no BOM).
3. REC-004b refined: kept frozen ContractErrorSchema/ErrorCodeSchema; clarified that additive error codes belong in a separate query-specific schema package; noted that any illustrative `z.union` from the Auditor is NOT the final design.
4. REC-002 refined: kept all auth details (algorithm, TTL, rotation, revocation, replay/jti, delegation transport, role mapping) at PROPOSED status; explicitly requested HRP proposals for delegation proof, service-user-org-request binding, and revoke/retry semantics. Noted that ADMIN/HR_MANAGER/HR_STAFF is NOT the final role allowlist.
5. Replay vs retry: clarified that replay token (jti one-shot) is distinct from retry of a valid query (new jti, new request).

## What is unchanged from r4

- D-01..D-04 (AGREED_DIRECTION)
- AC-1..AC-31 from r3
- AC-32..AC-48 from r4 (with clarification notes)
- Frozen contract package @hrp-engagement/contracts@0.0.8-g0.8-fixes
- All provenance references
- ACCEPTED_SHARED = 0
- HRP_IMPLEMENTED = 0
- H.09/Tier 3 gate

## Provenance

| Artifact | SHA |
|---|---|
| CRM baseline | 72643356a0d1355f9dccc3921b47c990ea9c31c1 |
| Frozen package | @hrp-engagement/contracts@0.0.8-g0.8-fixes |
| HRP r6 (MSG-022) | a2a5efa9f6e22e8beb1e858054a2585d343b4bea |
| HRP followup | 8a28678 |
| r1 (immutable) | 608d67daf9c0853b79862e72a117cf4bc520015c |
| r2 (immutable) | 93a31ce4abc1aa76f5a11b130c79f80447cbdf79 |
| r3 (immutable) | d971929892209590a5455cc9ecffe7a44ac22f99 |
| r4 (immutable) | 29e1fa4 |
| r5 (this) | see bundle manifest |

## Status Legend

- AGREED_DIRECTION: bilateral direction agreement, formal sign-off pending
- PROPOSED: one side has proposed, awaiting the other
- OPEN: not yet discussed or no consensus
- ACCEPTED_SHARED: both T0s signed off (current = NONE)

## Bundle Contents

1. DELTA-PROPOSAL.md (this file)
2. REC-002-HRP-REQUEST.md - asks HRP for specific proposals
3. REC-004B-ERROR-CONTRACT-CLARIFICATION.md - clarifies scope of additive errors
4. REPLAY-VS-RETRY.md - distinguishes replay token from query retry
5. CORRECTION-LEDGER.md - encoding correction narrative
6. README.md
7. manifest.sha256