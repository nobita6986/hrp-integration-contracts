# Phase 5 Migration Analysis (Note)

## Additive only
The r2 candidate is an ADDITIVE release. Existing CRM consumers that import
`@hrp-engagement/contracts` (the frozen root) require ZERO source-code
changes:

- Root export set is identical (379/379 named exports, same names, same
  ordering).
- `SCHEMA_VERSION` and `PACKAGE_VERSION` are unchanged.
- Frozen validator behavior is unchanged.
- No talent-context exports leak into the root.

## New subpath is greenfield
The new subpath `@hrp-engagement/contracts/talent-context-read/v1` is NOT
yet imported by any CRM consumer in the 6-consumer matrix. Adding new
consumers that use it is a separate, intentional migration step.

## Recommended migration (consumer-side, NOT executed here)

For each new caller that needs the talent-context-read surface:

1. Import:
   `import { ... } from "@hrp-engagement/contracts/talent-context-read/v1"`
2. Use frozen request/result/error schemas for parsing at the network
   boundary.
3. Wrap delegatedUser identity in `QueryDelegatedUserActorSchema` before
   sending.
4. Use `redactFullName` for PII display in user-facing UI.
5. Treat `TalentContextReadErrorSchema` codes as the only failure surface
   (no implicit string matching).

The migration plan above is INTENTIONALLY NOT executed in this T1-A task.
The r2 candidate is delivered as additive-only; consumer migration is a
follow-on step by T2/T3, not part of this compatibility review.

## Untouched consumers
- No CRM source file (under `src/`) was modified during this compatibility
  review. Only `package.json` files in the r2 scratch worktree were
  modified, and those were reverted before handoff.