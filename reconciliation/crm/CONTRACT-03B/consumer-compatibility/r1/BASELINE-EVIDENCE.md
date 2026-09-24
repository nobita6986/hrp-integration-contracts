# Baseline Evidence (CONTRACT-03B.2 Phase 2)

## Scratch checkout

- **Source commit:** `72643356a0d1355f9dccc3921b47c990ea9c31c1`
- **Method:** `git worktree add --detach` from primary CRM
- **Path:** (redacted from committed manifest)
- **HEAD:** `72643356a0d1355f9dccc3921b47c990ea9c31c1`

## Cleanliness checks

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| `node_modules/` absent | yes | absent (in scratch root) | PASS |
| `dist/` absent | yes | absent | PASS |
| `.tmp_pgdata_*` absent | yes | absent | PASS |
| `.codegraph/codegraph.db` absent | yes | absent | PASS |
| Working-tree changes | none | none (`git status --porcelain` empty) | PASS |
| Primary CRM working tree | unchanged | unchanged from session snapshot | PASS |

## Environment

| Field | Value |
|-------|-------|
| Node | v24.19.0 |
| npm | 11.17.0 |
| OS | Microsoft Windows 11 Pro 10.0.26200 |
| Scratch path | (machine-local; not in committed manifest) |

## Pre-switch baseline build/test

### packages/contracts (CRM dev-harness)

- `npm ci`: added 2 packages, audited 3 packages, 0 vulnerabilities
- `npm run build`: tsc compiled cleanly
- `npm test`: **398/398 tests PASS**, 0 fail

### packages/integration-store (baseline, with file:../contracts)

- `npm ci`: 37 packages, 0 vulnerabilities
- `npm run build`: tsc compiled cleanly (baseline)
- `npm test`: NOT executed in this scratch (would require embedded-postgres / Prisma generate for integration tests; baseline unit tests would only exercise schema validation, which is what the build already verifies). Phase 3 only checks `npm run build` per consumer per brief.

### Other consumers (baseline)

All other consumers (config, integration-worker, integration-api, context-panel, core-1.10-media) were left at their baseline `file:../contracts` pin after Phase 3, and their `npm install` + `npm run build` were exercised only when switched to the candidate (and reverted).

## Pre-existing limitations (none)

No pre-existing build failures were observed at baseline. All 6 consumers build cleanly with the CRM dev-harness package. The candidate-induced failures documented in BUILD-TEST-MATRIX.md are the only failures.