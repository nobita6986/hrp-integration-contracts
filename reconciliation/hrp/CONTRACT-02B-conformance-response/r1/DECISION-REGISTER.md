# Decision register

| ID | Topic | HRP disposition | Rationale / boundary | Remaining authority |
| --- | --- | --- | --- | --- |
| CD-01 | CRM correction integrity | VERIFIED | Raw blob recalculation: 19/19 match, specified manifest hash matches. | No runtime/audit conclusion follows. |
| CD-02 | Dedicated read query and strict seven-code parser | ACCEPT | Isolated query parser protects frozen command consumers and fails closed on malformed/unknown data. | CRM reciprocal review; exact shared schema artifact; REC-004b final acceptance. |
| CD-03 | Correlation/retry profile | ACCEPT | Fresh assertion/jti and reauthorization prevent logical correlation from becoming authority. | Retry count/backoff/time budget; REC-002 details. |
| CD-04 | Atomic receipt/exchange/cancel model | ACCEPT | Prevents receipt reuse and unknown-outcome replay while requiring HRP user approval. | Issuer/algorithm/key lifecycle, storage and transport implementation; REC-002. |
| CD-05 | Module/subpath/package distribution | COUNTERPROPOSAL | Module/subpath direction is sound; candidate package version and tarball operations are not yet reserved or demonstrated. | Package maintainer/version/export mapping; private distribution channel and consumer compatibility. |
| CD-06 | fullNameRedacted | PROPOSED | Deterministic, grapheme-aware initials-only display with safe omission avoids raw identity disclosure. | Bilateral review and test implementation. |
| CD-07 | Proposed endpoints | PROPOSED | Endpoint names/shapes separate browser approval from service back-channel and preserve fail-closed recovery. | REC-002/REC-004b; no existing endpoint is implied. |
| CD-08 | Canonical organization/service registration | OPEN | HRP must provide it through restricted operational authority, not infer it or disclose a credential. | Owner/HRP Operations decision. |
| CD-09 | Audit metadata | OPEN | A narrow 90-day recommendation needs Owner approval, including access, retention, and recovery details. | Owner decision. |

## Carried Owner-approved decisions

The following remain exactly as recorded in MSG-026: eligible roles are
`ADMIN`, `HR_MANAGER`, and `HR_STAFF` with no expanded object permission;
HRP login plus explicit approval is required; service-only reads are denied;
delegation lasts at most 15 minutes and never auto-renews; the controlled
pilot accepts bounded cross-system revoke delay until expiry. These decisions
do not authorize a rollout or make `ACCEPTED_SHARED` non-`NONE`.
