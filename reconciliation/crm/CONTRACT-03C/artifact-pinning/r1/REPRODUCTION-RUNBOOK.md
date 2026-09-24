# REPRODUCTION-RUNBOOK.md

This runbook describes how to locally reproduce the accepted `@hrp-engagement/contracts@0.0.0-r2-candidate.0` artifact (`b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc`) from a clean checkout, and how to verify that the produced bytes match the immutable `ARTIFACT-DESCRIPTOR.json`.

This runbook satisfies the local, immutable, and reproducible requirement of CONTRACT-03C.1. It does not publish the artifact.

## 1. Required starting state

1. Repository checkout at the acceptance commit `1841c9354f361c4ac2bdb70a325c739c264262de` (or any descendant that has not modified the tarball input tree).
2. Node.js >= 20 (the same Node version that produced the accepted artifact).
3. npm 11.x (compatible with `npm ci`, `npm pack --pack-destination`, `npm pack --dry-run --json`).
4. The descriptor file `reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/ARTIFACT-DESCRIPTOR.json` (committed in this branch).

No CRM working tree, no absolute machine paths, and no uncommitted `dist/` artifacts are required at start. The reproduce command creates everything it needs.

## 2. What this runbook guarantees

Running the procedure below will, deterministically:

1. Install pinned `node_modules/` from the committed lockfile (`npm ci`).
2. Verify that the frozen CRM baseline (the byte-exact mirror of CRM at the acceptance baseline commit) hashes match the pinned `BASELINE-MANIFEST.sha256` (`npm run verify`).
3. Assemble the publish-candidate source tree (`npm run assemble`):
   - Copy the frozen CRM source into `packages/publish-candidate/src/`.
   - Copy the new `talent-context-read` module into `packages/publish-candidate/src/talent-context-read/`.
   - Copy the frozen CRM tests + the new module tests into `packages/publish-candidate/tests/`.
4. Compile the package (`tsc` -> `packages/publish-candidate/dist/`).
5. Pack the tarball (`npm pack --pack-destination <output-dir>`).
6. Verify that the produced tarball's `filename`, `byte_size`, `sha256`, `npm_shasum`, and `file_count` exactly match the descriptor. Any drift exits non-zero.

## 3. One-command reproduction

From the repository root:

```bash
node tools/reconstruct.mjs \
  --descriptor reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/ARTIFACT-DESCRIPTOR.json \
  --output-dir reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/builds/build-N
```

Substitute `build-N` with the build directory you want to write into. The script auto-creates the destination.

If you already have a synchronized `node_modules/` (pinned against the committed lockfile) you may pass `--skip-npm-ci`.

A small `RECONSTRUCT-RESULT.txt` is written next to the produced tarball summarizing the produced identity.

## 4. Verifying an existing tarball (read-only)

If you already have a `.tgz` (e.g. produced by another machine) and want to verify it against the descriptor without rebuilding:

```bash
node tools/verify-artifact.mjs \
  --descriptor reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/ARTIFACT-DESCRIPTOR.json \
  --tarball <path-to-tgz>
```

This performs a strictly read-only check; it never writes anything.

## 5. Expected outputs

A successful run prints, in order:

1. `reconstruct: output dir = ...`
2. `reconstruct: package dir = ...`
3. `reconstruct: baseline verify ...` followed by `baseline verify: 56 OK, 0 bad (of 56)`
4. `assemble: ...` lines culminating in `assemble: src/ has 39 files, tests/ has 35 files`
5. `reconstruct: tsc build ...` (silent on success)
6. `reconstruct: npm pack ...` and the produced tarball filename
7. `reconstruct: produced ... size=169360 sha256=b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc shasum=4713b1ce639acdc070a9fa95f868bc08b99d0f9b files=79`
8. `reconstruct: identity check:` with five `OK` lines
9. `=== RECONSTRUCT: PASS (artifact identity matches descriptor) ===`

## 6. Failure modes

The script exits non-zero (1) on any of:

- `npm ci` failure (lockfile drift).
- baseline verify mismatch (frozen root bytes diverged from the acceptance baseline).
- assemble failure (missing inputs, frozen-root/talent-context path collision, missing `index.ts`).
- `tsc` failure (compiler error).
- `npm pack` failure.
- produced tarball `byte_size`, `sha256`, `npm_shasum`, or `file_count` drift from the descriptor.
- `filename` drift (script aborts if the produced file name does not match the descriptor).

The script also exits non-zero (2) on usage errors (missing `--descriptor`, unknown flag, descriptor missing a required field).

## 7. Why this is a clean-checkout-style procedure

Even though the script does not literally `rm -rf` the worktree before running (the caller controls that), the procedure is identical to a clean checkout because:

- `npm ci` rewrites `node_modules/` from the lockfile.
- `npm run assemble` always `rm -rf`s `packages/publish-candidate/src/` and `tests/` before re-creating them from the committed CRM mirror and the new module source.
- `tsc` rewrites `dist/`.
- `npm pack` writes a fresh tarball.

No prior build artifact, machine path, or hidden cache participates in producing the bytes that go into the tarball.

## 8. Tarball inputs (must be unchanged for reproducibility)

The following files at the acceptance commit determine every byte of the produced tarball. The reproduction procedure proves they are unchanged on disk (see `AC-EVIDENCE.md`):

| Path | Role |
|---|---|
| `packages/publish-candidate/package.json` | name, version, exports map, files list |
| `packages/publish-candidate/README.md` | packaged README |
| `packages/publish-candidate/CHANGELOG.md` | packaged CHANGELOG |
| `packages/publish-candidate/tsconfig.json` | compile options that drive `dist/` output |
| `packages/crm-frozen-root/src/**` | frozen root source mirror |
| `packages/crm-frozen-root/BASELINE-MANIFEST.sha256` | frozen root byte hash authority |
| `packages/contracts/src/talent-context-read/**` | new module source |
| `packages/contracts/tests/talent-context-read/**` | new module tests |

Tooling (NOT a tarball input, but used during the procedure):

| Path | Role |
|---|---|
| `packages/publish-candidate/scripts/assemble.mjs` | copies inputs into `packages/publish-candidate/src/` and `tests/` |
| `packages/publish-candidate/scripts/verify-baseline.mjs` | checks frozen-root byte hashes |
| `packages/publish-candidate/scripts/generate-manifest.mjs` | generator (used for evidence manifests, not for tarball) |
| `tools/reconstruct.mjs` | local reproduction + verification orchestrator |
| `tools/verify-artifact.mjs` | read-only tarball verification against descriptor |

## 9. Two-pass independent build (proves reproducibility)

To prove that the procedure yields identical bytes across independent runs, execute it twice into separate output directories and compare the produced SHAs:

```bash
node tools/reconstruct.mjs \
  --descriptor reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/ARTIFACT-DESCRIPTOR.json \
  --output-dir reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/builds/build-1

node tools/reconstruct.mjs \
  --descriptor reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/ARTIFACT-DESCRIPTOR.json \
  --output-dir reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/builds/build-2

node tools/verify-artifact.mjs \
  --descriptor reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/ARTIFACT-DESCRIPTOR.json \
  --tarball reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/builds/build-1/hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz

node tools/verify-artifact.mjs \
  --descriptor reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/ARTIFACT-DESCRIPTOR.json \
  --tarball reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/builds/build-2/hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz
```

Both `verify-artifact` invocations must exit 0 with all `OK` lines. See `DOUBLE-BUILD-EVIDENCE.md` for the captured run.

## 10. Explicit non-goals

This runbook does not:

- publish to npm,
- create a registry dist-tag,
- create a Git tag or release branch,
- mutate the CRM repo or any consumer,
- run any HRP runtime endpoint, signer, verifier, replay, delegation, DB, RLS, auth, or session code,
- run a pilot or deploy.

These are enforced by the descriptor's `publication_status: NOT_EXECUTED` and the `no_registry_actions`, `no_consumer_actions`, and `no_runtime_actions` arrays.
