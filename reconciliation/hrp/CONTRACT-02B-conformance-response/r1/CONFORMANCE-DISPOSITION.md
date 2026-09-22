# Conformance disposition

## 1. Dedicated query shapes and seven-code parser profile — ACCEPT

HRP accepts the dedicated read-query boundary, the projection-name
`fieldAllowlist`, and the strict seven-code profile shown in the CRM
conformance correction. A successful response must use the dedicated result
shape; a failed response must contain exactly one error with one of these
exact code/status/messageKey/retryClass triples:

| Code | HTTP | messageKey | retryClass |
| --- | ---: | --- | --- |
| `VALIDATION_ERROR` | 422 | `errors.validation` | `NEVER` |
| `AUTHENTICATION_REQUIRED` | 401 | `errors.authenticationRequired` | `REAUTHENTICATE` |
| `FORBIDDEN` | 403 | `errors.forbidden` | `NEVER` |
| `RATE_LIMITED` | 429 | `errors.rateLimited` | `BOUNDED_NEW_ASSERTION` |
| `DEPENDENCY_UNAVAILABLE` | 503 | `errors.dependencyUnavailable` | `BOUNDED_NEW_ASSERTION` |
| `NOT_FOUND` | 404 | `errors.talentContext.notFound` | `NEVER` |
| `INTERNAL_ERROR` | 500 | `errors.talentContext.internal` | `NEVER` |

Empty or multiple errors, command-only error codes, an unknown code, a
non-matching triple, malformed JSON, or a non-JSON error body are local safe
protocol failures. They must not fall back to a command parser,
`UNKNOWN_COMMAND_OUTCOME`, an invented HRP error, or a permissive union.

This acceptance leaves the exact shared source artifact and parser
implementation uncreated. Frozen command contracts remain unchanged.

## 2. BOUNDED_NEW_ASSERTION, correlationId, retry and reauthorization — ACCEPT

HRP accepts the corrected retry direction:

- A `correlationId` identifies one logical query only. It grants neither
  access nor idempotency.
- Every retry uses a fresh service assertion and a fresh `jti`, and passes
  complete authorization again.
- A retry can be attempted only for the two listed bounded classes (429 and
  503), with no promise of eventual success.
- 401 requires a new authenticated session/assertion; 403, 404, 422, and
  500 are not automatically retried.

The separate command-only `BOUNDED_SAME_KEY` behavior is not modified.
Maximum attempts, backoff, and client timeout budget remain an implementation
profile to approve before a real path exists.

## 3. Receipt consumption, delegation creation, and cancel recovery — ACCEPT

HRP accepts the required atomic boundary: receipt validation and one-time
consumption, immutable binding validation, delegation creation, and final
state transition occur in one HRP transaction. A receipt is bound to the
service, effective HRP user, configured organization, scopes/audiences,
pending request, expiry, and callback/session references. It is never placed
in a URL or client log.

An exchange timeout whose committed outcome is unknown does not permit a new
approval. CRM must first cancel and obtain acknowledgement, or wait for HRP
to confirm expiry. Repeated exchange/cancel calls must be safe but must not
reveal whether a receipt was used, cancelled, expired, or belonged to another
session.

The concrete proposed transport, errors, and validation order are in
`HRP-REQ-2-TRANSPORT.md`; none exists in HRP at the surveyed baseline.

## 4. Subpath, candidate version, and private tarball distribution — COUNTERPROPOSAL

HRP accepts the proposed source/module direction:

- source: `packages/contracts/src/talent-context-read/v1.ts`
- intended import: `@hrp-engagement/contracts/talent-context-read/v1`
- no root re-export and no change to frozen command contracts.

HRP does **not** reserve or accept `0.0.9-contract02b.1` as a final package
version. The package maintainer must first verify that the exact prerelease
is unused and then record the final version, export map, tarball SHA-256,
access control, retention, and provenance in the bilateral delivery.

A private immutable tarball is acceptable as a distribution *option*, not
evidence that a distribution channel, package build, consumer installation,
or compatibility test exists. Those checks remain `NOT_EXECUTED`.
