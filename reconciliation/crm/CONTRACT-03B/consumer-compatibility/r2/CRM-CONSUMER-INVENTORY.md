# Phase 3 - CRM Consumer Inventory and Lockfile Delta

## Six CRM consumers under test
1. packages/config
2. packages/integration-store
3. apps/integration-worker
4. apps/integration-api
5. apps/context-panel
6. apps/core-1.10-media

A seventh consumer -- packages/contracts (the dev-harness package itself) --
is the SOURCE of the r2 frozen-root surface; its replacement by the
candidate is implicit in the additive candidate model.

## Direct dependency on @hrp-engagement/contracts

| Consumer | package.json field | Original |
|---|---|---|
| packages/config | (no direct dep on @hrp-engagement/contracts) | n/a |
| packages/integration-store | file:../contracts (note: 1-up) | baseline |
| apps/integration-worker | file:../../packages/contracts | baseline |
| apps/integration-api | file:../../packages/contracts | baseline |
| apps/context-panel | file:../../packages/contracts | baseline |
| apps/core-1.10-media | file:../../packages/contracts | baseline |

## Candidate installation
Each consumer (other than packages/config which has no dep) had its
package.json `file:` reference switched to the local r2 tarball:

`file:../../.scratch-pkg/hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz`

This is the only source-consumer modification performed; no source file
under `src/` was touched.

`packages/integration-store` originally used a 1-up `file:../contracts`
reference; for candidate install the path was widened to 2-up to point at
`.scratch-pkg/` at the CRM root.

## Lockfile delta (per consumer)
Each consumer package-lock.json delta vs baseline was captured in a
scratch-only location (NOT committed to CRM):

- Scratch state dir: D:/tmp-scratch-state (outside the candidate repo)
- Saved: baseline package.json, baseline package-lock.json
- Saved: candidate package-lock.json (after `npm install` resolved through
  the candidate tarball)

Behaviour per consumer:
- packages/integration-store: lockfile changed (resolved through candidate
  tarball + 32 bytes shasum switch from baseline)
- apps/integration-worker: lockfile changed
- apps/integration-api: lockfile changed
- apps/context-panel: lockfile changed
- apps/core-1.10-media: lockfile changed
- packages/config: no dep, unchanged

After candidate runs, every consumers package.json + package-lock.json was
reverted to its baseline state in the scratch worktree.

## Important — package collision on small CLI checks
If a downstream consumer resolves `@hrp-engagement/contracts` from a parent
context-panel node_modules tree, the candidate tarball is what they see.
Without a `file:` override, npm would resolve to whichever local copy sits
in the consumers node_modules; this is the standard `file:` install pattern
already used by the dev-harness.