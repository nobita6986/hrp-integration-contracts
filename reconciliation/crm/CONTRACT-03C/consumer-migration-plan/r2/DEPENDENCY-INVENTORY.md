# Dependency Inventory — `@hrp-engagement/contracts` in HRP-CRM (UNCHANGED)

Carried forward from r1. No re-survey per brief.

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

Every consumer uses a `file:` workspace reference. No consumer uses a
version-range or npm-published spec. The workspace root
`packages/contracts` IS the live surface for every consumer.

## Lockfile entries
- packages/config                     -> pinned to file:../contracts
- packages/integration-store          -> pinned to file:../contracts
- apps/integration-worker             -> nested + flat references
- apps/integration-api                -> nested + flat references
- apps/context-panel                  -> nested + flat references
- apps/core-1.10-media                -> pinned to file:../../packages/contracts

## Subpath imports
`rg "@hrp-engagement/contracts/[a-z]"` over non-node_modules source code
returns ZERO real imports. The only matches are Markdown documentation
that mention a hypothetical subpath. No current consumer imports a
subpath of `@hrp-engagement/contracts`.

## Workspace root
No workspace-level package.json at the CRM root; each consumer
explicitly references the local package via a relative file: URI.

## Version coupling
- Frozen contracts version: 0.0.8-g0.8-fixes (PACKAGE_VERSION).
- Frozen contracts schema version: 1 (SCHEMA_VERSION).
- Both exported from packages/contracts/src/index.ts.

## Implication for migration (corrected per C-01)
The inventory of `file:` references is unchanged. The r2 plan does NOT
commit any package.json/lockfile change under M1; the actual diff is
deferred until CONTRACT-03C.1 chooses a distribution mechanism. See
OPTION-A and OPTION-B in FILE-CHANGE-PLAN.md.

Option A (still hypothetical): switch each `file:` to a repo-local
immutable artifact reference supplied by the artifact-pinning task.
This does NOT mean a published npm tag.

Option B (still hypothetical): replace workspace packages/contracts
with the full additive accepted source in a separate migration PR;
keep every existing file: dependency intact.

Neither option is committed in r2. The two are recorded so that, when
CONTRACT-03C.1 ships, the M1 slice is one step away from execution.