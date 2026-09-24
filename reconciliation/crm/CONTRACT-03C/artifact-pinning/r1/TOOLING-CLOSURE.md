# TOOLING-CLOSURE.md

This file documents the MSG-045 / VF-02 packaging-tooling limitations and the changes made in CONTRACT-03C.1 to close them. The fixes preserve byte-for-byte identity with the accepted `@hrp-engagement/contracts@0.0.0-r2-candidate.0` artifact (`b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc`).

## 1. Limitations recorded in MSG-045 / VERIFICATION.md

The HRP acceptance verification recorded (in `reconciliation/hrp/CONTRACT-03B-packaging-compatibility-acceptance/r1/VERIFICATION.md`) that the `pc-generator-manifest.test.mjs` package test could not run from a P2-only checkout because `generate-manifest.mjs` hard-coded the output path `reconciliation/crm/CONTRACT-03B/packaging/r2/manifest.txt`. When only the packaging source commit P2 was checked out, that evidence directory did not yet exist, so `writeFileSync` failed with `ENOENT`. The verification further required that the generator verification remain strictly read-only and never bake absolute machine paths into generated output.

## 2. Changes applied

### 2.1 `packages/publish-candidate/scripts/generate-manifest.mjs` (refactor)

- Added explicit CLI flags:
  - `--pc-out <path>`: explicit destination for the PC manifest. Defaults to the legacy location for backward compatibility.
  - `--evidence-out <path>`: explicit destination for the evidence manifest. Defaults to the legacy location.
  - `--evidence-list-file <path>`: file containing repo-relative paths to hash (one per line).
  - `--manifest <path>`: in `--verify` mode, the manifest(s) to verify. May be passed multiple times.
- Destination directories are auto-created via `mkdirSync(..., { recursive: true })`; the script never depends on a pre-existing destination directory.
- `--verify` mode is now strictly read-only: the only `fs` calls are `readFileSync` and `existsSync`. There is no `writeFileSync` in `--verify` mode.
- Generated output never contains absolute machine paths: paths are normalized through `git rev-parse --show-toplevel`; the user-facing summary lines include both the absolute path and the explicit `repo-relative:` form so callers can copy a forward-slash form verbatim into their scripts.
- Default invocation (`node packages/publish-candidate/scripts/generate-manifest.mjs`) preserves the prior behavior (writes both `packages/publish-candidate/manifest.sha256` and `reconciliation/crm/CONTRACT-03B/packaging/r2/manifest.txt`), so no existing test or workflow that relied on the legacy defaults is broken.
- Default invocation with `--pc-out` alone is sufficient for a P2-only checkout; the script does not require the CONTRACT-03B evidence directory to exist.

### 2.2 `packages/publish-candidate/scripts/assemble.mjs`

No structural changes were required. The script already:
- uses `git rev-parse --show-toplevel` to discover the repo root (no machine-pinned paths),
- uses `mkdirSync(..., { recursive: true })` to auto-create destinations,
- has no absolute machine paths baked in.

The post-refactor `generate-manifest.mjs` now writes its PC manifest entry for `packages/publish-candidate/scripts/assemble.mjs` with the up-to-date SHA-256. No byte-level change is introduced into `assemble.mjs`.

### 2.3 `tools/reconstruct.mjs` (new)

A new orchestration script that combines:
1. `npm ci` (skippable via `--skip-npm-ci`),
2. `npm run verify` (baseline verify),
3. `npm run assemble` (frozen + new module assembly),
4. `npm run build` (`tsc`),
5. `npm pack --pack-destination <output-dir>`,
6. identity check against the descriptor (`filename`, `byte_size`, `sha256`, `npm_shasum`, `file_count`).

The script:
- uses `git rev-parse --show-toplevel` for the repo root,
- creates the output directory with `mkdirSync(..., { recursive: true })`,
- on any step failure or identity drift, exits non-zero (1),
- on usage errors, exits (2),
- writes a `RECONSTRUCT-RESULT.txt` summary next to the produced tarball.

### 2.4 `tools/verify-artifact.mjs` (new)

A strictly read-only script that verifies an existing `.tgz` against the descriptor. It never writes to disk and never spawns `npm` or other build tools. It accepts `--descriptor` and `--tarball` and exits 0 on full match / 1 on drift / 2 on usage errors.

### 2.5 `reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/builds/.gitignore`

A scoped `.gitignore` rule that excludes the reproduction `*.tgz` binaries from being committed. The runbook result text (`RECONSTRUCT-RESULT.txt`) is not excluded because it carries no binary payload.

## 3. Verification that the tooling changes do not alter the tarball

The accepted artifact (`b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc`, 169360 bytes, 79 files) is determined entirely by:

- `packages/publish-candidate/package.json` (exports map, files list),
- `packages/publish-candidate/README.md`,
- `packages/publish-candidate/CHANGELOG.md`,
- `packages/publish-candidate/tsconfig.json`,
- the frozen CRM baseline (`packages/crm-frozen-root/`),
- the new module (`packages/contracts/src/talent-context-read/`),
- the result of `tsc` compile.

After the tooling refactor:

- `packages/publish-candidate/package.json` is byte-identical to the acceptance commit.
- `packages/publish-candidate/README.md` is byte-identical to the acceptance commit.
- `packages/publish-candidate/CHANGELOG.md` is byte-identical to the acceptance commit.
- `packages/publish-candidate/tsconfig.json` is byte-identical to the acceptance commit.
- All 67 files under `packages/crm-frozen-root/` (including `BASELINE-MANIFEST.sha256`) are byte-identical to the acceptance commit.
- All 10 files under `packages/contracts/src/talent-context-read/` are byte-identical to the acceptance commit.

This is verified in `AC-EVIDENCE.md` (tarball-input drift = 0 / 70).

The only committed-file modifications in this branch are:

- `packages/publish-candidate/scripts/generate-manifest.mjs` (tooling refactor; not a tarball input).
- `packages/publish-candidate/manifest.sha256` (regenerated after the tooling refactor; its own SHA-256 entry for `generate-manifest.mjs` updates accordingly).
- `reconciliation/crm/CONTRACT-03B/packaging/r2/manifest.txt` (regenerated after the tooling refactor; no entry-level content changes).

The `tsc` output (`dist/`) and the packaged `README.md`/`CHANGELOG.md`/`package.json` are unchanged, so the tarball bytes are unchanged. The double independent rebuilds in `DOUBLE-BUILD-EVIDENCE.md` confirm the SHA-256 stays at `b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc`.

## 4. Forward-looking note

If a new accepted artifact is ever produced, the new descriptor must:

- capture the new tarball's identity (`filename`, `byte_size`, `sha256`, `npm_shasum`, `file_count`),
- capture the new source commit and acceptance record,
- keep `publication_status: NOT_EXECUTED` until T0 explicitly authorizes a different state.

No automatic promotion occurs.
