import { z } from 'zod';
import { CanonicalIdSchema, JtiSchema } from './primitives.js';

// F-01 - Assertion/profile validators (pure).

export function parseAssertionHeader(raw) {
  if (typeof raw !== 'string') return { ok: false, reason: 'assertion header must be a string' };
  if (raw.length === 0 || raw.length > 8192) return { ok: false, reason: 'header length out of bounds' };
  for (let i = 0; i < raw.length; i++) {
    const cp = raw.codePointAt(i);
    if (cp === undefined) return { ok: false, reason: 'unexpected EOF' };
    if (cp <= 0x1F && cp !== 0x09 && cp !== 0x0A && cp !== 0x0D) return { ok: false, reason: 'contains control characters' };
    if (cp === 0x7F) return { ok: false, reason: 'contains DEL' };
    if (cp === 0xFEFF) return { ok: false, reason: 'contains FEFF' };
    if (cp === 0x202A || cp === 0x202B || cp === 0x202C || cp === 0x202D || cp === 0x202E) return { ok: false, reason: 'contains bidi control' };
    if (cp > 0xFFFF) i++;
  }
  if (raw[0] !== '{') return { ok: false, reason: 'must start with brace' };
  const seenKeys = new Set();
  let i = 1;
  while (i < raw.length) {
    while (i < raw.length && /[\s,]/.test(raw[i])) i++;
    if (i >= raw.length || raw[i] === '}') break;
    if (raw[i] !== '"') return { ok: false, reason: 'expected quoted key' };
    let j = i + 1;
    let key = '';
    while (j < raw.length) {
      const c = raw[j];
      if (c === '\\') { key += c + raw[j + 1]; j += 2; continue; }
      if (c === '"') break;
      key += c; j++;
    }
    if (raw[j] !== '"') return { ok: false, reason: 'unterminated key' };
    if (seenKeys.has(key)) return { ok: false, reason: 'duplicate top-level key: ' + key };
    seenKeys.add(key);
    i = j + 1;
    while (i < raw.length && /[\s]/.test(raw[i])) i++;
    if (raw[i] !== ':') return { ok: false, reason: 'expected colon' };
    i++;
    while (i < raw.length && /[\s]/.test(raw[i])) i++;
    if (raw[i] === '"') {
      let k = i + 1;
      while (k < raw.length) { if (raw[k] === '\\') { k += 2; continue; } if (raw[k] === '"') break; k++; }
      i = k + 1;
    } else if (raw[i] === '{' || raw[i] === '[') {
      const open = raw[i]; const close = open === '{' ? '}' : ']';
      let depth = 1; i++;
      while (i < raw.length && depth > 0) {
        if (raw[i] === open) depth++;
        else if (raw[i] === close) depth--;
        else if (raw[i] === '"') {
          let k = i + 1;
          while (k < raw.length) { if (raw[k] === '\\') { k += 2; continue; } if (raw[k] === '"') break; k++; }
          i = k + 1; continue;
        }
        i++;
      }
    } else {
      while (i < raw.length && /[^,}\s]/.test(raw[i])) i++;
    }
  }
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return { ok: false, reason: 'not valid JSON' }; }
  return { ok: true, value: parsed };
}

const integerTime = z.number().int();

export const AssertionClaimsSchema = z.object({
  iss: z.string().min(1).max(256),
  aud: z.string().min(1).max(256),
  sub: z.string().min(1).max(256),
  jti: JtiSchema,
  iat: integerTime,
  exp: integerTime,
  nbf: integerTime.optional(),
  scope: z.string().min(1).max(256).optional(),
  purpose: z.string().min(1).max(256).optional(),
  requestHash: z.string().regex(/^[A-Fa-f0-9]{64}$/).optional(),
  method: z.string().regex(/^[A-Z]{3,8}$/).optional(),
  path: z.string().min(1).max(2048).optional(),
}).strict();

export function validateClaimsObject(value) {
  const parsed = AssertionClaimsSchema.safeParse(value);
  if (!parsed.success) return { ok: false, reason: 'claims shape invalid', issues: parsed.error.issues };
  return { ok: true, claims: parsed.data };
}

export function validateTtlSkew(claims, opts) {
  const o = opts || {};
  const skewSeconds = o.skewSeconds == null ? 30 : o.skewSeconds;
  const ttlSeconds = o.ttlSeconds == null ? 60 : o.ttlSeconds;
  const nowSeconds = o.nowSeconds == null ? Math.floor(Date.now() / 1000) : o.nowSeconds;
  if (!Number.isInteger(claims.iat)) return { ok: false, reason: 'iat must be integer' };
  if (!Number.isInteger(claims.exp)) return { ok: false, reason: 'exp must be integer' };
  if (claims.exp <= claims.iat) return { ok: false, reason: 'exp must be > iat' };
  if (claims.exp - claims.iat > ttlSeconds) return { ok: false, reason: 'TTL exceeds cap' };
  if (claims.nbf !== undefined) {
    if (!Number.isInteger(claims.nbf)) return { ok: false, reason: 'nbf must be integer' };
    if (claims.nbf > claims.iat + skewSeconds) return { ok: false, reason: 'nbf in the future' };
  }
  if (nowSeconds > claims.exp + skewSeconds) return { ok: false, reason: 'expired' };
  if (claims.iat - skewSeconds > nowSeconds) return { ok: false, reason: 'iat in the future' };
  return { ok: true };
}

export function validateAudience(claims, opts) {
  if (typeof opts !== 'object' || opts === null) return { ok: false, reason: 'opts required' };
  if (opts.audience && claims.aud !== opts.audience) return { ok: false, reason: 'audience mismatch' };
  if (opts.issuer && claims.iss !== opts.issuer) return { ok: false, reason: 'issuer mismatch' };
  return { ok: true };
}

export function validateSubject(claims, opts) {
  if (typeof opts !== 'object' || opts === null) return { ok: false, reason: 'opts required' };
  if (opts.serviceId && claims.sub !== opts.serviceId) return { ok: false, reason: 'sub must equal serviceId' };
  return { ok: true };
}

export function validateRequestBinding(claims, opts) {
  if (typeof opts !== 'object' || opts === null) return { ok: false, reason: 'opts required' };
  if (opts.method && claims.method !== opts.method) return { ok: false, reason: 'method binding mismatch' };
  if (opts.path && claims.path !== opts.path) return { ok: false, reason: 'path binding mismatch' };
  if (opts.bodyHash && claims.requestHash !== opts.bodyHash) return { ok: false, reason: 'bodyHash binding mismatch' };
  if (opts.organizationIdDigest && claims.organizationIdDigest !== opts.organizationIdDigest) return { ok: false, reason: 'org digest mismatch' };
  return { ok: true };
}

export const BACKEND_OPERATIONS = Object.freeze(['create','exchange','cancel','revoke']);

const RequiredActorSchema = z.object({
  operation: z.enum(['create','exchange','cancel','revoke']),
  requireEffectiveHrpUser: z.boolean(),
  requireActiveCrmSession: z.boolean(),
}).strict();

export function actorForOperation(operation) {
  if (typeof operation !== 'string' || BACKEND_OPERATIONS.indexOf(operation) === -1) return { ok: false, reason: 'unknown operation' };
  switch (operation) {
    case 'create': return { ok: true, required: { operation: 'create', requireEffectiveHrpUser: false, requireActiveCrmSession: true } };
    case 'exchange': return { ok: true, required: { operation: 'exchange', requireEffectiveHrpUser: true, requireActiveCrmSession: true } };
    case 'cancel': return { ok: true, required: { operation: 'cancel', requireEffectiveHrpUser: false, requireActiveCrmSession: false } };
    case 'revoke': return { ok: true, required: { operation: 'revoke', requireEffectiveHrpUser: false, requireActiveCrmSession: false } };
  }
}

export function validateRequiredActor(required) {
  return RequiredActorSchema.safeParse(required);
}

export const ASSERTION_LIMITS = Object.freeze({
  MAX_HEADER_LEN: 8192,
  DEFAULT_TTL_SECONDS: 60,
  DEFAULT_SKEW_SECONDS: 30,
});
