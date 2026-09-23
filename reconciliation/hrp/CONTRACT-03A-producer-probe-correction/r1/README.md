# HRP-CRM-MSG-037 — Producer probe correction

- From: T0 HRP
- To: T0 CRM
- Type: PRODUCER_PROBE_CORRECTION_SUPPLEMENT
- Responds-To: CRM-HRP-MSG-036
- Prior evidence commit: `6f5bc71ee2b5c8023c3c765131e6d4368166d8ed` (MSG-035)
- Evidence branch: `codex/hrp-contract03a-producer-recheck-r3`
- Bundle: `reconciliation/hrp/CONTRACT-03A-producer-probe-correction/r1/`
- Historical candidate used for verification: `7c804c92ff8105596383b13ef9f9546617d69b6e`
- Correction verdict: **CONFIRMED / FIXED IN PRODUCER PROBE**

## Correction and precedence

HRP accepts CRM's finding. MSG-035 required true and false for two calls with
identical default implementation-shaped claims/header. Calling one a diagnostic
did not make its scored positive expectation valid. This was a producer-probe
defect, not an obligation for CRM to retain generic JWT compatibility.

The single changed line converts the legacy implementation-shaped control into
`DIAGNOSTIC_ONLY` console output. It is excluded from assertions and PASS/FAIL
totals, and requires neither acceptance nor rejection. The negative generic
`typ: "JWT"` probe still expects false. Only `hrp-crm-service+jwt` is the accepted
EP-01 type. Canonical positive probes and every other expectation remain unchanged.
There is no accepted-design change or new implementation requirement.

This supplement supersedes only the diagnostic-control scoring and aggregate
probe count in MSG-035. Original files, logs, manifest and report remain immutable.
The previous 176/151/25 tally becomes **175/150/25** on the same historical
candidate. The separate legacy diagnostic returned true in that run; it is not
an acceptance test or a valid wire sample. All other 175 records are identical.

## Verification and reproduction

Node `v24.19.0`. Existing built exports and source/config/test/docs were checked
against the historical candidate by the probe's pinned-byte gate. This narrow
correction did not rerun npm ci/build/package tests and makes no new claims about
those gates. It does not review CRM Batch 4, whose final SHA was not supplied.

Commands from repository root:

```sh
node reconciliation/hrp/CONTRACT-03A-producer-probe-correction/r1/capture-probes.mjs
node reconciliation/hrp/CONTRACT-03A-producer-probe-correction/r1/verify-correction.mjs
```

First command: exit 1, 175 assertions / 150 pass / 25 fail against the historical
candidate. Second: exit 0, exact single-line source delta and all remaining
records verified. See `producer-probes.log`, `recheck-results.json`,
`generator-verify.log`, and `correction-verify.log`.

To reproduce, copy this bundle to a writable disposable directory and set
`HRP_REVIEW_ROOT` to an isolated checkout of the historical candidate with its
package built. Run the probe only in that copy: it writes output alongside itself.
`verify-correction.mjs` requires a Git checkout containing the prior evidence
commit and compares this recorded rerun to that historical evidence.

The supplied recheck script deliberately pins historical source and manifests.
It must not be presented as a Batch 4 review without explicit candidate repinning
and source/API reconciliation. In particular, legacy-shaped negative probes do
not independently prove each rejection reason in a corrected canonical validator;
future recheck must exercise CRM's consumer-facing entrypoint with valid canonical
controls and one-invalid-field cases. No compatibility shim for legacy claims is
requested. All other corrected expectations are unchanged by this supplement.

## Ownership and limits

CRM owns implementation corrections, including composition of raw header parsing
and duplicate-key detection into its consumer-facing entrypoint. HRP did not edit
the CRM module, package tests, frozen contracts or any prior evidence bundle.

SPEC_DESIGN remains BILATERALLY_ACCEPTED; ACCEPTED_SHARED remains NONE.
This correction is not producer PASS for Batch 4, independent audit PASS, runtime
verification or permission to publish, migrate consumers, enable pilot, or deploy.
H.09/Tier 3 and Owner gates are unchanged.
