# 05C — Query-only parser
Status: DRAFT / NOT_EXECUTED. These are synthetic design examples aligned with HRP MSG-025, not executable schemas or runtime evidence. Technical proposals still require bilateral acceptance. Owner approvals are limited by MSG-026.

Proposed exact triples (code / HTTP / messageKey / retryClass):
- VALIDATION_ERROR / 422 / errors.validation / NEVER
- AUTHENTICATION_REQUIRED / 401 / errors.authenticationRequired / REAUTHENTICATE
- FORBIDDEN / 403 / errors.forbidden / NEVER
- RATE_LIMITED / 429 / errors.rateLimited / BOUNDED_NEW_ASSERTION
- DEPENDENCY_UNAVAILABLE / 503 / errors.dependencyUnavailable / BOUNDED_NEW_ASSERTION
- NOT_FOUND / 404 / errors.talentContext.notFound / NEVER
- INTERNAL_ERROR / 500 / errors.talentContext.internal / NEVER

Exactly one error in v1; strict fields code/messageKey/retryClass only.
200 uses direct result; non-2xx body must parse and match HTTP/code mapping.
Reject unknown version/code, command-only code, extra fields, wrong triple, wrong HTTP, empty/multiple errors and HTML transport bodies.
Rejection is a safe local protocol-failure state, not fabricated HRP INTERNAL_ERROR or UNKNOWN_COMMAND_OUTCOME; no automatic retry/raw rendering.
BOUNDED_NEW_ASSERTION is a proposed query-only literal; not frozen RetryClassSchema.
Transient code/messageKey reuse does not make the query error parseable by frozen ContractErrorSchema.
Use fixtures/errors.json valid and negative examples; these have NOT been run against a schema.
