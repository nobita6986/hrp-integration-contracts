# Engineering profile — HRP recommendations for bilateral decision

EP-01..EP-06 are concrete technical proposals. No Owner reapproval is sought
for roles, 15-minute delegation limit or the controlled-pilot revoke window.

## EP-01 — service assertions, strict claims and bindings

Use compact signed JWT, RS256 only, RSA 3072-bit keys. Protected header exactly
{ alg: 'RS256', typ: 'hrp-crm-service+jwt', kid: <registered ID> }.
Reject other algorithms, unsecured/encrypted JWT, duplicate JSON members,
unknown header/claim fields, crit, embedded keys and key-fetch URL headers.

Strict claims:

| Claim | Type / constraint |
| --- | --- |
| iss | Registered issuer string, <=256 ASCII bytes; exact match, no URL normalization/discovery |
| sub, serviceId | Same registered service ID, canonical ID grammar <=128 |
| aud | Single registered audience string <=256 ASCII bytes; arrays rejected |
| iat, exp | Integer epoch seconds, 0..Number.MAX_SAFE_INTEGER |
| jti | jt_ followed by canonical unpadded base64url encoding of exactly 32 random bytes |
| scope | Exactly ['talent-context:read:identitySummary'] |
| binding | Strict B from S28: organizationId, crmSubject, crmSessionHandle, crmSessionDeadline, callbackId |
| request | Strict { method: 'POST', path: <registered exact pathname>, bodySha256: <64 lowercase hex> } |
| actor | Query ONLY: exact DELEGATED_USER tuple from S25 including serviceId/userId/delegationRef; absent for issuance/exchange/cleanup |

B appears in create/exchange/cancel/revoke bodies and must equal signed B.
For query, stored delegation supplies B and must equal signed B; body org/actor
also match. request hash is over bounded raw UTF-8 bytes, never reserialized.
No URL query string, path alias, redirect, double-decoding or method substitution.
No role claim; current HRP user/role/object permissions remain authority.
CRM signature proves the service's CRM-session assertion, not user consent.

Recommended issuer namespace template:
urn:hrp-integration:crm:{environment}:{registrationId}.
Audience template: urn:hrp:talent-context:v1:{environment}:{operation}, where
operation is create, exchange, cancel, revoke or query. These are templates,
not deployment values. HRP registration pins exact strings, one service and
one org; pilot and production keys/registration/issuer/audiences are distinct.
The audience purpose must agree with the actual registered endpoint.

Require exp > iat, exp-iat <=60 seconds, iat <= verifierNow+30 seconds and
verifierNow < exp+30 seconds. nbf is not emitted/accepted in this strict
profile. Delegation/receipt/session deadlines have NO +30-second grace.
Clock skew applies only to service assertion verification. Use a shared HRP
authority-clock reading from the replay/authority database for verifierNow
and consumption deadlines, not independently drifting worker clocks. Clock
health uncertainty beyond 30 seconds fences assertions (503); no extended TTL.

Wrong signature/profile/time/body binding or duplicate jti: 401.
Wrong configured org/service permission: 403 before object lookup.
The agreed query vs delegation envelope is chosen by the endpoint.
Framing failures remain the untyped transport errors described in S28.

## EP-02 — trusted key provisioning and rotation

CRM signing private key resides in a restricted server secret manager; it
never enters browser, evidence repo or HRP. HRP registration receives public
JWK/PEM plus key thumbprint through authenticated restricted operations
handover. Verify issuer/service/environment/audience bindings out-of-band,
and verify a non-production signature challenge before activation.
No public discovery endpoint or untrusted jku/x5u fetch is introduced.

Routine provisioning: HRP integration operator registers pending public key,
CRM operator proves possession, both record nonsecret version/thumbprint and
activation time. Choose manual overlapping rotation for the pilot; no new
automated PKI platform. kid is 1..64 of [A-Za-z0-9._-], unique within issuer,
never reused for different key material.

Planned rotation: provision new verify key first, confirm readiness, then CRM
switches all signers. Old key verifies for <=24 hours after switch as an
operational overlap; each individual assertion still has <=60-second life.
CRM stops signing old key at switch. HRP then disables old kid.
Emergency compromise/service disable overrides overlap immediately; cleanup
must use a remaining valid cleanup-authorized key or authenticated HRP local
operations. Never accept a revoked key to make cleanup convenient.

Audit key changes as operational security metadata, without private keys or
tokens. Key storage/access and real registration are group 2 prerequisites.
Availability of a package/tarball is unrelated to trust provisioning.

## EP-03 — replay consumption and recovery fencing

Recommend the existing HRP PostgreSQL authority service for a future durable
replay table: unique, unambiguous (iss, serviceId, aud, jti), atomic insert,
commit BEFORE downstream work in a separate transaction. A failed query or
exchange does not roll back jti consumption. A duplicate concurrent insert
allows at most one attempt. Storage must be shared by all accepting instances;
no process-local replay cache or eviction-before-expiry.

Retain each entry through absolute exp+30 seconds, delete only after that
instant. All accepting nodes use healthy clocks; query authorization itself
does not use a positive replay/delegation cache. This is a backend selection
proposal, not a migration request or claim that the table exists.

Replay-store outage: all assertion-authenticated operations fail closed 503,
including cleanup (therefore no ACK). HRP local emergency revoke uses its
separate authenticated operational authority, never a service-proof bypass.

Restore/rollback/loss of consumed jti history:
1. Fence ALL assertion verifiers and stop in-flight acceptance/issuance work.
   Establish barrier time F on that same authority clock only after every
   accepting node acknowledges the fence and earlier transactions are settled
   or terminated. Persist the fence/barrier outside the state being restored.
2. Restore durable unique storage and verify connectivity/clock health.
3. Keep the fence until verifier time >= F+120 seconds. An assertion accepted
   at F could have iat=F+30, exp=F+90, exp+skew=F+120, hence the 120-second
   upper bound under EP-01. If barrier/clock/history is uncertain, stay fenced.
4. Drain/terminate requests authenticated before the fence; they cannot resume
   side effects after it. Reopen only fresh verification with intact storage.
   Empty replay storage alone is never sufficient.

If delegation/revocation authority itself was rolled back, this 120-second
wait is NOT enough: keep grant/read fenced, invalidate all potentially
affected delegations/pending receipts (or reconstruct current terminal state
from independently authoritative recovery evidence) before reopening.
Owner audit recovery approval remains separate; runtime replay/delegation
fencing is a technical fail-closed requirement. Cleanup resumes only when its
authority transaction can durably commit. Restoration never revives consent.

## EP-04 — bounded retry, timeout and cleanup profile

All budgets use a monotonic local clock. One active attempt per logical
operation. Abort local HTTP attempt at timeout; no claim that server work
necessarily stopped. No hedged/parallel retries. Backend connect/TLS timeout
<=1 second within the attempt deadline. No automatic HTTP redirects.

| Operation | Attempts including first | Attempt timeout | Total budget | Automatic retry |
| --- | --- | --- | --- | --- |
| Query | 3 | 3 seconds | 10 seconds | Valid typed 429/503 or a connection/response timeout with no complete response |
| Cancel/revoke | 6 | 5 seconds | 60 seconds | Valid typed 429/503 or connection/response timeout with no complete response |
| Create/exchange | 1 | 5 seconds | 5 seconds | None; exchange unknown outcome follows mandatory cancel recovery |

Query retries: full jitter in [0,250ms], then [0,750ms].
Cleanup retries: full jitter capped respectively at 0.5,1,2,4,8 seconds.
For typed 429/503, valid Retry-After is a minimum wait; choose the greater of
jitter and Retry-After. If that plus the next attempt cannot fit the remaining
budget, stop; never shorten Retry-After or extend total budget. Support integer
delta-seconds and valid HTTP-date; ignore invalid values, using bounded local
backoff. Timing never creates a guarantee of success.

Every retry signs a new assertion/jti and rechecks required authority.
Query retains the logical correlationId; UI refresh is a new logical query.
Query 401/403/404/422/500, protocol/parser errors, unexpected redirects and
untrusted malformed bodies do not automatically retry. Fix auth/reconnect
before a new logical query; no silent reauthentication loop.

Cleanup requires a terminal parsed 200 ACK. A 202, HTML response, malformed
body or timeout is not ACK. Budget exhaustion leaves cleanup unresolved,
blocks replacement approval for the affected flow and records a restricted
operational action. Resume only a new bounded cleanup run (operator/manual
retry or configured recovery action); no unbounded background spin or fake
completion. User inactive/session expired never stops authenticated cleanup.
Old service credentials do not gain validity through retries.

Create timeout cannot expose an active delegation because create grants none;
if pending ID was not received, do not retry automatically or invent an ID.
Retrying a new approval is possible after the bounded old pending lifetime
under the future implementation's verified flow-state handling. Exchange
unknown outcome always requires cancel ACK or HRP-confirmed expiry.
Browser form submissions are not automatically replayed. Handoff is one-time;
lost response requires controlled recovery/restart, never reuse of proof.
These are local read/cleanup rules, not REC-003 command delivery semantics.

## EP-05 — payload/string limits and canonical compatibility

Sizes below are bytes where stated, otherwise string characters as in frozen
schemas. Decode strict UTF-8; reject duplicate JSON/form keys, malformed
surrogates/encoding and unknown fields. No compressed request bodies.

| Surface | Bound |
| --- | --- |
| JSON backend request / response | 16 KiB each |
| URL-encoded handoff/decision/callback form | 8 KiB encoded; max 8 fields |
| Authorization header | 8 KiB; exactly one Bearer JWT |
| Request pathname | <=512 ASCII bytes, exact registered endpoint pattern |
| organizationId | Frozen OrganizationIdSchema: 1..64, opaque grammar |
| canonical IDs, serviceId, effectiveHrpUserId, crmSubject | 1..128, opaque grammar |
| correlationId | Frozen CorrelationIdSchema: 8..128, opaque grammar |
| callbackId | 1..64, opaque grammar |
| crmSessionHandle | <=128, opaque grammar; stable non-bearer session alias, never cookie/session token |
| binding UTC timestamps | RFC3339 UTC Z, 20..40 characters, valid date; producers canonicalize before first immutable binding |
| fieldAllowlist / unavailableFields | S25 unique bounds 1..8 / 0..8; no extra literals |
| requestedScopes / assertion scope | Array length 1, fixed accepted literal |
| redaction input processing / output | <=256 Unicode scalar values and <=16 tokens / <=512 UTF-8 bytes |

Opaque grammar is the frozen
`^[A-Za-z0-9][A-Za-z0-9._:-]*$`. Do not alter frozen primitives.
Use independent random 32-byte secrets with base64url encodings and fixed
prefixes: pd_ pending ID, hp_ handoff proof, rc_ receipt, dg_ delegationRef,
st_ callbackState, cs_ CSRF, jt_ jti. Each is 46 ASCII characters; require
canonical decode/re-encode equality. The leading prefix keeps delegationRef
compatible with frozen actor opaque-ID grammar even if base64url begins '-'.
No timestamp/identity is encoded into these values.

Over-limit name input/output causes the already-agreed whole-projection
omission; never truncate the name into a misleading partial redaction.
Other body/field overlimits reject with 413 transport or 422 validation as
appropriate to the endpoint; not a partial parse/silent strip.
Responses are no-store and size-bounded before sending. Secret-bearing HTML
approval/callback pages use a separate static-template limit of 32 KiB;
dynamic values must be safely escaped, never inserted as HTML.

Compatibility basis: CRM packages/contracts/src/primitives.ts at
72643356a0d1355f9dccc3921b47c990ea9c31c1,
raw SHA-256 359a37758e18069ed69e5e1015b8ea00ed18c6b2f598b6125afce01962ef56ac.
New delegation tokens/transport limits are proposed refinements, not changes
to frozen commands or proof of parser execution.

## EP-06 — browser and callback/session compatibility

Support top-level HTTPS navigation/forms on current stable Chromium, Firefox
and Safari, including desktop and mobile Safari/Chrome. Do not rely on iframe
third-party cookies or embedded CRM webviews. Browser integration tests are
required before real-path enablement, not presumed from these choices.

HRP handoff sets a fresh host-only Secure/HttpOnly SameSite=Lax browser-flow
cookie with path '/', lifetime capped by pending expiry. It grants no consent.
303 to the fixed HRP approval GET permits first-party HRP login/session checks.
Decision POST requires same-origin Origin validation plus local CSRF bound to
HRP user/session and flow. HTTP login redirects contain only fixed local
routes; rotate session safely and rebind or restart after account change.

A cross-site POST callback cannot assume CRM SameSite=Lax auth cookies arrive.
CRM callback performs only bounded receipt/state capture into a short-lived,
one-time isolated server-side callback landing record; no exchange or session
approval occurs at this POST. Check registered HRP Origin, expected pending
flow and callback state, without revealing state on failure.

Set a distinct random landing cookie (Secure/HttpOnly, host-only,
SameSite=Lax, path '/', <=60 seconds AND capped by receipt/flow deadlines);
303 to a fixed same-origin CRM completion GET. That GET receives CRM's normal
first-party Lax session cookie and MUST compare the current active CRM user/
session with the pending tuple and callback state before releasing the
server-held receipt for exchange. Landing cookie alone is never authority.
One landing slot per browser: another flow collision invalidates/denies the
ambiguous landing rather than overwriting bindings. No secrets in URLs.

If actual CRM/HRP auth cookies use Strict, partitioned, disabled or incompatible
settings, fail safely or require an explicit first-party navigation/login
that revalidates the original session binding; do not downgrade global cookie
security to make the integration work. Session/account change => cancel.
Only if the original session and state can be proven may exchange proceed.

No CORS credential sharing. Exact configured origins/callback paths, no
wildcards/open redirects. CSP restricts form-action to the registered
destination, frame-ancestors 'none', no third-party scripts/assets/analytics;
Referrer-Policy no-referrer, Cache-Control no-store. Callback/proof fields
never enter access logs, browser storage or third-party observability.

Approval label comes from the trusted CRM-session binding/display source
configured in registration. Its adapter must bind label to crmSubject/service,
escape it as plain text and limit it to 80 Unicode scalar values; it does not
prove identity equivalence or grant permissions. If no trusted source exists,
configuration remains missing; do not silently add a wire field or infer PII.
