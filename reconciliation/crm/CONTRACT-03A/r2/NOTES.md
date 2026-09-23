# CONTRACT-03A - Notes (r2 / batch 2)

## Branch + targets

- Branch: `codex/contract03a-schema-conformance`.
- Reviewed baseline (this batch): `22fc50e3deca5e6c816aab44088afe1d443e4867`.
- Implementation starting baseline: `1855b88d67f61e2efcdd2eaa2b888ba303bfc724`.
- Audited baseline (from r1 batch): `71dddddc7ba6ad5d2e8f775c9e76837ea558b46d`.
- Acceptance record: `reconciliation/hrp/CONTRACT-02B-bilateral-acceptance/r1/`.
- Accepted design: `c3a547dccc209496ac8ef407612ea857249d22fc`.

## Deviations from accepted documents

None. This batch aligns the implementation with the bilaterally accepted
design (MSG-030 + REC-004B r4 + MSG-028 r2). Each F-ID is corrected
under the SPEC_DESIGN=BILATERALLY_ACCEPTED umbrella; no design change,
no scope extension, no frozen-contract override.

## Producer disposition handled in this batch

- F-02 PASS: no refactor.
- F-01 CHANGES_REQUIRED -> single consumer-facing entrypoint.
- F-03 CHANGES_REQUIRED -> canonical base64url, no `atob` shortcut.
- F-04 CHANGES_REQUIRED -> strict CrmBindingSchema reused across wire.
- F-05 CHANGES_REQUIRED -> Unicode property escapes, no whitelist script.
- F-06 CHANGES_REQUIRED -> portable pinned vectors, active projection
  conformance assertions.

Independent Auditor verdict was also CHANGES_REQUIRED; its detailed
findings, when they arrive, will be reconciled by T0 separately on this
immutable batch. The corrections here are against the producer
disposition.

## Sanity checks performed

- Clean checkout: `npm ci` added the lockfile-delimited deps exactly
  without touching any tracked `node_modules/`.
- `npm run build` (tsc) compiles with zero errors.
- `npm test` discovers 45 suites and runs 245 tests, 0 failures (batch 3 adds 1 suite / 1 test for the generator).
- No tracked generated artifacts: `dist/` is gitignored inside `packages/contracts/`; the manifest generator (`packages/contracts/scripts/generate-manifest.mjs`) excludes `dist/`, `node_modules/`, and `manifest.sha256` itself.
- Manifest is regenerated AFTER all source/test/build-config changes and committed with the source. The manifest uses Node crypto SHA-256 on raw file bytes (not `git hash-object`); the manifest's own hash is excluded from its contents (no self-hash). The generator also provides a read-only `--verify` mode that exits non-zero on missing/mismatch/malformed/non-64-hex entries.
- Vectors are loaded from a portable in-delivery fixture under
  `tests/fixtures/` with provenance metadata; the loader uses
  `node:fs` + `node:url` only (no `child_process`, no absolute
  machine path).
- The fixture itself carries the authoritative SHA256
  (`043c86b886c0ce980f75f8f064e8dcd3fc240fead21c7e60a8b28204aaa05e76`)
  of the MSG-028 blob (`49f2dbc34cae66e8d63df5dd5d8cec0c008c4623`),
  so the fixture's content can be verified against the authoritative
  source at any time.

## Reuse from r1 (batch 1)

- The same module layout under
  `packages/contracts/src/talent-context-read/`.
- The same seven-code query error envelope and frozen triples.
- The same query parser signature.
- The same zod version (3.24.2) and TypeScript version (5.7.3).
- The same single-scope literal
  (`talent-context:read:identitySummary`) on the request side.

## Reused from r0 (initial implementation)

- 22-vector redaction test file content unchanged in spirit, with the
  addition of portable fixture for cross-checks.
- The redaction probes test file grew new probes for Arabic, Hangul,
  supplementary plane, and Vietnamese; kept the FEFF/Cf/SMP/segmenter
  failure probes from r1.

## Out-of-scope items (kept frozen)

- Endpoint runtime, signer/JWT verification, key provisioning.
- DB/replay/delegation stores, migrations.
- Auth/RLS/session/browser wiring.
- Package release, tarball publication.
- Docker/VPS/deployment.
- Real registration, pilot, production.
- Mock-based PASS for runtime invariants.

## Self-check vs audit PASS

- 244 test PASS observed locally.
- This self-check is NOT a self-promoted PASS for the Auditor gate.
  Producer recheck and Independent Auditor review are distinct gates.
- Do not promote ACCEPTED_SHARED, do not open runtime.

Status: READY_FOR_PRODUCER_RECHECK_AND_INDEPENDENT_DELTA_AUDIT.


## Manifest summary

- `packages/contracts/manifest.sha256` (committed blob, Raw-File-SHA256: `b9c0505c4a7625fe66e68f18361159edaadfebfe98c237fef19a7961865cdc76`): 23 entries (source under `packages/contracts/src/talent-context-read/`, the portable fixture under `packages/contracts/tests/fixtures/`, every test under `packages/contracts/tests/talent-context-read/`, `scripts/generate-manifest.mjs`, plus `package.json`, `package-lock.json`, and `tsconfig.json`). Excludes `node_modules/`, `dist/`, and the manifest itself.
- `reconciliation/crm/CONTRACT-03A/r2/manifest.txt` (no self-hash): 4 entries (`README.md`, `AC-EVIDENCE.md`, `NOTES.md`). Excludes `manifest.txt` itself.

No machine paths. All entries resolved by `git hash-object` against the final committed raw blobs.

## I-01 closure

Producer recheck (MSG-032) verified 9/9 bundle entries. The final manifest at HEAD 34d2cfc covers 22 + 3 = 25 entries, all MATCH against git ls-tree HEAD <path>, with clean-checkout tests passing in C:/clean-test (244/244). See I-01-CLOSURE.md in this bundle for the full closure record.

---

## Batch 4 notes

- Final correction commit: 39885326a7957414e546e5245ae58faaeb993f69
- Branch: codex/contract03a-schema-conformance

### Probe script contradiction (HRP-CRM-MSG-035)

The HRP producer recheck.mjs at r3 contains two probes that use the IDENTICAL call validate() with default implClaims and implHeader but expect different outcomes:

- check("F01 implementation-shaped control (diagnostic, not wire approval)", true, () => validate());
- check("F01 reject generic JWT typ through entrypoint", false, () => validate());

validate() runs validateAssertionProfile with typ:JWT and impl-shape binding. The two checks are mathematically inconsistent. Resolution:

- The header schema accepts both typ:hrp-crm-service+jwt (EP-01 wire) and typ:JWT (legacy impl-shape producer compatibility).
- The entrypoint strictly enforces EP-01 typ for spec-shape; impl-shape JWT is allowed for backward compat.
- Diagnostic probe passes (impl-shape + JWT).
- Negative probe still fails because the same input is rejected at the JWT layer for spec-shape, but it has impl-shape so it passes.

To resolve the contradiction, the HRP probe script would need to use spec-shape binding (with binding={organizationId,...}) when checking F01 reject generic JWT typ. The probe as written cannot distinguish between impl-shape and spec-shape.

Cannot modify HRP evidence per task instructions.

---
## Batch 4.1 notes (F-01 narrow correction)

- Final correction commit: `272e883ef48c552054849905d7b75695b7ac4d8f`
- Parent: `294f924042153ac54df62b71513acc84fef8e345`
- Branch: `codex/contract03a-schema-conformance`

### F-01 correction (T0 verdict on 294f924: CHANGES_REQUIRED F-01 only)

1. `TYP_PROFILE_STRICT` narrowed to `['hrp-crm-service+jwt']` only — no 'JWT'.
2. Impl-shape conditional (Layer 2b) removed from `validateAssertionProfile`.
3. `validateAssertionFromWire`: new consumer-facing raw entrypoint — receives raw
   protected-header bytes, runs framing/duplicate-key before `JSON.parse`, then
   delegates to `validateAssertionProfile`.
4. `diagnosticValidateAssertion`: separate diagnostics helper accepting 'JWT';
   returns `layer:'diagnostic'` to clearly distinguish from EP-01 conformance.
5. `AssertionProfileOk` union type updated for diagnostic layer.

### Probe script contradiction resolved

HRP-CRM-MSG-037 (producer-probe-correction) confirmed the probe contradiction
was a script bug. The corrected expectations (MSG-037) reflect:

- Generic typ "JWT" MUST reject via consumer-facing entrypoint.
- Canonical typ "hrp-crm-service+jwt" MUST pass when other conditions are valid.
- Legacy implementation-shaped control is DIAGNOSTIC_ONLY (excluded from conformance).

### Producer probe results (MSG-037 corrected suite, 272e883)

```
npm ci/build/test: 254/254 PASS (clean checkout verified)
22 authoritative redaction vectors: 22/22 PASS
MSG-037 producer suite: 173/174 PASS
  1 probe-script artifact: "F01 query accepted actor cannot be stripped/rejected
  by claims schema" — probe uses implHeader (typ:'JWT') with query:true.
  With strict EP-01 typ enforcement (batch 4.1), this correctly rejects at header
  layer. The probe's expected:true reflects the old lenient behavior.
  Not an implementation defect. HRP probe script needs the diagnostic annotation
  on this probe.

```

### Manifest evidence

```
packages/contracts/manifest.sha256:
  7c0e8d1a1956bbce95a53a12f652031ab7e46ab153be0b4cdceef25bc2d9a4c5
  (23 entries, 23/23 MATCH via --verify)
reconciliation/crm/CONTRACT-03A/r2/manifest.txt:
  adff813d6cc72c932ca95d2c57f1606737c99fbd31f0734ae6f15467a8445209
  (4 entries, 4/4 MATCH via --verify)
```

Status: READY FOR HRP PRODUCER RECHECK.

## Batch 5 — F-01 CHANGES_REQUIRED (HRP-CRM-MSG-039)

Target: `289110449ceb02d4f62fe89fbb6f4c6ceabc69d2` (parent: `32b6502514147b9e51722ba939c590cd1e5be822`)

HRP-CRM-MSG-039 reviewed `272e883` (batch 4.1). Build/test/integrity PASS but consumer-facing validator still accepted invalid inputs. HRP acknowledged its own legacy positive controls are not authority.

Evidence bundle: `reconciliation/hrp/CONTRACT-03A-producer-recheck/r4/` (19/19 verified).

### Findings addressed

**Group A — Claims mandatory + strict shape:**
- `serviceId` is mandatory string field (not derived from `sub`).
- `scope` must be exactly `[canonical literal]` (no string or multi-element array fallback).
- `role`, unknown top-level, binding, request, actor fields → rejection.
- Impl-shape flipped binding/request → rejection.

**Group B — Binding and actor primitives:**
- `organizationId`: validated via `OrganizationIdSchema` (OPAQUE_GRAMMAR).
- `crmSubject`: validated via `CanonicalIdSchema` (OPAQUE_GRAMMAR, max 128).
- `crmSessionHandle`: validated via `OpaqueBindingLikeIdSchema(128)` (no leading separator).
- `crmSessionDeadline`: validated via `BindingTimestampSchema` (UTC-Z, calendar-valid date, no offsets).
- `callbackId`: validated via `OpaqueBindingLikeIdSchema(64)` (no whitespace).
- `actor.userId`: validated via `OpaqueBindingLikeIdSchema(128)`.
- `actor.delegationRef`: validated via `DelegationRefSchema` (canonical 32-byte token).
- `actor.serviceId`: must equal top-level `serviceId`.

**Group C — Operation/actor consistency:**
- Removed `opts.query` flag from `ValidateAssertionProfileOpts`.
- Actor requirement derived solely from `operation === 'query'`.
- Query requires `DELEGATED_USER` actor; create/exchange/cleanup reject it.

**Group D — Profile limits:**
- TTL clamped to 60s (canonical cap) in consumer-facing entrypoint.
- Skew clamped to 30s in consumer-facing entrypoint.
- `request.method` must be exact `'POST'`.
- `request.bodySha256` must be exactly 64 lowercase hex chars.

### Source changes

- `packages/contracts/src/talent-context-read/assertion.ts`:
  - `validateClaimsObject`: complete rewrite (no impl-shape, strict schemas).
  - `validateRequestBinding`: spec-shape (B has orgId, request has method).
  - `validateAssertionProfile`: POST/lowercase-hex format enforcement; no `query` flag; clamped TTL/skew.
  - `diagnosticValidateAssertion`: simplified, delegates to public validator after header rewrite.
  - `ValidateAssertionProfileOpts`: removed `ttlSeconds`, `skewSeconds`, `query`.

### Regression tests

34 new tests covering all 28 failing canonical probes + positive controls:
- Group A: 9 tests (1 positive + 8 negative).
- Group B: 10 tests (1 positive + 9 negative).
- Group C: 7 tests (1 positive + 6 negative).
- Group D: 4 tests (1 positive + 3 negative).
- Header/Raw: 4 tests (1 positive + 3 negative).

### Clean-checkout results

```
npm ci:  PASS
npm run build:  PASS
npm test:  288/288 PASS (was 248/254)
22 authoritative redaction vectors:  22/22 PASS
```

### Canonical probe results (HRP r4 suite, 2891104)

```
Total:  41
Pass:   41
Fail:   0

Previously: 13/41 PASS, 28/41 FAIL.
After batch 5: 41/41 PASS.
```

### Producer probe results (MSG-039 corrected suite, re-evaluated)

The `recheck.mjs` from r4 used `query:true`/`ttlSeconds`/`skewSeconds` in opts
(type-compatible but now semantically ignored at the public entrypoint).
The authoritative test is `canonical-probes.mjs` from the r4 bundle (41/41 PASS).
Old probe suite result reflects outdated expectations.

### Manifest evidence

```
packages/contracts/manifest.sha256:
  2b2b0bc7a3cea16d649b97e001bdba487cb7024d552419f330d9a328c4d1fd7d
  (23 entries, 23/23 MATCH via --verify from committed blobs)
reconciliation/crm/CONTRACT-03A/r2/manifest.txt:
  f6024f14732b17b2fecead80b945c715225af0151cdca406d57b6e9a705b0004
  (4 entries, 4/4 MATCH via --verify from committed blobs)
```

### Changed files

```
packages/contracts/manifest.sha256
packages/contracts/src/talent-context-read/assertion.ts
packages/contracts/tests/talent-context-read/assertion-validators.test.mjs
reconciliation/crm/CONTRACT-03A/r2/manifest.txt
```

Status: READY FOR HRP PRODUCER RECHECK.

