# Correction Ledger — CONTRACT-02B r3

r3 supersedes r1 (608d67d) and r2 (93a31ce). Both remain immutable in Git history.

## Root cause of r2 content loss

r2 BUILD ERROR: node script used fs.appendFileSync() for PROPOSAL.md sections but the BUILD script used fs.writeFileSync() for CHANGE-PROPOSALS.md and ACCEPTANCE-CRITERIA.md in separate commands. The fs.writeFileSync() call overwrote the file AFTER the appendFileSync() calls completed, leaving these files empty. PROPOSAL.md had partial content (sections written before the crash).

The empty or truncated sections in r2 were NOT intentional content — they were a build artifact failure. The T0 review of r2 was correct to flag content loss.

r3 is a complete rebuild from scratch in a single node script call, with content generated directly into each file without cross-file write ordering issues.

## T0 feedback addressed in r3

| Feedback | r3 response |
|---|---|
| CHANGE-PROPOSALS.md had empty sections | All CP1..CP8 have full FROZEN/SLICE/CONTRACT bodies |
| ACCEPTANCE-CRITERIA.md referenced AC-X and deleted AC | All AC-1..AC-31 have full text; no deleted-AC references |
| SCRATCH-VALIDATION claimed not part of manifest | Corrected: file is in manifest; label = NOT_RUN |
| r1/r2 must be combined to understand design | r3 is self-contained; no reference to r1/r2 for design content |
| POST-with-idempotency-key was ambiguous | Removed; AC-1 now says idempotent request without implying POST |
| RLS extension was assumed | HRP chooses mechanism (RLS/ACL/query-time); CRM does not require RLS |
| ApiErrorCode treated as wire | Gap 4 + AC-24 clarify mock UI code vs shared wire |
| organizationId/resolvedAt/snapshotVersion not marked REQUIRED | Each gap marks them REQUIRED in frozen schema |
| Version 0 validity not distinguished | Syntax validity vs semantic validity clarified in Gap 1 |
| Delegation policy self-contradictory | Delegation policy = HRP decision; not both optional and always reject |
| HRP_IMPLEMENTED=0 was ambiguous | Clarified: means S2S slice not implemented; does not contradict internal endpoint |

## What r3 does NOT repeat from r1/r2

r3 does not carry over the full field-mapping table from r1 §1.2 (which was correct in r1). The gap summary and field references are in HRP-FIELD-MAPPING.md section 6. Readers who need the full mapping table can consult r1 commit 608d67d; r3 references are sufficient for this bundle.

---

## Stop

r3 is self-contained. No further correction ledgers needed unless T0 requests specific changes.