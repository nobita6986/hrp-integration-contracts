# CONTRACT-03A producer recheck — CHANGES_REQUIRED

## 1. Scope and verdict

Reviewed commit: `22fc50e3deca5e6c816aab44088afe1d443e4867`.
Prior reviewed commit: `f9cc493224792d15f99ba1debc27fc4d6a9cce7e`.
Remote branch: `codex/contract03a-schema-conformance`; reviewed commit was resolved and verified reachable from the fetched remote branch. Review used an isolated detached checkout, not a moving branch HEAD.

Authorization: Owner relayed CRM EXECUTABLE_CONTRACT_PRODUCER_RECHECK_REQUEST responding to HRP-CRM-MSG-031. Scope is source/tests/build configuration and F-01–F-06 against accepted design. No endpoint, signature verification, DB, RLS, replay store, session/browser runtime, package release, consumer migration or deployment was performed. No tracked implementation file was edited. These findings concern schema conformance and evidence integrity, not demonstrated production exploitation. Report flavor: null, bounded producer review.

Verdict: **CHANGES_REQUIRED**. F-02 wire-shape corrections pass; F-01, F-03, F-04, F-05 and F-06 are not closed. Delivery integrity also fails independently. Do not promote ACCEPTED_SHARED. CRM remains implementation owner; HRP does not create a competing module.

| Finding | Verdict | Summary |
| --- | --- | --- |
| F-01 | CHANGES_REQUIRED | Claims differ from EP-01; protected-header and composed consumer validation missing; duplicate/time checks incomplete |
| F-02 | PASS, shape-only | Path/body split, code-only error, browser forms and effective-user result corrected; shared primitives remain subject to F-03/F-04 |
| F-03 | CHANGES_REQUIRED | Noncanonical padding rejected, but valid canonical base64url containing `_`/`-` rejected |
| F-04 | CHANGES_REQUIRED | Binding helper not used by operation schemas; malformed IDs and invalid calendar dates accepted |
| F-05 | CHANGES_REQUIRED | Original FEFF/byte/segmenter probes fixed; hand-coded Unicode whitelist still rejects valid letter scripts |
| F-06 | CHANGES_REQUIRED | New helper works on independent pinned vectors; package suite hard-codes another workstation path and fails collection |
| I-01 | CHANGES_REQUIRED | Delivered manifest hash wrong; 13/18 entry mismatches; five new source/test files uncovered |

## 2. Authority and commands

Subject precedence is unchanged:

- `c3a547dccc209496ac8ef407612ea857249d22fc`, `reconciliation/hrp/CONTRACT-02B-consolidated/r1/SPECIFICATION.md` and `ENGINEERING-PROFILE.md`, EP-01..EP-06.
- Bilateral record `1855b88d67f61e2efcdd2eaa2b888ba303bfc724`.
- S28 `49f2dbc34cae66e8d63df5dd5d8cec0c008c4623`, `reconciliation/hrp/CONTRACT-02B-conformance-response/r2/TRANSPORT.md`, `REDACTION.md`, `REDACTION-VECTORS.json`.
- S25 query authority remains incorporated by the consolidated specification; no query/error redesign is proposed.

Environment: Windows; Node `v24.19.0`; npm `11.17.0`.

| Command | Result | Evidence |
| --- | --- | --- |
| `npm ci` in `packages/contracts` | exit 0, lockfile installation | `gate-ci.txt` |
| `npm run build` | exit 0 | `gate-run-build.txt` |
| `npm test` | **exit 1**; 195 completed tests pass, pinned-vector suite fails during construction; not 217 PASS | `gate-test.txt` |
| `node review/recheck.mjs` from checkout root | exit 1 intentionally on unmet corrected expectations; 112 checks, 78 PASS, 34 FAIL | `recheck-results.json` |
| `git diff --exit-code` | exit 0; tracked source unchanged | command observation |

`recheck.mjs` is a new producer probe against corrected expectations, not the old reproducer's old-bug assertions. It imports the built public `dist/index.js`. Its exact manifest hashes, entry hashes, expected/actual results and timestamp are stored in JSON. It does not modify source or access a DB. `capture-gates.mjs` captures actual stdout/stderr and exit codes using explicit UTF-8.

Reproduce in a checkout pinned to the reviewed commit with Git objects for the cited S28 authority available:

```powershell
# From the pinned checkout root, with this review/ directory present:
node review/capture-gates.mjs
# Expected on this reviewed commit: exit 1 from npm test.
node review/recheck.mjs
# Expected on this reviewed commit: exit 1 with individual mismatches.
```

## 3. Findings and minimal corrections

### I-01 — Manifest is not a raw-blob integrity attestation

Severity: medium; status: validated; confidence: high. Evidence: E-01, E-02. Location: `reconciliation/crm/CONTRACT-03A/r1/manifest.sha256:1`.

Delivered hash: `a666a9bdc3486491f459a9d809a4e0d679f8915d6b8bd9cb980e37fc4ddf08bf`.
Actual raw Git-blob hash: `82be316582967c22d8ee899b1e37890bcb6aa95a55884919d01aee420b193466`.
Only **5/18 entries MATCH**. All 13 mismatches are enumerated with actual/expected hashes in `recheck-results.json`. Simple CRLF conversion does not reconcile them; no cause is assumed.

Uncovered additions:

- `packages/contracts/src/talent-context-read/assertion.ts`
- `packages/contracts/src/talent-context-read/conformance.ts`
- `packages/contracts/tests/talent-context-read/assertion-validators.test.mjs`
- `packages/contracts/tests/talent-context-read/conformance-helper.test.mjs`
- `packages/contracts/tests/talent-context-read/redaction-probes.test.mjs`

Minimal fix: generate the declared full-perimeter manifest from committed/indexed raw blobs after corrections, include these files, verify every entry and manifest hash against the final immutable commit, then deliver that SHA/hash. Do not rewrite old commits. Review continued on pinned source despite failed manifest; it did not treat this manifest as certification.

### F-01 — EP-01 profile is not implemented by the exported validators

Severity: high; status: validated; confidence: high. Evidence: E-02, E-04. Locations: `packages/contracts/src/talent-context-read/assertion.ts:6`, `:69`, `:103`, `:121`; `tests/talent-context-read/assertion-validators.test.mjs:155` under `packages/contracts/`.

Accepted EP-01 requires `serviceId`, exact single-element `scope` array, strict `binding: B`, strict `request: {method:'POST',path,bodySha256}`, and query-only exact delegated actor. Current strict schema rejects that valid object, but accepts an incomplete `{iss,aud,sub,jti,iat,exp}` object. It uses optional string scope and flat optional `method/path/requestHash`, and accepts `nbf`, contrary to explicit EP-01 prohibition. Negative and unsafe integer epochs are accepted. The TTL helper accepts `now === exp+30`, whereas EP-01 requires `now < exp+30`.

`organizationIdDigest` is not in accepted wire and is not even accepted by `AssertionClaimsSchema`; the test feeds it directly to `validateRequestBinding`, bypassing schema validation. It neither implements nor replaces signed strict B. This is not a request to add the digest to the wire.

`parseAssertionHeader` is generic JSON framing, not the protected-header profile validator: it accepts `{alg:'none',typ:'wrong',kid:'k',jku:...}`. There is no exported enforcement for exact RS256/type/registered kid header. Literal duplicate keys are detected, but decoded-equivalent keys (`iss` and `\u0069ss`) and nested duplicate B members are accepted. Separate audience/request helpers can return OK with empty trusted options; no composed consumer entrypoint requires all necessary checks. These observations do **not** claim a signature was verified or bypassed at a deployed endpoint.

Minimal fix: implement the accepted exact profile and an explicit pure consumer validation entrypoint combining raw duplicate detection, strict header/claims, required trusted registration/operation constraints, time boundaries and signed/body/stored binding comparisons where supplied by the caller. Do not implement crypto, stores or endpoints in this task. Make absence of required validation context fail closed, and test negatives via that entrypoint, not helper-only objects. Reject nbf, flat substitute claims and organizationIdDigest; enforce bounded safe integer times, ASCII limits and exact request hash/path/scope types. Document separately the runtime checks still excluded.

### F-02 — Wire-shape corrections pass

Status: closed for original shape findings; confidence: high. Evidence: E-02, E-04.
Locations: `packages/contracts/src/talent-context-read/delegation.ts:73`, `:89`, `:136`, `:249`.

Exchange and cancel no longer require path pendingRequestId in body; strict bodies reject it. Delegation error is code-only without messageKey. Handoff, decision, approved/denied callback shapes are present; DENIED rejects receipt. Exchange result requires effectiveHrpUserId. Independent positive/negative probes passed. This is **not** acceptance of the whole delegation security perimeter: token and binding primitive defects are tracked once under F-03/F-04, not duplicated here. Runtime ownership, expiry, atomicity and browser compatibility remain NOT_EXECUTED.

### F-03 — Canonical base64url tokens falsely rejected

Severity: medium; status: validated; confidence: high. Evidence: E-02, E-04.
Locations: `packages/contracts/src/talent-context-read/primitives.ts:30`, `:129`.

Decoder sends URL alphabet unchanged to standard `atob`. Node 24's `atob` rejects `_` and `-`. All seven token schemas reject the valid canonical encoding of 32 bytes `0xff`, including public query actor delegationRef. All-zero tokens pass, hiding the problem in fixtures. Noncanonical unused pad bits and generic `dr-1` actor tokens are correctly rejected now.

Minimal fix: translate the base64url alphabet before standard decoding (or use a correct platform-safe base64url decoder), preserve exact 32-byte and round-trip checks, and test valid tokens containing both `-` and `_`, plus invalid padding/length/alphabet through all consumers. Format tests do not prove randomness. Review the browser/Node fallback encoder too: its non-btoa fallback currently decodes bytes as Latin-1 instead of actually base64-encoding them.

### F-04 — Binding validation is bypassed by public operation schemas

Severity: medium; status: validated; confidence: high. Evidence: E-02, E-04.
Locations: `packages/contracts/src/talent-context-read/delegation.ts:49`, `:140`, `:172`, `:195`; `primitives.ts:82`, `:174` in the same directory.

Create/exchange/cancel/revoke duplicate `crmSessionHandle` and `callbackId` as length-only strings instead of using strict B. Every operation accepts callback whitespace and a newline in session handle. `CrmBindingSchema` itself accepts leading `_` in session handle although frozen opaque grammar requires an alphanumeric initial. UTC offsets are correctly rejected, but `2026-02-30T10:00:00Z` is accepted: `new Date` normalizes the invalid day, and the alleged round-trip check only checks nonempty output.

Minimal fix: share the validated B fields in the actual operation schemas; use the exact opaque grammar and actual Gregorian-date validation. Keep past valid deadlines allowed for cancel/revoke; syntactic date validation must not introduce active-session requirements for cleanup. Test each public entrypoint, not only CrmBindingSchema.

### F-05 — Original regression fixes pass, Unicode-letter coverage remains incomplete

Severity: medium; status: validated; confidence: high. Evidence: E-02, E-04.
Location: `packages/contracts/src/talent-context-read/redaction.ts:119`, `:134`.

FEFF rejection, 515-byte output omission, result-schema byte limit, Deseret surrogate handling and segmentation-exception omission pass independent probes. All 22 pinned vectors also pass in the independent harness.

However `isLetterCodePoint` is a hand-coded script whitelist rather than Unicode `\p{L}`. Synthetic Arabic `علي` and Hangul `홍길동` satisfy the accepted grammar and have multiple letter-led graphemes, but return omitted instead of `ع••` and `홍••`. No script whitelist was accepted. This is deterministic contract drift, not a request to disclose unsafe names. The implementation should also count **letter-led** graphemes as specified, rather than total clusters including punctuation.

Minimal fix: use Unicode letter-property checks over full code points and count letter-led clusters; retain whole-projection omission on invalid grammar, insufficient letter clusters, controls, limits or segmentation failure. Add Arabic/Hangul and another non-whitelisted script to tests without narrowing the normative Unicode grammar. The test titled byte-bound rejection at `tests/talent-context-read/redaction-probes.test.mjs:72` currently only counts bytes; assert actual schema rejection too.

### F-06 — Clean-checkout conformance suite is not reproducible

Severity: medium; status: validated; confidence: high. Evidence: E-02, E-03, E-04.
Location: `packages/contracts/tests/talent-context-read/conformance-helper.test.mjs:21`.

`loadPinnedVectors` executes Git in hard-coded `D:/CodeApp/hrp-integration-contracts-02a`. On this fresh C: checkout the suite fails construction with `spawnSync git ENOENT` (nonexistent cwd, not a missing Git installation: the independent probe uses Git successfully). `npm test` exits 1 with 195 completed tests and no execution of these 22 tests. Thus the delivered claim 217 PASS is not reproduced here.

Independent producer loading of exact S28 blob succeeds: 21 requested vectors compare both expectedName and expectedUnavailableFields; the unrequested vector proves absence of identity data/marker with a valid request for an unsupported field (its separate placementCase marker is explicitly accounted for). The conformance helper behavior is improved, but the shipped test cannot establish it in a clean checkout. Old duplicated fixtures still replace decomposed accents by NFC and retain `assert.ok(true)` for unrequested at `redaction-vectors.test.mjs:53`; they must not be represented as independent exact-pinned proof.

Minimal fix: portable fixture loading relative to repository/test location, or a byte-identical committed fixture with pinned source SHA/hash; no hidden workstation checkout. Ensure a shallow/isolated checkout has everything necessary. Assert the pinned expectedUnavailableFields and actual projection behavior, then report complete npm ci/build/test exits. Do not silently alter accepted fixtures or just increase test count.

## 4. Coverage and evidence chain

| Evidence | Observation / source | Linked findings |
| --- | --- | --- |
| E-01 | Raw `git show SHA:path` SHA-256 verification; expected/actual manifest hashes and coverage in `recheck-results.json` | I-01 |
| E-02 | Immutable source plus S28/EP-01/EP-05 requirements, locations listed above | I-01, F-01..F-06 |
| E-03 | Clean lockfile install/build/test command captures, Node/npm versions; collection failure | F-06 |
| E-04 | New corrected-expectation public-export probes, actual/expected 112 checks in `recheck-results.json` | F-01..F-06 |

Evidence observation time: `recheck-results.json.observedAt`; source type: file/command; work item: CONTRACT-03A producer recheck. Prior immutable review remains unchanged; these observations supersede old-bug behavior only for this new SHA. Hashes for review artifacts are provided in `review-manifest.sha256`; those are local artifact fixity, not a pushed immutable response commit.

P-01 (callflow): accepted input/negative case -> exported public schema/helper -> actual result -> comparison with pinned requirement. E-02 + E-04 demonstrate both rejection of valid accepted-wire data and acceptance of invalid incomplete data; no real identity/permission was used.

P-02 (verification path): raw commit blobs -> manifest validation (E-01) -> npm ci/build/test in isolated checkout (E-03) -> independent corrected probes (E-04). Failure in package collection does not stop bounded manual recheck, but cannot be counted as test PASS.

Preserved coverage: seven-code strict HTTP/messageKey profile passes independent checks; wrong HTTP/messageKey and delegation envelope are rejected by query parser. Existing query tests also cover empty/multiple/unknown/command-only errors and retry-class mismatch. Diff contains only dedicated module/tests, local build ignore metadata and task handoff docs; no frozen command implementation or runtime is changed in this correction. No equivalent claim is made for consumers in other repositories.

Coverage still not fulfilled: composed pure EP-01 validation; public operation binding constraints; platform-valid canonical tokens; general Unicode letter semantics; clean-checkout exact-vector suite. Runtime signature verification, trusted manual key provisioning (not JWKS), PostgreSQL replay authority, jti retention to exp+skew versus separate 120-second recovery fence, RLS, real sessions/browser and atomic cleanup remain expressly NOT_EXECUTED.

## 5. Handoff and governance

CRM executor should fix one batch covering I-01 and remaining F-IDs, keep previous commits immutable and send a new full SHA plus verified raw-blob manifest. Re-run npm ci/build/test and corrected public-entrypoint negatives on that final SHA. No prior independent audit verdict automatically carries to this delta.

SPEC_DESIGN: BILATERALLY_ACCEPTED, unchanged. ACCEPTED_SHARED: NONE. No merge/publish/consumer migration/runtime/pilot/deploy authorization is issued. Owner and H.09/Tier 3 gates remain. HRP's work here is producer review, not independent security audit PASS.

Local delivery only: this report, probe, JSON and captured logs are untracked review artifacts; no commit, push or external message was sent. T1B's AFF-05A worktree was not touched.

Checklist: pinned source and authority verified; manual source review plus public-export probes; all new findings have source/behavior evidence and minimal fixes; no implementation mutation; no secrets/real PII in fixtures; local report generated with docs-generator and code-audit evidence structure. Skill tool-index/ce:writer were unavailable; available Git/Node/npm and direct Markdown were used without installing tools.
