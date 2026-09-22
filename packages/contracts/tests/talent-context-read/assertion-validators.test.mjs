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
  validateRequiredActor,
  BACKEND_OPERATIONS,
  ASSERTION_LIMITS,
} from '../../dist/index.js';

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
    const out = parseAssertionHeader('{"iss":"a","aud":"b","sub":"c","jti":"jt_' + 'A'.repeat(43) + '","iat":1,"exp":2}');
    assert.equal(out.ok, true);
  });
});

describe('F-01 parsed-claims validation is separate from framing', () => {
  test('missing iat rejected', () => {
    const r = validateClaimsObject({ iss: 'a', aud: 'b', sub: 'c', jti: 'jt_' + 'A'.repeat(43), exp: 2 });
    assert.equal(r.ok, false);
  });
  test('extra field rejected (.strict)', () => {
    const r = validateClaimsObject({
      iss: 'a', aud: 'b', sub: 'c', jti: 'jt_' + 'A'.repeat(43), iat: 1, exp: 2, alg: 'HS256',
    });
    assert.equal(r.ok, false);
  });
  test('iat must be integer (no fractional)', () => {
    const r = validateClaimsObject({
      iss: 'a', aud: 'b', sub: 'c', jti: 'jt_' + 'A'.repeat(43), iat: 1.5, exp: 60,
    });
    assert.equal(r.ok, false);
  });
  test('exp must be integer', () => {
    const r = validateClaimsObject({
      iss: 'a', aud: 'b', sub: 'c', jti: 'jt_' + 'A'.repeat(43), iat: 1, exp: 60.5,
    });
    assert.equal(r.ok, false);
  });
  test('valid claims pass', () => {
    const r = validateClaimsObject({
      iss: 'a', aud: 'b', sub: 'c', jti: 'jt_' + 'A'.repeat(43), iat: 1, exp: 60,
    });
    assert.equal(r.ok, true);
  });
});

describe('F-01 TTL/skew rules', () => {
  const validClaims = () => ({
    iss: 'a', aud: 'b', sub: 'c',
    jti: 'jt_' + 'A'.repeat(43),
    iat: 100, exp: 130,
  });

  test('exp must be > iat', () => {
    const c = validClaims(); c.exp = c.iat;
    assert.equal(validateTtlSkew(c, { nowSeconds: 100 }).ok, false);
  });
  test('TTL > cap (default 60s) rejected', () => {
    const c = validClaims(); c.exp = c.iat + 61;
    assert.equal(validateTtlSkew(c, { nowSeconds: 100 }).ok, false);
  });
  test('within TTL/skew passes', () => {
    const c = validClaims();
    assert.equal(validateTtlSkew(c, { nowSeconds: 100, skewSeconds: 30, ttlSeconds: 60 }).ok, true);
  });
  test('expired rejected', () => {
    const c = validClaims();
    assert.equal(validateTtlSkew(c, { nowSeconds: c.exp + 60, skewSeconds: 30, ttlSeconds: 60 }).ok, false);
  });
  test('iat in the future rejected', () => {
    const c = validClaims();
    assert.equal(validateTtlSkew(c, { nowSeconds: c.iat - 60, skewSeconds: 30, ttlSeconds: 60 }).ok, false);
  });
  test('nbf > iat+skew rejected', () => {
    const c = validClaims(); c.nbf = c.iat + 31;
    assert.equal(validateTtlSkew(c, { nowSeconds: 100, skewSeconds: 30, ttlSeconds: 60 }).ok, false);
  });
});

describe('F-01 audience/issuer', () => {
  const claims = () => ({
    iss: 'issuer1', aud: 'aud1', sub: 'svc-1',
    jti: 'jt_' + 'A'.repeat(43), iat: 100, exp: 130,
  });

  test('match passes', () => {
    assert.equal(validateAudience(claims(), { audience: 'aud1', issuer: 'issuer1' }).ok, true);
  });
  test('mismatch rejected', () => {
    assert.equal(validateAudience(claims(), { audience: 'OTHER' }).ok, false);
    assert.equal(validateAudience(claims(), { issuer: 'OTHER' }).ok, false);
  });
});

describe('F-01 subject must equal serviceId', () => {
  const claims = () => ({
    iss: 'i', aud: 'a', sub: 'svc1',
    jti: 'jt_' + 'A'.repeat(43), iat: 100, exp: 130,
  });

  test('matching serviceId passes', () => {
    assert.equal(validateSubject(claims(), { serviceId: 'svc1' }).ok, true);
  });
  test('non-matching serviceId rejected', () => {
    assert.equal(validateSubject(claims(), { serviceId: 'svcX' }).ok, false);
  });
});

describe('F-01 request binding', () => {
  const claims = () => ({
    iss: 'i', aud: 'a', sub: 's',
    jti: 'jt_' + 'A'.repeat(43), iat: 100, exp: 130,
    method: 'POST', path: '/api/exchange', requestHash: 'a'.repeat(64),
    organizationIdDigest: 'b'.repeat(64),
  });

  test('all matching passes', () => {
    assert.equal(validateRequestBinding(claims(), {
      method: 'POST', path: '/api/exchange', bodyHash: 'a'.repeat(64),
      organizationIdDigest: 'b'.repeat(64),
    }).ok, true);
  });
  test('method mismatch rejected', () => {
    assert.equal(validateRequestBinding(claims(), { method: 'GET' }).ok, false);
  });
  test('path mismatch rejected', () => {
    assert.equal(validateRequestBinding(claims(), { path: '/other' }).ok, false);
  });
  test('bodyHash mismatch rejected', () => {
    assert.equal(validateRequestBinding(claims(), { bodyHash: 'z'.repeat(64) }).ok, false);
  });
  test('org digest mismatch rejected', () => {
    assert.equal(validateRequestBinding(claims(), { organizationIdDigest: 'z'.repeat(64) }).ok, false);
  });
});

describe('F-01 actor per operation', () => {
  test('all 4 known operations recognized', () => {
    for (const op of BACKEND_OPERATIONS) {
      const r = actorForOperation(op);
      assert.equal(r.ok, true);
      assert.equal(validateRequiredActor(r.required).success, true);
    }
  });
  test('unknown operation rejected without fallback', () => {
    const r = actorForOperation('unknown');
    assert.equal(r.ok, false);
  });
  test('create does not require effective user but does require active CRM', () => {
    const r = actorForOperation('create');
    assert.equal(r.required.requireEffectiveHrpUser, false);
    assert.equal(r.required.requireActiveCrmSession, true);
  });
  test('exchange requires both', () => {
    const r = actorForOperation('exchange');
    assert.equal(r.required.requireEffectiveHrpUser, true);
    assert.equal(r.required.requireActiveCrmSession, true);
  });
  test('cancel accepts past CRM session deadline (cleanup uses immutable binding only)', () => {
    const r = actorForOperation('cancel');
    assert.equal(r.required.requireActiveCrmSession, false);
  });
  test('revoke accepts past CRM session deadline', () => {
    const r = actorForOperation('revoke');
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
