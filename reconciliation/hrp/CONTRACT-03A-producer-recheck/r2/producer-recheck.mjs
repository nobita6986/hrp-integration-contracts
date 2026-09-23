import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as api from '../../../../packages/contracts/dist/index.js';

// HRP producer-side corrected-expectation probes from HRP-CRM-MSG-032.
// These are not the CRM old-bug reproducer assertions. No network, DB,
// endpoint, auth, replay-store, package-publish, consumer, pilot, or deploy
// operation is performed.

const reviewedSha = '7c804c92ff8105596383b13ef9f9546617d69b6e';
const priorProducerEvidence = 'c8786c0fa2a2569cd26f0654d34978a4f8d397f9';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..', '..');
const git = (...args) => execFileSync('git', args, { cwd: root });
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

assert.equal(git('rev-parse', 'HEAD').toString().trim(), reviewedSha);

function committed(pathname) {
  return git('show', `${reviewedSha}:${pathname}`);
}

function parseManifest(manifestPath) {
  const raw = committed(manifestPath);
  const text = new TextDecoder('utf-8', { fatal: true }).decode(raw);
  const entries = text
    .split(/\n/u)
    .filter((line) => line.trim() && !line.startsWith('#'))
    .map((line) => {
      const match = line.match(/^([0-9a-f]{64})  (.+)$/u);
      if (!match) return { line, malformed: true };
      const blob = committed(match[2]);
      let utf8 = true;
      try {
        new TextDecoder('utf-8', { fatal: true }).decode(blob);
      } catch {
        utf8 = false;
      }
      const actual = sha256(blob);
      return {
        path: match[2],
        expected: match[1],
        actual,
        match: match[1] === actual,
        encoding: {
          utf8,
          bom: blob.length >= 3 && blob[0] === 0xef && blob[1] === 0xbb && blob[2] === 0xbf,
          nul: blob.includes(0),
          crlf: blob.includes(13),
        },
      };
    });
  return { path: manifestPath, rawSha256: sha256(raw), entries };
}

const contractsManifest = parseManifest('packages/contracts/manifest.sha256');
const bundleManifest = parseManifest('reconciliation/crm/CONTRACT-03A/r2/manifest.txt');

const expectedContracts = git(
  'ls-tree', '-r', '--name-only', reviewedSha, '--', 'packages/contracts',
).toString('utf8').trim().split(/\r?\n/u).filter((pathname) =>
  pathname &&
  !pathname.includes('node_modules/') &&
  !pathname.includes('dist/') &&
  !pathname.endsWith('.gitignore') &&
  !pathname.endsWith('manifest.sha256') &&
  /\.(ts|mjs|cjs|json|md)$/u.test(pathname)
).sort();

const expectedBundle = git(
  'ls-tree', '-r', '--name-only', reviewedSha, '--', 'reconciliation/crm/CONTRACT-03A/r2',
).toString('utf8').trim().split(/\r?\n/u).filter((pathname) =>
  pathname && !pathname.endsWith('manifest.txt')
).sort();

function coverage(expected, manifest) {
  const covered = manifest.entries.filter((entry) => !entry.malformed).map((entry) => entry.path).sort();
  return {
    expected: expected.length,
    covered: covered.length,
    missing: expected.filter((pathname) => !covered.includes(pathname)),
    extra: covered.filter((pathname) => !expected.includes(pathname)),
  };
}

const manifestBefore = [contractsManifest.rawSha256, bundleManifest.rawSha256];
const generator = spawnSync(
  process.execPath,
  ['packages/contracts/scripts/generate-manifest.mjs', '--verify'],
  { cwd: root, encoding: 'utf8' },
);
const manifestAfter = [
  sha256(fs.readFileSync(path.join(root, 'packages/contracts/manifest.sha256'))),
  sha256(fs.readFileSync(path.join(root, 'reconciliation/crm/CONTRACT-03A/r2/manifest.txt'))),
];

const allManifestEntries = [...contractsManifest.entries, ...bundleManifest.entries];
const manifestEvidence = {
  reviewedSha,
  manifests: [contractsManifest, bundleManifest],
  entryCount: allManifestEntries.length,
  matchCount: allManifestEntries.filter((entry) => entry.match).length,
  malformedCount: allManifestEntries.filter((entry) => entry.malformed).length,
  coverage: {
    contracts: coverage(expectedContracts, contractsManifest),
    bundle: coverage(expectedBundle, bundleManifest),
  },
  encoding: {
    invalidUtf8OrNul: allManifestEntries
      .filter((entry) => entry.encoding && (!entry.encoding.utf8 || entry.encoding.nul))
      .map((entry) => entry.path),
    utf8Bom: allManifestEntries.filter((entry) => entry.encoding?.bom).map((entry) => entry.path),
    crlf: allManifestEntries.filter((entry) => entry.encoding?.crlf).map((entry) => entry.path),
  },
  generatorVerify: {
    exit: generator.status,
    stdout: generator.stdout,
    stderr: generator.stderr,
    readOnly: JSON.stringify(manifestBefore) === JSON.stringify(manifestAfter),
    before: manifestBefore,
    after: manifestAfter,
  },
};

const records = [];
function check(finding, id, expected, fn) {
  let actual;
  try {
    actual = fn();
  } catch (error) {
    actual = { threw: error instanceof Error ? error.message : String(error) };
  }
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  records.push({ finding, id, expected, actual, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${finding} ${id}: ${JSON.stringify(actual)}`);
}

const token = (prefix, bytes = Buffer.alloc(32)) => prefix + bytes.toString('base64url');
const binding = {
  organizationId: 'org-test',
  crmSubject: 'crm-test',
  crmSessionHandle: 'session-test',
  crmSessionDeadline: '2026-09-23T10:00:00Z',
  callbackId: 'callback-test',
};
const actor = {
  kind: 'DELEGATED_USER',
  serviceId: 'svc-test',
  userId: 'hrp-test',
  delegationRef: token('dg_'),
};
const canonicalClaims = {
  iss: 'urn:test:issuer',
  sub: 'svc-test',
  serviceId: 'svc-test',
  aud: 'urn:test:query',
  iat: 100,
  exp: 130,
  jti: token('jt_'),
  scope: [api.SINGLE_SCOPE_LITERAL],
  binding,
  request: {
    method: 'POST',
    path: '/api/integrations/crm/talent-context/query',
    bodySha256: 'a'.repeat(64),
  },
  actor,
};

check('F-01', 'accepted EP-01 query claims accepted', true,
  () => api.validateClaimsObject(canonicalClaims).ok);
check('F-01', 'request-binding helper fails closed when context absent', false,
  () => api.validateRequestBinding({ binding: undefined, request: undefined }, {}).ok);
check('F-01', 'escaped-equivalent duplicate key rejected', false,
  () => api.parseAssertionHeader('{"iss":"a","\\u0069ss":"b"}').ok);
check('F-01', 'nested duplicate key rejected', false,
  () => api.parseAssertionHeader('{"binding":{"organizationId":"a","organizationId":"b"}}').ok);
check('F-01', 'exported parser rejects alg none', false,
  () => api.parseAssertionHeader('{"alg":"none","typ":"wrong","kid":"k","jku":"https://invalid.example/key"}').ok);

const mixedBytes = Buffer.from(Array.from({ length: 32 }, (_, index) => (index % 2 === 0 ? 0xfb : 0xff)));
const mixedPayload = mixedBytes.toString('base64url');
assert.equal(mixedPayload.includes('-'), true);
assert.equal(mixedPayload.includes('_'), true);
for (const [schemaName, prefix] of [
  ['PendingRequestIdSchema', 'pd_'],
  ['HandoffProofSchema', 'hp_'],
  ['ReceiptSchema', 'rc_'],
  ['DelegationRefSchema', 'dg_'],
  ['CallbackStateSchema', 'st_'],
  ['JtiSchema', 'jt_'],
  ['CsrfTokenSchema', 'cs_'],
]) {
  check('F-03', `${schemaName} accepts canonical -/_ payload`, true,
    () => api[schemaName].safeParse(prefix + mixedPayload).success);
  check('F-03', `${schemaName} rejects noncanonical pad bits`, false,
    () => api[schemaName].safeParse(prefix + 'A'.repeat(42) + 'B').success);
}
check('F-03', 'query actor accepts canonical -/_ delegationRef', true,
  () => api.QueryDelegatedUserActorSchema.safeParse({ ...actor, delegationRef: 'dg_' + mixedPayload }).success);

const create = { ...binding, requestedScopes: [api.SINGLE_SCOPE_LITERAL], callbackState: token('st_') };
const exchange = { ...binding, receipt: token('rc_') };
const cancel = { ...binding, reason: 'USER_CANCELLED' };
const revoke = { ...binding, delegationRef: token('dg_'), reason: 'USER_CANCELLED' };
for (const [name, schema, body] of [
  ['create', api.CreateDelegationRequestSchema, create],
  ['exchange', api.ExchangeDelegationRequestSchema, exchange],
  ['cancel', api.CancelDelegationRequestSchema, cancel],
  ['revoke', api.RevokeDelegationRequestSchema, revoke],
]) {
  check('F-04', `${name} rejects callback whitespace`, false,
    () => schema.safeParse({ ...body, callbackId: 'bad id' }).success);
  check('F-04', `${name} rejects session newline`, false,
    () => schema.safeParse({ ...body, crmSessionHandle: 'bad\nhandle' }).success);
  check('F-04', `${name} rejects timezone offset`, false,
    () => schema.safeParse({ ...body, crmSessionDeadline: '2026-09-23T17:00:00+07:00' }).success);
  check('F-04', `${name} rejects nonexistent Gregorian date`, false,
    () => schema.safeParse({ ...body, crmSessionDeadline: '2026-02-30T10:00:00Z' }).success);
}
check('F-04', 'binding rejects opaque identifier with underscore initial', false,
  () => api.CrmBindingSchema.safeParse({ ...binding, crmSessionHandle: '_session' }).success);

check('F-05', 'FEFF rejected', false, () => api.redactFullName('\uFEFFAlpha').success);
check('F-05', 'oversized redaction omitted', false,
  () => api.redactFullName('Q' + '\u0301'.repeat(254) + 'b').success);
check('F-05', 'oversized result rejected at schema layer', false,
  () => api.IdentitySummarySchema.safeParse({
    schemaVersion: '1', fullNameRedacted: '\u2022'.repeat(512), displayOnly: true,
  }).success);
for (const [name, input, expected] of [
  ['Arabic', '\u0639\u0644\u064a', '\u0639\u2022\u2022'],
  ['Hangul', '\ud64d\uae38\ub3d9', '\ud64d\u2022\u2022'],
  ['Deseret', '\u{10400}\u{10401}', '\u{10400}\u2022\u2022'],
]) {
  check('F-05', `${name} Unicode-letter name redacted`, expected,
    () => api.redactFullName(input).redacted ?? null);
}

const fixture = JSON.parse(fs.readFileSync(
  path.join(root, 'packages/contracts/tests/fixtures/redaction-vectors.fixtures.json'), 'utf8',
));
for (const vector of fixture.vectors) {
  const expectedUnavailableFields =
    vector.requested && vector.expectedName === null ? ['identitySummary'] : [];
  if (vector.requested) {
    check('F-06', `pinned vector ${vector.id}`,
      { name: vector.expectedName, unavailable: expectedUnavailableFields }, () => {
        const result = api.checkResultConformance(['identitySummary'], api.redactFullName(vector.input));
        return {
          name: result.identitySummary?.fullNameRedacted ?? null,
          unavailable: result.unavailableFields,
        };
      });
  } else {
    check('F-06', `pinned vector ${vector.id} identity omitted when unrequested`,
      { name: vector.expectedName, unavailable: expectedUnavailableFields }, () => {
        const result = api.checkResultConformance(['placementCase'], api.redactFullName(vector.input));
        assert.deepEqual(result.unavailableFields, ['placementCase']);
        return {
          name: result.identitySummary?.fullNameRedacted ?? null,
          unavailable: result.unavailableFields.filter((field) => field === 'identitySummary'),
        };
      });
  }
}

const byFinding = Object.fromEntries(
  [...new Set(records.map((record) => record.finding))].map((finding) => {
    const scoped = records.filter((record) => record.finding === finding);
    return [finding, {
      total: scoped.length,
      pass: scoped.filter((record) => record.pass).length,
      fail: scoped.filter((record) => !record.pass).length,
    }];
  }),
);
const manifestPass =
  manifestEvidence.entryCount === manifestEvidence.matchCount &&
  manifestEvidence.malformedCount === 0 &&
  manifestEvidence.coverage.contracts.missing.length === 0 &&
  manifestEvidence.coverage.contracts.extra.length === 0 &&
  manifestEvidence.coverage.bundle.missing.length === 0 &&
  manifestEvidence.coverage.bundle.extra.length === 0 &&
  manifestEvidence.encoding.invalidUtf8OrNul.length === 0 &&
  manifestEvidence.generatorVerify.exit === 0 &&
  manifestEvidence.generatorVerify.readOnly;

const result = {
  messageId: 'HRP-CRM-MSG-034',
  respondsTo: 'CRM-HRP-MSG-033',
  reviewedSha,
  priorProducerEvidence,
  observedAt: new Date().toISOString(),
  node: process.version,
  manifestEvidence,
  correctedExpectationProbes: {
    total: records.length,
    pass: records.filter((record) => record.pass).length,
    fail: records.filter((record) => !record.pass).length,
    byFinding,
    records,
  },
  verdict: manifestPass && records.every((record) => record.pass) ? 'PASS' : 'CHANGES_REQUIRED',
};

fs.writeFileSync(
  path.join(here, 'producer-recheck-results.json'),
  JSON.stringify(result, null, 2) + '\n',
  'utf8',
);
console.log(JSON.stringify({
  verdict: result.verdict,
  manifestPass,
  correctedExpectationProbes: {
    total: result.correctedExpectationProbes.total,
    pass: result.correctedExpectationProbes.pass,
    fail: result.correctedExpectationProbes.fail,
    byFinding,
  },
}, null, 2));
process.exitCode = result.verdict === 'PASS' ? 0 : 1;
