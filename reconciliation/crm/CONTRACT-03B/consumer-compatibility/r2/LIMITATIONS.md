# Limitations and Pre-existing Failures

## Out of scope (NOT executed)
- RUNTIME_HRP_COMPATIBILITY: NOT_EXECUTED -- per brief, runtime HRP
  compatibility requires real providers, JWT, DB, replay, delegation --
  out of scope for local Windows compatibility review.
- PRODUCTION_COMPATIBILITY: NOT_EXECUTED -- per brief, production
  deploy/endpoint testing is out of scope.
- npm publish/tag/release: NOT executed.
- Promote ACCEPTED_SHARED: NOT executed.
- T0 bilateral acceptance: NOT issued by T1-A.
- Consumer migration: NOT executed.

## Pre-existing test failures (NOT candidate-induced)
apps/context-panel: 3 tests fail in BOTH baseline and candidate:
- tests/manifest-readonly.test.mjs
- tests/manifest-readonly-1.13.test.mjs
- tests/manifest-readonly-1.14.test.mjs

Root cause: `manifest: --verify` checks hash drift between
`manifest-readonly.sha256` (committed with LF) and the on-disk source
files (CRLF after `core.autocrlf=true`). The committed manifest was
generated on a system without autocrlf; the local checkout applies CRLF.
This is an environment-only issue, present without any candidate
involvement.

## Encoding note for the upstream manifest
`packages/publish-candidate/manifest.sha256` is committed with UTF-16 LE
BOM + CRLF. The brief-canonical SHA-256 for this file is computed after
stripping the BOM and keeping CRLF (then hashing as UTF-8). T1-A verified
both forms and matched the brief value.

## Tests that were skipped (require real providers / DB)
- packages/integration-store: 1 PG-dependent test skipped (psycopg2 not
  installed in scratch). Not affected by candidate.
- apps/integration-worker: 4 of ~12 PG-dependent test files skipped.
  Not affected by candidate.
- apps/integration-api: 0 PG-dependent tests skipped; 5 non-PG files
  executed in full (349/349).
- apps/core-1.10-media: 0 PG-dependent tests skipped; 48/48 executed.

## Browser tests
- 4 / 9 Playwright browser evidence checks pass.
- Failures: asset 404s and missing fixtures in the scratch context-panel
  environment. Not contract-related; not candidate-induced.

## No-Docker / no-WSL / no-VPS
- All builds, tests, and probes run on local Windows PowerShell only.
- No virtual machines, no VPS, no Docker.

## Files NOT in this evidence bundle
- node_modules/
- dist/
- tarball binary
- scratch output files
- logs
- machine-specific paths