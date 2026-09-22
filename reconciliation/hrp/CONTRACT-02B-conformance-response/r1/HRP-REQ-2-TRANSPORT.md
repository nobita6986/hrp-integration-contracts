# HRP-REQ-2 — proposed transport and fail-closed ordering

## Status

Every endpoint in this document is a proposed future endpoint. No matching
CRM S2S endpoint, receipt store, delegation store, or service registration
exists at HRP baseline \`0f46f0fbf2c8bc8d106c9aa2f0d3fc6143d2850b\`.

The names below intentionally separate browser approval from service
back-channel calls. A receipt, delegation token, signed assertion, or HRP
session token is never placed in a URL.

## Proposed endpoints

| Purpose | Method and path | Request | Success | Failure rule |
| --- | --- | --- | --- | --- |
| Create approval request | \`POST /api/integrations/crm/talent-context/delegation-requests\` | signed service assertion; \`{ crmSubject, crmSessionHandle, requestedScopes, callbackId }\` | \`202 { pendingRequestId, expiresAt }\` | Generic 401/403/422/503; no approval-state oracle. |
| Display/submit browser approval | \`POST /integrations/crm/talent-context/approval\` | browser form post containing opaque pending reference and handoff proof; HRP login and CSRF proof | browser confirmation, then HTTPS form POST callback | Login/session/CSRF failures stay on HRP browser surface; no receipt in redirect URL. |
| Exchange receipt | \`POST /api/integrations/crm/talent-context/delegation-requests/{pendingRequestId}/exchange\` | fresh signed service assertion; \`{ receipt, callbackId, crmSessionHandle }\` | \`201 { delegationRef, expiresAt }\` | Receipt invalid/used/cancelled/expired/binding mismatch returns indistinguishable 403. |
| Cancel uncertain request | \`POST /api/integrations/crm/talent-context/delegation-requests/{pendingRequestId}/cancel\` | fresh signed service assertion; \`{ callbackId, crmSessionHandle, reason }\` | \`202 { acknowledged: true }\` | Idempotent generic acknowledgement after authenticated binding; no state oracle. |
| Revoke delegation | \`POST /api/integrations/crm/talent-context/delegations/{delegationRef}/revoke\` | fresh signed service assertion; \`{ crmSessionHandle, reason }\` | \`202 { acknowledged: true }\` | HRP-received committed revoke blocks later checkpoints; cross-system delivery remains bounded by the Owner-approved expiry window. |
| Read Talent context | \`POST /api/integrations/crm/talent-context/query\` | fresh signed service assertion and dedicated query request | dedicated success result | Strict seven-code query matrix only. |

The \`pendingRequestId\`, \`receipt\`, and \`delegationRef\` are opaque random
values. They are not canonical user, organization, or labor-profile IDs.

## Proposed approval and exchange binding

A pending request records immutable values:
\`pendingRequestId\`, \`serviceId\`, effective HRP user after login/approval,
configured \`organizationId\`, scopes, exchange/query audiences, CRM subject,
CRM session handle, HRP session reference, callback ID, \`approvedAt\`, and
\`expiresAt\`. The one-time receipt is a 256-bit opaque secret; HRP stores only
its digest. Its maximum lifetime is 60 seconds and it cannot outlive either
linked session.

On successful exchange, HRP creates a delegation with a maximum life of 15
minutes, capped by the approved HRP session, and no automatic renewal. Each
query still checks delegation expiry/revocation, active HRP user, approved
role, configured organization before lookup, and canonical object permission
under HRP authorization/RLS.

## Fail-closed processing order

For every service back-channel endpoint, the intended order is:

1. Enforce request-size limit, HTTPS, content type, and parseable JSON; reject
   malformed framing without echoing the input.
2. Verify the signed service assertion: issuer, signature, \`kid\`, audience,
   expiry, skew, method/path/body binding, and fresh \`jti\`.
3. Atomically consume the \`jti\`. If the replay store is unavailable, fail
   closed with 503; never accept on stale or best-effort replay state.
4. Validate the request shape and the service registration/organization
   binding. A valid service that is not authorized for the binding is denied
   before object lookup.
5. Acquire the pending-request/delegation record under transaction lock; verify
   all immutable bindings, status, expiry, current user activity, and the
   HRP session cap.
6. For exchange, atomically consume the receipt and create the delegation; for
   cancel/revoke, atomically record the terminal state. Commit before success.
7. For a query, run the current effective-user role and object authorization
   checkpoint before lookup and apply the fixed projection only after it passes.
8. Return a generic response that avoids revealing record existence, session
   state, authorization detail, SQL, stack traces, secrets, or PII.

The exact assertion issuer, algorithm, audiences, replay storage technology,
maximum retry budget, and error shapes for approval/exchange/cancel are still
subject to REC-002/REC-004b approval. The query error matrix is limited to
the seven accepted design triples in \`CONFORMANCE-DISPOSITION.md\`.

