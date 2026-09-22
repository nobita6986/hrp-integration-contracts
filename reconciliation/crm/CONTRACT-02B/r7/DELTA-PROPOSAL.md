# CONTRACT-02B r7 - Metadata Supplement over r6

From: T1-B (CRM)
To: T0 (HRP-CRM reconciliation)

r7 is a NARROW metadata supplement over r6 (eb586247fe1a147bc904ff69d49104e8609943ff). No content changes; only adds the SHA-256 of the manifest file itself and renames the existing per-file SHA list from "Manifest SHA-256" to "File-SHA256" for clarity.

## Delta from r6

1. MANIFEST-REFERENCES.md updated: per-file list renamed to "File-SHA256"; new "Manifest-SHA256" entry added with blob SHA-1, raw-bytes SHA-256, and size of `manifest.sha256` at commit eb586247.

2. README.md updated: links to new metadata fields.

3. CORRECTION-LEDGER.md updated: notes metadata supplement.

4. manifest.sha256 regenerated for r7 files.

## Verdict Provenance (unchanged from r6)

- r4 (29e1fa40190fbfd8bb7ffab8bfe23fe35a04e59b): audited PASS at T0.
- r5 (4f8609bda71f13c65fde5b10834e102c50ecd8cb): verdict NOT inherited by r6 or r7.
- r6 (eb586247fe1a147bc904ff69d49104e8609943ff): narrow delta with evidence specific to r6; audit status pending.
- r7 (this revision): metadata-only supplement; content unchanged from r6; audit status pending.

## Content is unchanged from r6

- REC-004B-ERROR-CONTRACT-CLARIFICATION.md: identical to r6.
- REC-002-HRP-REQUEST.md: identical to r6.
- REPLAY-VS-RETRY.md: identical to r6.

## Provenance - Full Commit SHAs


| Revision | Commit SHA |
|---|---|
| r1 (immutable) | 608d67daf9c0853b79862e72a117cf4bc520015c |
| r2 (immutable) | 93a31ce4abc1aa76f5a11b130c79f80447cbdf79 |
| r3 (immutable) | d971929892209590a5455cc9ecffe7a44ac22f99 |
| r4 (immutable, audited PASS) | 29e1fa40190fbfd8bb7ffab8bfe23fe35a04e59b |
| r5 (immutable, NOT inherited) | 4f8609bda71f13c65fde5b10834e102c50ecd8cb |
| r6 (immutable) | eb586247fe1a147bc904ff69d49104e8609943ff |
| r7 (this revision) | see bundle manifest |

## Bundle Contents

1. DELTA-PROPOSAL.md (this file)
2. REC-004B-ERROR-CONTRACT-CLARIFICATION.md (unchanged from r6)
3. REC-002-HRP-REQUEST.md (unchanged from r6)
4. REPLAY-VS-RETRY.md (unchanged from r6)
5. CORRECTION-LEDGER.md (updated)
6. MANIFEST-REFERENCES.md (updated with File-SHA256 + Manifest-SHA256)
7. README.md (updated)
8. manifest.sha256 (regenerated for r7 files)

## Status Legend

- AGREED_DIRECTION: bilateral direction agreement, formal sign-off pending
- PROPOSED: one side has proposed, awaiting the other
- OPEN: not yet decided
- ACCEPTED_SHARED: both T0s signed off (current = NONE)