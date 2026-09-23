import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import * as api from '../packages/contracts/dist/index.js';

// Producer-side probes only. No module edits, DB, network calls or runtime auth.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'review');
const sha = '22fc50e3deca5e6c816aab44088afe1d443e4867';
const prior = 'f9cc493224792d15f99ba1debc27fc4d6a9cce7e';
const git = (...args) => execFileSync('git', args, { cwd: root });
assert.equal(git('rev-parse', 'HEAD').toString().trim(), sha);
const hash = b => createHash('sha256').update(b).digest('hex');
const records = [];
function check(id, expected, fn) {
  let actual;
  try { actual = fn(); } catch (e) { actual = { threw: e.message }; }
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  records.push({ id, expected, actual, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}: ${JSON.stringify(actual)}`);
}
const manifestPath = 'reconciliation/crm/CONTRACT-03A/r1/manifest.sha256';
const manifest = git('show', `${sha}:${manifestPath}`);
const entries = manifest.toString('utf8').trim().split(/\r?\n/).map(line => {
  const [, expected, file] = line.match(/^([a-f0-9]{64})\s+(.+)$/);
  const blob = git('show', `${sha}:${file}`);
  const actual = hash(blob);
  const crlfHash = hash(Buffer.from(blob.toString('utf8').replace(/\r?\n/g, '\r\n')));
  return { file, expected, actual, match: expected === actual, crlfHashMatchesExpected: expected === crlfHash };
});
const tracked = git('ls-tree', '-r', '--name-only', sha, '--', 'packages/contracts/src/', 'packages/contracts/tests/').toString().trim().split(/\r?\n/);
const integrity = {
  sha, manifestPath, manifestHash: hash(manifest),
  deliveredManifestHash: 'a666a9bdc3486491f459a9d809a4e0d679f8915d6b8bd9cb980e37fc4ddf08bf',
  entries, uncovered: tracked.filter(f => !entries.some(e => e.file === f)),
  diffNames: git('diff', '--name-only', prior, sha).toString().trim().split(/\r?\n/),
};

const token = prefix => prefix + Buffer.alloc(32).toString('base64url');
const binding = { organizationId: 'org-test', crmSubject: 'crm-test', crmSessionHandle: 'session-test', crmSessionDeadline: '2026-09-23T10:00:00Z', callbackId: 'callback-test' };
const actor = { kind: 'DELEGATED_USER', serviceId: 'svc-test', userId: 'hrp-test', delegationRef: token('dg_') };
const canonicalClaims = {
  iss: 'urn:test:issuer', sub: 'svc-test', serviceId: 'svc-test', aud: 'urn:test:query',
  iat: 100, exp: 130, jti: token('jt_'), scope: [api.SINGLE_SCOPE_LITERAL], binding,
  request: { method: 'POST', path: '/api/integrations/crm/talent-context/query', bodySha256: 'a'.repeat(64) }, actor,
};
const minimalClaims = { iss: 'i', sub: 's', aud: 'a', iat: 100, exp: 130, jti: token('jt_') };
check('F01 accepted EP01 query claims accepted', true, () => api.validateClaimsObject(canonicalClaims).ok);
check('F01 incomplete claims rejected', false, () => api.validateClaimsObject(minimalClaims).ok);
check('F01 nbf rejected', false, () => api.validateClaimsObject({ ...minimalClaims, nbf: 100 }).ok);
check('F01 negative epoch rejected', false, () => api.validateClaimsObject({ ...minimalClaims, iat: -20, exp: -10 }).ok);
check('F01 unsafe integer rejected', false, () => api.validateClaimsObject({ ...minimalClaims, iat: Number.MAX_SAFE_INTEGER + 1 }).ok);
check('F01 exp+skew equality rejected', false, () => api.validateTtlSkew(minimalClaims, { nowSeconds: 160 }).ok);
check('F01 helper fails without trusted audience config', false, () => api.validateAudience(minimalClaims, {}).ok);
check('F01 helper fails without request bindings', false, () => api.validateRequestBinding(minimalClaims, {}).ok);
check('F01 unapproved organizationIdDigest rejected by claims', false, () => api.validateClaimsObject({ ...minimalClaims, organizationIdDigest: 'b'.repeat(64) }).ok);
check('F01 raw duplicate escaped JSON key rejected', false, () => api.parseAssertionHeader('{"iss":"a","\\u0069ss":"b"}').ok);
check('F01 raw duplicate nested JSON key rejected', false, () => api.parseAssertionHeader('{"binding":{"organizationId":"a","organizationId":"b"}}').ok);
// This is evidence of a missing protected-header validator, not signature testing.
check('F01 protected header rejects alg none through exported parser', false, () => api.parseAssertionHeader('{"alg":"none","typ":"wrong","kid":"k","jku":"https://invalid.example/key"}').ok);

const create = { ...binding, requestedScopes: [api.SINGLE_SCOPE_LITERAL], callbackState: token('st_') };
const exchange = { ...binding, receipt: token('rc_') };
const cancel = { ...binding, reason: 'USER_CANCELLED' };
const revoke = { ...binding, delegationRef: token('dg_'), reason: 'USER_CANCELLED' };
check('F02 exchange body excludes path pendingRequestId', true, () => api.ExchangeDelegationRequestSchema.safeParse(exchange).success);
check('F02 exchange body rejects pendingRequestId', false, () => api.ExchangeDelegationRequestSchema.safeParse({ ...exchange, pendingRequestId: token('pd_') }).success);
check('F02 cancel body accepted without path id', true, () => api.CancelDelegationRequestSchema.safeParse(cancel).success);
check('F02 code-only delegation error accepted', true, () => api.DelegationErrorResponseSchema.safeParse({ status: 'FAILED', error: { code: 'FORBIDDEN' } }).success);
check('F02 delegation error messageKey rejected', false, () => api.DelegationErrorResponseSchema.safeParse({ status: 'FAILED', error: { code: 'FORBIDDEN', messageKey: 'x' } }).success);
check('F02 browser handoff accepted', true, () => api.BrowserHandoffRequestSchema.safeParse({ pendingRequestId: token('pd_'), handoffProof: token('hp_'), callbackState: token('st_') }).success);
check('F02 approval decision accepted', true, () => api.ApprovalDecisionRequestSchema.safeParse({ pendingRequestId: token('pd_'), decision: 'APPROVE', csrfToken: token('cs_') }).success);
check('F02 denied callback rejects receipt', false, () => api.CallbackOutcomeSchema.safeParse({ pendingRequestId: token('pd_'), callbackState: token('st_'), outcome: 'DENIED', receipt: token('rc_') }).success);
check('F02 effective user required at exchange result', false, () => api.ExchangeDelegationSuccessSchema.safeParse({ delegationRef: token('dg_'), expiresAt: binding.crmSessionDeadline }).success);
for (const [schemaName, prefix] of [['PendingRequestIdSchema','pd_'],['HandoffProofSchema','hp_'],['ReceiptSchema','rc_'],['DelegationRefSchema','dg_'],['CallbackStateSchema','st_'],['JtiSchema','jt_'],['CsrfTokenSchema','cs_']]) {
  check(`F03 ${schemaName} canonical zero bytes accepted`, true, () => api[schemaName].safeParse(token(prefix)).success);
  check(`F03 ${schemaName} canonical ff bytes accepted`, true, () => api[schemaName].safeParse(prefix + Buffer.alloc(32, 255).toString('base64url')).success);
  check(`F03 ${schemaName} noncanonical pad bits rejected`, false, () => api[schemaName].safeParse(prefix + 'A'.repeat(42) + 'B').success);
}
check('F03 actor rejects generic dr-1 token', false, () => api.QueryDelegatedUserActorSchema.safeParse({ ...actor, delegationRef: 'dr-1' }).success);
check('F03 query actor accepts canonical ff token', true, () => api.QueryDelegatedUserActorSchema.safeParse({ ...actor, delegationRef: 'dg_' + Buffer.alloc(32, 255).toString('base64url') }).success);
for (const [name, schema, body] of [['create',api.CreateDelegationRequestSchema,create],['exchange',api.ExchangeDelegationRequestSchema,exchange],['cancel',api.CancelDelegationRequestSchema,cancel],['revoke',api.RevokeDelegationRequestSchema,revoke]]) {
  check(`F04 ${name} callback whitespace rejected`, false, () => schema.safeParse({ ...body, callbackId: 'bad id' }).success);
  check(`F04 ${name} session newline rejected`, false, () => schema.safeParse({ ...body, crmSessionHandle: 'bad\nhandle' }).success);
  check(`F04 ${name} offset deadline rejected`, false, () => schema.safeParse({ ...body, crmSessionDeadline: '2026-09-23T17:00:00+07:00' }).success);
  check(`F04 ${name} nonexistent calendar date rejected`, false, () => schema.safeParse({ ...body, crmSessionDeadline: '2026-02-30T10:00:00Z' }).success);
}
check('F04 binding opaque initial underscore rejected', false, () => api.CrmBindingSchema.safeParse({ ...binding, crmSessionHandle: '_session' }).success);
check('F05 FEFF rejected', false, () => api.redactFullName('\uFEFFAlpha').success);
check('F05 515-byte redaction omitted', false, () => api.redactFullName('Q' + '\u0301'.repeat(254) + 'b').success);
check('F05 oversized result rejected through result schema', false, () => api.IdentitySummarySchema.safeParse({ schemaVersion: '1', fullNameRedacted: '\u2022'.repeat(512), displayOnly: true }).success);
for (const [name, input, expected] of [['Arabic','\u0639\u0644\u064a','\u0639\u2022\u2022'],['Hangul','\ud64d\uae38\ub3d9','\ud64d\u2022\u2022'],['Deseret','\u{10400}\u{10401}','\u{10400}\u2022\u2022']]) {
  check(`F05 ${name} Unicode-letter name redacted`, expected, () => api.redactFullName(input).redacted ?? null);
}
const nativeSegmenter = Intl.Segmenter;
try {
  Intl.Segmenter = class { segment() { throw Error('synthetic'); } };
  check('F05 segmenter throws -> omit', false, () => api.redactFullName('Alpha').success);
} finally { Intl.Segmenter = nativeSegmenter; }

const vectorsBlob = git('show','49f2dbc34cae66e8d63df5dd5d8cec0c008c4623:reconciliation/hrp/CONTRACT-02B-conformance-response/r2/REDACTION-VECTORS.json');
const vectors = JSON.parse(vectorsBlob).vectors;
for (const v of vectors) {
  if (v.requested) {
    check(`F06 pinned vector ${v.id}`, { name: v.expectedName, unavailable: v.expectedUnavailableFields }, () => {
      const r = api.checkResultConformance(['identitySummary'], api.redactFullName(v.input));
      return { name: r.identitySummary?.fullNameRedacted ?? null, unavailable: r.unavailableFields };
    });
  } else {
    // Valid wire requests need 1..8 fields. Request only an unsupported field;
    // assert identity omission separately, with its requested marker accounted for.
    check(`F06 pinned vector ${v.id} identity omission`, { name: v.expectedName, unavailable: v.expectedUnavailableFields }, () => {
      const r = api.checkResultConformance(['placementCase'], api.redactFullName(v.input));
      assert.deepEqual(r.unavailableFields, ['placementCase']);
      return { name: r.identitySummary?.fullNameRedacted ?? null, unavailable: r.unavailableFields.filter(f => f === 'identitySummary') };
    });
  }
}
for (const code of Object.keys(api.QUERY_ERROR_HTTP_STATUS)) {
  const body = { schemaVersion: '1', status: 'FAILED', correlationId: 'probe-0001', errors: [{ code, messageKey: api.QUERY_ERROR_MESSAGE_KEY[code], retryClass: api.QUERY_ERROR_RETRY_CLASS[code] }] };
  check(`query seven-code ${code}`, 'QUERY_ERROR', () => api.parseTalentContextReadResponse(api.QUERY_ERROR_HTTP_STATUS[code], body).status);
  check(`query wrong HTTP ${code}`, 'PROTOCOL_ERROR', () => api.parseTalentContextReadResponse(418, body).status);
  check(`query wrong messageKey ${code}`, 'PROTOCOL_ERROR', () => api.parseTalentContextReadResponse(api.QUERY_ERROR_HTTP_STATUS[code], { ...body, errors: [{ ...body.errors[0], messageKey: 'wrong' }] }).status);
}
check('query rejects delegation error envelope', 'PROTOCOL_ERROR', () => api.parseTalentContextReadResponse(403, { status: 'FAILED', error: { code: 'FORBIDDEN' } }).status);

const result = {
  reviewedSha: sha, priorSha: prior, node: process.version, observedAt: new Date().toISOString(),
  integrity, vectorsHash: hash(vectorsBlob), records,
  summary: { total: records.length, pass: records.filter(r => r.pass).length, fail: records.filter(r => !r.pass).length },
};
fs.writeFileSync(path.join(outDir, 'recheck-results.json'), JSON.stringify(result, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(result.summary));
// Intentional nonzero: corrected expectations still fail on the reviewed source.
process.exitCode = result.summary.fail ? 1 : 0;
