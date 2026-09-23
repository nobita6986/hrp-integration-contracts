import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.HRP_REVIEW_ROOT ?? execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: here, encoding: 'utf8' }).trim();
const api = await import(pathToFileURL(path.join(root, 'packages/contracts/dist/index.js')).href);
const reviewedSha = '2eb6bd155399d5e0490c5a2b0c5037a57dc36bc3';
const token = (prefix) => prefix + Buffer.alloc(32, 255).toString('base64url');
const scope = 'talent-context:read:identitySummary';
const header = { alg: 'RS256', typ: 'hrp-crm-service+jwt', kid: 'key-1' };
const binding = { organizationId: 'org-test', crmSubject: 'crm-test', crmSessionHandle: 'session-test', crmSessionDeadline: '2026-09-23T10:00:00Z', callbackId: 'callback-test' };
const claims = { iss: 'urn:test:issuer', sub: 'svc-test', serviceId: 'svc-test', aud: 'urn:test:query', iat: 100, exp: 130, jti: token('jt_'), scope: [scope], binding, request: { method: 'POST', path: '/api/integrations/crm/talent-context/query', bodySha256: 'a'.repeat(64) }, actor: { kind: 'DELEGATED_USER', serviceId: 'svc-test', userId: 'hrp-test', delegationRef: token('dg_') } };
const opts = { operation: 'query', query: true, serviceId: 'svc-test', expectedIssuer: claims.iss, expectedAudience: claims.aud, method: claims.request.method, path: claims.request.path, bodySha256: claims.request.bodySha256, organizationId: binding.organizationId, crmSubject: binding.crmSubject, verifierNowSeconds: 120, protectedHeader: header };
const records = [];

function probe(id, expected, mutate = () => {}, rawHeader = JSON.stringify(header)) {
  const input = { claims: structuredClone(claims), opts: structuredClone(opts) };
  mutate(input);
  let result;
  try {
    result = api.validateAssertionFromWire(rawHeader, { ...input.opts, claims: input.claims });
  } catch (error) {
    result = { threw: error.message };
  }
  const pass = result.ok === expected;
  records.push({ id, expected, actual: result.ok ?? null, pass, result });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}: ${JSON.stringify({ expected, actual: result.ok, layer: result.layer, reason: result.reason })}`);
}

probe('CONTROL canonical query', true);
probe('CONTROL canonical create', true, (x) => { delete x.claims.actor; x.opts.operation = 'create'; x.opts.query = false; });
probe('CONTROL canonical exchange', true, (x) => { delete x.claims.actor; x.opts.operation = 'exchange'; x.opts.query = false; });
probe('CONTROL canonical cleanup', true, (x) => { delete x.claims.actor; x.opts.operation = 'cleanup'; x.opts.query = false; });
probe('F01 strict generic JWT rejected', false, () => {}, JSON.stringify({ ...header, typ: 'JWT' }));
probe('F01 raw escaped duplicate rejected through wire entrypoint', false, () => {}, '{"alg":"RS256","typ":"hrp-crm-service+jwt","kid":"a","\\u006bid":"key-1"}');
probe('F01 raw nested duplicate rejected through wire entrypoint', false, () => {}, '{"alg":"RS256","typ":"hrp-crm-service+jwt","kid":"key-1","extra":{"x":1,"x":2}}');
probe('F01 wrong issuer rejected with valid canonical header', false, (x) => { x.claims.iss = 'urn:wrong'; });
probe('F01 nbf rejected with valid canonical header', false, (x) => { x.claims.nbf = 100; });
probe('F01 organizationIdDigest rejected with valid canonical header', false, (x) => { x.claims.organizationIdDigest = 'b'.repeat(64); });
probe('F01 future iat beyond skew rejected', false, (x) => { x.claims.iat = 151; x.claims.exp = 181; });
probe('F01 exp plus skew boundary rejected', false, (x) => { x.opts.verifierNowSeconds = 160; });
probe('F01 wrong body hash rejected with valid canonical header', false, (x) => { x.claims.request.bodySha256 = 'b'.repeat(64); });
probe('F01-A missing serviceId rejected', false, (x) => { delete x.claims.serviceId; });
probe('F01-A numeric serviceId rejected', false, (x) => { x.claims.serviceId = 7; });
probe('F01-A string scope rejected', false, (x) => { x.claims.scope = scope; });
probe('F01-A unknown role claim rejected', false, (x) => { x.claims.role = 'ADMIN'; });
probe('F01-A unknown binding field rejected', false, (x) => { x.claims.binding.extra = true; });
probe('F01-A unknown request field rejected', false, (x) => { x.claims.request.extra = true; });
probe('F01-A unknown actor field rejected', false, (x) => { x.claims.actor.extra = true; });
probe('F01-A legacy flipped binding request rejected', false, (x) => { x.claims.binding = { ...x.claims.request }; x.claims.request = { organizationId: binding.organizationId, crmSubject: binding.crmSubject, delegationRef: token('dg_') }; });
probe('F01-B invalid callbackId grammar rejected', false, (x) => { x.claims.binding.callbackId = 'bad id'; });
probe('F01-B callbackId overlimit rejected', false, (x) => { x.claims.binding.callbackId = 'a'.repeat(65); });
probe('F01-B empty crmSessionHandle rejected', false, (x) => { x.claims.binding.crmSessionHandle = ''; });
probe('F01-B invalid crmSessionHandle grammar rejected', false, (x) => { x.claims.binding.crmSessionHandle = '_bad'; });
probe('F01-B crmSessionHandle overlimit rejected', false, (x) => { x.claims.binding.crmSessionHandle = 'a'.repeat(129); });
probe('F01-B impossible date rejected', false, (x) => { x.claims.binding.crmSessionDeadline = '2026-02-30T10:00:00Z'; });
probe('F01-B offset timestamp rejected', false, (x) => { x.claims.binding.crmSessionDeadline = '2026-09-23T17:00:00+07:00'; });
probe('F01-B invalid actor userId grammar rejected', false, (x) => { x.claims.actor.userId = 'bad id'; });
probe('F01-B actor userId overlimit rejected', false, (x) => { x.claims.actor.userId = 'a'.repeat(129); });
probe('F01-B invalid actor delegation token rejected', false, (x) => { x.claims.actor.delegationRef = 'dg_bad'; });
probe('F01-C actor service mismatch rejected', false, (x) => { x.claims.actor.serviceId = 'other-service'; });
probe('F01-C query operation with query false cannot drop actor', false, (x) => { delete x.claims.actor; x.opts.query = false; });
probe('F01-C query operation with omitted flag cannot drop actor', false, (x) => { delete x.claims.actor; delete x.opts.query; });
probe('F01-C create operation cannot accept actor via query flag', false, (x) => { x.opts.operation = 'create'; });
probe('F01-C exchange operation cannot accept actor via query flag', false, (x) => { x.opts.operation = 'exchange'; });
probe('F01-C cleanup operation cannot accept actor via query flag', false, (x) => { x.opts.operation = 'cleanup'; });
probe('F01-D TTL override cannot relax 60 second cap', false, (x) => { x.claims.exp = 161; x.opts.ttlSeconds = 120; });
probe('F01-D skew override cannot relax 30 second cap', false, (x) => { x.opts.verifierNowSeconds = 160; x.opts.skewSeconds = 60; });
probe('F01-D method profile remains POST with matching context', false, (x) => { x.claims.request.method = 'GET'; x.opts.method = 'GET'; });
probe('F01-D bodySha256 remains lower hex with matching context', false, (x) => { x.claims.request.bodySha256 = 'A'.repeat(64); x.opts.bodySha256 = 'A'.repeat(64); });

const summary = { total: records.length, pass: records.filter((record) => record.pass).length, fail: records.filter((record) => !record.pass).length };
const result = { reviewedSha, observedAt: new Date().toISOString(), node: process.version, summary, records };
fs.writeFileSync(path.join(here, 'canonical-results.json'), JSON.stringify(result, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(summary));
process.exitCode = summary.fail ? 1 : 0;
