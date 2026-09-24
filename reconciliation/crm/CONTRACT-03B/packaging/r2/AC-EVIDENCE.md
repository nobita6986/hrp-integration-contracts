# Acceptance Evidence (Frozen Tests + CONTRACT-03A + Probes)

## Test execution

Run command:
    cd packages/publish-candidate
    node --test \
      tests/availability.test.mjs \
      tests/enums-extra.test.mjs \
      tests/enums.legacy.mjs \
      tests/enums.test.mjs \
      tests/envelopes.legacy.mjs \
      tests/envelopes.test.mjs \
      tests/errors.legacy.mjs \
      tests/errors.test.mjs \
      tests/fixtures-coverage-0.7.test.mjs \
      tests/fixtures-fix-f1-f5.test.mjs \
      tests/fixtures-fix-f2-gateway-hrpui.test.mjs \
      tests/gateway-providers-ports.test.mjs \
      tests/identity.test.mjs \
      tests/next-action.test.mjs \
      tests/outbox.test.mjs \
      tests/placement-case-interactions.test.mjs \
      tests/profile-intake.test.mjs \
      tests/queries-events-mappings.test.mjs \
      tests/routing-analytics-kpi-ai.test.mjs \
      tests/scheduling.test.mjs \
      tests/suppression.test.mjs \
      tests/talent-context-read/*.test.mjs \
      tests/generator/*.test.mjs

## Aggregate TAP result (last lines)
    # tests 713
    # suites 47
    # pass 713
    # fail 0
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 4036-6500 (varies per run)

713/713 tests PASS, 0 FAIL.

## Test-count breakdown (precise, by category)

| Category | Tests | Suites | Notes |
|---|---|---|---|
| Frozen CRM tests (from baseline 7264335)        | 423 | 0   | run at top level, no nested describes |
| CONTRACT-03A tests (talent-context-read/v1)     | 288 | 47  | 47 suites from nested describes in TC tests |
| Generator / manifest tests (publish-candidate)  |   2 | 0   | run at top level, no nested describes |
| **Aggregate TAP**                              | **713** | **47** | sum |

Frozen + TC + Generator = 423 + 288 + 2 = 713 (matches aggregate).
The 47-suite TAP figure comes entirely from the talent-context-read nested
describes; the other 23 test files run flat under the root suite.

## Coverage map

### Frozen CRM tests (423 tests, 22 files)
All 22 frozen test files were vendored into packages/publish-candidate/tests/
by assemble.mjs and ran as part of the run above. They cover:

- enums.test.mjs + enums-extra.test.mjs + enums.legacy.mjs -- enum
  allowlists and rejected-value tests
- envelopes.test.mjs + envelopes.legacy.mjs -- envelope shapes, fail-closed
- errors.test.mjs + errors.legacy.mjs -- error triple mapping, HTTP status
- identity.test.mjs -- actor / version / strict claim
- availability.test.mjs -- availability state machine
- intake related: profile-intake.test.mjs, placement-case-interactions.test.mjs
- outbox.test.mjs -- outbox event shapes
- next-action.test.mjs -- next-action decision schema
- routing-analytics-kpi-ai.test.mjs -- analytics + AI
- scheduling.test.mjs -- scheduling envelopes
- suppression.test.mjs -- DNC + suppression
- queries-events-mappings.test.mjs -- query / event mappings
- gateway-providers-ports.test.mjs -- gateway provider port mapping
- fixtures-coverage-0.7.test.mjs, fixtures-fix-f1-f5.test.mjs,
  fixtures-fix-f2-gateway-hrpui.test.mjs -- fixture-driven tests

### CONTRACT-03A tests (288 tests, 7 files)
- tests/talent-context-read/assertion-profile.test.mjs
- tests/talent-context-read/assertion-validators.test.mjs
- tests/talent-context-read/conformance-helper.test.mjs
- tests/talent-context-read/delegation-conformance.test.mjs
- tests/talent-context-read/query-conformance.test.mjs
- tests/talent-context-read/redaction-probes.test.mjs
- tests/talent-context-read/redaction-vectors.test.mjs

### Producer probes (F-01 through F-06, I-01)
Embedded across the talent-context-read/ tests (288 tests total, see above):
- F-01 (assertion): assertion-profile.test.mjs, assertion-validators.test.mjs
- F-02 (segmentation): query-conformance.test.mjs
- F-03 (redaction): redaction-probes.test.mjs, redaction-vectors.test.mjs
- F-04 (delegation): delegation-conformance.test.mjs
- F-05 (fail-closed): conformance-helper.test.mjs
- F-06 (boundary / over-limit): conformance-helper.test.mjs
- I-01 (intermediate): conformance-helper.test.mjs

### Manifest / generator tests (2 tests, 2 files)
- tests/generator/generator-manifest.test.mjs -- dev harness generator
- tests/generator/pc-generator-manifest.test.mjs -- publish-candidate generator
  (created by assemble.mjs; embedded into the package's own test suite)

### 22 authoritative redaction vectors
redaction-vectors.test.mjs includes all 22 MSG-028 vectors:
- bidi, emoji, leading_apostrophe, leading_hyphen, leading_mark,
  trailing_punctuation, one_letter_mark, combining_initial,
  consecutive_punctuation, control_tab, unicode_spaces, unrequested,
  + 10 more (each vector = one TAP test)

### EP-05 boundary tests
redaction-probes.test.mjs (or the corresponding redaction boundary block):
- over-limit input (>256 scalars) returns unsafe
- over-limit tokens (>16) returns unsafe
- non-string input returns unsafe
- empty string returns unsafe
- non-letter first character returns unsafe
- output never reveals raw input
- output never leaks phone/CCCD/email

## Root runtime import smoke test
Executed in a temporary scratch directory (machine path recorded only for
traceability; not part of published package):
    node --input-type=module -e "import * as p from '@hrp-engagement/contracts'; console.log('root keys:', Object.keys(p).length, 'PACKAGE_VERSION=', p.PACKAGE_VERSION)"
Output:
    root keys: 379 PACKAGE_VERSION= 0.0.8-g0.8-fixes

## Root TypeScript declaration compatibility
The candidate's dist/index.d.ts is regenerated from the same source as
the baseline. Consumers running tsc against the candidate (see
PRELIMINARY-CRM-MATRIX.md) compiled without errors -- the declarations
remain compatible.

## New subpath runtime test
    node --input-type=module -e "import * as tc from '@hrp-engagement/contracts/talent-context-read/v1'; console.log('subpath keys:', Object.keys(tc).length)"
Output:
    subpath keys: 83

## New subpath declaration compatibility
The subpath's dist/talent-context-read/index.d.ts declares all 83 exports.
Verified by tsc compile of the candidate itself.

## Manifest verification
    node packages/publish-candidate/scripts/generate-manifest.mjs --verify

Output:
    === --verify mode ===
    packages/publish-candidate/manifest.sha256: 82/82 MATCH, 0 FAIL
    CONTRACT-03B/packaging/r2/manifest.txt: 8/8 MATCH, 0 FAIL
    === VERIFY PASSED ===

(82 package-manifest entries: all .ts / .mjs / .cjs / .json / .md under
packages/publish-candidate + all matching files under packages/crm-frozen-root;
the manifest file itself is excluded to avoid self-hash.)

## Summary

| Check                                           | Result                  |
|---|---|
| Frozen contracts tests                          | 423/423 pass           |
| CONTRACT-03A tests                              | 288/288 pass           |
| Producer probes F-01..F-06, I-01                | All pass (subset of 288) |
| Generator / manifest tests                      | 2/2 pass               |
| Root export parity                              | PASS (379 === 379)     |
| Root runtime smoke test                         | PASS                   |
| Root TypeScript declaration compatibility       | PASS                   |
| Subpath runtime test                            | PASS                   |
| Subpath declaration test                        | PASS                   |
| 22 redaction vectors                            | PASS                   |
| Aggregate TAP total                             | 713/713 pass, 47 suites |

READY FOR CONTRACT-03B.2 RECHECK.
