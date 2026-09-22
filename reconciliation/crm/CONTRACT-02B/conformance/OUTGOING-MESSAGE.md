# Outgoing draft — T0 CRM to T0 HRP
Status: NOT_SENT. T1-B prepared the initial evidence; T0 corrected it under Owner authorization.
Responds-To: HRP-CRM-MSG-025 and HRP-CRM-MSG-026.
Message-ID: allocate from the protocol ledger at actual delivery; not fabricated here.
Delivery commit and manifest raw SHA-256 are supplied out-of-band after commit, avoiding self-reference.

T0 CRM verified MSG-025 manifest and 5/5 entries, and MSG-026 manifest and 1/1 entry.
This corrected conformance bundle supersedes examples at 4bf0931b5ab849bd3f90579f8eb844f9b04c249e, not HRP's immutable proposals.

CRM disposition:
- D-01..D-04: AGREED_DIRECTION.
- Query-only seven-code/parser/retry direction supported; BOUNDED_NEW_ASSERTION does not alter command BOUNDED_SAME_KEY.
- Retry uses same logical correlationId and fresh assertion/jti; fully reauthorized, no success guarantee.
- Atomic receipt/delegation creation and authenticated cancel-before-new-approval direction supported; exact transport remains bilateral.
- Owner approvals in MSG-026 acknowledged: roles, consent/reapproval, bounded delegation lifetime and controlled-pilot revoke window. Do not ask Owner to approve them again.
- ORG-1 and AUDIT-1 remain OPEN.
- Distribution is a private pinned tarball proposal with source/build provenance; no zero-impact or publication claim.

Requests to HRP:
HRP-REQ-1: redaction algorithm and synthetic vectors, including unsafe-redaction omission.
HRP-REQ-2: exact issuance/approval/exchange/cancel transport/body/status and auth-error precedence.
HRP-REQ-3: concrete organizationId/registration from authoritative HRP configuration (via appropriate channel).
HRP-REQ-4: operations proposal for audit metadata access/retention/recovery for Owner disposition.
Confirm/revise query wire/parser/retry and distribution proposals to prepare one consolidated bilateral spec.

Examples remain DRAFT/NOT_EXECUTED; JSON_OK is syntax only.
No source/schema/runtime change; ACCEPTED_SHARED=NONE; H.09/Tier 3 unchanged.
No implementation, consumer migration, publish, pilot/production enablement from this message.

T0 CRM
