# Migration Plan (CONTRACT-03B.2 Phase 5) - READ-ONLY

**No code changes proposed below. This is an analysis-only deliverable per brief.**

## Capability-to-subpath mapping (proposed, not implemented)

If/when HRP begins calling CRM to read talent context (the use case the
candidate subpath is designed for), CRM would need to:

1. **Validate HRP requests** to CRM:
   - Use `TalentContextReadQueryRequestSchema` from the subpath to parse
     incoming requests (after HRP authenticates and delegates).
   - File: `apps/integration-api/src/receiver/talent-context-handler.ts` (NEW)
   - Usage: validator at request entry

2. **Parse HRP responses** (when CRM delegates read to HRP):
   - Use `TalentContextReadResultSchema` / `TalentContextReadErrorResponseSchema`
   - File: `apps/integration-worker/src/talent-context-parser.ts` (NEW)
   - Usage: parser in worker side

3. **Validate delegation tokens** from HRP:
   - Use `CreateDelegationRequestSchema`, `RevokeDelegationRequestSchema`,
     `ExchangeDelegationRequestSchema`
   - File: `apps/integration-api/src/receiver/delegation-handler.ts` (NEW)
   - Usage: validator

4. **Validate assertion profiles** from HRP gateway:
   - Use `validateAssertionProfile`, `parseAssertionHeader`,
     `diagnosticValidateAssertion`
   - File: `apps/integration-api/src/receiver/assertion-verify.ts` (NEW)
   - Usage: validator

5. **Audit query records**:
   - Use `TalentContextReadQueryRequest` / `TalentContextReadResult` types
   - File: `packages/integration-store/src/repos/talent-context-query.ts` (NEW)
   - Usage: inferred type

6. **Redact display names in UI**:
   - Use `redactFullName`
   - File: `apps/context-panel/src/ui/components/intake-review.tsx` (modify)
   - File: `apps/context-panel/src/ui/components/context-panel.tsx` (modify)
   - Usage: validator runtime

7. **Schema version pinning** in shared config:
   - Use `MODULE_SCHEMA_VERSION`
   - File: `packages/config/src/talent-context-version.ts` (NEW)
   - Usage: inferred type

8. **Enumerate supported/unsupported fields**:
   - Use `CONFORMANCE_SUPPORTED`, `CONFORMANCE_KNOWN_UNSUPPORTED`,
     `compareUnavailableFields`
   - File: `packages/integration-store/src/conformance.ts` (NEW)
   - Usage: validator runtime

## Import style proposed

Use the **explicit subpath** in all new code:
```ts
import {
  TalentContextReadQueryRequestSchema,
  redactFullName,
} from "@hrp-engagement/contracts/talent-context-read/v1";
```

Rationale: the subpath is canonical and forward-compatible with
possible future per-subpath bundles.

## Risks (analysis only)

| Risk | Severity | Notes |
|------|----------|-------|
| Duplicate contracts | HIGH | CRM dev-harness and candidate share package name `@hrp-engagement/contracts`. Co-existence requires package manager hoisting rules; npm workspaces with two file: deps pointing to the same name in different dirs will collide. Must publish/promote candidate to a registry before CRM can install via `npm:@hrp-engagement/contracts@0.0.0-candidate.x` distinct from `file:../contracts` 0.0.8-g0.8-fixes. |
| Root/subpath collision | LOW | Root and subpath both resolve to the same compiled file by design. No collision today. |
| ESM/CJS resolution | MEDIUM | Candidate is ESM-only. CRM consumers are ESM (`"type": "module"`). Compatible. CJS consumers (if any in CRM) cannot use the subpath. |
| Declaration resolution | LOW | Phase 4 verified TypeScript declarations resolve under `module: NodeNext` + strict. Consumers using `module: ESNext + moduleResolution: node` would NOT honor the exports map and would silently fall back. CRM convention is `NodeNext` so this is fine. |
| Version pinning | HIGH | Each consumer pins to a different source path. A migration task must add explicit version fields to candidate install (registry-based or workspace-aware) and document pin policy. |
| Lockfile impact | MEDIUM | Switching any consumer's contract dependency would regenerate `package-lock.json` and propagate to integration tests. This must be done in a follow-up migration PR, not in this review. |
| Bundler / tree-shaking | LOW | Vite/esbuild for context-panel would benefit from explicit subpath imports for tree-shaking. The candidate dist is structured so `import { TalentContextReadQueryRequestSchema } from "@hrp-engagement/contracts/talent-context-read/v1"` only pulls the relevant module(s). |
| Node compatibility | LOW | Candidate requires `engines.node: ">=20"`. CRM requires `engines.node: ">=20.0.0"`. Compatible. |

## What this task does NOT do

- Does not add new imports to any CRM source file.
- Does not regenerate any CRM `package-lock.json`.
- Does not introduce a `packages/contracts` workspace alias to the candidate.
- Does not promote the candidate to ACCEPTED_SHARED.
- Does not run any CRM-side unit test against the candidate.
- Does not run any browser bundler test (Vite/esbuild) against the candidate.

## Bottom line

Migration is feasible but blocked on three preconditions not in scope
for CONTRACT-03B.2:

1. **Promotion:** candidate must be published to a registry (or
   symlinked cleanly into CRM workspaces without name collision).
2. **Schema disjointness:** CRM consumers must add new subpath imports
   alongside (not replacing) the existing dev-harness imports.
3. **T0 sign-off:** a separate T0-owned migration task should plan and
   execute CRM consumer additions; CONTRACT-03B.2 only proves the
   subpath itself is consumable.