# Subpath Probe (CONTRACT-03B.2 Phase 4)

## Probe scratch

- Path: `<scratch-root>/.scratch-probe/` (path redacted from manifest)
- package.json:
  ```json
  {
    "name": "scratch-subpath-probe",
    "version": "0.0.0",
    "private": true,
    "type": "module",
    "dependencies": {
      "@hrp-engagement/contracts": "file:./hrp-engagement-contracts-0.0.0-candidate.0.tgz",
      "zod": "3.24.2"
    },
    "devDependencies": {
      "typescript": "5.7.3",
      "@types/node": "22.10.2"
    }
  }
  ```
- tsconfig.json: `target: ES2022, module: NodeNext, moduleResolution: NodeNext, strict: true, noUncheckedIndexedAccess: true, noEmit: true` -- matches CRM convention.
- Staged tarball: `hrp-engagement-contracts-0.0.0-candidate.0.tgz` (SHA-256 verified locally: `7c394f74bfa16458bb67d414ff2373e27fb2fb934606a82b3f04e8127f0e87c0`).
- `npm install`: 5 packages, 0 vulnerabilities; install observed the candidate `prepare` script warning (copy-from-harness.mjs) -- expected, dist already in tarball.

## Probe checks (ESM runtime, Node 24.19.0)

```
delegationRef length: 46 (expect 43 chars body + "dg_" prefix -> 46 total)
1. canonical query parses: true
2. canonical result parses: true
3. error body parses: true
4. invalid assertion header rejected: true
5. invalid delegation token rejected: true
6. unknown field rejected (strict): true
7. redaction returns RedactOutcome: true / value: {"success":true,"redacted":"A•• B••","fullNameBytes":15}
8. unavailableFields preserved: true
9. MODULE_SCHEMA_VERSION: 1
10. BACKEND_OPERATIONS includes query: true
11. CONFORMANCE_SUPPORTED: ["identitySummary"]
12. CONFORMANCE_KNOWN_UNSUPPORTED count: 7
13. parseTalentContextReadResponse type: function
All probe checks complete.
```

13/13 PASS. Probe output saved at `<scratch-root>/.scratch-probe/probe-output.txt` (not committed).

## TypeScript strict check (`tsc --noEmit`)

- Command: `npx tsc --noEmit`
- Exit code: 0
- Output: empty (0 bytes)
- Both root import and explicit subpath import resolve under strict mode + module: NodeNext + moduleResolution: NodeNext.

## Requirements verified (per brief)

| # | Requirement | Result |
|---|-------------|--------|
| 1 | ESM runtime import succeeds | PASS |
| 2 | TypeScript declarations resolve under strict mode | PASS |
| 3 | No need for dist/src/private path imports | PASS (only `.` and `./talent-context-read/v1` used) |
| 4 | Positive canonical query/result/error parse | PASS (checks 1, 2, 3) |
| 5 | Malformed assertion rejected | PASS (check 4) |
| 6 | Invalid delegation token rejected | PASS (check 5) |
| 7 | Strict unknown fields rejected | PASS (check 6) |
| 8 | Redaction and unavailableFields semantics preserved | PASS (checks 7, 8) |
| 9 | Root imports coexist with new subpath | PASS (same schemas accessible via `.` and `./talent-context-read/v1`) |

## Notes (negative results, not masked)

- Initial probe used `Nguyen Van A` for redaction input; the redaction algorithm rejected it as `unsafe` (the regex-based token grammar rejects this input). Switched input to `Anna Banana` for a passing positive case. This is the algorithm's spec, not a code change.
- Initial probe used `QUERY_VALIDATION_FAILED` error code; the frozen triple is `VALIDATION_ERROR`. Switched to canonical code; messageKey and retryClass must match the frozen triple.
- Initial probe used arbitrary base64url for delegationRef; the schema requires canonical base64url of exactly 32 raw bytes with `dg_` prefix (46 chars total). Used `sha256(seed).digest().toString("base64url")` to derive a deterministic valid token.
- Probe-imported `EventReceiptSchema` initially; removed because candidate does not export it. The probe intentionally does not test any schemas that the candidate does not provide.
- Probe-imported `AssertionProfileSchema`, `DelegationCreateRequestSchema`, `SUPPORTED`, `KNOWN_UNSUPPORTED` initially; renamed to `parseAssertionHeader`, `CreateDelegationRequestSchema`, `CONFORMANCE_SUPPORTED`, `CONFORMANCE_KNOWN_UNSUPPORTED` to match the candidate's actual export map.

## Verdict

NEW_SUBPATH_RUNTIME_COMPATIBILITY: **PASS**
TYPESCRIPT_DECLARATION_COMPATIBILITY: **PASS**