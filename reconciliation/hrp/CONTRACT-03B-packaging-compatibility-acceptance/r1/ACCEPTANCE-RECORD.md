# CONTRACT-03B bilateral packaging and compatibility acceptance record

## 1. Authority and pinned evidence

T0 HRP accepts the disposition delivered by T0 CRM in `CRM-HRP-MSG-044` and pins exactly:

- prior HRP bilateral executable acceptance `3b18007ef2f37ccd5c4b7084f1aa6dbc05569d63`;
- executable candidate `2eb6bd155399d5e0490c5a2b0c5037a57dc36bc3`;
- packaging source P2 `b7505568957217184b225d99312066097c518fdc`;
- packaging evidence E3 `81a1000efac3d244add07568f69cd63554fa3eff`;
- CRM compatibility evidence `e7f90de7e6fb98c9e2900f00cc6b6265de712dc1`;
- CRM compatibility bundle `reconciliation/crm/CONTRACT-03B/consumer-compatibility/r2/`;
- CRM compatibility manifest SHA-256 `b05be5a2d336e0fd65cab33282716f5ffbf0abff5dba43dea2d6086d2878e521`.

The accepted package artifact is:

- package `@hrp-engagement/contracts`;
- candidate version `0.0.0-r2-candidate.0`;
- tarball `hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz`;
- size `169360` bytes;
- SHA-256 `b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc`;
- npm shasum `4713b1ce639acdc070a9fa95f868bc08b99d0f9b`;
- file count `79`.

No mutable branch head, rebuilt artifact with a different digest, future version, or root-module classification is accepted implicitly.

## 2. Accepted shared perimeter

The only newly promoted shared module is:

`@hrp-engagement/contracts/talent-context-read/v1`

The accepted perimeter contains:

1. Talent-context read request, result, projection, and error schemas.
2. Strict assertion/profile schemas and validation constraints.
3. Delegation operation request, result, and error shapes.
4. Query-local seven-code parser/profile.
5. Canonical primitives, redaction behavior, synthetic vectors, and conformance fixtures.
6. The exact additive package export at the pinned subpath.
7. Manifest and reproducibility tooling needed to identify the accepted candidate.

The 379 frozen root named exports are compatibility carriers only. Their ownership, classification, and prior acceptance state do not change. No talent-context symbol is accepted through the package root.

## 3. Compatibility disposition

T0 HRP accepts the following evidence-backed results:

- root named-export parity: `379/379`, no addition, deletion, rename, or talent-context leak;
- root `SCHEMA_VERSION = 1` and `PACKAGE_VERSION = 0.0.8-g0.8-fixes` preserved;
- additive subpath runtime assertions: `21/21 PASS`;
- strict NodeNext TypeScript declaration probe: `PASS` under the recorded CRM standard;
- CRM consumer builds: `6/6 PASS`;
- CRM consumer test matrix: `954/957 PASS`, with three identical pre-existing context-panel manifest line-ending failures and zero candidate-induced failures;
- browser bundle generation, server boot, package exposure, page boot, and navigation: verified;
- detailed Playwright browser checks: `4/9 PASS`, therefore production browser compatibility remains unaccepted.

The compatibility evidence does not establish HRP runtime compatibility, production compatibility, real session/browser authority, cryptographic verification, replay enforcement, delegation-store behavior, RLS authorization, or endpoint behavior.

## 4. Governance state

- `SPEC_DESIGN = BILATERALLY_ACCEPTED`.
- `EXECUTABLE_CONTRACT = BILATERALLY_ACCEPTED`.
- `TALENT_CONTEXT_READ_V1 = ACCEPTED_SHARED` for the exact module and pins in sections 1–2.
- `ADDITIVE_PACKAGE_COMPATIBILITY = BILATERALLY_ACCEPTED`.
- `PACKAGE_PUBLICATION = NOT_EXECUTED`.
- `CRM_CONSUMER_MIGRATION = NOT_EXECUTED`.
- `HRP_RUNTIME = NOT_EXECUTED`.
- `BROWSER_PRODUCTION_COMPATIBILITY = NOT_EXECUTED`.
- `PRODUCTION_ENABLEMENT = NOT_AUTHORIZED`.

H.09, Tier 3, Owner runtime, registration/configuration, browser compatibility, consumer rollout, and production gates remain closed.

## 5. Explicit exclusions

This record does not authorize:

- npm publication, registry upload, release, or Git tag;
- CRM dependency or lockfile mutation;
- HRP endpoint or HTTP transport implementation;
- JWT signer, cryptographic verifier, key provisioning, or rotation implementation;
- replay, delegation, or audit stores;
- DB migration, RLS, auth, or session changes;
- real organization or service registration;
- consumer activation, pilot, production enablement, or deployment.

## 6. Next-task authorization and ownership

T0 CRM may open CONTRACT-03B follow-up work as separate gated tasks for:

1. local immutable-artifact distribution and digest pinning;
2. packaging documentation cleanup;
3. consumer migration planning and isolated compatibility verification.

Opening those tasks is not permission to execute a consumer dependency migration. CRM owns its consumer work; HRP owns future HRP runtime integration. Neither side may create a competing shared module or silently widen the accepted subpath.

Before any publication or consumer migration, the packaging task must close the tooling/documentation observations recorded in `VERIFICATION.md`, regenerate affected manifests, and reverify any changed artifact SHA.
