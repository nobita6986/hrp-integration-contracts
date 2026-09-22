# C-02..C-07 — corrected transport proposal

## Scope and common types

Every endpoint below is PROPOSED. No endpoint implementation or current
capability is asserted. Query/result/error shapes agreed in MSG-025/027
remain unchanged.

The single permitted scope literal is `talent-context:read:identitySummary`.
Use it identically in registration, requestedScopes, assertion scope claim,
approval, receipt/delegation records and checks. Arrays contain exactly this
one value; no aliases, wildcard or dot-separated alternative.

Timestamps are UTC ISO timestamps. IDs are bounded, nonempty opaque strings;
random proof/state values use 256 bits of entropy encoded base64url.
Bodies are strict objects with no additional fields. Concrete string-size
limits belong to the engineering profile before implementation.

Define immutable CRM binding B =
`{ organizationId, crmSubject, crmSessionHandle, crmSessionDeadline, callbackId }`.
CRM supplies it through the registered backend after authenticating the local
session. The signed assertion binds serviceId, B, fixed scope, endpoint
audience, method, exact path and SHA-256 of raw request bytes.
No caller-supplied HRP user ID is accepted at issuance.

## 1. Create request and issue browser handoff proof

`POST /api/integrations/crm/talent-context/delegation-requests`
Authenticated CRM backend JSON:
`{ ...B, requestedScopes: ['talent-context:read:identitySummary'], callbackState }`.
callbackState is a new random value that CRM binds server-side to the exact
CRM subject/session and this logical approval attempt.

HRP verifies service authentication, raw-body binding, configured org/scope,
registered callbackId and fresh assertion/jti. HRP derives serviceId from
the registration, never from unsigned body fields.

HRP atomically creates a pending record and issues a distinct one-time opaque
handoffProof, storing its digest. Binding includes pendingRequestId, serviceId,
B, scope, callbackState digest, purpose/audience and expiration.
Proposed pending lifetime: min(create time + 5 minutes, CRM session deadline).
Proposed proof lifetime: min(create time + 120 seconds, pending expiry).

Success 201:
`{ pendingRequestId, expiresAt, handoffProof, handoffExpiresAt }`.
expiresAt here is pending expiry, not delegation expiry. CRM receives this
over the authenticated TLS back-channel and transfers proof to only the same
authenticated browser session through an HTTPS form POST. It never puts proof
in a URL, persistent browser storage, analytics or logs.

## 2. Browser handoff, HRP approval and callback

Browser form:
`POST /integrations/crm/talent-context/approval/handoff`
body `{ pendingRequestId, handoffProof, callbackState }`.

HRP verifies digest/binding/deadline and consumes proof atomically once, then
binds pending state to a fresh HRP browser-flow session (Secure, HttpOnly,
appropriately SameSite-protected cookie). This entry accepts a registered CRM
origin for the cross-site form; no HRP consent or delegation is granted here.
A bare pendingRequestId never authenticates a browser or session.

HRP responds 303 to fixed local `GET /integrations/crm/talent-context/approval`.
Any required HRP login resumes the server-side browser flow; no proof or
receipt travels in redirect URLs. Replayed/invalid proof gives a generic
403 browser response without callback or details.

The approval page requires an authenticated active HRP user and displays the
verified CRM account label, configured organization, scope and lifetime.
CRM account label must be obtained from a registered trusted binding/display
source; do not substitute PII guesses for identity. If no such verified label
is available, approval remains blocked until that registration detail is set.
The page generates a local CSRF token bound to the HRP session and pending
flow. Login/session rotation must rebind safely or restart the flow, never
silently switch the approved HRP user.

Local form:
`POST /integrations/crm/talent-context/approval/decision`
body `{ pendingRequestId, decision: 'APPROVE' | 'DENY', csrfToken }`.
Same-origin/CSRF/session/pending-binding checks run before the decision;
APPROVE additionally checks current active user, eligible role, deadlines
and service grant-enabled status. The effective HRP user is resolved from
that HRP session. Repeated decision cannot mint another receipt.

APPROVE commits consent and one-time receipt digest with the immutable
service/B/scope/pending/effectiveHrpUserId/HRP-session/audiences tuple.
The receipt lifetime is min(approval time + 60 seconds, pending expiry,
HRP session expiry, bound CRM session deadline).

HRP returns 200 browser form-post page to the registered fixed HTTPS callback:
`{ pendingRequestId, callbackState, outcome: 'APPROVED', receipt }`.
DENY transitions the pending flow terminal and returns the same form mechanism:
`{ pendingRequestId, callbackState, outcome: 'DENIED' }`.
No receipt accompanies DENIED. Browser validation/auth failures return local
generic 401/403/422/503 pages; never reflect secrets or redirect to an arbitrary
callback. Transport/cache headers are no-store and Referrer-Policy no-referrer.

CRM callback verifies state, pending association and SAME currently active
CRM user/session before exchange. No received HRP user ID from the browser
is authority. On mismatch/logout, CRM does not exchange and initiates cancel
using its stored immutable binding. CRM owns the exact callback URL and its
response page; HRP callbackId resolves only to that pre-registered URL.

## 3. Exchange and authoritative user ID

`POST /api/integrations/crm/talent-context/delegation-requests/{pendingRequestId}/exchange`
Fresh authenticated CRM backend JSON `{ ...B, receipt }`.

After common authentication, lock the pending record and verify immutable B,
service, scope, approved effective user/session, receipt and all deadlines.
Creation/consumption is one transaction: at most one delegation per receipt.
Effective HRP user is active and currently eligible at exchange.

Success 201:
`{ delegationRef, effectiveHrpUserId, expiresAt }`.
effectiveHrpUserId is the HRP-confirmed opaque canonical ID. CRM stores this
with delegationRef server-side and uses it as actor.userId; HRP still compares
the query actor with the stored delegation and resolves current permissions.
No mapping from CRM ID, name, email or phone is allowed.

`expiresAt = min(exchangeTime + 15 minutes, HRP session expiry,
bound CRM session deadline)`.
CRM session deadline is obtained by the CRM backend from its actual session
authority and authenticated in the signed create request; HRP stores it
immutably. Later requests must match; extension requires a new approval flow.
HRP also limits authority using its own session and 15-minute cap.
A signed deadline is a trusted service assertion about the CRM session, not
proof that HRP has online access to CRM session state. Earlier CRM logout or
deadline shortening blocks local use immediately and triggers revoke; the
Owner-approved delivery-failure window still applies.

Invalid/used/cancelled/expired receipt or mismatched record binding: generic
403. Never replay the successful exchange response. Timeout/unknown outcome:
no second exchange attempt; cancel and obtain terminal ACK before another
approval, or obtain authoritative HRP expiry confirmation.

## 4. Reduction of authority: cancel and revoke

Cancel:
`POST /api/integrations/crm/talent-context/delegation-requests/{pendingRequestId}/cancel`
body `{ ...B, reason: 'EXCHANGE_OUTCOME_UNKNOWN' | 'SESSION_ENDED' | 'USER_CANCELLED' }`.

Revoke:
`POST /api/integrations/crm/talent-context/delegations/revoke`
body `{ ...B, delegationRef, reason: 'SESSION_ENDED' | 'ACCOUNT_SWITCH' | 'USER_CANCELLED' }`.
delegationRef is in authenticated POST BODY only, never the URL.

Both require a currently valid cleanup-authorized service authentication,
fresh assertion/jti, org/service registration binding and immutable ownership
binding. They do NOT require an active user, active CRM/HRP session, unexpired
receipt/delegation/pending request or eligibility to grant/read. A past CRM
session deadline is accepted as the original immutable binding value.
Expired/invalid SERVICE assertions are still rejected.

Cancel serializes with exchange on the same pending record, terminates the
pending flow, and revokes any delegation already created from it atomically.
Cancel before exchange prevents later creation; exchange before cancel is
revoked before cancel ACK. Revoke terminates its matching delegation.
Known owned, already terminal, missing and non-owned record cases all return
the same 200 `{ acknowledged: true }` after authenticated processing.
Non-owned records are not modified. No existence/status/receipt is returned.
Normalize outward behavior and test for practical existence-oracle leakage.

ACK means that this authenticated binding can no longer issue/read via the
referenced flow; it is NOT a queued 202. Unknown storage/commit outcome or
unavailable authority store returns 503/no ACK. Retry cancel/revoke with a
fresh assertion/jti; no replacement approval until acknowledged.
An ACK for an absent record requires transactional serialization/uniqueness
that prevents that pending ID being created later for the binding.

Disabling service grant/read access should retain separately authorized
cleanup access where policy permits. Invalid/revoked service keys never pass;
when no cleanup credential remains valid, HRP operations must revoke locally
or CRM must await HRP-confirmed expiry. No stale/expired-key bypass.

## 5. Authentication and validation order

Common backend order:
bounded transport framing and raw bytes -> pinned service signature,
issuer/audience/time -> method/path/raw-body and signed B/scope checks ->
configured org/service authorization -> atomic fresh-jti consume ->
strict operation body validation -> operation-specific transactional checks.
No LaborProfile lookup occurs before org binding; every query retains full
effective-user/object authorization under the agreed query profile.

Duplicate/malformed JSON, missing fields and invalid primitive values are
validation failures; never hash a reserialized body. Bounded framing rejection
may precede authentication but reveals no record state. In create, required
B syntax is checked before accepting it as a new immutable tuple; other calls
compare it with the stored tuple after authentication. Grant/read additionally
check active user/session/deadlines; cancel/revoke use only immutable ownership
and cleanup authorization. jti is not returned to the pool on downstream error.

Proposed backend errors for these DELEGATION operations only:
`{ status: 'FAILED', error: { code: <one code below> } }`, strict object,
no free-text/detail/PII. This is not the query error envelope.

| HTTP | Delegation code | Condition |
| --- | --- | --- |
| 401 | AUTHENTICATION_REQUIRED | Missing/invalid/expired service proof, method/body mismatch or duplicate jti |
| 403 | FORBIDDEN | Org/scope/service permission denial, or exchange/approval binding/eligibility denial |
| 422 | VALIDATION_ERROR | Invalid JSON or operation shape/value after bounded framing |
| 429 | RATE_LIMITED | Authenticated endpoint capacity/rate limit |
| 503 | DEPENDENCY_UNAVAILABLE | Replay/authority store unavailable or commit outcome unknown |
| 500 | INTERNAL_ERROR | Unexpected fault with sanitized response |

Infrastructure size/content-type/HTML errors may be 413/415 or another
untyped transport failure. They are not parsed as a typed delegation/query
error and carry no success/ACK. Cancel/revoke missing/non-owned records use
the generic ACK rule above rather than 403. Exchange timeout/5xx retains the
uncertain-outcome cancel rule, even when generic retry budgets would allow a
read retry. Query seven-code/error/retry rules are unchanged.

## 6. Confidentiality and engineering profile

pendingRequestId is a non-secret correlation reference, with no independent
authority. It may appear in the pending route path, but logs should record
route templates and minimize/hash the reference under the audit policy.
receipt, handoffProof, delegationRef, callbackState, signed assertions,
session handles, CSRF tokens and request/response bodies are redacted from
proxy/access/app/analytics logs. HRP user IDs and immutable B are restricted
metadata, never ordinary URL/console fields. Successful backend/browser
responses are no-store; secret-bearing pages load no third-party assets.

Technical values above (5-minute pending, 120-second handoff, 60-second
receipt) are recommendations for bilateral engineering review, not new Owner
decisions. RS256, assertion <=60 seconds/skew <=30 seconds and replay
retention until exp+skew remain MSG-025 engineering proposals. Issuer/key
provisioning, rotation, recovery and retry/backoff/timeout budgets still need
the engineering profile. Do not ask Owner to approve roles/15 minutes/revoke
window again. No endpoint can be implemented from this bundle alone.
