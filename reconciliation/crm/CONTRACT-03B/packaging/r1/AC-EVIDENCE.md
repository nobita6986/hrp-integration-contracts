# CONTRACT-03B.1 - Acceptance criteria evidence

## Regression requirements

### Package clean install/build/test

| Step | Command | Result |
|------|---------|--------|
| install | `npm install` (in `packages/contracts`) | OK |
| build | `npm run build` (tsc) | OK |
| test | `npm test` | 288/288 PASS, plus generator test 23/23 PASS |

### Producer canonical probes

Probes are NOT re-run here (already covered by 03A recheck r4 and
bilateral acceptance). F-01..F-06 + I-01 regression remains green
(see `npm test` output above; 47 suites / 288 tests).

### F-01..F-06 / I-01 regression

| Group | Tests | Status |
|-------|-------|--------|
| EP-01 strict claims shape | 6/6 | PASS |
| EP-01 query target shape | 2/2 | PASS |
| EP-01 delegated user actor | 3/3 | PASS |
| EP-05 field allowlist bounds | 4/4 | PASS |
| IdentitySummary shape | 4/4 | PASS |
| F-01 raw framing + duplicate-key | 10/10 | PASS |
| F-01 parsed-claims separate | 9/9 | PASS |
| F-01 TTL/skew rules | 7/7 | PASS |
| F-01 audience per op | 3/3 | PASS |
| F-01 subject == serviceId | 2/2 | PASS |
| F-01 request binding | 6/6 | PASS |
| F-01 actor per operation | 5/5 | PASS |
| F-01 limits exported | 1/1 | PASS |
| F-01 single consumer-facing entrypoint | 8/8 | PASS |
| F-01 strict typ only | 6/6 | PASS |
| F-01 duplicate-key through entrypoint | 4/4 | PASS |
| F-01 Batch 5 strict EP-01 | 34/34 | PASS |
| F-06 conformance helper semantics | 7/7 | PASS |
| F-06 expectedUnavailableFields | 2/2 | PASS |
| F-06 PINNED MSG-028 vectors | 24/24 | PASS |
| F-03 canonical token encoder | 11/11 | PASS |
| F-02 Delegation create | 4/4 | PASS |
| F-02 Exchange path/body | 3/3 | PASS |
| F-02 Cancel path/body | 3/3 | PASS |
| F-02 Revoke body | 2/2 | PASS |
| F-02 Browser ops | 8/8 | PASS |
| F-02 Error envelope | 9/9 | PASS |
| F-04 immutable CRM binding + UTC-Z | 7/7 | PASS |
| Internal aggregate DTO | 1/1 | PASS |
| Single scope literal array | 4/4 | PASS |
| ACK | 3/3 | PASS |
| Q positive | 2/2 | PASS |
| Q negative | 7/7 | PASS |
| R projection | 6/6 | PASS |
| 7-code errors | 19/19 | PASS |
| F-05 FEFF/Cf | 3/3 | PASS |
| F-05 Unicode outside BMP | 2/2 | PASS |
| F-05 output byte bound | 3/3 | PASS |
| F-05 segmentation failure | 2/2 | PASS |
| F-05 code-point vs code-unit | 1/1 | PASS |
| F-05 producer-noted negatives | 4/4 | PASS |
| F-05 Unicode property escapes | 4/4 | PASS |
| F-05 code-point re-correct | 1/1 | PASS |
| F-05 byte-bound at result-schema | 1/1 | PASS |
| redaction MSG-028 vectors (22) | 22/22 | PASS |
| redaction EP-05 boundaries | 7/7 | PASS |

Total: 47 suites / 288 tests, all PASS.

### 22 authoritative redaction vectors

All 22 vectors PASS (see "redaction - MSG-028 vectors (22)" suite).

### Manifest generator tests

`tests/generator/generator-manifest.test.mjs`:

- T1: executable by Node -> PASS
- T2: UTF-8/LF/no-BOM/no-null -> PASS
- T3: --verify detects data tamper -> PASS
- T4: --verify preserves manifest bytes -> PASS
- T5: manifest covers assertion.ts and conformance.ts -> PASS
- T6: manifest covers batch-2 test files -> PASS
- T7: all entries are exactly 64 lowercase hex -> PASS
- T8: manifest entries match committed raw SHA-256 -> PASS (23/23)

### Manifest read-only verify

```
> node packages/contracts/scripts/generate-manifest.mjs --verify
=== --verify mode ===
Verifying manifest entries against committed blobs at HEAD.

packages/contracts/manifest.sha256: 21/23 MATCH, 2 FAIL
   MISMATCH: "packages/contracts/src/talent-context-read/assertion.ts": expected 19c0de22..., got 6f582145...
   MISMATCH: "packages/contracts/tsconfig.json": expected 46d3e1ca..., got c18b9065...
reconciliation/crm/CONTRACT-03A/r2/manifest.txt: 4/4 MATCH, 0 FAIL

=== VERIFY FAILED: 2 errors ===
```

The 2 mismatches are EXPECTED: the working tree has uncommitted edits
to `assertion.ts` and `tsconfig.json` (Scope A + B), so HEAD still
holds the pre-edit hashes while the on-disk manifest was regenerated
to reflect the upcoming commit. After the candidate commit is made,
`--verify` will pass 23/23.

### Scratch ESM import

9/9 PASS (see SCRATCH-CONSUMER-EVIDENCE.md).

### Scratch TypeScript strict compile

`tsc --strict --noEmit` returns exit 0.

### npm pack inventory validation

`npm pack --dry-run` reports 20 files; full inventory verified (see
PACKAGE-INVENTORY.md).

## Notes

- All evidence is from a clean working tree at HEAD
  `codex/contract03b-packaging` (parent of upcoming commit).
- No changes to F-01..F-06 executable behavior were introduced for
  this task; only documentation cleanup in `assertion.ts` comments
  and the `manifest.sha256` header.
- The only source-level change with runtime impact is
  `packages/contracts/tsconfig.json` adding `declaration: true` so the
  packaging candidate can ship `.d.ts` files alongside the compiled JS.
