# CORRECTION-LEDGER - CONTRACT-02B r7

## Reason for r7

r7 is a NARROW metadata supplement over r6. The supplementary metadata is:

1. The SHA-256 (raw bytes) of the `manifest.sha256` file at commit `eb586247fe1a147bc904ff69d49104e8609943ff`.

2. Renamed the existing per-file SHA list to "File-SHA256" to distinguish from "Manifest-SHA256" (the manifest file itself).

No content changes from r6. r6 remains immutable in Git history.

## Manifest File (r6) - Raw-Bytes SHA-256


| Attribute | Value |
|---|---|
| Path | reconciliation/crm/CONTRACT-02B/r6/manifest.sha256 |
| Commit | eb586247fe1a147bc904ff69d49104e8609943ff |
| Size | 617 bytes |
| Encoding | ASCII (raw bytes); CR=0; LF=7 |
| Blob SHA-1 | ffc0b80660c8c5b1e1755de319e3d89dfd9b84a0 |
| SHA-256 (raw bytes) | 0c1d4a9d9c49711e6883e5e0d10e4ac0fdb49bc6fd432b67375a016dd4f934e3 |

## r6 Blob Verification

All 7 file entries in r6 manifest.sha256 verified against Git blobs at commit eb586247fe1a147bc904ff69d49104e8609943ff:

- DELTA-PROPOSAL.md: blob d459c394f8345ec535115ae8826ab9a3f5c38071, sha256 e854f3b40cae63fa76ef2aa52d4b70850ef63496df00c4d5007283d7c520a6a9 (match).
- REC-004B-ERROR-CONTRACT-CLARIFICATION.md: blob a0ca971d4243a2fe754753a32e7f536732a103d0, sha256 d79f889bf8476692fa740c89b649c0948a8aa4cd667fd95265c896aa0ef92cbe (match).
- REC-002-HRP-REQUEST.md: blob 3acc9671cd9516f60da98333ffa65147343d7240, sha256 addd0a9b55ac8b305875dfe863dd27a56b42660e4361e4e135a7de8a98f0c436 (match).
- REPLAY-VS-RETRY.md: blob 426ff075ba828a0bc25a52d52ceb641796bb669b, sha256 b291b2db2e44a189c31c0af9dc628a6f05e56d1d31906ed975842b9caae1b116 (match).
- CORRECTION-LEDGER.md: blob e76e72ba1e2d8498726341512c53694379d49699, sha256 867df5c2bbfcae51ff351803eaaaf39d356b097766dc126022e714d021186957 (match).
- MANIFEST-REFERENCES.md: blob 4041643ac265080d1f6c46b6a42676e222c1d552, sha256 9164a5231bdcf903563394fab691d3834004d1db80c126f98bcae47acf8b6076 (match).
- README.md: blob 6712bcbd77390ee8901f078e316db3b017dcbef8, sha256 21c8fd5ddb3b4aa0bd13f8c0c7745526566166556d771975575250b45db43a7e (match).

## What is NOT changed in r7

- r1..r6 are immutable.
- Frozen contracts not modified.
- ACCEPTED_SHARED = 0.
- H.09/Tier 3 gate unchanged.
- Implementation not opened.

## Encoding (r7 same as r6)

- UTF-8, NO BOM, LF only.
- Verified via raw byte inspection.
- Manifest computed from raw bytes.

## Files in r7 Bundle

1. DELTA-PROPOSAL.md
2. REC-004B-ERROR-CONTRACT-CLARIFICATION.md
3. REC-002-HRP-REQUEST.md
4. REPLAY-VS-RETRY.md
5. CORRECTION-LEDGER.md
6. MANIFEST-REFERENCES.md
7. README.md
8. manifest.sha256