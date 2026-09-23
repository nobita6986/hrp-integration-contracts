# CONTRACT-03A Producer Recheck — CHANGES_REQUIRED

## 1. Scope and authoritative target

HRP reviewed immutable commit
`7c804c92ff8105596383b13ef9f9546617d69b6e` from
`codex/contract03a-schema-conformance`, as requested by `CRM-HRP-MSG-033`.
The review used a clean detached checkout for the initial gates and an evidence
branch created directly from that SHA. The producer branch was not modified.

The expectations are the corrected producer expectations recorded in
`HRP-CRM-MSG-032`; the old-bug reproducer assertions were not used as
regression expectations. The probe imports the built public exports from
`packages/contracts/dist/index.js`.

Overall verdict: **CHANGES_REQUIRED**. I-01, F-03, F-05, and F-06 pass.
F-01 and F-04 remain open. The candidate is not ready for the next bilateral
acceptance step.

## 2. Finding verdicts

### F-01 — CHANGES_REQUIRED

Severity: high. Corrected producer probes: **0/5 pass**.

Observed residuals:

1. The accepted EP-01 query claims object is rejected. The public claims
   schema at `packages/contracts/src/talent-context-read/assertion.ts` still
   implements a different shape: it omits the `serviceId` claim, uses a scalar
   `scope`, and swaps the accepted immutable binding/request grouping.
2. Calling request-binding validation without the required context throws
   `Cannot read properties of undefined (reading 'method')` instead of
   returning a fail-closed validation result.
3. Raw duplicate detection accepts decoded-equivalent keys (`iss` and
   `\u0069ss`).
4. Raw duplicate detection accepts nested duplicate binding members.
5. The exported parser accepts an `alg:none`/wrong-typ/jku object. The composed
   entrypoint has stricter header validation, but the corrected producer
   expectation for the exported parser surface remains unmet.

The package's own F-01 suite passes 52/52, but it asserts the implementation's
current profile rather than the corrected accepted profile for the first
case. A green internal suite therefore does not close this finding.

### F-03 — PASS

Corrected producer probes: **15/15 pass**.

- All seven token schemas accept a canonical 32-byte base64url payload that
  contains both `-` and `_`.
- All seven reject a noncanonical pad-bit form.
- `QueryDelegatedUserActorSchema` accepts the same canonical delegation ref.

### F-04 — CHANGES_REQUIRED

Severity: medium. Corrected producer probes: **16/17 pass**.

Every public create/exchange/cancel/revoke schema rejects whitespace/newline,
timezone offsets, and nonexistent Gregorian dates as required. However
`CrmBindingSchema` still accepts `crmSessionHandle: "_session"`.

The source has a correct `OPAQUE_GRAMMAR` requiring an alphanumeric first
character, but `CrmBindingBaseSchema.crmSessionHandle` uses the separate
`BINDING_ID_GRAMMAR = /^[A-Za-z0-9._:-]+$/`, which permits leading separators.

### F-05 — PASS

Corrected producer probes: **6/6 pass**.

FEFF, oversize output, schema byte bounds, Arabic, Hangul, and supplementary
plane Unicode-letter behavior match the corrected expectations. The full
package redaction regression suite also passes.

### F-06 — PASS

Corrected producer probes: **22/22 pass**.

The portable in-package fixture is loaded without a workstation path. All
pinned names and `unavailableFields` semantics match, including the
unrequested identity omission case. The dedicated package suite passes 33/33.

### I-01 — CLOSED / PASS

Independent raw-blob verification confirms:

- both manifest formats use exactly 64 lowercase SHA-256 characters;
- 23/23 package entries and 4/4 r2 document entries match the final committed
  raw blobs;
- coverage has no missing or extra path;
- every covered blob is valid UTF-8 and contains no NUL;
- the Node generator executes successfully;
- `--verify` exits 0 and preserves both manifest hashes byte-for-byte;
- package manifest raw SHA-256 is
  `b9c0505c4a7625fe66e68f18361159edaadfebfe98c237fef19a7961865cdc76`;
- r2 manifest raw SHA-256 is
  `41f23bcc74c76dae01d6d09ff2c08b89101b9b1316651ac7ad100530d7f6de95`.

Encoding observation, not a blocker: three covered historical files have a
UTF-8 BOM and three test files use CRLF. The manifest attests those raw bytes;
the generator file itself is UTF-8/no-BOM/LF/no-NUL as required.

## 3. Gate evidence

| Gate | Observed result | Evidence |
| --- | --- | --- |
| `npm ci` | exit 0; 0 vulnerabilities | `gate-npm-ci.txt` |
| `npm run build` | exit 0 | `gate-npm-run-build.txt` |
| `npm test` | exit 0; 245/245 pass | `gate-npm-test.txt` |
| corrected producer probe | exit 1; 59/65 pass, 6 fail | `gate-producer-corrected-expectations.txt`, `producer-recheck-results.json` |

The probe's nonzero exit is intentional fail-closed behavior for the open
findings, not a harness error.

## 4. Required correction boundary

CRM should issue one new immutable correction commit that:

1. aligns the F-01 public claim/header/framing surfaces with the accepted
   corrected expectation, including fail-closed missing context and decoded
   duplicate-key handling;
2. makes `crmSessionHandle` use the no-leading-separator opaque grammar;
3. adds regression tests that directly exercise these corrected producer
   cases rather than only the current implementation profile;
4. regenerates both raw SHA-256 manifests after the final source/test changes;
5. provides a new full SHA for another bounded producer recheck.

No request is made to implement signatures, endpoints, persistence, replay,
consumer integration, package publication, pilot, or deployment in this
correction.

## 5. Remaining limitations and governance

This was source/schema/build/test verification only. It did not validate real
signature verification, key provisioning, jti replay consumption, session
state, PostgreSQL, RLS, network transport, browser flow, endpoint behavior,
package distribution, a consumer migration, pilot, or deployment.

`SPEC_DESIGN: BILATERALLY_ACCEPTED` remains unchanged.
`ACCEPTED_SHARED: NONE` remains unchanged. H.09/Tier 3 and Owner gates remain
closed. No acceptance, publish, merge, runtime, or deploy authority is granted.
