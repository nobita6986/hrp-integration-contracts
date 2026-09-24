# DOUBLE-BUILD-EVIDENCE.md

Independent, sequential reproductions of the accepted `@hrp-engagement/contracts@0.0.0-r2-candidate.0` artifact, executed via `tools/reconstruct.mjs` against `ARTIFACT-DESCRIPTOR.json`. Both runs were started from a single working tree at the acceptance commit `1841c9354f361c4ac2bdb70a325c739c264262de` (with the tooling refactor already committed). Each run wrote into its own output directory; no state was shared between the two runs beyond the committed inputs.

## 1. Inputs to the procedure

- Working tree HEAD: `1841c9354f361c4ac2bdb70a325c739c264262de` (acceptance commit).
- Descriptor: `reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/ARTIFACT-DESCRIPTOR.json`.
- Build script: `tools/reconstruct.mjs`.
- Output directories:
  - `reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/builds/build-1/`
  - `reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/builds/build-2/`

## 2. Invocation

```bash
node tools/reconstruct.mjs \
  --descriptor reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/ARTIFACT-DESCRIPTOR.json \
  --output-dir reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/builds/build-1 \
  --skip-npm-ci
```

```bash
node tools/reconstruct.mjs \
  --descriptor reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/ARTIFACT-DESCRIPTOR.json \
  --output-dir reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/builds/build-2 \
  --skip-npm-ci
```

Both invocations passed (exit 0) with full identity OK.

## 3. Captured results

### 3.1 build-1

`RECONSTRUCT-RESULT.txt` content:

```
# Local reproduction result
# All values from a fresh in-tree assemble + build + npm pack.
filename=hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz
byte_size=169360
sha256=b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc
npm_shasum=4713b1ce639acdc070a9fa95f868bc08b99d0f9b
file_count=79
source_commit=1841c9354f361c4ac2bdb70a325c739c264262de
matched_descriptor=true
```

Per-field produced values:

| Field | Produced | Descriptor | Match |
|---|---|---|---|
| filename | `hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz` | `hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz` | OK |
| byte_size | 169360 | 169360 | OK |
| sha256 | `b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc` | `b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc` | OK |
| npm_shasum | `4713b1ce639acdc070a9fa95f868bc08b99d0f9b` | `4713b1ce639acdc070a9fa95f868bc08b99d0f9b` | OK |
| file_count | 79 | 79 | OK |

### 3.2 build-2

`RECONSTRUCT-RESULT.txt` content:

```
# Local reproduction result
# All values from a fresh in-tree assemble + build + npm pack.
filename=hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz
byte_size=169360
sha256=b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc
npm_shasum=4713b1ce639acdc070a9fa95f868bc08b99d0f9b
file_count=79
source_commit=1841c9354f361c4ac2bdb70a325c739c264262de
matched_descriptor=true
```

Per-field produced values:

| Field | Produced | Descriptor | Match |
|---|---|---|---|
| filename | `hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz` | `hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz` | OK |
| byte_size | 169360 | 169360 | OK |
| sha256 | `b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc` | `b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc` | OK |
| npm_shasum | `4713b1ce639acdc070a9fa95f868bc08b99d0f9b` | `4713b1ce639acdc070a9fa95f868bc08b99d0f9b` | OK |
| file_count | 79 | 79 | OK |

## 4. Cross-build identity check

| Property | build-1 | build-2 | Match |
|---|---|---|---|
| byte_size | 169360 | 169360 | OK |
| sha256 | `b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc` | `b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc` | OK |
| npm_shasum | `4713b1ce639acdc070a9fa95f868bc08b99d0f9b` | `4713b1ce639acdc070a9fa95f868bc08b99d0f9b` | OK |
| file_count | 79 | 79 | OK |

Independent runs produce byte-identical artifacts that also match the accepted SHA-256 exactly. The procedure is reproducible.

## 5. Read-only verification

Each produced tarball was also verified by `tools/verify-artifact.mjs`:

```bash
node tools/verify-artifact.mjs \
  --descriptor reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/ARTIFACT-DESCRIPTOR.json \
  --tarball reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/builds/build-1/hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz

node tools/verify-artifact.mjs \
  --descriptor reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/ARTIFACT-DESCRIPTOR.json \
  --tarball reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/builds/build-2/hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz
```

Both invocations returned:

```
verify-artifact: descriptor=...
verify-artifact: tarball=... (hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz, 169360 bytes)
  OK  filename ...
  OK  byte_size ...
  OK  sha256 ...
  OK  npm_shasum ...
=== VERIFY-ARTIFACT: PASS ===
```

Exit code: 0 for both.

## 6. Tarball binaries are not committed

The two produced `.tgz` files live under `reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/builds/build-1/` and `.../build-2/`. A scoped `.gitignore` rule at `reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/builds/.gitignore` excludes every `.tgz` and `.tgz.sha256` under that subtree. The `RECONSTRUCT-RESULT.txt` summary files are intentionally committed (no binary content).

`git status` after the runs reports no `.tgz` files as untracked; only the evidence Markdown, the descriptor, the `.gitignore`, and the tooling scripts are added/modified.
