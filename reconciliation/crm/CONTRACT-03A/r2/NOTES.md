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
- `npm test` discovers 44 suites and runs 244 tests, 0 failures.
- No tracked generated artifacts: `dist/` is gitignored inside
  `packages/contracts/`; the manifest's `git hash-object` list
  excludes `dist/`, `node_modules/`, and `manifest.sha256` itself.
- Manifest is regenerated AFTER all source/test/build-config changes
  and committed with the source. The manifest's own hash is excluded
  from its contents (no self-hash).
- Vectors are loaded from a portable in-delivery fixture under
  `tests/fixtures/` with provenance metadata; the loader uses
  `node:fs` + `node:url` only (no `child_process`, no absolute
  machine path).
- The fixture itself carries the authoritative SHA256
  (`a7e7ae0b32629a9dedd2a20031086460a606271c5cf305bbc76c14a76783e428`)
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
