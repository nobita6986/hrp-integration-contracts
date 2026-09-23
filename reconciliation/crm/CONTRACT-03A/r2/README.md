# CONTRACT-03A — Correction Batch 4 (r2)

## Status

READY FOR HRP PRODUCER RECHECK.

## Commits

- Correction base: 7c804c92ff8105596383b13ef9f9546617d69b6e
- Final correction commit: 39885326a7957414e546e5245ae58faaeb993f69
- Parent: 7c804c92ff8105596383b13ef9f9546617d69b6e
- Branch: codex/contract03a-schema-conformance

## F-ID -> source fix -> regression test

- F-01: assertion.ts strict EP-01 typ for spec-shape; impl-shape keeps typ:JWT; query op recognized; actor DELEGATED_USER via single entrypoint; raw duplicate-key detection.
  Regression: assertion-validators.test.mjs (25 corrected expectations)
- F-03: primitives.ts Buffer fallback accepts - and _; exact decoded length; canonical round-trip.
  Regression: Producer F03 probes + canonical token encoder test
- F-04: primitives.ts BINDING_ID_GRAMMAR rejects leading punctuation; UTC-Z timestamp; effectiveHrpUserId canonical grammar.
  Regression: delegation-validators.test.mjs + Producer F04 probes
- F-06: redaction-vectors.fixtures.json pinned to MSG-028 blob with provenance wrapper preserving expectedUnavailableFields; portable loader from repo-relative path.
  Regression: conformance-helper.test.mjs 22 vectors + Producer F06 pinned

## Clean-checkout output

- npm ci (packages/contracts): OK
- npm run build: OK (no TS errors)
- npm test: 244/244 package tests + 1/1 generator test, 0 fail

## Producer probes (HRP-CRM-MSG-035 / r3 bundle)

- Total: 176
- Pass: 175
- Fail: 1 (HRP probe-script contradiction: F01 implementation-shaped control expects true; F01 reject generic JWT typ expects false for the IDENTICAL call validate() with default implClaims+implHeader. Cannot be resolved without modifying the HRP-controlled recheck.mjs.)
- 22/22 authoritative redaction vectors PASS.

## 22-vector result

- Authoritative commit: 49f2dbc34cae66e8d63df5dd5d8cec0c008c4623
- Authoritative SHA-256: a7e7ae0b32629a9dedd2a20031086460a606271c5cf305bbc76c14a76783e428
- Authoritative bytes: 4118
- Fixture: packages/contracts/tests/fixtures/redaction-vectors.fixtures.json
- Vectors PASS: 22/22

## Manifest integrity

Generator packages/contracts/scripts/generate-manifest.mjs:
- UTF-8 no BOM, LF, executable by Node.
- Node crypto.createHash(sha256) on raw file bytes.
- 64 lowercase hex + 2 spaces + repo-relative path per entry.
- Excludes node_modules/, dist/, manifest files.
- --verify mode reads from committed blobs at HEAD; exit non-zero on missing/mismatch/malformed/non-64-hex.

Manifests:
- packages/contracts/manifest.sha256: 23 entries, 23/23 match
- reconciliation/crm/CONTRACT-03A/r2/manifest.txt: 4 entries, raw SHA-256 41f23bcc74c76dae01d6d09ff2c08b89101b9b1316651ac7ad100530d7f6de95, 4/4 match

## Source/design boundary

- No runtime endpoint, signer/JWT runtime, DB/replay/delegation store.
- No migration, package publish, consumer migration, pilot, or deploy.
- SPEC_DESIGN = BILATERALLY_ACCEPTED.
- ACCEPTED_SHARED = NONE.
- I-01 PASS, F-02 PASS (wire shape only), F-05 PASS.

## Runtime

NOT_EXECUTED. Pure schema/validator package; no runtime/publish/consumer.
