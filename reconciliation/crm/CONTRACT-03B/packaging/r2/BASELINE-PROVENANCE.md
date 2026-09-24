# Baseline Provenance -- CRM Frozen Root

## CRM source baseline
- Repository: Hrp-Crm (the primary CRM working tree)
- Commit (baseline): 72643356a0d1355f9dccc3921b47c990ea9c31c1
- Path: packages/contracts/
- Package identity: @hrp-engagement/contracts
- Version (baseline): 0.0.8-g0.8-fixes
- Exports (baseline): only .  ->  dist/index.js + dist/index.d.ts

## Pinning method
The baseline source is vendored byte-exactly into this neutral repository
under packages/crm-frozen-root/. Provenance is recorded by
packages/crm-frozen-root/BASELINE-MANIFEST.sha256 (raw SHA-256 of every
imported file, repo-relative paths).

packages/publish-candidate/scripts/verify-baseline.mjs reads
BASELINE-MANIFEST.sha256 and re-hashes every file on disk. It must report
"56 OK, 0 bad" before any assembly step. Any drift fails the build.

## Baseline artifacts (56 files)
- package.json (identity + exports field)
- tsconfig.json
- 33 source modules under src/:
    - commands/ (22 modules: ai-proposals, ai-provider-config, analytics,
      availability, dnc, events, evidence, gateway, identity, intake,
      interactions, kpi, mappings, merge-review, next-action, outbox,
      placement-case, ports, profile, providers, queries, routing,
      scheduling, suppression)
    - enums.ts, envelopes.ts, errors.ts, index.ts, primitives.ts (top level)
- 21 test files under tests/ (incl. fixtures/):
    - availability.test.mjs, enums.test.mjs, enums-extra.test.mjs,
      enums.legacy.mjs, envelopes.test.mjs, envelopes.legacy.mjs,
      errors.test.mjs, errors.legacy.mjs, identity.test.mjs,
      next-action.test.mjs, outbox.test.mjs,
      placement-case-interactions.test.mjs, profile-intake.test.mjs,
      queries-events-mappings.test.mjs, routing-analytics-kpi-ai.test.mjs,
      scheduling.test.mjs, suppression.test.mjs, test-helpers.mjs,
      fixtures-coverage-0.7.test.mjs, fixtures-fix-f1-f5.test.mjs,
      fixtures-fix-f2-gateway-hrpui.test.mjs, gateway-providers-ports.test.mjs
- 1 fixture: tests/fixtures/redaction-vectors.fixtures.json
- tests/_synthetic-coverage.md, tests/_synthetic-pending.md (notes, not tests)

Full per-file hashes are in:
- packages/crm-frozen-root/BASELINE-MANIFEST.sha256
- packages/publish-candidate/manifest.sha256 (subset under crm-frozen-root/)

## What is NOT imported from baseline
- dist/   (build output; not committed)
- node_modules/ (not committed anywhere)
- Any worktree paths or absolute paths

## Verifiability (third-party reproduction)
1. Re-clone Hrp-Crm at the baseline SHA:
     git -C SCRATCH checkout 72643356a0d1355f9dccc3921b47c990ea9c31c1 -- packages/contracts
2. Re-vendor with cp -r or git archive to packages/crm-frozen-root/.
3. Run: node packages/publish-candidate/scripts/verify-baseline.mjs
4. Recomputed hashes must match BASELINE-MANIFEST.sha256 byte-exact.

## Authority resolution
- The frozen CRM root comes ONLY from commit 72643356a0d1355f9dccc3921b47c990ea9c31c1.
- No root module was reconstructed from memory.
- No root constant, enum, error triple, or root export name was renamed.
- The baseline PACKAGE_VERSION (0.0.8-g0.8-fixes) is preserved verbatim in
  the candidate runtime.

## Local CRM HEAD confirmation at evidence creation
  git -C D:\CodeApp\Hrp-Crm rev-parse HEAD
  -> 72643356a0d1355f9dccc3921b47c990ea9c31c1
