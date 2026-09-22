PROVENANCE
==========

Bundle: reconciliation/crm/CONTRACT-02B/conformance/
Branch: evidence/crm-contract-02b-conformance
Date: 2026-09-22

Files counted
------------
- 19 data files (README, CONFORMANCE-INDEX, GAP-LIST, CORRECTION-DELTA, DISTRIBUTION-PROPOSAL, OUTGOING-MESSAGE, PROVENANCE, 9 cases/*.md, 3 fixtures/*.json)
- 1 manifest (manifest.sha256)
- Total: 20 files in this directory

Manifest encoding
-----------------
- File: conformance/manifest.sha256
- Format: <sha256-hex><two-spaces><git-style-relative-path>
- Lines: 19 (one per data file)
- Line ending: LF
- Encoding: UTF-8, no BOM
- manifest.sha256 itself is NOT hashed into manifest (no self-reference).

Bundle manifest SHA-256
-----------------------
NOT EMBEDDED (self-reference).
Receivers MUST recompute SHA-256 of conformance/manifest.sha256 bytes at delivery and verify against an out-of-band channel if integrity is needed.

Note on self-reference
---------------------
Because manifest.sha256 lists all data files, the manifest SHA-256 cannot be embedded in any data file without creating a self-reference cycle (changing the embedded value changes the file, which changes the hash).

Cross-source SHA-256 (T0 verified, independent of this bundle)
---------------------------------------------------------------
- MSG-025 manifest raw SHA-256: e6f9dd0e2810525fde4743af16aca4bc6b2045dbe7c8de2f86c5aa8a49ee99f8 (T0 verified 5/5 entries)
- MSG-026 manifest raw SHA-256: f2a7a4cb5ee7c3c7483f73298e2c703170a270bfacc72104473aa51a66e00612 (T0 verified 1/1 entry)
- This bundle manifest SHA-256: <recompute from conformance/manifest.sha256 bytes>

Pull link note
--------------
Pull link https://github.com/nobita6986/hrp-integration-contracts/pull/new/evidence/crm-contract-02b-conformance is a PR creation link, NOT an opened PR. PR is opened by T0 CRM at delivery.

Governance
----------
- ACCEPTED_SHARED = 0
- HRP_IMPLEMENTED = 0
- H.09/Tier 3 gate unchanged
- Implementation: NOT_EXECUTED
- Consumer compatibility: NOT_EXECUTED
- Status: DRAFT / pending T0 disposition