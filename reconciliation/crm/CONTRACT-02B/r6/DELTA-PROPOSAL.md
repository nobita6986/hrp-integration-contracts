# CONTRACT-02B r6 - Correction over r5: CRM position on REC-004b + full SHA references

From: T1-B (CRM)
To: T0 (HRP-CRM reconciliation)

r6 is a NARROW correction over r5 (4f8609bda71f13c65fde5b10834e102c50ecd8cb). r5 remains immutable in Git history. The correction addresses:

1. **CRM position on REC-004b revised**: CRM T1-B does NOT prefer additive global enum. CRM T1-B position is now query-specific error contract. NOT_FOUND/INTERNAL_ERROR are proposals for the query-specific contract; exact shape/naming/package placement require bilateral acceptance.

2. **r5 verdict NOT inherited**: r4 (29e1fa40190fbfd8bb7ffab8bfe23fe35a04e59b) was audited PASS at T0. r5 (4f8609bda71f13c65fde5b10834e102c50ecd8cb) had two material content issues: (a) CRM position on REC-004b was mis-stated as preferring additive global enum, and (b) verdict linkage was ambiguous. r6 is a narrow delta over r5 with evidence specific to r6; it does NOT inherit r5 verdict.

3. **Full commit SHAs and manifest SHAs included** for r1 through r5. No "see manifest" placeholders.

4. **REC-002 framing corrected**: HRP proposes the mechanism (issuance/transport, binding, revoke/retry, role policy); CRM evaluates compatibility from the consumer side. CRM does NOT assign HRP ownership of the shared wire protocol unilaterally.

## Delta from r5

- REC-004B-ERROR-CONTRACT-CLARIFICATION.md rewritten: removed "Approach A: Additive Global Enum (CRM preference)"; CRM T1-B position is now query-specific error contract.
- REC-002 framing: HRP proposes mechanism; CRM evaluates consumer compatibility.
- README.md: added full SHA references; added r5 verdict disclaimer.
- CORRECTION-LEDGER.md: documents the r5 content issue and r6 correction.
- DELTA-PROPOSAL.md (this file): explicit "not inherit r5 verdict".
- REPLAY-VS-RETRY.md: unchanged content (still valid).

## Verdict Provenance

- r4 (29e1fa40190fbfd8bb7ffab8bfe23fe35a04e59b): T0 audited PASS.
- r5 (4f8609bda71f13c65fde5b10834e102c50ecd8cb): T0 audit status NOT inherited by r6.
- r6: narrow delta with evidence specific to r6. Audit status: pending review.

## Provenance - Full Commit SHAs

| Revision | Commit SHA |
|---|---|
| r1 (immutable) | 608d67daf9c0853b79862e72a117cf4bc520015c |
| r2 (immutable) | 93a31ce4abc1aa76f5a11b130c79f80447cbdf79 |
| r3 (immutable) | d971929892209590a5455cc9ecffe7a44ac22f99 |
| r4 (immutable, audited PASS) | 29e1fa40190fbfd8bb7ffab8bfe23fe35a04e59b |
| r5 (immutable, NOT inherited) | 4f8609bda71f13c65fde5b10834e102c50ecd8cb |
| r6 (this revision) | see bundle manifest |

## Other Provenance

| Artifact | Reference |
|---|---|
| CRM baseline | 72643356a0d1355f9dccc3921b47c990ea9c31c1 |
| Frozen package | @hrp-engagement/contracts@0.0.8-g0.8-fixes |
| HRP r6 (MSG-022) | a2a5efa9f6e22e8beb1e858054a2585d343b4bea |
| HRP followup | 8a28678 |

## Status Legend

- AGREED_DIRECTION: bilateral direction agreement, formal sign-off pending
- PROPOSED: one side has proposed, awaiting the other
- OPEN: not yet decided
- ACCEPTED_SHARED: both T0s signed off (current = NONE)

## Bundle Contents

1. DELTA-PROPOSAL.md (this file)
2. REC-004B-ERROR-CONTRACT-CLARIFICATION.md (rewritten)
3. REC-002-HRP-REQUEST.md (framing corrected)
4. REPLAY-VS-RETRY.md (unchanged content)
5. CORRECTION-LEDGER.md
6. README.md
7. manifest.sha256

See MANIFEST-REFERENCES.md for full SHA-256 of all r5 files and r6 files.