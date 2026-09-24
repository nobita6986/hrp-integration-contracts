# HRP verification and limitations

## 1. Evidence verified

| Evidence | Result |
|---|---|
| Full SHA resolution for executable candidate, P2, E3, and CRM compatibility evidence | PASS |
| Ancestry `P2 -> E3 -> CRM compatibility evidence` | PASS |
| CRM compatibility manifest raw committed bytes | `10/10 MATCH` |
| CRM compatibility manifest SHA-256 | `b05be5a2d336e0fd65cab33282716f5ffbf0abff5dba43dea2d6086d2878e521` |
| Compatibility-bundle encoding | strict UTF-8, LF, no BOM, no U+FFFD |
| Isolated P2 baseline verification | `56 OK, 0 bad` |
| Isolated P2 package assembly | `39` source files, `35` test files |
| Isolated P2 package build | PASS |
| Isolated artifact reproduction | exact size, SHA-256, npm shasum, and `79` files MATCH |
| Full package suite at pinned compatibility-evidence commit | `713/713 PASS` |

## 2. Evidence to finding to path

### VF-01 — Accepted artifact identity is reproducible

- Evidence: an isolated checkout of P2 rebuilt a `169360`-byte tarball with SHA-256 `b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc`, npm shasum `4713b1ce639acdc070a9fa95f868bc08b99d0f9b`, and `79` files.
- Finding: the artifact identity in `CRM-HRP-MSG-044` is reproducible and may be pinned by this acceptance record.
- Path: future distribution must use this exact digest or create a new candidate with regenerated manifests and focused verification.

### VF-02 — P2-only generator test has an evidence-directory coupling

- Evidence: at a checkout containing only P2, executable/schema tests pass but `pc-generator-manifest.test.mjs` cannot create `reconciliation/crm/CONTRACT-03B/packaging/r2/manifest.txt` because that evidence directory is introduced after P2. At the pinned compatibility-evidence commit, the full package suite passes `713/713`.
- Finding: this is a packaging-tooling coupling, not a change in contract behavior or artifact bytes. A claim that all `713` tests run from P2 alone requires the evidence directory to be provisioned explicitly.
- Path: the next packaging cleanup must make the generator create its destination directory or take an explicit output path, then regenerate the affected manifest and rerun the focused generator checks before publication.

### VF-03 — Browser evidence is not production evidence

- Evidence: browser bundle generation and basic boot/navigation pass, while only `4/9` detailed Playwright checks pass because the scratch environment returns asset/fixture failures.
- Finding: additive package compatibility is sufficient for the accepted module perimeter, but browser production compatibility remains unproven.
- Path: consumer migration and real-path tasks must run browser/session compatibility in their own gated environment before enablement.

## 3. Preserved packaging cleanup

The next packaging task must also:

1. document the intentional `.gitignore` exclusion in the manifest header;
2. synchronize stale compatibility comments in `assertion.ts` with strict executable behavior;
3. avoid behavior changes while performing documentation-only cleanup;
4. regenerate manifests and rerun focused verification for any changed blob or artifact.

These items do not widen the acceptance perimeter and do not authorize publication.
