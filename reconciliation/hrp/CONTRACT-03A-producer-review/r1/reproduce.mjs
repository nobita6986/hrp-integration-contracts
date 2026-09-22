import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import * as m from '../packages/contracts/dist/index.js';

// Synthetic, local-only producer review. No network, credentials or runtime.
const observed = [];
function check(name, actual, expected) {
  assert.deepEqual(actual, expected, name);
  observed.push({ name, actual });
}
const binding = {
  organizationId: 'org-1', crmSubject: 'crm-1',
  crmSessionHandle: 'session-1', crmSessionDeadline: '2026-09-22T10:00:00Z',
  callbackId: 'callback-1',
};
const suffix = 'A'.repeat(42) + 'B';
check('noncanonical receipt accepted', m.ReceiptSchema.safeParse('rc_' + suffix).success, true);
check('receipt roundtrip is not canonical', Buffer.from(suffix, 'base64url').toString('base64url') === suffix, false);
check('actor arbitrary delegationRef accepted', m.QueryDelegatedUserActorSchema.safeParse({
  kind: 'DELEGATED_USER', serviceId: 'svc-1', userId: 'u-1', delegationRef: 'dr-1',
}).success, true);
for (const [field, value] of [
  ['callbackId', 'bad value'], ['crmSessionHandle', 'bad\nvalue'],
  ['crmSessionDeadline', '2026-09-22T17:00:00+07:00'],
]) check('binding accepts invalid ' + field, m.CrmBindingSchema.safeParse({ ...binding, [field]: value }).success, true);
check('S28 exchange body rejected', m.ExchangeDelegationRequestSchema.safeParse({
  ...binding, receipt: 'rc_' + 'A'.repeat(43),
}).success, false);
check('S28 cancel body rejected', m.CancelDelegationRequestSchema.safeParse({
  ...binding, reason: 'SESSION_ENDED',
}).success, false);
check('S28 code-only delegation error rejected', m.DelegationErrorResponseSchema.safeParse({
  status: 'FAILED', error: { code: 'FORBIDDEN' },
}).success, false);
check('Cf FEFF accepted before trim', m.redactFullName('\uFEFFAlpha').success, true);
check('valid astral-letter token omitted', m.redactFullName('\u{10400}\u{10401}').success, false);
const redacted = m.redactFullName('Q' + '\u0301'.repeat(254) + 'b');
check('256-scalar input yields success', redacted.success, true);
check('output exceeds 512-byte bound', Buffer.byteLength(redacted.redacted, 'utf8'), 515);
check('oversize generated output passes schema', m.IdentitySummarySchema.safeParse({
  schemaVersion: '1', displayOnly: true, fullNameRedacted: redacted.redacted,
}).success, true);
check('1536-byte string passes 512-character schema', m.IdentitySummarySchema.safeParse({
  schemaVersion: '1', displayOnly: true, fullNameRedacted: '\u2022'.repeat(512),
}).success, true);
check('no assertion header/claims validator exported', Object.keys(m).filter(k => /assertion|jwt|claims|jti/i.test(k)), []);
const nativeSegmenter = Intl.Segmenter;
try {
  Intl.Segmenter = class { segment() { throw new Error('synthetic segmentation failure'); } };
  let threw = false;
  try { m.redactFullName('Alpha'); } catch { threw = true; }
  check('segmentation failure escapes instead of omission', threw, true);
} finally { Intl.Segmenter = nativeSegmenter; }

// Run the authoritative vectors, not the coder's copied/normalized fixtures.
const repo = new URL('../', import.meta.url);
const json = execFileSync('git', ['show',
  '49f2dbc34cae66e8d63df5dd5d8cec0c008c4623:reconciliation/hrp/CONTRACT-02B-conformance-response/r2/REDACTION-VECTORS.json',
], { cwd: repo, encoding: 'utf8' });
const vectors = JSON.parse(json).vectors;
let tested = 0;
for (const vector of vectors.filter(v => v.requested)) {
  const result = m.redactFullName(vector.input);
  assert.equal(result.success ? result.redacted : null, vector.expectedName, vector.id);
  tested++;
}
console.log(JSON.stringify({ observed, authoritativeAlgorithmVectorsPassed: tested,
  unrequestedVector: 'NOT_PROVEN: requires request-aware projection conformance',
}, null, 2));
