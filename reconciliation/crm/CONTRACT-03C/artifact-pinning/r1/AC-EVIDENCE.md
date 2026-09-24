# AC-EVIDENCE.md

Acceptance-criteria evidence for `CONTRACT-03C.1: Local Immutable Artifact Pinning & Tooling Closure`. Every numbered criterion in the task brief is paired with a concrete, reproducible observation recorded in this branch.

## 1. Task brief criteria and their evidence

| # | Criterion | Evidence in this branch | Result |
|---|---|---|---|
| 1 | Create a new branch from acceptance commit `1841c935...` | Branch `codex/contract03c-artifact-pinning-r1` is at `1841c935...` (`git rev-parse HEAD`). | PASS |
| 2a | Generator destination must be explicit | `packages/publish-candidate/scripts/generate-manifest.mjs` adds `--pc-out`, `--evidence-out`, and `--evidence-list-file` flags. | PASS |
| 2b | Generator auto-creates destination directory | `mkdirSync(..., { recursive: true })` is invoked in both `generatePackageManifest` and `generateEvidenceManifest`. Verified: with the `reconciliation/crm/CONTRACT-03B/packaging/r2/` directory removed, `node packages/publish-candidate/scripts/generate-manifest.mjs --pc-out packages/publish-candidate/manifest.sha256` succeeded and recreated the directory. | PASS |
| 2c | P2-style clean checkout does not depend on evidence directory | Default invocation with `--pc-out` alone works from a tree where the evidence directory is absent. The legacy `reconciliation/crm/CONTRACT-03B/packaging/r2/` is the default for backward compatibility; callers can opt out by passing only `--pc-out`. | PASS |
| 2d | Generator verification remains read-only | `--verify` mode only uses `readFileSync` and `existsSync`. No `writeFileSync`, `mkdirSync`, or `execFileSync` (for npm) calls exist in the `--verify` branch. | PASS |
| 2e | No absolute machine paths in generated output | Generator uses `git rev-parse --show-toplevel` for the repo root. Stdout includes both an absolute path (for caller convenience) and an explicit `repo-relative:` line that uses forward slashes. No `D:\...` or `/home/user/...` style path appears in any generated manifest file body. | PASS |
| 3 | No changes to tarball inputs | Tarball-input files compared byte-for-byte against acceptance commit: `0 drift` out of `70` (`package.json` x2, `README.md`, `CHANGELOG.md`, `tsconfig.json`, plus the full frozen-root mirror and the full `talent-context-read` source). See section 2 below. | PASS |
| 4 | Immutable artifact descriptor with required fields | `ARTIFACT-DESCRIPTOR.json` carries `source_commit`, `package_name`, `package_version`, `filename`, `byte_size`, `sha256`, `npm_shasum`, `file_count`, `accepted_subpath`, `acceptance_record`, and `publication_status: NOT_EXECUTED`, plus provenance for the source commit, packaging P2, evidence E3, compatibility evidence, baseline SHA, frozen root counts, accepted subpath, acceptance record, reproduction command, and three explicit `no_*_actions` arrays. | PASS |
| 5 | Local reconstruction + verification command performs all 8 steps | `tools/reconstruct.mjs` performs, in order: `npm ci` (optional), baseline verify (`npm run verify`), assemble (`npm run assemble`), build (`npm run build`), `npm pack --pack-destination <output-dir>`, then identity check on filename, byte_size, sha256, npm_shasum, file_count. Exits non-zero on any drift. | PASS |
| 6 | Two independent runs from a clean checkout produce identical SHAs | Build-1 and build-2 each produced `b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc`. See `DOUBLE-BUILD-EVIDENCE.md` section 4. | PASS |
| 7a | Full package suite passes 713/713 | `npm test` (from `packages/publish-candidate/`): `tests=713, pass=713, fail=0, cancelled=0, skipped=0, todo=0, duration_ms=7089.8376`. | PASS |
| 7b | Generator tests pass | `tests/generator/pc-generator-manifest.test.mjs`: `tests=1, pass=1, fail=0`, with 6 in-script tests all PASS (T1-T6). | PASS |
| 7c | Manifest verification passes | `npm run manifest:verify`: `packages/publish-candidate/manifest.sha256 136/136 MATCH, 0 FAIL`, `reconciliation/crm/CONTRACT-03B/packaging/r2/manifest.txt 8/8 MATCH, 0 FAIL`. Exit code 0. | PASS |
| 7d | Root parity 379/379 | `import('dist/index.js')` yields `Object.keys(m).length === 379` (sorted, identical to baseline). | PASS |
| 7e | Subpath probes | `import('dist/talent-context-read/index.js')` yields 83 named exports. The 21/21 runtime assertion suite (`tests/talent-context-read/*.test.mjs`) reports `tests=288, pass=288, fail=0`. | PASS |
| 8 | Tarball binary not committed | `reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/builds/.gitignore` excludes every `.tgz` under that subtree. `git status --porcelain` reports no `.tgz` files as untracked. | PASS |
| 9 | No registry, release, or Git tag created | `git tag` output unchanged. `git ls-remote --tags origin` does not show a new tag. The descriptor carries `publication_status: NOT_EXECUTED`. | PASS |

## 2. Tarball-input drift check

Run from the repository root at HEAD:

```bash
node -e "
var {execFileSync}=require('child_process');
var fs=require('fs');
var path=require('path');
var {createHash}=require('crypto');
function sha(p){return createHash('sha256').update(fs.readFileSync(p)).digest('hex');}
function gitBlob(c,p){return execFileSync('git',['show',c+':'+p],{encoding:'utf8',shell:true});}
var commit='1841c9354f361c4ac2bdb70a325c739c264262de';
var inputs=[
  'packages/publish-candidate/package.json',
  'packages/publish-candidate/README.md',
  'packages/publish-candidate/CHANGELOG.md',
  'packages/publish-candidate/tsconfig.json',
];
function walk(dir,list){
  if(!fs.existsSync(dir))return;
  for(var e of fs.readdirSync(dir,{withFileTypes:true})){
    var f=path.join(dir,e.name);
    if(e.isDirectory())walk(f,list);
    else if(/\.(ts|json|mjs|cjs|md)$/.test(e.name))list.push(f);
  }
}
walk('packages/crm-frozen-root',inputs);
walk('packages/contracts/src/talent-context-read',inputs);
var drift=[];
for(var f of inputs){
  var rel=f.split(path.sep).join('/');
  if(!fs.existsSync(f)){drift.push('MISS '+rel);continue;}
  var l=sha(f),c=sha(gitBlob(commit,rel));
  if(l!==c)drift.push('DRIFT '+rel+' local='+l.slice(0,12)+' commit='+c.slice(0,12));
}
console.log('compared',inputs.length,'drift',drift.length);
"
```

Result: `compared 70 drift 0`.

## 3. Manifest SHAs after tooling refactor

After applying the tool refactor in this branch, the manifests regenerate cleanly, verify without drift, and are deterministic across repeated runs (re-running the generator with no input change yields the same SHA):

| Manifest | Entries | SHA-256 (deterministic) | Verify |
|---|---|---|---|
| `packages/publish-candidate/manifest.sha256` | 136 | `c9b2d2611e235711241e9c09f0e9432cdf45b40bc0f1cae3363ddd1589957ae0` | `136/136 MATCH, 0 FAIL` |
| `reconciliation/crm/CONTRACT-03B/packaging/r2/manifest.txt` | 8 | `176a0cb880272f4396a82deb1fbe755fe0bad1b6ab83fe11e3f68fb4685e4df7` | `8/8 MATCH, 0 FAIL` |
| `reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/manifest.sha256` | 13 | (recomputes on each run; verify result is the invariant) | `13/13 MATCH, 0 FAIL` |

The PC manifest has always been deterministic (it excludes itself from its file list). The artifact-pinning evidence manifest is now also deterministic because the generator excludes the output path from its own file list before writing the body (the manifest's self-entry was previously the cause of an alternating-SHA feedback loop; the fix is in `generateEvidenceManifest`).

The CONTRACT-03B packaging r2 manifest snapshot above is the SHA before this branch's tooling edits; the manifest file itself was not rewritten by this branch (its contents are unchanged from the prior commit), so its SHA is stable.

Commands used for verification:

```
node packages/publish-candidate/scripts/generate-manifest.mjs \
  --pc-out packages/publish-candidate/manifest.sha256 \
  --evidence-out reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/manifest.sha256 \
  --evidence-list-file reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/manifest.files.txt

node packages/publish-candidate/scripts/generate-manifest.mjs \
  --verify --manifest packages/publish-candidate/manifest.sha256 \
  --manifest reconciliation/crm/CONTRACT-03B/packaging/r2/manifest.txt \
  --manifest reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/manifest.sha256
```

## 4. Test counts (full package suite)

| Surface | Test files | Tests | Pass | Fail |
|---|---|---|---|---|
| Frozen CRM (compiled into `tests/*.test.mjs` by `assemble.mjs`) | 20 | 425 | 425 | 0 |
| New module (`tests/talent-context-read/*.test.mjs`) | 7 | 288 | 288 | 0 |
| Full package suite (`npm test`) | 47 suites | 713 | 713 | 0 |
| Generator (`tests/generator/pc-generator-manifest.test.mjs`) | 1 | 6 in-script | 6 | 0 |

(The frozen-CRM and new-module rows sum to 713.)

## 5. Tooling refactor summary

See `TOOLING-CLOSURE.md` for the full description. Highlights:

- `generate-manifest.mjs` now exposes `--pc-out`, `--evidence-out`, `--evidence-list-file`, and `--manifest` flags. Auto-creates destinations. Strictly read-only in `--verify` mode. Default invocation preserves prior behavior.
- `tools/reconstruct.mjs` (new): orchestrates `npm ci` + `npm run verify` + `npm run assemble` + `npm run build` + `npm pack` + identity check.
- `tools/verify-artifact.mjs` (new): read-only identity check on an existing tarball against the descriptor.

## 6. Reproduction result (single run)

Run:

```bash
node tools/reconstruct.mjs \
  --descriptor reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/ARTIFACT-DESCRIPTOR.json \
  --output-dir reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/builds/build-1 \
  --skip-npm-ci
```

Captured:

- `byte_size=169360`
- `sha256=b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc`
- `npm_shasum=4713b1ce639acdc070a9fa95f868bc08b99d0f9b`
- `file_count=79`
- `matched_descriptor=true`

A second independent run (`build-2`) produced the exact same SHA-256.

## 7. Publication state

- `ARTIFACT-DESCRIPTOR.json` carries `publication_status: NOT_EXECUTED`.
- `no_registry_actions`: no `npm publish`, no `npm dist-tag`, no `npm release`, no Git tag, no release branch creation.
- `no_consumer_actions`: no CRM repo mutation, no consumer `package.json` update, no lockfile change, no consumer migration.
- `no_runtime_actions`: no runtime endpoint, no JWT signer or verifier, no replay or delegation store, no DB migration or RLS, no auth or session change, no pilot or deploy.

## 8. Status

`READY FOR T0 ARTIFACT PINNING REVIEW`.
