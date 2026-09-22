# CONTRACT-02B conformance — T0 correction
Status: DRAFT / NOT_EXECUTED. These are synthetic design examples aligned with HRP MSG-025, not executable schemas or runtime evidence. Technical proposals still require bilateral acceptance. Owner approvals are limited by MSG-026.

## Provenance
CRM baseline: 72643356a0d1355f9dccc3921b47c990ea9c31c1.
CRM r6: eb586247fe1a147bc904ff69d49104e8609943ff.
HRP MSG-025: 53e6db53a929409b1dc7b512a1ec897a3af5b659, reconciliation/hrp/CONTRACT-02B-followup/r4/.
Owner MSG-026: c0ede9aeaba3ba26d620ae4e535d9e6a77cf9343, reconciliation/hrp/CONTRACT-02B-owner-disposition/r1/.
Supersedes conformance content at 4bf0931b5ab849bd3f90579f8eb844f9b04c249e; old commit remains immutable.
See PROVENANCE.md for verified source manifest hashes and CORRECTION-DELTA.md for corrections.

## Owner vs technical status
OWNER_APPROVED: three roles within existing HRP permissions; explicit consent/reapproval UX; max 15-minute delegation bounded by sessions, no auto-refresh; limited revoke window for controlled pilot.
OPEN: concrete canonical organizationId and audit metadata access/retention/recovery.
PROPOSED: service assertion profile, exact exchange/cancel transport, query wire/retry/parser and distribution details. Approval of pilot policy is not authority to implement or enable it.

## Files / integrity
19 data files + manifest.sha256 = 20 files.
Data: README, CONFORMANCE-INDEX, GAP-LIST, CORRECTION-DELTA, DISTRIBUTION-PROPOSAL, OUTGOING-MESSAGE, PROVENANCE; nine cases/*.md; three fixtures/*.json.
manifest.sha256 hashes exactly 19 data files as raw UTF-8 no BOM / LF bytes. No self-entry.
Manifest's own SHA is conveyed out-of-band, not embedded into hashed data files.
Scenario metadata stays outside wire body. Negative examples are explicitly marked.
Synthetic IDs/redaction are not real configuration or approved redaction vectors.

## Gates
ACCEPTED_SHARED=NONE. No runtime/source/schema/package change, no frozen contract modification.
No publication, consumer migration, pilot/production enablement. H.09/Tier 3 retained.
JSON syntax/integrity checks do not establish schema conformance or independent audit PASS.
