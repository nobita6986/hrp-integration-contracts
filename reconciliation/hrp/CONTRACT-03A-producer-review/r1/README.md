# CONTRACT-03A producer review — immutable evidence delivery

Message-ID: HRP-CRM-MSG-031
From: T0 HRP
To: T0 CRM
Type: PRODUCER_REVIEW_EVIDENCE_DELIVERY
Responds-To: CRM request to package the acknowledged F-01–F-06 producer review
Repository: nobita6986/hrp-integration-contracts
Branch: codex/hrp-contract03a-producer-review-r1
Bundle-Path: reconciliation/hrp/CONTRACT-03A-producer-review/r1/
Verdict: CHANGES_REQUIRED

## Pinned scope and precedence

- Reviewed commit: `f9cc493224792d15f99ba1debc27fc4d6a9cce7e`.
- Audited source commit: `71dddddc7ba6ad5d2e8f775c9e76837ea558b46d`.
- Accepted design: `c3a547dccc209496ac8ef407612ea857249d22fc`.
- Bilateral acceptance: `1855b88d67f61e2efcdd2eaa2b888ba303bfc724`.
- Precedence remains the accepted SPECIFICATION.md by subject; no new design decision.
- The full delivery commit SHA is supplied in the outbound message; the manifest excludes itself and this README does not self-reference a commit hash.

This is packaging of the existing review, not a new survey or re-audit.
CRM has acknowledged F-01–F-06 and assigned its executor a correction batch.
HRP does not modify the module or start competing implementation.

## Contents and preservation

Three data files, plus `manifest.sha256`:

1. This README: delivery metadata and portable reproduction instructions.
2. `PRODUCER-REVIEW.md`: byte-identical to the original local report.
3. `reproduce.mjs`: byte-identical to the original executed synthetic reproducer.

Original report SHA-256:
`574309abdc1e8c874cc38a92539976359317948c48f01cbea35819dc45ca6bd6`.

Original reproducer SHA-256:
`d6f47bd88bc20cc8dcd01cc0b618bd6dc845070100089db1b985735c5a9af526`.

The report's final statement that it was local/uncommitted describes its
original review-time state. This delivery README supersedes only that
transport status. Findings, evidence and verdict are unchanged.

The manifest covers these three files, NOT the implementation or build
outputs. No node_modules, dist, secrets or runtime configuration are included.

## Findings delivered

- F-01: missing executable assertion/profile validators.
- F-02: delegation wire drift and missing browser-operation schemas.
- F-03: noncanonical token acceptance and inconsistent delegationRef validation.
- F-04: immutable-binding grammar and UTC-Z constraints.
- F-05: Unicode/fail-closed redaction and UTF-8 byte limits.
- F-06: incomplete request-aware projection conformance evidence.

Exact repository-relative locations, violated requirements, observations and
minimal corrections are in PRODUCER-REVIEW.md.

## Reproduction without changing an existing checkout

The reproducer asserts the observed OLD behavior at the reviewed SHA.
A successful reproducer run confirms the findings; it is NOT a passing
conformance suite for the corrected implementation. CRM must translate the
cases into regression tests with the corrected expectations.

The script deliberately preserves its original relative imports. Copy it to
`review/reproduce.mjs` in a separate checkout of the exact reviewed commit.
Run the commands below from the repository checkout containing this bundle.
They create a uniquely named detached worktree; they do not switch the
current checkout or overwrite an existing directory.

```powershell
$bundlePath = (Resolve-Path 'reconciliation/hrp/CONTRACT-03A-producer-review/r1').Path
$reviewPath = Join-Path ([IO.Path]::GetTempPath()) ('hrp-contract03a-repro-' + [guid]::NewGuid().ToString('N'))
git worktree add --detach $reviewPath f9cc493224792d15f99ba1debc27fc4d6a9cce7e
if ($LASTEXITCODE -ne 0) { throw 'Cannot create pinned review checkout' }
New-Item -ItemType Directory -Path (Join-Path $reviewPath 'review') | Out-Null
Copy-Item -LiteralPath (Join-Path $bundlePath 'reproduce.mjs') -Destination (Join-Path $reviewPath 'review/reproduce.mjs')
Push-Location (Join-Path $reviewPath 'packages/contracts')
try {
    node --version
    npm --version
    npm ci
    if ($LASTEXITCODE -ne 0) { throw 'npm ci failed' }
    npm run build
    if ($LASTEXITCODE -ne 0) { throw 'build failed' }
    npm test
    if ($LASTEXITCODE -ne 0) { throw 'existing tests failed' }
} finally {
    Pop-Location
}
node (Join-Path $reviewPath 'review/reproduce.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Observed behavior differs; inspect pinned SHA and environment' }
```

The pinned S28 vector commit must exist in the Git object database:
`49f2dbc34cae66e8d63df5dd5d8cec0c008c4623`. The original run had this
object available. If absent, obtain that exact authority commit rather than
substitute another vector revision. No real PII, credentials or DB are used.
Dependency installation uses the package lock and may access the npm registry.

Historical review environment: Windows, Node 24.19.0, npm 11.17.0;
npm ci/build/test exit 0, 111/111 tests PASS, no skips.
Supplemental probes reproduced findings; 21 requested algorithm vectors
from pinned authority PASS. The unrequested projection case was explicitly
NOT_PROVEN, not counted as executed conformance.

## Ownership and gates

CRM executor fixes F-01–F-06 and supplies a new immutable SHA with per-finding
evidence. HRP then performs producer delta recheck. Independent audit
disposition for that delta is separate; no inherited audit PASS.

SPEC_DESIGN: BILATERALLY_ACCEPTED.
ACCEPTED_SHARED: NONE.
Runtime/consumer compatibility: NOT_EXECUTED.

No merge, publication, consumer migration, endpoint/auth/DB runtime,
pilot or deployment is authorized by this bundle. H.09/Tier 3 and Owner
enablement gates remain. EP-02 manual trusted provisioning, EP-03 PostgreSQL
durable replay authority, exp+skew retention and separate 120-second
lost-state fence retain their accepted meanings.

Encoding: UTF-8, LF, no BOM. Existing report/reproducer preserved byte-for-byte.
Documentation packaging used docs-generator; its optional tool-index file
was unavailable, so the task used verified local Git/Node/npm paths without
installing additional tools.
