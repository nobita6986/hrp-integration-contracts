# CONTRACT-03B.2: CRM Consumer Compatibility Review - README

**Bundle:** reconciliation/crm/CONTRACT-03B/consumer-compatibility/r1/
**Branch:** codex/contract03b-consumer-compatibility-r1
**Parent (evidence commit E):** 5b0356ee8024a922fcac4dca621a4a5b11392388
**Packaging source commit (P):** 68c5fc729afb306f27266f8b08f8c63a671a446e
**CRM baseline:** 72643356a0d1355f9dccc3921b47c990ea9c31c1

## Authoritative inputs

| Field | Value |
|-------|-------|
| Package | `@hrp-engagement/contracts@0.0.0-candidate.0` |
| Subpath | `@hrp-engagement/contracts/talent-context-read/v1` |
| Tarball filename | `hrp-engagement-contracts-0.0.0-candidate.0.tgz` |
| Tarball bytes | 27,949 |
| Tarball SHA-256 | `7c394f74bfa16458bb67d414ff2373e27fb2fb934606a82b3f04e8127f0e87c0` |
| Packaging manifest SHA-256 | `0bab74b895e9a6989a69d1e3e4f33720fa7e677cf78c7d0d01f412a181626d95` |

## Status

| Verdict | Status |
|---------|--------|
| ROOT_EXPORT_BACKWARD_COMPATIBILITY | NOT_APPLICABLE |
| NEW_SUBPATH_RUNTIME_COMPATIBILITY | PASS |
| TYPESCRIPT_DECLARATION_COMPATIBILITY | PASS |
| CRM_BUILD_COMPATIBILITY | FAIL_EXPECTED |
| CRM_TEST_COMPATIBILITY | NOT_EXECUTED |
| BROWSER_BUNDLE_COMPATIBILITY | NOT_VERIFIED |
| RUNTIME_HRP_COMPATIBILITY | NOT_EXECUTED (per contract) |
| PRODUCTION_COMPATIBILITY | NOT_EXECUTED (per contract) |

## Scope summary

| Scope | Description | Status |
|-------|-------------|--------|
| 1 | Artifact reconstruction (npm pack byte-for-byte) | DONE |
| 2 | CRM clean baseline (scratch worktree) | DONE |
| 3 | Existing-consumer compatibility (6 consumers) | DONE |
| 4 | New subpath probe (ESM + strict TS + semantics) | DONE |
| 5 | Proposed migration analysis (read-only) | DONE |
| 6 | Verdict categories (per-category, NOT_EXECUTED where applicable) | DONE |

## Evidence files

- README.md (this file)
- CRM-CONSUMER-INVENTORY.md
- BASELINE-EVIDENCE.md
- TARBALL-VERIFICATION.md
- BUILD-TEST-MATRIX.md
- SUBPATH-PROBE.md
- MIGRATION-PLAN.md
- LIMITATIONS.md
- manifest.sha256

## Key finding (1 paragraph)

The candidate tarball is **byte-for-byte reproducible** from packaging source commit P and matches the brief SHA-256 exactly. The new subpath `@hrp-engagement/contracts/talent-context-read/v1` is fully functional in isolation: ESM runtime imports succeed, TypeScript declarations resolve under strict mode + module: NodeNext, all canonical positive parses pass, all negative rejections (malformed assertion, invalid delegation token, strict unknown fields) behave per spec, and redaction/unavailableFields semantics are preserved. **However, the candidate is a greenfield subpath, not a superset of the existing CRM `packages/contracts` (version 0.0.8-g0.8-fixes)**: switching any of the 6 CRM consumers (config, integration-store, integration-worker, integration-api, context-panel, core-1.10-media) to the candidate breaks their build, because they all import schemas/types that exist only in the local dev-harness package (e.g. `SCHEMA_VERSION`, `EventReceiptSchema`, `HrpGatewayMethod`, `RoutingPoolSchema`, `SecretPortHandleSchema`, `OUTBOX_PATCH_FORBIDDEN`, `ActorClaim`, `METRIC_GRAINS`, etc.). The candidate exposes only the `talent-context-read/v1` contract - a distinct subpath from the CRM dev-harness contracts that no current CRM consumer imports.

## Hard prohibitions (no exceptions)

- npm publish
- Git tag / GitHub Release
- Promote ACCEPTED_SHARED
- Modify CRM primary working tree
- Consumer migration in CRM primary
- Runtime endpoint / JWT signer / key provisioning / replay store / delegation store / audit DB
- HRP auth/RLS changes
- Migration / pilot / production / deploy
- Self-issued bilateral compatibility acceptance

## Stop at

**READY FOR T0 CRM CONSUMER COMPATIBILITY REVIEW**