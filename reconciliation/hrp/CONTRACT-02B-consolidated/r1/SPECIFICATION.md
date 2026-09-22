# Consolidated specification — scope and precedence

## Pinned authority

All paths below are repository-relative to nobita6986/hrp-integration-contracts.

| Ref | Immutable commit | Path and function |
| --- | --- | --- |
| S25 / MSG-025 | 53e6db53a929409b1dc7b512a1ec897a3af5b659 | reconciliation/hrp/CONTRACT-02B-followup/r4/REC-002-PROPOSAL.md and REC-004B-PROPOSAL.md: foundational binding and dedicated query/error schemas |
| S26 / MSG-026 | c0ede9aeaba3ba26d620ae4e535d9e6a77cf9343 | reconciliation/hrp/CONTRACT-02B-owner-disposition/r1/OWNER-DECISION.md: Owner policy authority |
| C44 / CRM correction | d44e0a5e81dbc469e6b428ee05ed8ffded464616 | reconciliation/crm/CONTRACT-02B/conformance/: corrected examples, cases and distribution proposal |
| S27 / MSG-027 | 6eb6f78afbf6d1e12dbdc2747908cca606086d0f | reconciliation/hrp/CONTRACT-02B-conformance-response/r1/CONFORMANCE-DISPOSITION.md: query/parser/retry direction and version counterproposal |
| S28 / MSG-028 | 49f2dbc34cae66e8d63df5dd5d8cec0c008c4623 | reconciliation/hrp/CONTRACT-02B-conformance-response/r2/: corrected redaction, transport and audit clarification |
| CA28 | received through Owner conversation, recorded in CRM-DISPOSITION.md here | CRM accepts C-01..C-07 at DESIGN LEVEL and requests this consolidation/profile; no CRM commit or Message-ID supplied |

Precedence is by subject, not simply newest date:

1. S26 governs Owner decisions; technical artifacts cannot expand its authority.
2. S28 REDACTION.md, REDACTION-VECTORS.json and TRANSPORT.md govern corrected
   redaction/issuance/cleanup. They supersede conflicting S27 redaction and
   transport text. CA28 closes C-01..C-07 at design level.
3. S25 REC-004B-PROPOSAL.md governs dedicated query/result/seven-code parser,
   with S27 disposition and C44 corrections demonstrating the same shapes.
   Examples/metadata in C44 never override the normative schema semantics.
4. S25 REC-002-PROPOSAL.md supplies binding/retry/security semantics where S26
   and S28 have not refined them. S28 limits/policies accepted by CA28 prevail.
5. S27's packaging counterproposal and CA28 defer version reservation and
   distribution execution to a packaging task. Candidate strings are not
   reserved versions and absent tarballs do not block design review.
6. ENGINEERING-PROFILE.md fills only remaining technical details. Until CRM
   dispositions EP-01..EP-06, it is PROPOSED, not an implicit override.
   Unexpected normative contradictions stop the affected implementation
   decision for two-T0 resolution, without reopening closed subjects globally.

Frozen command contracts at CRM baseline 72643356a0d1355f9dccc3921b47c990ea9c31c1
are unchanged. Frozen root schemas/parsers must not silently parse new query
or delegation messages.

## Accepted design perimeter

Read by known canonical LaborProfile ID, for one server-configured
organization; no versions on dedicated query target/result. Effective-user
HRP authorization and object permissions remain mandatory. Only requested
identitySummary.fullNameRedacted can be returned, displayOnly=true; unsafe
redaction omits the projection and marks it unavailable if requested.
No phone/CCCD/raw DTO, mutation, outbound, client/KPI or multi-org claim.

S25's dedicated direct result, exact seven-code error triples, strict parser,
requested/unsupported/unrequested distinction and resolvedAt semantics are
incorporated unchanged. correlationId is logical-query trace only; new
assertion/jti and full authorization for every retry.

S28's create -> handoff -> HRP approval -> callback -> exchange -> query,
plus cancel/revoke, is incorporated unchanged. The single scope is
talent-context:read:identitySummary. HRP supplies effectiveHrpUserId at exchange.
Pending <=5 minutes, handoff <=120 seconds, receipt <=60 seconds retain all
S28 caps. Delegation <=15 minutes and both sessions. Cleanup uses authenticated
ownership, accepts expired/inactive user/session state, and ACKs only terminal
commit. Unknown outcome never ACKs. Secrets remain outside URLs/logs.
Delegation error envelope is distinct from the query parser.

## Implementation boundary after future acceptance

A subsequent separately authorized schema/conformance task may implement
dedicated schemas, assertion/profile validators, synthetic fixtures and
producer/consumer parser tests ONLY to the exact accepted scope. This message
does not open that task. Endpoint handlers, auth/RLS/DB changes, packaging,
consumer migration, real-path activation and pilot remain separately gated.

Required future conformance includes all pinned corrected examples plus
negative/edge cases for redaction, strict query/delegation separation,
assertion limits, clock/replay, retry schedules, callback/session swaps and
cleanup. Synthetic conformance cannot replace real authorization/browser
integration and independent audit before activation.

Source ownership remains neutral shared design/schema authority; HRP owns
canonical enforcement/consent/redaction, CRM owns session/signer/parser/UI
compatibility, package maintainer owns release artifact/export verification.
