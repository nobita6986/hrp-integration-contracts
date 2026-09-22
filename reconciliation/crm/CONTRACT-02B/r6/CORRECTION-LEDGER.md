# CORRECTION-LEDGER - CONTRACT-02B r6

## Reason for r6

r5 (4f8609bda71f13c65fde5b10834e102c50ecd8cb) had two content issues:

1. REC-004B-ERROR-CONTRACT-CLARIFICATION.md stated "Approach A: Additive Global Enum (CRM preference)". This mis-stated the CRM position. T1-B has now clarified: CRM T1-B position is query-specific error contract; CRM does NOT prefer additive global enum.

2. Verdict linkage was ambiguous: it implied r5 inherited the r4 audit PASS verdict. r4 (29e1fa40190fbfd8bb7ffab8bfe23fe35a04e59b) was audited PASS; r5 was NOT. r6 does NOT inherit r5 verdict.

3. REC-002 framing implied HRP unilaterally owned the shared wire protocol. Corrected in r6: HRP proposes the mechanism; CRM evaluates consumer compatibility. Neither side decides unilaterally.

r6 is a NARROW correction over r5. r5 remains immutable in Git history.

## r6 Changes

1. REC-004B-ERROR-CONTRACT-CLARIFICATION.md rewritten:
   - Removed "Approach A: Additive Global Enum (CRM preference)".
   - CRM T1-B position: query-specific error contract.
   - Note added: r6 does NOT mandate creating a separate npm package.
   - Open items for bilateral decision (shape, naming, versioning, package placement, parser scope, consumer audit scope).

2. REC-002-HRP-REQUEST.md framing corrected:
   - HRP proposes mechanism; CRM evaluates consumer compatibility.
   - CRM does NOT assign HRP unilateral ownership.

3. README.md updated:
   - Full SHA references for r1..r5.
   - r5 manifest SHA-256 references for each file.
   - Verdict disclaimer: r4 audited PASS; r5 verdict NOT inherited by r6.

4. DELTA-PROPOSAL.md added: explicit "r5 verdict NOT inherited".

5. MANIFEST-REFERENCES.md added: full SHA-256 for all files in r1..r6.

## What is NOT changed in r6

- r1, r2, r3, r4, r5 are immutable.
- Frozen contracts not modified.
- ACCEPTED_SHARED = 0.
- H.09/Tier 3 gate unchanged.
- Implementation not opened.
- REPLAY-VS-RETRY.md content unchanged (still valid).

## Encoding (r6 same as r5)

- UTF-8, NO BOM, LF only.
- Verified via raw byte inspection.
- Manifest computed from raw bytes.

## Files in r6 Bundle

1. DELTA-PROPOSAL.md
2. REC-004B-ERROR-CONTRACT-CLARIFICATION.md
3. REC-002-HRP-REQUEST.md
4. REPLAY-VS-RETRY.md
5. CORRECTION-LEDGER.md
6. MANIFEST-REFERENCES.md
7. README.md
8. manifest.sha256