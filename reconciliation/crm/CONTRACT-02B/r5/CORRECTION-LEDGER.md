# CORRECTION-LEDGER - CONTRACT-02B r5

## Encoding Correction (Narrow Scope)

r4 (29e1fa4) contained a UTF-8 BOM (EF BB BF) at the start of every Markdown file as a result of PowerShell `Out-File -Encoding UTF8`. The BOM is not part of UTF-8 standard for new files; it interferes with tools that expect pure UTF-8 (such as git, GitHub rendering, some JSON parsers).

r5 removes the BOM from all 7 Markdown files. The content is otherwise a NARROW delta over r4.

### Verification (raw bytes)

Before correction (r4):

| File | First 3 bytes | BOM |
|---|---|---|
| DELTA-PROPOSAL.md | EF BB BF | YES |
| REC-002-CRM-PROPOSAL.md | EF BB BF | YES |
| REC-004B-CRM-PROPOSAL.md | EF BB BF | YES |
| DESIGN-DECISION-RECORD.md | EF BB BF | YES |
| AC-ADDENDA.md | EF BB BF | YES |
| CORRECTION-LEDGER.md | EF BB BF | YES |
| README.md | EF BB BF | YES |

After correction (r5):

| File | First 3 bytes | BOM |
|---|---|---|
| DELTA-PROPOSAL.md | 23 20 23 | NO |
| REC-002-HRP-REQUEST.md | 23 20 23 | NO |
| REC-004B-ERROR-CONTRACT-CLARIFICATION.md | 23 20 23 | NO |
| REPLAY-VS-RETRY.md | 23 20 23 | NO |
| CORRECTION-LEDGER.md | 23 20 23 | NO |
| README.md | 23 20 23 | NO |

### Method

r5 files written via Node.js `fs.writeFileSync` with explicit `Buffer.from(text, "utf8")` to avoid BOM injection. Manifest computed from raw bytes (LF, no BOM, no NUL).

## Content Adjustments from r4

r5 is a NARROW delta over r4. The following content adjustments were made:

1. REC-004b: clarified that additive error codes belong in a separate query-specific schema package, not in the frozen ContractErrorSchema. Any `z.union` illustration from the Auditor is discussion-only, not design.

2. REC-002: explicitly noted that all auth details (algorithm, TTL, rotation, revocation, replay, delegation, role mapping) remain PROPOSED. CRM does NOT accept ADMIN/HR_MANAGER/HR_STAFF as final role allowlist. CRM explicitly requests HRP proposals for delegation proof, binding, and revoke/retry.

3. New document REPLAY-VS-RETRY.md distinguishes replay token (one-time jti) from query retry (new request, new jti).

4. New document REC-002-HRP-REQUEST.md formally requests HRP proposals.

5. r4 documents DESIGN-DECISION-RECORD.md, AC-ADDENDA.md were renamed/replaced in r5; their content is folded into DELTA-PROPOSAL.md, REC-002-HRP-REQUEST.md, REC-004B-ERROR-CONTRACT-CLARIFICATION.md, REPLAY-VS-RETRY.md. The narrow scope is intentional.

## What is NOT changed

- r1, r2, r3, r4 are immutable.
- Frozen contracts not modified.
- ACCEPTED_SHARED = 0.
- H.09/Tier 3 gate unchanged.
- Implementation not opened.

## Files in r5 Bundle

1. DELTA-PROPOSAL.md
2. REC-002-HRP-REQUEST.md
3. REC-004B-ERROR-CONTRACT-CLARIFICATION.md
4. REPLAY-VS-RETRY.md
5. CORRECTION-LEDGER.md
6. README.md
7. manifest.sha256