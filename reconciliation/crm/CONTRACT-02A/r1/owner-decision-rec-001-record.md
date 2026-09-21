# Owner Decision Record — CRM-side acknowledgement (HRP-CRM-REC-001)

**Bundle:** reconciliation/crm/CONTRACT-02A/r1/
**Decision-ID:** HRP-CRM-REC-001
**Source Message ID:** CRM-HRP-MSG-010 (per Owner directive in this task prompt)
**Owner authority:** Owner
**HRP-side record:** reconciliation/hrp/P0-C/decisions/HRP-CRM-REC-001/DECISION.md (branch evidence/hrp-rec-001-owner-decision, commit 2accd9a183333b412203e3dfb155893579afa47a)
**Status (per Owner prompt B):** APPROVED for REC-001; REC-001-OPS = OPEN/PROPOSED.

## 1. Approved scope (verbatim from Owner directive)

1. CRM owns suppression at channel/contact/connection level.
2. HRP owns suppression at canonical person level within each organization.
3. No default cross-organization suppression.
4. Effective deny = union. Any deny from any source blocks outbound.
5. Each system only un-sets suppression within its own authority.
6. Suppression does not block intake / review / read workflows.

## 2. Explicitly excluded from approval (Owner prompt B)

- TTL cache.
- Synchronization semantics.
- Resync mechanisms.
- Recovery procedures.
- Unavailable / fail-open / fail-closed behavior.

These are REC-001-OPS, status OPEN/PROPOSED, pending HRP / CRM Tier 0 review.

## 3. Carry-forward correction from CRM-HRP-MSG-008 (per Owner prompt B + supplement)

- Canonical authority of PlacementCase lifecycle belongs to HRP. (APPROVED in MSG-008.)
- Wire mapping and transition semantics between CRM stage (intendedStage) and HRP status remain UNRESOLVED.
- The UNRESOLVED status reflects interface mismatch only; ownership is NOT in question.
- HRP r3 supplement (commit a0cd30e) records: HRP proposes canonical authority; shared decision has NOT yet been accepted bilaterally.

## 4. Adjacent open decisions (Owner prompt B)

- REC-002 (S2S Auth): still OPEN/PROPOSED.
- REC-003 (Outbox/Idempotency): still OPEN/PROPOSED.
- REC-004a (Neutral repo authority): CLOSED. Not reopened.
- REC-004b (Enum/Error compatibility policy): still OPEN/PROPOSED.

## 5. Authority boundaries (Owner prompt B + RECONCILIATION_PROTOCOL §2 Integrity ACK)

CRM-side acknowledgement of REC-001 is INTEGRITY_ONLY. It is NOT:
- An independent Auditor PASS.
- A semantic acceptance of HRP r3 GAP report claims (those claims were themselves SUPERSEDED in supplement a0cd30e).
- A wire acceptance of any module to ACCEPTED_SHARED.
- An authorization to modify frozen contracts @hrp-engagement/contracts@0.0.8-g0.8-fixes.
- A deployment, publish, tag, or runtime change.
- A waiver of the bilateral acceptance rule from RECONCILIATION_PROTOCOL §2 / §3.

## 6. Evidence pointers (read-only, no edits)

- HRP source baseline: 1059f6669482efac5b7956ef25d43996ca59d515
- HRP r3 bundle commit: 2ee99394a210fc51125523ceef9020812f893be2
- HRP r3 claim-verification supplement: a0cd30e04a86a80975824f23208a9e3ecfc29cbd
- HRP REC-001 decision branch: evidence/hrp-rec-001-owner-decision @ 2accd9a183333b412203e3dfb155893579afa47a
- CRM baseline: 72643356a0d1355f9dccc3921b47c990ea9c31c1
- CRM CONTRACT-01 r1 commit: 25fc8b1f7f61a4bd5b6a9313eddb866af2e41b31
- Frozen CRM contracts: @hrp-engagement/contracts@0.0.8-g0.8-fixes

## 7. What this record does NOT change

- Frozen contracts remain unchanged.
- docs/contracts/inventory.md pre-existing delta is preserved.
- T1-A Chatwoot POC continues with mocks; this record is a note, not a directive to T1-A.
- No package bootstrap. No HRP endpoint implementation. No consumer migration.

