# Tarball Verification (CONTRACT-03B.2 Phase 1)

## Inputs

| Field | Value |
|-------|-------|
| Packaging source commit (P) | `68c5fc729afb306f27266f8b08f8c63a671a446e` |
| Evidence commit (E) | `5b0356ee8024a922fcac4dca621a4a5b11392388` |
| Packaging manifest SHA-256 (from E) | `0bab74b895e9a6989a69d1e3e4f33720fa7e677cf78c7d0d01f412a181626d95` |
| Tarball filename (expected) | `hrp-engagement-contracts-0.0.0-candidate.0.tgz` |
| Tarball bytes (expected) | 27,949 |
| Tarball SHA-256 (expected) | `7c394f74bfa16458bb67d414ff2373e27fb2fb934606a82b3f04e8127f0e87c0` |
| File count (expected) | 20 |
| Package | `@hrp-engagement/contracts` |
| Version | `0.0.0-candidate.0` |

## Reproducible build steps executed

1. `git fetch origin codex/contract03b-packaging` (in scratch clone)
2. `git checkout 68c5fc729afb306f27266f8b08f8c63a671a446e`
3. `cd packages/contracts && npm ci` -> added 2 packages, 0 vulnerabilities
4. `npm run build` -> tsc clean
5. `npm test` -> **288/288 tests PASS + generator 23/23 PASS**
6. `cd ../publish-candidate && node scripts/copy-from-harness.mjs` -> Copied 18 files (125,923 bytes)
7. `npm pack --dry-run` -> 20 files, name=`@hrp-engagement/contracts`, version=`0.0.0-candidate.0`, filename=`hrp-engagement-contracts-0.0.0-candidate.0.tgz`, package size=27.9 kB, unpacked size=129.4 kB, npm-registry shasum=`aaa23def3c0247a77da75b87ea9474bc82f9da2c`
8. `npm pack` -> produced `hrp-engagement-contracts-0.0.0-candidate.0.tgz`

## Tarball artifact verification

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| Filename | `hrp-engagement-contracts-0.0.0-candidate.0.tgz` | `hrp-engagement-contracts-0.0.0-candidate.0.tgz` | PASS |
| Bytes | 27,949 | 27,949 | PASS |
| SHA-256 | `7c394f74bfa16458bb67d414ff2373e27fb2fb934606a82b3f04e8127f0e87c0` | `7c394f74bfa16458bb67d414ff2373e27fb2fb934606a82b3f04e8127f0e87c0` | PASS |
| File count | 20 | 20 | PASS |
| Package name | `@hrp-engagement/contracts` | `@hrp-engagement/contracts` | PASS |
| Package version | `0.0.0-candidate.0` | `0.0.0-candidate.0` | PASS |

## Unpacked inventory (20 files)

| Path | SHA-256 |
|------|---------|
| package/dist/talent-context-read/assertion.d.ts | 07fd24d43617a548aae28e08cec5abde6f5ee3144e98750861f2e269bab30eab |
| package/dist/talent-context-read/assertion.js | 7794c59cdda90c630c86a30e03f05a5eddfa278fd75081917a1c38e9761dc5b1 |
| package/dist/talent-context-read/conformance.d.ts | 76028f9c821ec2a4e9625b53c0b369bbf56de58f884634be93d41edaca7f61c6 |
| package/dist/talent-context-read/conformance.js | 0f9a87800b68d03753e4fbf6bf0c52648a84ae23a665c7b5934311e4aaf4fcf6 |
| package/dist/talent-context-read/delegation.d.ts | 3080e7e2e7225cbe13166491192122a391bff09f6f1a0960da64e64995646b68 |
| package/dist/talent-context-read/delegation.js | 370ebcda4fdc0f85fd0c02d732aabbd2b4d113b5bdd3b5f3d00ff6e592bf7352 |
| package/dist/talent-context-read/index.d.ts | fd19e0cf0375112d14033ed9dc8e5de500d84e91c58a3ff3799b82a1149133bc |
| package/dist/talent-context-read/index.js | 5869d1724f90aa56e4a0baa502712bfd7d6e54d88aab327bb36d648059786195 |
| package/dist/talent-context-read/primitives.d.ts | 14698ac8eac3f8210eed7ef7253163c479b0148c2c9c1cbcabec54404d6856ba |
| package/dist/talent-context-read/primitives.js | 9fb3467e5dbda390492440a9629e4542de7d8ca2007f98d770201e0f8a9f72a2 |
| package/dist/talent-context-read/query-errors.d.ts | a7f2a36a77450a11c6b2fe048e46d088e0c530cad84ebd9c0b74efd61dc48750 |
| package/dist/talent-context-read/query-errors.js | 71d442bd4d9e7893330b290858dfd9c01f9c4462d60d0b2ca353b6d8819b7f22 |
| package/dist/talent-context-read/query-parser.d.ts | b70e41a0bd95e6c94689c8651e6e4505686ef5b2217dad4c12759e685190bc6c |
| package/dist/talent-context-read/query-parser.js | 6caef1c83d94e99be093b9a063cca6c46bc147f21a51be101562e231638190dc |
| package/dist/talent-context-read/query-types.d.ts | e3feb75bf2def2db13c6b7f7de72e00160a9db301c2d737ac140d692ab933dc2 |
| package/dist/talent-context-read/query-types.js | f9eb5a7d9701f5c42e905796917fe54091633187ace58be07fd30f298dcde746 |
| package/dist/talent-context-read/redaction.d.ts | 69cce05099df97f3ccec4e3b39024a4501c80c4ea73478b1bca02426e834cf30 |
| package/dist/talent-context-read/redaction.js | eb49e5179e80fee4c89f6d8cb5d07aa45b26b79a65151cc4bf1cb8ce2eca146a |
| package/package.json | c6c76142f7f7701255a6727bb86f3df094efd8e8b51914069937e786b8ef5efe |
| package/README.md | cc142419e33354b56769eedca917a5dfdaddd8e0edee527c8dbd9ce2e0ff47a2 |

## Manifest verification (E-side)

- File: `reconciliation/crm/CONTRACT-03B/packaging/r1/manifest.sha256`
- Self-SHA-256 (excluding self): `0bab74b895e9a6989a69d1e3e4f33720fa7e677cf78c7d0d01f412a181626d95` -- **MATCH** the brief

The packaging evidence bundle at commit E contains 7 evidence files, all
SHA-verified against the manifest. The bundle does NOT contain the
tarball itself (only its SHA-256 hash is referenced).

## Result

**Tarball is byte-for-byte reproducible from P; matches brief exactly. PASS.**