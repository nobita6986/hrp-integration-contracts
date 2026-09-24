# CONTRACT-03C.1 — Local Immutable Artifact Pinning & Tooling Closure

## What this is

A local, reproducible pinning of the accepted `@hrp-engagement/contracts@0.0.0-r2-candidate.0` artifact. The pin lives in `ARTIFACT-DESCRIPTOR.json` and is reproducible by `tools/reconstruct.mjs`. A strictly read-only check against the descriptor is provided by `tools/verify-artifact.mjs`. The accepted artifact bytes are not changed.

## Pinned identity

| Property | Value |
|---|---|
| Package | `@hrp-engagement/contracts@0.0.0-r2-candidate.0` |
| Filename | `hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz` |
| Size | 169360 bytes |
| SHA-256 | `b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc` |
| npm shasum | `4713b1ce639acdc070a9fa95f868bc08b99d0f9b` |
| File count | 79 |
| Source commit | `1841c9354f361c4ac2bdb70a325c739c264262de` |
| Packaging P2 | `b7505568957217184b225d99312066097c518fdc` |
| Evidence E3 | `81a1000efac3d244add07568f69cd63554fa3eff` |
| Acceptance record | `reconciliation/hrp/CONTRACT-03B-packaging-compatibility-acceptance/r1/ACCEPTANCE-RECORD.md` |
| Acceptance manifest SHA-256 | `14ab789408c54844f149b1130a0e98c3716cda1e967661828194c5258be03251` |
| Publication status | **NOT_EXECUTED** |

## Accepted subpath

`@hrp-engagement/contracts/talent-context-read/v1` (no other subpath; no promotion to the package root).

## Files in this bundle

- `README.md` (this file)
- `ARTIFACT-DESCRIPTOR.json` — the immutable pin (source, package, artifact identity, accepted subpath, acceptance record, reproduction command, publication status, no-action arrays).
- `REPRODUCTION-RUNBOOK.md` — how to reproduce the artifact from the acceptance commit and verify the bytes against the descriptor.
- `TOOLING-CLOSURE.md` — MSG-045 / VF-02 limitations and the CONTRACT-03C.1 closures (explicit destinations, auto-mkdir, read-only verify, no machine paths).
- `DOUBLE-BUILD-EVIDENCE.md` — two independent reproductions that produce byte-identical tarballs matching the descriptor.
- `AC-EVIDENCE.md` — every task-brief criterion paired with its concrete observation.
- `manifest.sha256` — header-enriched raw-file SHA-256 manifest of the files in this bundle.
- `builds/` — local reproduction outputs (excluded from the index by the scoped `.gitignore`; only `RECONSTRUCT-RESULT.txt` is committed).

## How to use this bundle

### Reproduce from a fresh working tree

```bash
node tools/reconstruct.mjs \
  --descriptor reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/ARTIFACT-DESCRIPTOR.json \
  --output-dir reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/builds/build-N
```

### Verify an existing tarball (read-only)

```bash
node tools/verify-artifact.mjs \
  --descriptor reconciliation/crm/CONTRACT-03C/artifact-pinning/r1/ARTIFACT-DESCRIPTOR.json \
  --tarball <path-to-tgz>
```

See `REPRODUCTION-RUNBOOK.md` for full details, expected output, and failure modes.

## Authority and prohibitions

- Authority: HRP acceptance message `HRP-CRM-MSG-045`, acceptance commit `1841c935...`, packaging P2 `b750556...`, compatibility evidence `e7f90de...`.
- This bundle does not authorize: `npm publish`, registry upload, release, Git tag, CRM consumer migration, HRP runtime endpoint/JWT/replay/DB/auth/session/pilot/deploy.
- The descriptor's `publication_status: NOT_EXECUTED` and the three `no_*_actions` arrays make the prohibitions explicit.

## Status

`READY FOR T0 ARTIFACT PINNING REVIEW`.
