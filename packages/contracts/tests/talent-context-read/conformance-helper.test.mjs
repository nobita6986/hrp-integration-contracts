import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  redactFullName,
  checkResultConformance,
  compareUnavailableFields,
  CONFORMANCE_KNOWN_UNSUPPORTED,
  CONFORMANCE_SUPPORTED,
} from '../../dist/index.js';

// ============================================================================
// F-06 - Request/result conformance.
//
// Uses exact pinned REDACTION-VECTORS.json from MSG-028. The reproducer
// at HRP-side reports observed bugs at baseline f9cc493; this file asserts
// CORRECTED expectations.
// ============================================================================

function loadPinnedVectors() {
  const repo = 'D:/CodeApp/hrp-integration-contracts-02a';
  const json = execFileSync('git', [
    'show', '49f2dbc34cae66e8d63df5dd5d8cec0c008c4623:reconciliation/hrp/CONTRACT-02B-conformance-response/r2/REDACTION-VECTORS.json',
  ], { cwd: repo, encoding: 'utf8' });
  return JSON.parse(json).vectors;
}

describe('F-06 conformance helper semantics', () => {
  test('SUPPORTED set == [identitySummary]', () => {
    assert.deepEqual(CONFORMANCE_SUPPORTED, ['identitySummary']);
  });
  test('KNOWN_UNSUPPORTED has 7 entries (request-conformant, not projection-filled)', () => {
    assert.equal(CONFORMANCE_KNOWN_UNSUPPORTED.length, 7);
    assert.ok(!CONFORMANCE_KNOWN_UNSUPPORTED.includes('identitySummary'));
  });

  test('requested UNSAFE -> omit identitySummary + single marker', () => {
    const r = checkResultConformance(['identitySummary'], { success: false, reason: 'unsafe' });
    assert.equal(r.identitySummary, undefined);
    assert.equal(r.unavailableFields.length, 1);
    assert.ok(r.unavailableFields.includes('identitySummary'));
  });

  test('requested UNSAFE but with KNOWN_UNSUPPORTED also requested -> markers for both', () => {
    const r = checkResultConformance(
      ['identitySummary', 'placementCase'],
      { success: false, reason: 'unsafe' },
    );
    assert.equal(r.identitySummary, undefined);
    assert.ok(r.unavailableFields.includes('identitySummary'));
    assert.ok(r.unavailableFields.includes('placementCase'));
    assert.equal(r.unavailableFields.length, 2);
  });

  test('known unsupported but NOT requested -> no marker', () => {
    const r = checkResultConformance(
      ['identitySummary'],
      { success: true, redacted: 'A\u2022\u2022' },
    );
    assert.equal(r.identitySummary !== undefined, true);
    assert.equal(r.unavailableFields.length, 0);
  });

  test('known unsupported AND requested -> marker only', () => {
    const r = checkResultConformance(
      ['identitySummary', 'placementCase'],
      { success: true, redacted: 'A\u2022\u2022' },
    );
    assert.equal(r.identitySummary !== undefined, true);
    assert.deepEqual(r.unavailableFields, ['placementCase']);
  });

  test('unrequested field -> neither data nor marker', () => {
    const r = checkResultConformance(
      ['identitySummary'],
      { success: true, redacted: 'A\u2022\u2022' },
    );
    // placementCase is unrequested -> NOT in unavailable
    assert.ok(!r.unavailableFields.includes('placementCase'));
    // identitySummary is in allowlist -> has data
    assert.ok(r.identitySummary !== undefined);
  });
});

describe('F-06 expectedUnavailableFields comparison helper', () => {
  test('compareUnavailableFields sorts before compare', () => {
    assert.equal(compareUnavailableFields(['a','b'], ['b','a']), true);
  });
  test('compareUnavailableFields on different lengths returns false', () => {
    assert.equal(compareUnavailableFields(['a'], ['a','b']), false);
  });
});

describe('F-06 - PINNED vectors (MSG-028) drive conformance assertions', () => {
  const vectors = loadPinnedVectors();
  for (const vector of vectors) {
    test('vector: ' + vector.id, () => {
      if (vector.requested) {
        const redaction = redactFullName(vector.input);
        const r = checkResultConformance(['identitySummary'], redaction);
        // Per F-06 spec: requested unsafe must omit identitySummary and
        // produce a single identitySummary marker.
        if (vector.expectedName === null) {
          assert.equal(r.identitySummary, undefined, vector.id);
          assert.deepEqual(r.unavailableFields, ['identitySummary'], vector.id);
        } else {
          assert.ok(r.identitySummary !== undefined, vector.id);
          assert.equal(r.identitySummary.fullNameRedacted, vector.expectedName, vector.id);
          assert.deepEqual(r.unavailableFields, [], vector.id);
        }
      } else {
        // Unrequested: identitySummary is NOT in the allowlist. Helper must
        // produce NO data and NO marker for identitySummary.
        const r = checkResultConformance(['placementCase'], { success: true, redacted: 'never-used' });
        assert.equal(r.identitySummary, undefined, vector.id);
        // placementCase is known-unsupported and IS requested -> 1 marker
        assert.deepEqual(r.unavailableFields, ['placementCase'], vector.id);
      }
    });
  }
});
