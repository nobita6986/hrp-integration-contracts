# Dependency Inventory — `@hrp-engagement/contracts` in HRP-CRM

Inventory of every CRM package.json and lockfile that references the
frozen contracts package. Source: `rg "@hrp-engagement/contracts"`
over the CRM scratch worktree at baseline 72643356a0d1355f9dccc3921b47c990ea9c31c1.

## Direct dependencies (package.json `dependencies`)

| Package | Spec | Path form |
|---|---|---|
| packages/contracts | (self) | `name = "@hrp-engagement/contracts"` |
| packages/config | `file:../contracts` | 1-up sibling reference |
| packages/integration-store | `file:../contracts` | 1-up sibling reference |
| apps/integration-worker | `file:../../packages/contracts` | 2-up packages reference |
| apps/integration-api | `file:../../packages/contracts` | 2-up packages reference |
| apps/context-panel | `file:../../packages/contracts` | 2-up packages reference |
| apps/core-1.10-media | `file:../../packages/contracts` | 2-up packages reference |

Every consumer uses a `file:` workspace reference. No consumer uses
a version-range or npm-published spec. This means the workspace root
`packages/contracts` IS the live surface for every consumer.

## Lockfile entries (package-lock.json `node_modules/@hrp-engagement/contracts`)

| Package | Lockfile state at baseline |
|---|---|
| packages/config | pinned to `file:../contracts` (1 line) |
| packages/integration-store | pinned to `file:../contracts` (1 line) |
| apps/integration-worker | nested + flat resolved entries referencing `file:../../packages/contracts` and `file:../contracts` (transitive) |
| apps/integration-api | nested + flat resolved entries referencing `file:../../packages/contracts` and `file:../contracts` (transitive) |
| apps/context-panel | nested + flat resolved entries referencing `file:../../packages/contracts` and `file:../contracts` (transitive) |
| apps/core-1.10-media | pinned to `file:../../packages/contracts` (1 line) |

## Subpath imports

`rg "@hrp-engagement/contracts/[a-z]"` over non-node_modules source code
returns ZERO real imports. The only matches are Markdown documentation
that mention a hypothetical subpath (e.g. comments referencing
`@hrp-engagement/contracts/scheduling.ts`, handoff-core-1.11.md listing
`@hrp-engagement/contracts/routing`).

No current consumer imports a subpath of `@hrp-engagement/contracts`.
All imports use the package root only.

## Workspace root (CRM monorepo)

There is no workspace-level `package.json` at the CRM root that declares
the workspace; each consumer explicitly references the local package via
the relative `file:` URI. The workspace implicit root is the CRM
directory itself.

## Version coupling

- Frozen contracts version: `0.0.8-g0.8-fixes` (PACKAGE_VERSION constant).
- Frozen contracts schema version: `1` (SCHEMA_VERSION constant).
- Both values are exported from `packages/contracts/src/index.ts`.
- Every consumer pins via `file:` to the workspace copy, so version drift
  is impossible without a CRM code edit. There is no scenario where a
  consumer pulls a different version silently.

## Implication for migration

Because every consumer pins via `file:` to the local `packages/contracts`
workspace copy, the M1 step (pin/install additive candidate) requires
either:

a) keeping the `file:../../packages/contracts` reference but ensuring
   the workspace `packages/contracts` is replaced/augmented by the
   additive candidate; OR

b) replacing the `file:` URI with a tarball reference to the published
   candidate (e.g. `file:.scratch-pkg/hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz`).

The compatibility evidence (`e7f90de`) used option (b) in scratch.
Option (a) is the production-aligned choice once T0 promotes the
candidate to a release tag; option (b) is the only choice while the
candidate is unpublished.

A workspace root `package.json` would be a structural change; the plan
explicitly AVOIDS adding one (keeps the workspace structure flat).