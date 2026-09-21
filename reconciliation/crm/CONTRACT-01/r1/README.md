# CRM CONTRACT-01 Evidence Bundle (r1)

## Provenance

- CRM repository: https://github.com/nobita6986/HRP-CRM.git
- CRM baseline (full SHA): 72643356a0d1355f9dccc3921b47c990ea9c31c1
- CRM frozen package: @hrp-engagement/contracts@0.0.8-g0.8-fixes
- Source workspace: D:\\CodeApp\\Hrp-Crm
- Branch: evidence/crm-contract-01-r1
- Tier-0 acceptance (CRM-side): ACCEPTED inventory/provisional classification only.
  - This is NOT an independent audit PASS.
  - This is NOT HRP acceptance.
  - ACCEPTED_SHARED = 0 and HRP_IMPLEMENTED = 0 verified CRM-side.

## Scope and limitations of this evidence

In scope:
- Inventory of packages/contracts/src modules and public exports.
- Provisional classification per Owner-defined status set.
- Consumer map (integration-api, integration-worker, context-panel, core-1.10-media, packages/config, packages/integration-store).
- Test/fixture inventory (18 *.test.mjs files; 385 fixtures per CHANGELOG history).

Out of scope / NOT included in this bundle:
- HRP baseline SHA or HRP runtime evidence.
- HRP acceptance or two-party artifact.
- Contract source code changes (frozen CRM package untouched).
- Consumer migration. Consumers continue to import the frozen CRM package.
- Package bootstrap in this neutral repo.

## Two-party workflow

- This bundle is the CRM-side evidence exchange.
- HRP runs on a separate machine. They consume the same artifacts from this branch.
- No HRP baseline, runtime, or acceptance is assumed or interpolated.
- HRP-side artifacts expected from HRP side:
  - CRM_CONTRACT_GAP_REPORT.md
  - THIN_SLICE_CAPABILITY_MATRIX.md
  - hrp-contract-baseline.json

These HRP artifacts are NOT yet delivered. They are listed in the inventory pending list.

## What this evidence is NOT

- NOT a bootstrap of a shared package.
- NOT a tag, release, or publication.
- NOT a merge into main of this neutral repo.
- NOT a deployment of contracts.
- NOT a change to frozen CRM contracts.

## Manifest verification

Each file in this bundle (except this README and manifest.sha256) is hashed in manifest.sha256.
Relative paths are used. To verify on another machine:

    cd reconciliation/crm/CONTRACT-01/r1
    sha256sum -c manifest.sha256

On Windows (PowerShell):

    Get-FileHash -Algorithm SHA256 -Path (Get-ChildItem -Recurse -File | Where-Object { .Name -ne manifest.sha256 -and .FullName -notlike README.md }).FullName

Expected hashes (must match exactly):

- neutral-contract-inventory.md : 0b5fd09c337409f21417f5a974398c21ae174d641a446ea027936cddc190533a
- neutral-contract-evidence.json: 3014a9d804767a26d5868302ed62c0e5328195dca1e40bdc13266b221ff4fb0c
- contract-inventory.mjs        : c20db16c848cc63342378084c92e2ccc8238e670d6161d18faad22202cb265ba

## Script provenance

scripts/contract-inventory.mjs (saved here as contract-inventory.mjs) is the verification tool used at CRM-side.
It MUST be run at the CRM checkout at the exact baseline above with its installed dependencies.
Do NOT run it inside this neutral repo. Running it here would scan this bundle, not the CRM source, and produce meaningless counts.

## Reconciliation handoff

Per the prompt, the HRP side should reply with:
- HRP-side review of the inventory.
- HRP-side artifacts: CRM_CONTRACT_GAP_REPORT.md, THIN_SLICE_CAPABILITY_MATRIX.md, hrp-contract-baseline.json.
- HRP-side hash of these three artifacts (or a HRP-side manifest.sha256 of equivalent bundle).

Only after both sides exchange hashes and reconcile does CONTRACT-02 implementation become eligible.

