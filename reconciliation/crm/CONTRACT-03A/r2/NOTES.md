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
