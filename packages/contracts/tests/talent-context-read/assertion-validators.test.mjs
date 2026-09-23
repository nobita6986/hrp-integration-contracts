import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseAssertionHeader,
  AssertionClaimsSchema,
  validateClaimsObject,
  validateTtlSkew,
  validateAudience,
  validateSubject,
  validateRequestBinding,
  actorForOperation,
  BACKEND_OPERATIONS,
  ASSERTION_LIMITS,
  validateAssertionProfile,
  OPERATION_AUDIENCE,
} from '../../dist/index.js'

import { encodeBase64Url } from '../../dist/index.js';
function canonicalTokenOfSeed(seed) {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) bytes[i] = (seed + i) & 0xff;
  return encodeBase64Url(bytes);
}
const canonicalTokenA = canonicalTokenOfSeed(1);
const canonicalTokenB = canonicalTokenOfSeed(2);
const canonicalBodySha = ('a'.repeat(64));

// ============================================================================
// F-01 - Assertion/profile validators (correction batch 2).
//
// These tests MUST call the actual exported `validateAssertionProfile`
// entrypoint for the profile-PASS cases. Individual helpers are called
// directly only to confirm failure layering (raw/header/claims/ttl/...),
// not to establish a profile PASS.
// ============================================================================

// 32 random base64url bytes, valid for canonical JtiSchema.
const JT = 'jt_' + canonicalTokenA;
const JT_BAD_ALPHABET = 'jt_' + '!'.repeat(43); // non-base64url char.
const JT_TOO_SHORT = 'jt_' + 'A'.repeat(20);
const SAFE_BODY_SHA = canonicalBodySha;
const ORG_ID = 'OrgId_One';
const SUBJECT = 'Subject_One';
const DELEGATION_REF = 'dg_' + canonicalTokenB;

function buildValidHeader() {
  return { alg: 'HS256', typ: 'JWT', kid: 'kidsafe' };
}

function buildValidClaims() {
  return {
    iss: 'issuer1',
    aud: OPERATION_AUDIENCE.exchange,
    sub: 'serviceId-1',
    jti: JT,
    iat: 100,
    exp: 130,
    scope: 'talent-context:read:identitySummary',
    binding: {
      method: 'POST',
      path: '/api/exchange',
      bodySha256: SAFE_BODY_SHA,
    },
    request: {
      organizationId: ORG_ID,
      crmSubject: SUBJECT,
      delegationRef: DELEGATION_REF,
    },
  };
}

describe('F-01 raw framing + duplicate-key detection', () => {
  test('rejects empty string', () => {
    assert.equal(parseAssertionHeader('').ok, false);
  });
  test('rejects oversize string', () => {
    assert.equal(parseAssertionHeader('x'.repeat(8193)).ok, false);
  });
  test('rejects non-string', () => {
    assert.equal(parseAssertionHeader(123).ok, false);
    assert.equal(parseAssertionHeader(null).ok, false);
    assert.equal(parseAssertionHeader({}).ok, false);
  });
  test('rejects non-brace prefix', () => {
    assert.equal(parseAssertionHeader('[]').ok, false);
    assert.equal(parseAssertionHeader('"x"').ok, false);
  });
  test('rejects raw control characters', () => {
    assert.equal(parseAssertionHeader('{"a\u0001":1}').ok, false);
    assert.equal(parseAssertionHeader('{"a\u001B":1}').ok, false);
  });
  test('rejects raw FEFF', () => {
    assert.equal(parseAssertionHeader('\uFEFF{"a":1}').ok, false);
  });
  test('rejects raw bidi control in framing', () => {
    assert.equal(parseAssertionHeader('{"a\u202E":1}').ok, false);
  });
  test('rejects invalid JSON', () => {
    assert.equal(parseAssertionHeader('{not json}').ok, false);
  });
  test('detects duplicate top-level key even when JSON.parse would keep only the last', () => {
    const raw = '{"iss":"a","iss":"b"}';
    const out = parseAssertionHeader(raw);
    assert.equal(out.ok, false);
    assert.match(out.reason, /duplicate top-level key/);
  });
  test('parses valid header', () => {
    const out = parseAssertionHeader('{"iss":"a","aud":"b","sub":"c","jti":"jt_' + canonicalTokenA + '","iat":1,"exp":2}');
    assert.equal(out.ok, true);
  });
});

describe('F-01 parsed-claims validation is separate from framing', () => {
  test('missing iat rejected', () => {
    const r = validateClaimsObject({ iss: 'a', aud: 'b', sub: 'c', jti: JT, exp: 2 });
    assert.equal(r.ok, false);
  });
  test('extra field rejected (.strict)', () => {
    const r = validateClaimsObject({
      iss: 'a', aud: 'b', sub: 'c', jti: JT, iat: 1, exp: 2, alg: 'HS256',
    });
    assert.equal(r.ok, false);
  });
  test('iat must be integer (no fractional)', () => {
    const r = validateClaimsObject({
      iss: 'a', aud: 'b', sub: 'c', jti: JT, iat: 1.5, exp: 60,
    });
    assert.equal(r.ok, false);
  });
  test('exp must be integer', () => {
    const r = validateClaimsObject({
      iss: 'a', aud: 'b', sub: 'c', jti: JT, iat: 1, exp: 60.5,
    });
    assert.equal(r.ok, false);
  });
  test('non-canonical JTI rejected at claims layer', () => {
    const r = validateClaimsObject({
      iss: 'a', aud: 'b', sub: 'c', jti: JT_BAD_ALPHABET, iat: 1, exp: 60,
    });
    assert.equal(r.ok, false);
  });
  test('too-short JTI rejected at claims layer', () => {
    const r = validateClaimsObject({
      iss: 'a', aud: 'b', sub: 'c', jti: JT_TOO_SHORT, iat: 1, exp: 60,
    });
    assert.equal(r.ok, false);
  });
  test('valid claims pass', () => {
    const r = validateClaimsObject(buildValidClaims());
    assert.equal(r.ok, true);
  });
  test('missing binding rejected', () => {
    const c = buildValidClaims();
    delete c.binding;
    assert.equal(validateClaimsObject(c).ok, false);
  });
  test('missing request rejected', () => {
    const c = buildValidClaims();
    delete c.request;
    assert.equal(validateClaimsObject(c).ok, false);
  });
});

describe('F-01 TTL/skew rules', () => {
  test('exp must be > iat', () => {
    const c = buildValidClaims();
    const res = validateTtlSkew({ iat: c.iat, exp: c.iat }, { nowSeconds: 100 });
    assert.equal(res.ok, false);
  });
  test('TTL > cap (default 60s) rejected', () => {
    const res = validateTtlSkew({ iat: 100, exp: 200 }, { nowSeconds: 100 });
    assert.equal(res.ok, false);
  });
  test('within TTL/skew passes', () => {
    const res = validateTtlSkew({ iat: 100, exp: 130 }, { nowSeconds: 100, skewSeconds: 30, ttlSeconds: 60 });
    assert.equal(res.ok, true);
  });
  test('boundary: now == exp + 30s rejected', () => {
    const res = validateTtlSkew({ iat: 100, exp: 130 }, { nowSeconds: 160, skewSeconds: 30, ttlSeconds: 60 });
    assert.equal(res.ok, false);
  });
  test('boundary: now < exp + 30s accepted', () => {
    const res = validateTtlSkew({ iat: 100, exp: 130 }, { nowSeconds: 159, skewSeconds: 30, ttlSeconds: 60 });
    assert.equal(res.ok, true);
  });
  test('expired beyond skew rejected', () => {
    const res = validateTtlSkew({ iat: 100, exp: 130 }, { nowSeconds: 200, skewSeconds: 30, ttlSeconds: 60 });
    assert.equal(res.ok, false);
  });
  test('iat in the future rejected', () => {
    const res = validateTtlSkew({ iat: 100, exp: 130 }, { nowSeconds: 60, skewSeconds: 30, ttlSeconds: 60 });
    assert.equal(res.ok, false);
  });
});

describe('F-01 audience must equal expectedAudience (per op)', () => {
  test('audience match passes', () => {
    const res = validateAudience({ aud: OPERATION_AUDIENCE.exchange }, { audience: OPERATION_AUDIENCE.exchange });
    assert.equal(res.ok, true);
  });
  test('audience mismatch rejected', () => {
    const res = validateAudience({ aud: 'other' }, { audience: OPERATION_AUDIENCE.exchange });
    assert.equal(res.ok, false);
  });
  test('operation audience is distinct across operations', () => {
    assert.notEqual(OPERATION_AUDIENCE.create, OPERATION_AUDIENCE.exchange);
    assert.notEqual(OPERATION_AUDIENCE.exchange, OPERATION_AUDIENCE.cleanup);
  });
});

describe('F-01 subject must equal serviceId', () => {
  test('matching serviceId passes', () => {
    assert.equal(validateSubject({ sub: 'svc1' }, { serviceId: 'svc1' }).ok, true);
  });
  test('non-matching serviceId rejected', () => {
    assert.equal(validateSubject({ sub: 'svcX' }, { serviceId: 'svc1' }).ok, false);
  });
});

describe('F-01 request binding (method/path/bodySha256 + organizationId/crmSubject)', () => {
  function claimsBinding() {
    return {
      binding: { method: 'POST', path: '/api/exchange', bodySha256: SAFE_BODY_SHA },
      request: { organizationId: ORG_ID, crmSubject: SUBJECT, delegationRef: DELEGATION_REF },
    };
  }
  test('all matching passes', () => {
    assert.equal(
      validateRequestBinding(claimsBinding(), {
        method: 'POST',
        path: '/api/exchange',
        bodySha256: SAFE_BODY_SHA,
        organizationId: ORG_ID,
        crmSubject: SUBJECT,
      }).ok,
      true,
    );
  });
  test('method mismatch rejected', () => {
    assert.equal(
      validateRequestBinding(claimsBinding(), {
        method: 'GET',
        path: '/api/exchange',
        bodySha256: SAFE_BODY_SHA,
        organizationId: ORG_ID,
        crmSubject: SUBJECT,
      }).ok,
      false,
    );
  });
  test('path mismatch rejected', () => {
    assert.equal(
      validateRequestBinding(claimsBinding(), {
        method: 'POST',
        path: '/other',
        bodySha256: SAFE_BODY_SHA,
        organizationId: ORG_ID,
        crmSubject: SUBJECT,
      }).ok,
      false,
    );
  });
  test('bodySha256 mismatch rejected', () => {
    assert.equal(
      validateRequestBinding(claimsBinding(), {
        method: 'POST',
        path: '/api/exchange',
        bodySha256: 'z'.repeat(64),
        organizationId: ORG_ID,
        crmSubject: SUBJECT,
      }).ok,
      false,
    );
  });
  test('organizationId mismatch rejected', () => {
    assert.equal(
      validateRequestBinding(claimsBinding(), {
        method: 'POST',
        path: '/api/exchange',
        bodySha256: SAFE_BODY_SHA,
        organizationId: 'OTHER',
        crmSubject: SUBJECT,
      }).ok,
      false,
    );
  });
  test('crmSubject mismatch rejected', () => {
    assert.equal(
      validateRequestBinding(claimsBinding(), {
        method: 'POST',
        path: '/api/exchange',
        bodySha256: SAFE_BODY_SHA,
        organizationId: ORG_ID,
        crmSubject: 'OTHER',
      }).ok,
      false,
    );
  });
});

describe('F-01 actor per operation profile', () => {
  test('all 3 ops recognized', () => {
    assert.equal(BACKEND_OPERATIONS.length, 3);
    for (const op of BACKEND_OPERATIONS) {
      const r = actorForOperation(op);
      assert.equal(r.ok, true);
    }
  });
  test('unknown operation rejected', () => {
    const r = actorForOperation('unknown');
    assert.equal(r.ok, false);
  });
  test('create does not require effective user but does require active CRM session', () => {
    const r = actorForOperation('create');
    assert.equal(r.required.requireEffectiveHrpUser, false);
    assert.equal(r.required.requireActiveCrmSession, true);
  });
  test('exchange requires both', () => {
    const r = actorForOperation('exchange');
    assert.equal(r.required.requireEffectiveHrpUser, true);
    assert.equal(r.required.requireActiveCrmSession, true);
  });
  test('cleanup does not require active session (past deadline accepted)', () => {
    const r = actorForOperation('cleanup');
    assert.equal(r.required.requireActiveCrmSession, false);
  });
});

describe('F-01 limits exported', () => {
  test('ASSERTION_LIMITS includes MAX_HEADER_LEN/DEFAULT_TTL/DEFAULT_SKEW', () => {
    assert.equal(ASSERTION_LIMITS.MAX_HEADER_LEN, 8192);
    assert.equal(ASSERTION_LIMITS.DEFAULT_TTL_SECONDS, 60);
    assert.equal(ASSERTION_LIMITS.DEFAULT_SKEW_SECONDS, 30);
  });
});

describe('F-01 single consumer-facing entrypoint validateAssertionProfile', () => {
  test('profile PASS via entrypoint with valid header + claims + binding + audience', () => {
    const out = validateAssertionProfile({
      protectedHeader: buildValidHeader(),
      claims: buildValidClaims(),
      operation: 'exchange',
      serviceId: 'serviceId-1',
      expectedAudience: OPERATION_AUDIENCE.exchange,
      method: 'POST',
      path: '/api/exchange',
      bodySha256: SAFE_BODY_SHA,
      organizationId: ORG_ID,
      crmSubject: SUBJECT,
      verifierNowSeconds: 110,
    });
    assert.equal(out.ok, true);
    if (out.ok) {
      assert.equal(out.layer, 'profile');
      assert.equal(out.requiredActor.operation, 'exchange');
    }
  });
  test('header layer reject: jku not accepted', () => {
    const hdr = { ...buildValidHeader(), jku: 'https://attacker/k.json' };
    const out = validateAssertionProfile({
      protectedHeader: hdr,
      claims: buildValidClaims(),
      operation: 'exchange',
      serviceId: 'serviceId-1',
      expectedAudience: OPERATION_AUDIENCE.exchange,
      method: 'POST',
      path: '/api/exchange',
      bodySha256: SAFE_BODY_SHA,
      organizationId: ORG_ID,
      crmSubject: SUBJECT,
      verifierNowSeconds: 110,
    });
    assert.equal(out.ok, false);
    if (!out.ok) assert.equal(out.layer, 'header');
  });
  test('header layer reject: unknown alg', () => {
    const out = validateAssertionProfile({
      protectedHeader: { alg: 'none', typ: 'JWT', kid: 'k' },
      claims: buildValidClaims(),
      operation: 'exchange',
      serviceId: 'serviceId-1',
      expectedAudience: OPERATION_AUDIENCE.exchange,
      method: 'POST',
      path: '/api/exchange',
      bodySha256: SAFE_BODY_SHA,
      organizationId: ORG_ID,
      crmSubject: SUBJECT,
      verifierNowSeconds: 110,
    });
    assert.equal(out.ok, false);
  });
  test('audience layer reject: claims.aud does not match operation audience', () => {
    const c = buildValidClaims();
    c.aud = 'https://other.api/aud';
    const out = validateAssertionProfile({
      protectedHeader: buildValidHeader(),
      claims: c,
      operation: 'exchange',
      serviceId: 'serviceId-1',
      expectedAudience: OPERATION_AUDIENCE.exchange,
      method: 'POST',
      path: '/api/exchange',
      bodySha256: SAFE_BODY_SHA,
      organizationId: ORG_ID,
      crmSubject: SUBJECT,
      verifierNowSeconds: 110,
    });
    assert.equal(out.ok, false);
  });
  test('subject layer reject: sub !== serviceId', () => {
    const c = buildValidClaims();
    c.sub = 'otherService';
    const out = validateAssertionProfile({
      protectedHeader: buildValidHeader(),
      claims: c,
      operation: 'exchange',
      serviceId: 'serviceId-1',
      expectedAudience: OPERATION_AUDIENCE.exchange,
      method: 'POST',
      path: '/api/exchange',
      bodySha256: SAFE_BODY_SHA,
      organizationId: ORG_ID,
      crmSubject: SUBJECT,
      verifierNowSeconds: 110,
    });
    assert.equal(out.ok, false);
  });
  test('ttl layer reject: now == exp + 30s boundary', () => {
    const out = validateAssertionProfile({
      protectedHeader: buildValidHeader(),
      claims: buildValidClaims(),
      operation: 'exchange',
      serviceId: 'serviceId-1',
      expectedAudience: OPERATION_AUDIENCE.exchange,
      method: 'POST',
      path: '/api/exchange',
      bodySha256: SAFE_BODY_SHA,
      organizationId: ORG_ID,
      crmSubject: SUBJECT,
      verifierNowSeconds: 160, // exp=130, skew=30 => boundary.
    });
    assert.equal(out.ok, false);
  });
  test('binding layer reject: method mismatch', () => {
    const out = validateAssertionProfile({
      protectedHeader: buildValidHeader(),
      claims: buildValidClaims(),
      operation: 'exchange',
      serviceId: 'serviceId-1',
      expectedAudience: OPERATION_AUDIENCE.exchange,
      method: 'GET', // mismatch
      path: '/api/exchange',
      bodySha256: SAFE_BODY_SHA,
      organizationId: ORG_ID,
      crmSubject: SUBJECT,
      verifierNowSeconds: 110,
    });
    assert.equal(out.ok, false);
  });
  test('query surface: requires claims.actor.kind = DELEGATED_USER', () => {
    const out = validateAssertionProfile({
      protectedHeader: buildValidHeader(),
      claims: buildValidClaims(),
      operation: 'cleanup',
      serviceId: 'serviceId-1',
      expectedAudience: OPERATION_AUDIENCE.cleanup,
      method: 'POST',
      path: '/api/cleanup',
      bodySha256: SAFE_BODY_SHA,
      organizationId: ORG_ID,
      crmSubject: SUBJECT,
      verifierNowSeconds: 110,
      query: true,
    });
    assert.equal(out.ok, false);
  });
  test('issuance: rejects query actor', () => {
    const c = buildValidClaims();
    c.actor = {
      kind: 'DELEGATED_USER',
      serviceId: 'serviceId-1',
      userId: 'u1',
      delegationRef: DELEGATION_REF,
    };
    const out = validateAssertionProfile({
      protectedHeader: buildValidHeader(),
      claims: c,
      operation: 'create',
      serviceId: 'serviceId-1',
      expectedAudience: OPERATION_AUDIENCE.create,
      method: 'POST',
      path: '/api/create',
      bodySha256: SAFE_BODY_SHA,
      organizationId: ORG_ID,
      crmSubject: SUBJECT,
      verifierNowSeconds: 110,
    });
    assert.equal(out.ok, false);
  });
});
