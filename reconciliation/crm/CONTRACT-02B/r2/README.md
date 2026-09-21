# CONTRACT-02B Evidence Bundle (r2) - revised delta from r1

## Provenance

- CRM repository: https://github.com/nobita6986/HRP-CRM.git
- CRM baseline (full SHA): 72643356a0d1355f9dccc3921b47c990ea9c31c1

## Scope

r2 is a narrow correction of r1. T0 verdict CHANGES_REQUIRED. r2 applies BR-1..BR-7 = CR-2-1..CR-2-7.

r1 remains immutable. r2 does NOT open implementation, does NOT change frozen contracts, does NOT promote any module to ACCEPTED_SHARED.

Contents (r2):

## Boundaries (confirmed, not relaxed)

- No edits to frozen CRM contracts @hrp-engagement/contracts@0.0.8-g0.8-fixes.

## Manifest verification

On Linux / macOS:

    cd reconciliation/crm/CONTRACT-02B/r2
    sha256sum -c manifest.sha256

On Windows (PowerShell 5+):

    Get-ChildItem -Recurse -File -Exclude manifest.sha256 | ForEach-Object { certutil -hashfile .FullName SHA256 | Select-Object -Skip 1 -First 1 }

Source of truth for SHA-256: the raw LF file bytes. Git blob bytes are subject to system-wide core.autocrlf=true on Windows and may differ from LF manifest hash.

## Supersession / revision pinning


## Stop

STOP - READY FOR T0 DESIGN REVIEW.

