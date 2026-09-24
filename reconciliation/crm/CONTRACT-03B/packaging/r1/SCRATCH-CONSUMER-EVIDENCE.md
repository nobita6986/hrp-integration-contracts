# CONTRACT-03B.1 - Scratch consumer evidence

## Setup

- Scratch dir: `D:\CodeApp\scratch-consumer`
- Outside the source checkout.
- Initial `package.json`: name=scratch-consumer, private=true, type=module.
- TypeScript 5.7.3 installed as devDep.
- Tarball:
  `D:\CodeApp\hrp-integration-contracts-02a\packages\publish-candidate\hrp-engagement-contracts-0.0.0-candidate.0.tgz`
- Tarball SHA-256: `7c394f74bfa16458bb67d414ff2373e27fb2fb934606a82b3f04e8127f0e87c0`

## Install

```
npm install "D:\CodeApp\hrp-integration-contracts-02a\packages\publish-candidate\hrp-engagement-contracts-0.0.0-candidate.0.tgz" --save

added 3 packages, audited 4 packages in 2s
1 package is looking for funding
found 0 vulnerabilities
```

npm warns about a `prepare` script (`copy-from-harness.mjs` runs in the
package, but the dist files were already present in the tarball, so no
source files need to be copied).

Installed package.json dependencies after the install:

```
"dependencies": {
  "@hrp-engagement/contracts": "file:../hrp-integration-contracts-02a/packages/publish-candidate/hrp-engagement-contracts-0.0.0-candidate.0.tgz"
}
```

## Runtime smoke test (ESM import)

Source: `D:\CodeApp\scratch-consumer\src\smoke.mjs`

```
PASS  1. canonical request parses
PASS  2. canonical result parses
PASS  3. error body parses
PASS  3b. wrong HTTP status returns PROTOCOL_ERROR
PASS  4. malformed header (extra field) rejected
PASS  5. invalid delegation token rejected
PASS  6. redaction returns redacted shape
PASS  7. unknown field rejected
PASS  B. BACKEND_OPERATIONS includes query

Summary: 9 PASS, 0 FAIL
```

Coverage of the minimum smoke set:

- canonical positive talent-context query/request  -> PASS (test 1)
- canonical result parse                           -> PASS (test 2)
- query-local error parse                          -> PASS (test 3)
- query-local error envelope rejected on bad HTTP  -> PASS (test 3b)
- malformed assertion rejected                     -> PASS (test 4)
- invalid delegation token rejected                -> PASS (test 5)
- redaction output parse                           -> PASS (test 6)
- unknown fields rejected                          -> PASS (test 7)
- BACKEND_OPERATIONS includes `query`              -> PASS (test B)

## Root import smoke test

Source: `D:\CodeApp\scratch-consumer\src\smoke-root.mjs`

```
> node src/smoke-root.mjs
Root import works: true
```

Confirmed: root import `@hrp-engagement/contracts` resolves.

## TypeScript strict check

```
> npx tsc --strict --noEmit
(no errors)
```

Confirms:

- `.d.ts` declarations resolve at the subpath.
- Subpath types are usable under `module: Node16`.
- Type aliases derivable from Zod schemas match the wire shapes.
- No `any` leaks.

## Tooling requirements

- Node >= 20 (engines.node in candidate package.json).
- TypeScript >= 5.7 for strict mode.
- Consumers MUST set `module: Node16` (or NodeNext) for subpath
  resolution; with `module: ESNext + moduleResolution: node` the
  package exports map is NOT honored.

## Negative results we explicitly did NOT mask

- Smoke test 3 initially failed when the test used an arbitrary
  `messageKey`. We fixed the test to use the canonical
  `errors.validation` per frozen triple. This is a test-data fix,
  not a code change.
- `tsc --strict --noEmit` initially failed with `module: ESNext +
  moduleResolution: node` because the subpath requires
  `moduleResolution: node16`. We updated tsconfig to
  `module: Node16 + moduleResolution: node16`. This is a
  consumer-side configuration requirement, not a package defect.
- The original smoke imported `redactNameRedactable`, which does
  not exist. We replaced it with `redactFullName` (the actual export
  from `redaction.ts`). No code change.
- The original typecheck imported `TalentContextReadQueryRequest`
  as a type name, but only `TalentContextReadQueryRequestSchema`
  is exported; types are derivable via `ReturnType<...parse>`. No
  code change.
