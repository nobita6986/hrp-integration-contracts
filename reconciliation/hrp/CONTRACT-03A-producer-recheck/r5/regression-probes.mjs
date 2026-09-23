import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.HRP_REVIEW_ROOT ?? execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: here, encoding: 'utf8' }).trim();
const reviewedSha = '2eb6bd155399d5e0490c5a2b0c5037a57dc36bc3';
const api = await import(pathToFileURL(path.join(root, 'packages/contracts/dist/index.js')).href);
const git = (...args) => execFileSync('git', args, { cwd: root });
const blob = (file) => git('show', `${reviewedSha}:${file}`);
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const records = [];

function check(id, expected, run) {
  let actual;
  try {
    actual = run();
  } catch (error) {
    actual = { threw: error.message };
  }
  const pass = isDeepStrictEqual(actual, expected);
  records.push({ id, expected, actual, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}: ${JSON.stringify(actual)}`);
}

// I-01: raw committed-blob integrity, coverage and read-only verifier.
const manifestPaths = ['packages/contracts/manifest.sha256', 'reconciliation/crm/CONTRACT-03A/r2/manifest.txt'];
const manifestResults = manifestPaths.map((manifestPath) => {
  const raw = blob(manifestPath);
  const entries = [];
  const errors = [];
  for (const line of new TextDecoder('utf8', { fatal: true }).decode(raw).split('\n').filter((item) => item.trim() && !item.startsWith('#'))) {
    const match = /^([0-9a-f]{64})  ([^\r\n]+)$/.exec(line);
    if (!match) {
      errors.push(`malformed:${line}`);
      continue;
    }
    const [, expected, file] = match;
    try {
      const bytes = blob(file);
      entries.push({ file, expected, actual: sha256(bytes), match: expected === sha256(bytes) });
    } catch (error) {
      errors.push(`missing:${file}:${error.message}`);
    }
  }
  return { manifestPath, rawSha256: sha256(raw), entries, errors };
});
check('I01 package manifest hash', '2b2b0bc7a3cea16d649b97e001bdba487cb7024d552419f330d9a328c4d1fd7d', () => manifestResults[0].rawSha256);
check('I01 handoff manifest hash', 'd5dc33552646ca79edf5f7b2c1600e2afd4be37eda9148366a62ce11063176f9', () => manifestResults[1].rawSha256);
check('I01 package manifest 23/23 raw blobs match', true, () => manifestResults[0].entries.length === 23 && manifestResults[0].errors.length === 0 && manifestResults[0].entries.every((entry) => entry.match));
check('I01 handoff manifest 4/4 raw blobs match', true, () => manifestResults[1].entries.length === 4 && manifestResults[1].errors.length === 0 && manifestResults[1].entries.every((entry) => entry.match));
const verify = spawnSync(process.execPath, ['packages/contracts/scripts/generate-manifest.mjs', '--verify'], { cwd: root, encoding: 'utf8' });
check('I01 committed-blob verifier exits zero', 0, () => verify.status);

const token = (prefix, fill = 255) => prefix + Buffer.alloc(32, fill).toString('base64url');
const scope = 'talent-context:read:identitySummary';
const binding = { organizationId: 'org-test', crmSubject: 'crm-test', crmSessionHandle: 'session-test', crmSessionDeadline: '2026-09-23T10:00:00Z', callbackId: 'callback-test' };
const create = { ...binding, requestedScopes: [scope], callbackState: token('st_') };
const exchange = { ...binding, receipt: token('rc_') };
const cancel = { ...binding, reason: 'USER_CANCELLED' };
const revoke = { ...binding, delegationRef: token('dg_'), reason: 'USER_CANCELLED' };

// F-02: delegation wire shapes and code-only operation error envelope.
check('F02 create parses', true, () => api.CreateDelegationRequestSchema.safeParse(create).success);
check('F02 exchange excludes path pendingRequestId', true, () => api.ExchangeDelegationRequestSchema.safeParse(exchange).success);
check('F02 exchange rejects body pendingRequestId', false, () => api.ExchangeDelegationRequestSchema.safeParse({ ...exchange, pendingRequestId: token('pd_') }).success);
check('F02 cancel excludes path pendingRequestId', true, () => api.CancelDelegationRequestSchema.safeParse(cancel).success);
check('F02 revoke carries delegationRef', true, () => api.RevokeDelegationRequestSchema.safeParse(revoke).success);
check('F02 code-only delegation error accepted', true, () => api.DelegationErrorResponseSchema.safeParse({ status: 'FAILED', error: { code: 'FORBIDDEN' } }).success);
check('F02 delegation error rejects query messageKey', false, () => api.DelegationErrorResponseSchema.safeParse({ status: 'FAILED', error: { code: 'FORBIDDEN', messageKey: 'query.forbidden' } }).success);
check('F02 exchange result requires effectiveHrpUserId', false, () => api.ExchangeDelegationSuccessSchema.safeParse({ delegationRef: token('dg_'), expiresAt: binding.crmSessionDeadline }).success);

// F-03: canonical 32-byte base64url tokens and pad-bit rejection.
const tokenSchemas = [['PendingRequestIdSchema', 'pd_'], ['HandoffProofSchema', 'hp_'], ['ReceiptSchema', 'rc_'], ['DelegationRefSchema', 'dg_'], ['CallbackStateSchema', 'st_'], ['JtiSchema', 'jt_'], ['CsrfTokenSchema', 'cs_']];
for (const [schemaName, prefix] of tokenSchemas) {
  check(`F03 ${schemaName} accepts canonical 32-byte token`, true, () => api[schemaName].safeParse(token(prefix)).success);
  check(`F03 ${schemaName} rejects non-canonical pad bits`, false, () => api[schemaName].safeParse(prefix + 'A'.repeat(42) + 'B').success);
}

// F-04: immutable binding grammar and UTC-Z deadline.
for (const [name, schema, body] of [['create', api.CreateDelegationRequestSchema, create], ['exchange', api.ExchangeDelegationRequestSchema, exchange], ['cancel', api.CancelDelegationRequestSchema, cancel], ['revoke', api.RevokeDelegationRequestSchema, revoke]]) {
  check(`F04 ${name} valid binding`, true, () => schema.safeParse(body).success);
  check(`F04 ${name} rejects whitespace callbackId`, false, () => schema.safeParse({ ...body, callbackId: 'bad id' }).success);
  check(`F04 ${name} rejects offset deadline`, false, () => schema.safeParse({ ...body, crmSessionDeadline: '2026-09-23T17:00:00+07:00' }).success);
}

// F-05: Unicode/redaction boundaries and fail-closed omission.
check('F05 Arabic initial', 'ع••', () => api.redactFullName('علي').redacted ?? null);
check('F05 Hangul initial', '홍••', () => api.redactFullName('홍길동').redacted ?? null);
check('F05 supplementary-plane initial', '𐐀••', () => api.redactFullName('𐐀𐐁').redacted ?? null);
for (const unsafe of ['\ufeffAlpha', 'A\u200bB', '\u0301Alpha', '-Alpha', "'Alpha", 'Alpha-', 'A'.repeat(257)]) {
  check(`F05 unsafe input omitted ${JSON.stringify(unsafe).slice(0, 30)}`, false, () => api.redactFullName(unsafe).success);
}
check('F05 result schema enforces 512-byte bound', false, () => api.IdentitySummarySchema.safeParse({ schemaVersion: '1', displayOnly: true, fullNameRedacted: '•'.repeat(512) }).success);
const savedSegmenter = Intl.Segmenter;
try {
  Intl.Segmenter = undefined;
  check('F05 missing Segmenter fails closed', false, () => api.redactFullName('Alpha').success);
} finally {
  Intl.Segmenter = savedSegmenter;
}

// F-06: accepted query/result/error perimeter and 22 authoritative vectors.
const query = { schemaVersion: '1', correlationId: 'corr-12345678', organizationId: 'org-test', target: { kind: 'TALENT', laborProfileId: 'lp-test' }, actor: { kind: 'DELEGATED_USER', serviceId: 'svc-test', userId: 'hrp-test', delegationRef: token('dg_') }, fieldAllowlist: ['identitySummary'] };
check('F06 query parses', true, () => api.TalentContextReadQueryRequestSchema.safeParse(query).success);
check('F06 query rejects laborProfileVersion', false, () => api.TalentContextReadQueryRequestSchema.safeParse({ ...query, target: { ...query.target, laborProfileVersion: 1 } }).success);
const result = { schemaVersion: '1', correlationId: query.correlationId, organizationId: query.organizationId, target: query.target, resolvedAt: '2026-09-23T10:00:00.000Z', identitySummary: { schemaVersion: '1', displayOnly: true, fullNameRedacted: 'N•• V•• A••' }, unavailableFields: [] };
check('F06 result parses', true, () => api.TalentContextReadResultSchema.safeParse(result).success);
check('F06 result rejects snapshotVersion', false, () => api.TalentContextReadResultSchema.safeParse({ ...result, snapshotVersion: 1 }).success);
const errorBase = { schemaVersion: '1', status: 'FAILED', correlationId: query.correlationId };
check('F06 seven-code parser accepts NOT_FOUND triple', 'QUERY_ERROR', () => api.parseTalentContextReadResponse(404, { ...errorBase, errors: [{ code: 'NOT_FOUND', messageKey: 'errors.talentContext.notFound', retryClass: 'NEVER' }] }).status);
check('F06 query parser rejects command-only error', 'PROTOCOL_ERROR', () => api.parseTalentContextReadResponse(409, { ...errorBase, errors: [{ code: 'VERSION_CONFLICT', messageKey: 'errors.versionConflict', retryClass: 'REFRESH_AND_REVIEW' }] }).status);
const authoritative = JSON.parse(git('show', '49f2dbc34cae66e8d63df5dd5d8cec0c008c4623:reconciliation/hrp/CONTRACT-02B-conformance-response/r2/REDACTION-VECTORS.json'));
const fixture = JSON.parse(blob('packages/contracts/tests/fixtures/redaction-vectors.fixtures.json'));
check('F06 authoritative vector count', 22, () => authoritative.vectors.length);
check('F06 fixture preserves exact 22 vectors', true, () => isDeepStrictEqual(authoritative.vectors, fixture.vectors));
check('F06 all authoritative vector outcomes match', true, () => authoritative.vectors.every((vector) => {
  if (!vector.requested) {
    const conformance = api.checkResultConformance(['placementCase'], { success: true, redacted: 'never-used' });
    return conformance.identitySummary === undefined && isDeepStrictEqual(conformance.unavailableFields, ['placementCase']);
  }
  const outcome = api.redactFullName(vector.input);
  const conformance = api.checkResultConformance(['identitySummary'], outcome);
  return vector.expectedName === null
    ? conformance.identitySummary === undefined && isDeepStrictEqual(conformance.unavailableFields, ['identitySummary'])
    : conformance.identitySummary?.fullNameRedacted === vector.expectedName && isDeepStrictEqual(conformance.unavailableFields, []);
}));

const summary = { total: records.length, pass: records.filter((record) => record.pass).length, fail: records.filter((record) => !record.pass).length };
fs.writeFileSync(path.join(here, 'regression-results.json'), JSON.stringify({ reviewedSha, observedAt: new Date().toISOString(), node: process.version, summary, records }, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(here, 'generator-verify.log'), `${verify.stdout}${verify.stderr}\nEXIT_CODE=${verify.status}\n`, 'utf8');
console.log(JSON.stringify(summary));
process.exitCode = summary.fail ? 1 : 0;
