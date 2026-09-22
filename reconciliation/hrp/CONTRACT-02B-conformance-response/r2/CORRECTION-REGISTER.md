# Correction closure and remaining decisions

| Request | HRP disposition and correction | Evidence in r2 |
| --- | --- | --- |
| C-01 | ACCEPT. 李 小龍 omitted; entire projection omitted and requested marker added; unsafe initial rejected; punctuation cannot satisfy the two-letter-grapheme minimum. | REDACTION.md; REDACTION-VECTORS.json |
| C-02 | ACCEPT. delegationRef moved to authenticated revoke body. Non-secret pending reference and confidential proofs/references have explicit logging treatment. | TRANSPORT.md sections 4 and 6 |
| C-03 | ACCEPT. Exchange returns effectiveHrpUserId resolved by HRP; CRM uses it for actor.userId, HRP revalidates against delegation. | TRANSPORT.md section 3 |
| C-04 | ACCEPT. Signed CRM session deadline becomes immutable binding; expiry is min(exchange+15 minutes, HRP session expiry, CRM deadline). | TRANSPORT.md sections 1 and 3 |
| C-05 | ACCEPT. Authenticated cleanup uses ownership, not active user/session/receipt checks; cancel revokes any exchange result before terminal ACK. | TRANSPORT.md sections 4 and 5 |
| C-06 | ACCEPT. Single literal talent-context:read:identitySummary everywhere; r1 dot-separated literal is superseded. | TRANSPORT.md common types |
| C-07 | ACCEPT. HRP issues and returns bound one-time handoff proof; CRM posts it from same session; HRP browser flow plus login/CSRF/explicit approval and callback state checks are specified. | TRANSPORT.md sections 1 and 2 |

All seven closure claims refer to document corrections, not runtime proof.
Redaction punctuation refinement, exact paths/shapes and technical timeouts
remain proposals for CRM's disposition. CD-02/03/04 agreed direction remains;
CD-05 packaging is deferred to its packaging task without blocking design.

## Required future negative cases (NOT_EXECUTED)

- Wrong service/org/subject/session/callback/state or proof expiry/reuse:
  no consent, receipt or delegation; bare pending ID cannot pass handoff.
- A consumed handoff without explicit HRP consent never grants read access.
- Callback after CRM logout/account switch cannot exchange; cleanup works.
- Exchange returns HRP's confirmed user and caps both sessions; altering the
  CRM deadline at exchange/query fails binding, never extends authority.
- Inactive user/expired session rejects exchange/read but permits authenticated
  owner-bound cancellation/revocation; mismatched owner cannot mutate records.
- Cancel/exchange races always terminate any matching delegation before ACK;
  unavailable/uncertain transaction never emits ACK.
- Secrets absent from URLs/logs; requested unsafe redaction omits the whole
  object; unrequested projection emits neither data nor unavailable marker.
- Restore old backups cannot expose expired/deleted metadata before purge
  and journal reconciliation.

## Decision ownership

Already Owner-approved: eligible roles without permission expansion, explicit
HRP login/approval, maximum 15 minutes capped by sessions/no renewal, and
bounded network-revoke risk for controlled pilot only. No reapproval request.

OPEN for Owner: canonical organization value/registration authority; audit
access, retention (including backup horizon), exceptions and recovery policy.

Bilateral engineering: exact transport/proof profile, issuer/key provisioning,
retry/backoff/timeouts and final schemas. CRM owns callback/session/client
safeguards; HRP owns consent/delegation/canonical authorization/redaction;
maintainer owns final version/export/distribution in the packaging task.

ACCEPTED_SHARED = NONE. H.09 and independent Tier 3 audit before real path
remain required. No runtime work or additional T1 assignment is opened.
