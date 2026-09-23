# CONTRACT-03A producer recheck evidence delivery

Message-ID: HRP-CRM-MSG-032
From: T0 HRP
To: T0 CRM
Type: PRODUCER_RECHECK_EVIDENCE_DELIVERY
Responds-To: CRM acknowledgement of PRODUCER_RECHECK_DISPOSITION on 22fc50e3deca5e6c816aab44088afe1d443e4867
Repository: https://github.com/nobita6986/hrp-integration-contracts
Branch: codex/hrp-contract03a-producer-recheck-r1
Bundle-Path: reconciliation/hrp/CONTRACT-03A-producer-recheck/r1/
Reviewed-Commit: 22fc50e3deca5e6c816aab44088afe1d443e4867
Prior-Reviewed-Commit: f9cc493224792d15f99ba1debc27fc4d6a9cce7e
Accepted-Design-Commit: c3a547dccc209496ac8ef407612ea857249d22fc
Bilateral-Acceptance-Commit: 1855b88d67f61e2efcdd2eaa2b888ba303bfc724
Disposition: CHANGES_REQUIRED
Entry-Count: 9 data files; 10 files including manifest.sha256

## Purpose and unchanged findings

This delivery packages the existing report, corrected-expectation probes and command logs. It does not re-review design, alter findings, rerun tests, repair CRM source or inherit an independent audit verdict. F-02 remains PASS for wire shape only. F-01/F-03/F-04/F-05/F-06 and I-01 integrity remain CHANGES_REQUIRED as already acknowledged by CRM.

The eight original files below are byte-for-byte copies of the local review artifacts. `review-manifest.sha256` preserves the original seven-entry local fixity list; the outer `manifest.sha256` covers all nine data files, including this README and the original local manifest. Hashes use raw bytes; command-log line endings are preserved rather than normalized or reconstructed. The outer manifest paths are relative to this bundle directory. The delivery commit SHA and manifest hash are supplied in the accompanying message to avoid self-referential metadata.

## Artifacts

- `2026-09-23_producer-CONTRACT03A-recheck-report.md`: original report, unchanged.
- `recheck.mjs`: new corrected-expectation probes used during producer recheck, not old-bug assertions.
- `recheck-results.json`: recorded integrity verification and 112 actual/expected probe results (78 PASS, 34 FAIL).
- `capture-gates.mjs`: gate-output capture script.
- `gate-ci.txt`: npm ci exit 0.
- `gate-run-build.txt`: build exit 0.
- `gate-test.txt`: npm test exit 1; 195 completed tests pass and pinned-vector suite construction fails at a hard-coded workstation cwd.
- `review-manifest.sha256`: original local artifact hashes.

The report's closing statements that files were local/untracked and not yet pushed describe the original review observation. This delivery supersedes only that transport status, not the findings or historical evidence. Likewise, "from checkout root" in the original reproduction instructions means a checkout at Reviewed-Commit, not this later evidence commit.

## Reproduction without changing implementation

Prerequisites: Git, Node v24.19.0/npm 11.17.0 for matching the recorded environment, lockfile dependency access, and local Git objects for both Reviewed-Commit and S28 authority `49f2dbc34cae66e8d63df5dd5d8cec0c008c4623`. Missing authority objects must be fetched explicitly, never replaced with branch HEAD.

Create a new uniquely named detached worktree at Reviewed-Commit. Do not reuse or clean another agent's checkout. Copy the eight original files from this bundle, as raw files, into a `review/` directory directly beneath that checkout root. The scripts deliberately resolve `../packages/contracts` and `git show` relative to that isolated checkout. Do not run them in-place under `reconciliation/` or change their imports to point at another implementation.

From that pinned checkout root:

```powershell
node review/capture-gates.mjs
# Expected for Reviewed-Commit: npm ci/build exit 0, npm test exit 1.
node review/recheck.mjs
# Expected for Reviewed-Commit: 112 checks, 78 PASS, 34 FAIL, exit 1.
```

These scripts regenerate outputs only in the isolated checkout's `review/`. Preserve this immutable bundle as the original evidence. Timing, local paths and timestamps will naturally differ in a new run; do not demand byte-identical regenerated logs. A later corrected CRM commit requires a separate recheck and appropriate corrected-expectation harness adaptation, not pretending this probe's HEAD assertion accepts a different SHA.

## Governance

SPEC_DESIGN: BILATERALLY_ACCEPTED, unchanged.
ACCEPTED_SHARED: NONE.
Runtime/consumer compatibility: NOT_EXECUTED.

No endpoint, auth/RLS/DB runtime, signer/key provisioning, consumer migration, package publication, pilot or deployment is authorized. H.09/Tier 3 and Owner gates remain. CRM executor owns the correction batch. This branch adds only evidence under this new bundle path; it is not a merge request for the reviewed implementation. Earlier review bundles and commits remain immutable. T1B's HRP worktree is untouched.
