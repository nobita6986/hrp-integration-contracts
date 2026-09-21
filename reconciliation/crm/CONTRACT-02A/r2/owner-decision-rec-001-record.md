# Owner Decision Record — CRM-side Acknowledgement (HRP-CRM-REC-001)

**Bundle:** reconciliation/crm/CONTRACT-02A/r2/
**Decision-ID:** HRP-CRM-REC-001
**Owner authority:** Owner
**Status (per Owner prompt B):** APPROVED for REC-001 domain authority; REC-001-OPS = OPEN/PROPOSED.
**HRP-side record:** reconciliation/hrp/P0-C/decisions/HRP-CRM-REC-001/DECISION.md (branch evidence/hrp-rec-001-owner-decision, commit 2accd9a183333b412203e3dfb155893579afa47a)

## 1. Approved scope (verbatim from Owner directive)

1. CRM owns suppression at channel/contact/connection level.
2. HRP owns suppression at canonical person level within each organization.
3. No default cross-organization suppression.
4. Effective deny = union. Any deny from any source blocks outbound.
5. Each system only unsets suppression within its own authority.
6. Suppression does not block intake / review / read workflows.

## 2. Explicitly excluded from approval (Owner prompt B)

- TTL cache.
- Synchronization semantics.
- Resync mechanisms.
- Recovery procedures.
- Unavailable / fail-open / fail-closed behavior.

These are REC-001-OPS, status OPEN/PROPOSED, pending HRP / CRM Tier 0 review.

## 3. Canonical PlacementCase authority (carry-forward from Owner prompt B + MSG-008)

Canonical authority of PlacementCase lifecycle (ownership) belongs to HRP. This authority was established by Owner directive and re-affirmed in MSG-008.

MSG-008 is a reminder/affirmation of the existing authority decision; it does not create new authority. Authority stems from Owner directive, not from MSG-008.

Wire mapping and transition semantics between CRM intendedStage and HRP status remain UNRESOLVED per HRP r3 GAP_REPORT §17 and supplement §C. The UNRESOLVED status reflects interface mismatch only; ownership is NOT in question.

Per supplement §C: HRP proposes canonical authority; shared decision has NOT been bilaterally accepted. This correction supersedes the r1 phrasing that placed both the authority fact and the supplement caveat as co-equal conclusions.

## 4. What this record distinguishes (CR-7, CR-8)

This acknowledgement distinguishes four separate things that r1 conflated:

(a) Owner decision: REC-001 domain authority is APPROVED. This is a governance record from Owner.

(b) Evidence bundle ACK: The CRM CONTRACT-01 r1 evidence bundle (25fc8b1) was acknowledged with INTEGRITY_ONLY verification. This is a technical integrity check, not business acceptance.

(c) Bilateral wire acceptance: Has not occurred. ACCEPTED_SHARED = 0. No wire contract is bilaterally accepted.

(d) Runtime implementation: Not authorized by REC-001 alone. REC-001 is domain authority only. REC-001-OPS must be decided before implementation. REC-002, REC-003, and REC-004b must also reach ACCEPTED_SHARED before runtime authorization.

## 5. Adjacent open decisions

- REC-002 (S2S Auth): OPEN/PROPOSED.
- REC-003 (Outbox/Idempotency): OPEN/PROPOSED.
- REC-004a (Neutral repo authority): CLOSED. Not reopened.
- REC-004b (Enum/Error compatibility policy): OPEN/PROPOSED.

## 6. What this record does NOT do

- Does not reopen REC-001 APPROVED authority decision.
- Does not create runtime authorization for any system.
- Does not promote any module to ACCEPTED_SHARED.
- Does not authorize changes to frozen contracts @hrp-engagement/contracts@0.0.8-g0.8-fixes.
- Does not open HRP endpoint implementation.
- Does not constitute independent Auditor PASS.

## 7. Evidence pointers (read-only; no edits)

- HRP source baseline: 1059f6669482efac5b7956ef25d43996ca59d515
- HRP r3 bundle commit: 2ee99394a210fc51125523ceef9020812f893be2
- HRP r3 claim-verification supplement: a0cd30e04a86a80975824f23208a9e3ecfc29cbd
- HRP REC-001 decision branch: evidence/hrp-rec-001-owner-decision @ 2accd9a183333b412203e3dfb155893579afa47a
- CRM baseline: 72643356a0d1355f9dccc3921b47c990ea9c31c1
- CRM CONTRACT-01 r1 commit: 25fc8b1f7f61a4bd5b6a9313eddb866af2e41b31
- Frozen CRM contracts: @hrp-engagement/contracts@0.0.8-g0.8-fixes

## 8. Boundaries confirmed

- Frozen contracts unchanged.
- docs/contracts/inventory.md pre-existing delta preserved.
- No edits to apps/**, packages/**, scripts/v7.9a/**, or T1-A POC files.
- No package bootstrap, publish, tag, merge, or deploy.

