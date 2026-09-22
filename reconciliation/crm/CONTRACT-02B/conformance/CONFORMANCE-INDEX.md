# Conformance index
Status: DRAFT / NOT_EXECUTED. These are synthetic design examples aligned with HRP MSG-025, not executable schemas or runtime evidence. Technical proposals still require bilateral acceptance. Owner approvals are limited by MSG-026.

1. cases/01-valid-read.md: complete direct query request/result, safe projection.
2. cases/02-auth-perm.md: service-only deny, delegation/user/org checks and failure-precedence gap.
3. cases/03-hidden-object.md: same sanitized 404, invalid auth/ID and transport distinctions.
4. cases/04-fields.md: projection names, requested/unsupported/unrequested, strict list.
5. cases/05-retry-vs-replay.md: stable logical correlationId, new assertion, no success guarantee.
6. cases/05A-retry-reauthorize.md: current permissions/revocation and fail-closed authority.
7. cases/05B-exchange-cancel-receipt.md: atomic lifecycle and unknown-outcome recovery.
8. cases/05C-seven-code-parser.md: exact proposed triples and negative parser cases.
9. cases/06-error-parsing.md: metadata-free wire examples and safe protocol failure.

fixtures/requests.json, results.json and errors.json supply synthetic design examples.
Authentication preconditions and partial scenario metadata are not complete signed HTTP exchanges.
Source authority: HRP MSG-025 at 53e6db53a929409b1dc7b512a1ec897a3af5b659; Owner MSG-026 at c0ede9aeaba3ba26d620ae4e535d9e6a77cf9343.
D-01..D-04 remain AGREED_DIRECTION; detailed technical proposals remain pending bilateral sign-off.
Owner decisions are closed only within controlled-pilot limits. Do not reopen them as generic role/TTL gaps.
See GAP-LIST.md for actual outstanding decisions. No execution or coverage PASS claimed.
