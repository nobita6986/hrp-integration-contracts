# CONTRACT-03A — Implementation notes

## Deviations from MSG-028 / REC-004B / EP-01..EP-06

None. The implementation matches all accepted design documents. Where the
r2 baseline (`f9cc493`) did not cover an accepted requirement, this
correction batch (current commit) supplies the missing surface WITHOUT
changing the agreed semantics:

| F-ID | Subject | Status |
| --- | --- | --- |
| F-01 | Pure assertion/profile validators | Implemented in `assertion.ts`. |
| F-02 | Exact delegation wire (path/body split; code-only error; handoff/decision/callback schemas; CSRF) | Implemented in `delegation.ts` and `delegation-conformance.test.mjs`. |
| F-03 | Canonical token encoder (prefix + 32 decoded bytes + base64url roundtrip) | Implemented in `primitives.ts` (`canonicalTokenSchema`). |
| F-04 | Immutable binding grammar + UTC-Z deadline | Implemented in `primitives.ts` (`BindingTimestampSchema`); `IsoTimestampSchema` left untouched for non-binding surfaces. |
| F-05 | Redaction FEFF, SMP, segmenter, byte bound, omission | Implemented in `redaction.ts`; verified in `redaction-probes.test.mjs`. |
| F-06 | Request/result conformance helper | Implemented in `conformance.ts`; pinned-vector driven tests replace `assert.ok(true)`. |

## Pure-validator scope limits

The following runtime invariants are NOT proven by these synthetic tests:

- Signature verification (RS256, RSA 3072-bit keys, kid, header parsing).
- jti consumption / replay fencing (120-second barrier, F+120s reopen).
- Session active at exchange time (crmSessionDeadline check).
- RLS / object permission enforcement (organization/service binding).
- Cancel atomicity (acknowledgement under timeout).
- Browser/callback state (landing cookie, CSRF, callbackId round-trip).
- Approval label source binding to crmSubject/service.

These are recorded as future runtime test requirements in
`assertion-profile.test.mjs` (suite: Pure validators do not assert runtime invariants).
No mock-based PASS is granted.

## Query-only retry/error profile

The `BOUNDED_NEW_ASSERTION` retry literal in `QueryRetryClassSchema` is module-local
and does NOT appear in the frozen `RetryClassSchema`. The seven-query-error triples
do NOT alter frozen command triples for VALIDATION_ERROR, AUTHENTICATION_REQUIRED,
and FORBIDDEN (code/messageKey reused, retryClass overridden for RATE_LIMITED and
DEPENDENCY_UNAVAILABLE). NOT_FOUND and INTERNAL_ERROR are new additions with their
own messageKeys. No frozen error policy is changed.

## Schema version scope

The literal `'1'` in `MODULE_SCHEMA_VERSION` is module-local. It is not a
shared v1 literal across the contract. Future schema versions must be added
as new modules, not by widening this literal.

## Redaction algorithm details

The implementation follows S28 REDACTION.md algorithm steps 1-6:

1. Require string; reject controls (Cc/Cf including bidi) before whitespace.
2. NFC normalize; trim Unicode White_Space; collapse runs to ASCII space.
3. Split on ASCII space; each token must match
   `^[\p{L}][\p{L}\p{M}]*(?:[''-][\p{L}][\p{L}\p{M}]*)*$`.
4. Use `Intl.Segmenter` with granularity=grapheme.
   First cluster must start with `[\p{L}]`.
   Token must have at least 2 grapheme clusters (refined r1: punctuation
   cannot make a one-letter name safe).
5. Emit first letter-led cluster + U+2022 U+2022; join with ASCII space.
6. Missing segmenter / malformed input → unsafe.

EP-05 additional bounds: input ≤ 256 Unicode scalar values; ≤ 16 tokens;
output ≤ 512 UTF-8 bytes (single masked initial is well under).

## Token prefix encoding (EP-05)

| Token | Prefix | Total length |
| --- | --- | --- |
| pendingRequestId | pd_ | 46 ASCII |
| handoffProof | hp_ | 46 ASCII |
| receipt | rc_ | 46 ASCII |
| delegationRef | dg_ | 46 ASCII |
| callbackState | st_ | 46 ASCII |
| jti | jt_ | 46 ASCII |

46 = 3-char prefix + 43-char canonical base64url of 32 random bytes.
The leading underscore is preserved so delegationRef remains compatible with
the frozen actor opaque-ID grammar even if base64url starts with `-`.

## Frozen primitive compatibility

All opaque-ID schemas use the frozen grammar
`^[A-Za-z0-9][A-Za-z0-9._:-]*$` with the same length bounds as the frozen
CRM primitives.ts at commit 72643356.

`IsoTimestampSchema` uses Zod 3.24.2 `datetime({ offset: true })` matching
the frozen shape.

## Build harness

`packages/contracts/tsconfig.json` is dev-only:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": false,
    "noImplicitAny": false,
    "noEmit": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "outDir": "dist"
  },
  "include": ["src/talent-context-read/**/*.ts"]
}
```

`packages/contracts/package.json` is private, dev-only:

```json
{
  "name": "@hrp-integration-contracts/talent-context-read-dev",
  "version": "0.0.0-dev.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "tsc -p tsconfig.json && node --test tests/talent-context-read/*.test.mjs",
    "test:only": "node --test tests/talent-context-read/*.test.mjs"
  },
  "devDependencies": {
    "typescript": "5.7.3",
    "zod": "3.24.2"
  }
}
```

No release version reserved. Not published. Frozen package is not touched.

## Test counts per file

| File | Tests | Suites |
| --- | --- | --- |
| redaction-vectors.test.mjs | 29 | 2 |
| query-conformance.test.mjs | 34 | 4 |
| delegation-conformance.test.mjs | 28 | 4 |
| assertion-profile.test.mjs | 20 | 6 |
| Total | 111 | 16 |

## Trusted key provisioning (EP-02)

Per EP-02, CRM signing private key resides in a restricted server secret manager.
HRP registration receives public JWK/PEM plus key thumbprint through authenticated
restricted operations handover. Verify issuer/service/environment/audience bindings
out-of-band, and verify a non-production signature challenge before activation.

No JWKS discovery endpoint or untrusted `jku`/`x5u` fetch is introduced.
No automated PKI platform. Manual overlapping rotation for pilot.
kid is 1..64 of `[A-Za-z0-9._-]`, unique within issuer, never reused for
different key material.

Emergency compromise/service disable overrides overlap immediately; cleanup must
use a remaining valid cleanup-authorized key or authenticated HRP local operations.

## Replay authority (EP-03)

Per EP-03, a durable PostgreSQL authority service is recommended for replay
consumption. The table schema must be unique by `(iss, serviceId, aud, jti)`,
atomic insert, committed BEFORE downstream work in a separate transaction.
A failed query or exchange does NOT roll back jti consumption. Storage must be
shared by all accepting instances; no process-local replay cache.

**Retention:** each jti entry is retained through `absolute exp + 30 seconds`,
then deleted. No early eviction. A shared HRP authority clock reading from the
replay/authority database is used for `verifierNow` and consumption deadlines,
not independently drifting worker clocks.

**Recovery fence (EP-03 section 2):** if consumed jti history is rolled back,
ALL assertion verifiers are fenced and in-flight acceptance/issuance work is stopped.
A coordinated barrier time F is established on the authority clock only after
every accepting node acknowledges the fence and earlier transactions are settled
or terminated. The fence persists outside the state being restored. Keep fence
until verifier time ≥ F + 120 seconds. An assertion accepted at F could have
iat = F + 30, exp = F + 90, exp + skew = F + 120 — hence the 120-second
upper bound under EP-01.

If delegation/revocation authority itself was rolled back, the 120-second wait
is NOT sufficient: keep grant/read fenced, invalidate all potentially affected
delegations/pending receipts before reopening. Owner audit recovery approval
remains separate. Cleanup resumes only when its authority transaction can
durably commit. Restoration never revives consent.

## Consumer-readiness inputs

Findings from `reconciliation/crm/CONTRACT-02B/consumer-readiness/`
(commit ffe4896) that shaped this implementation:

- MockIdentity is mock-only; production needs real authenticated identity.
  → EP-01 actor shape (DELEGATED_USER) is strictly untrusted claim; binding is
    asserted by signature, not by the wire shape.
- retry.ts (worker) is not reusable for query retries.
  → Query error envelope has its own retryClass enum with BOUNDED_NEW_ASSERTION.
- TalentContextReadQuery types were missing.
  → Implemented in query-types.ts.
- Delegation flow endpoints absent.
  → Implemented in delegation.ts (synthetic schemas only; no handlers).
- Redaction algorithm missing.
  → Implemented in redaction.ts.
- No seven-code parser existed.
  → Implemented in query-errors.ts + query-parser.ts.