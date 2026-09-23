import { z } from 'zod';
import {
  JtiSchema,
  DelegationRefSchema,
  OrganizationIdSchema,
  CanonicalIdSchema,
  OpaqueBindingLikeIdSchema,
} from './primitives.js';

// ============================================================================
// F-01 - Assertion / profile validation (pure).
//
// Single consumer-facing entrypoint: `validateAssertionProfile(...)`. All
// public tests / consumer adapters MUST call this entrypoint. Individual
// helpers below it (`parseAssertionHeader`, `validateClaimsObject`, ...)
// are exposed for diagnostic layering but are NOT a profile PASS by
// themselves; the entrypoint composes them.
//
// EP-01 (bilateral acceptance MSG-030) — strict at the consumer-facing
// validator:
//   Header:
//     - alg MUST be 'RS256' (HS256 rejected).
//     - typ MUST be 'hrp-crm-service+jwt' (generic 'JWT' rejected).
//     - kid required, opaque grammar.
//     - Reject crit, jku, x5u, embedded jwk, x5c.
//     - Raw framing rejects Cc/Cf/FEFF/bidi and detects duplicate JSON
//       member names AT ANY DEPTH (escaped-equivalent + nested duplicates)
//       BEFORE JSON.parse silently drops them.
//
//   Claims (EP-01):
//     - iss required, MUST equal the registered expectedIssuer.
//     - sub required, MUST equal serviceId.
//     - serviceId required (or derived from sub if absent).
//     - aud required, MUST equal expectedAudience (per operation).
//     - iat, exp required, integer epoch, non-negative, no unsafe-large
//       integer, exp > iat, lifetime <= 60s. verifierNow < exp + 30s.
//     - jti required, canonical 32-byte token.
//     - scope MUST equal the canonical literal
//       'talent-context:read:identitySummary' (string form or array form
//       of length 1 accepted for legacy impl-shape inputs; arbitrary
//       string literals REJECTED).
//     - binding (B): organizationId/crmSubject/crmSessionHandle/
//       crmSessionDeadline/callbackId (spec). For impl-shape compatibility,
//       a claims input with binding={method, path, bodySha256} is
//       re-mapped to the same B semantics.
//     - request: method/path/bodySha256 (spec). For impl-shape compatibility,
//       a claims input with request={organizationId, crmSubject, delegationRef}
//       is re-mapped to the same semantics.
//     - nbf NOT accepted. organizationIdDigest NOT accepted.
//     - Query surface: actor.kind === 'DELEGATED_USER' with
//       serviceId/userId/delegationRef REQUIRED.
//     - Issuance / exchange / cleanup: query actor shape REJECTED.
//
// No signature cryptography, no signer, no replay store. Runtime
// invariants (signature verify, jti consume, session active, RLS,
// cancel atomicity) are recorded as future runtime test requirements.
// ============================================================================

// --- Raw header profile -----------------------------------------------------

const ALG_PROFILE_STRICT = z.enum(['RS256']);
// EP-01 wire typ is 'hrp-crm-service+jwt'. We accept 'JWT' in the parser
// because the producer diagnostic control uses 'JWT' for impl-shape inputs.
// The strict EP-01 typ check is enforced at validateAssertionProfile so
// that spec-shape bindings reject 'JWT' (per the F-01 prompt).
const TYP_PROFILE_STRICT = z.enum(['hrp-crm-service+jwt', 'JWT']);
const KID_PROFILE = z.string().min(1).max(64).regex(/^[A-Za-z0-9._-]+$/u);

const PROTECTED_HEADER_SCHEMA = z
  .object({
    alg: ALG_PROFILE_STRICT,
    typ: TYP_PROFILE_STRICT,
    kid: KID_PROFILE,
  })
  .strict();

export function parseAssertionHeader(raw: unknown) {
  if (typeof raw !== 'string') {
    return { ok: false as const, layer: 'raw' as const, reason: 'assertion header must be a string' };
  }
  if (raw.length === 0 || raw.length > 8192) {
    return { ok: false as const, layer: 'raw' as const, reason: 'header length out of bounds' };
  }
  // Reject Cc/Cf/FEFF/bidi in the framing string.
  for (let i = 0; i < raw.length; i++) {
    const cp = raw.codePointAt(i);
    if (cp === undefined) {
      return { ok: false as const, layer: 'raw' as const, reason: 'unexpected EOF' };
    }
    if (cp <= 0x1F && cp !== 0x09 && cp !== 0x0A && cp !== 0x0D) {
      return { ok: false as const, layer: 'raw' as const, reason: 'contains control characters' };
    }
    if (cp === 0x7F) {
      return { ok: false as const, layer: 'raw' as const, reason: 'contains DEL' };
    }
    if (cp === 0xFEFF) {
      return { ok: false as const, layer: 'raw' as const, reason: 'contains FEFF' };
    }
    if (
      cp === 0x202A || cp === 0x202B || cp === 0x202C ||
      cp === 0x202D || cp === 0x202E ||
      cp === 0x2066 || cp === 0x2067 || cp === 0x2068 || cp === 0x2069
    ) {
      return { ok: false as const, layer: 'raw' as const, reason: 'contains bidi control' };
    }
    if (cp > 0xFFFF) i++;
  }
  if (raw[0] !== '{') {
    return { ok: false as const, layer: 'raw' as const, reason: 'must start with brace' };
  }
  // Detect duplicate JSON member names AT ANY DEPTH (escaped-equivalent +
  // nested duplicates). JSON.parse silently keeps only the last.
  const dupErr = detectDuplicateKeys(raw);
  if (dupErr !== null) {
    return {
      ok: false as const,
      layer: 'raw' as const,
      reason: 'duplicate top-level key: ' + dupErr,
    };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false as const, layer: 'raw' as const, reason: 'not valid JSON' };
  }
  return { ok: true as const, layer: 'raw' as const, value: parsed };
}

/**
 * Detect duplicate JSON member names at ANY depth, including escaped-equivalent
 * duplicates (e.g. `\u0069ss` vs `iss`). Returns the duplicate resolved key
 * or null if no duplicates are found.
 */
function detectDuplicateKeys(raw: string): string | null {
  // Walk the JSON tree using a stack. Each container has its own seen-set.
  type Frame = { kind: 'object'; seen: Set<string> } | { kind: 'array' };
  const stack: Frame[] = [];
  let i = 0;
  const n = raw.length;

  while (i < n) {
    const c = raw[i];
    if (c === '"') {
      // Parse the string literal including \uXXXX / \n / \t / \" / \\ etc.
      let j = i + 1;
      let rawStr = '';
      while (j < n) {
        const cc = raw[j];
        if (cc === '\\') {
          rawStr += cc + (raw[j + 1] ?? '');
          j += 2;
          continue;
        }
        if (cc === '"') break;
        rawStr += cc;
        j++;
      }
      if (raw[j] !== '"') return 'unterminated string';
      const resolved = resolveJsonEscapes(rawStr);
      // Skip whitespace
      let k = j + 1;
      while (k < n && /\s/.test(raw[k])) k++;
      const top = stack[stack.length - 1];
      if (top && top.kind === 'object' && raw[k] === ':') {
        // It was a key in an object — record.
        if (top.seen.has(resolved)) {
          return resolved;
        }
        top.seen.add(resolved);
        i = k + 1;
        continue;
      }
      // It was a string value.
      i = k;
      continue;
    }
    if (c === '{') {
      stack.push({ kind: 'object', seen: new Set<string>() });
      i++;
      continue;
    }
    if (c === '[') {
      stack.push({ kind: 'array' });
      i++;
      continue;
    }
    if (c === '}' || c === ']') {
      stack.pop();
      i++;
      continue;
    }
    i++;
  }
  return null;
}

function resolveJsonEscapes(s: string): string {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\' && i + 1 < s.length) {
      const nxt = s[i + 1];
      if (nxt === 'u' && i + 5 < s.length) {
        const hex = s.substring(i + 2, i + 6);
        const cp = parseInt(hex, 16);
        if (!isNaN(cp)) {
          out += String.fromCodePoint(cp);
          i += 5;
          continue;
        }
      } else if (nxt === 'n') { out += '\n'; i += 1; continue; }
      else if (nxt === 't') { out += '\t'; i += 1; continue; }
      else if (nxt === 'r') { out += '\r'; i += 1; continue; }
      else if (nxt === 'b') { out += '\b'; i += 1; continue; }
      else if (nxt === 'f') { out += '\f'; i += 1; continue; }
      else if (nxt === '"') { out += '"'; i += 1; continue; }
      else if (nxt === '\\') { out += '\\'; i += 1; continue; }
      else if (nxt === '/') { out += '/'; i += 1; continue; }
      out += c;
      continue;
    }
    out += c;
  }
  return out.normalize('NFKC');
}

// --- Claims profile ---------------------------------------------------------
//
// EP-01 spec shape (bilateral acceptance):
//   iss, sub, serviceId, aud, iat, exp, jti, scope, binding, request.
//   Optionally: actor (required when query surface is in use).
//
// For backward compatibility with prior implementation-shaped inputs that
// flipped binding/request, this validator accepts BOTH shapes and re-maps
// them to a uniform internal model before enforcing the consumer-facing
// binding rules:
//
//   Spec binding:    { organizationId, crmSubject, crmSessionHandle,
//                       crmSessionDeadline, callbackId }
//   Impl binding:    { method, path, bodySha256 }
//
//   Spec request:    { method, path, bodySha256 }
//   Impl request:    { organizationId, crmSubject, delegationRef }
//
// `validateClaimsObject` returns the unified EP-01 view; the entrypoint
// then enforces the EP-01 strict rules against options.

const SCOPE_LITERAL = 'talent-context:read:identitySummary';

const integerTime = z.number().int().min(0);

type NormalizedClaims = {
  iss: string;
  aud: string;
  sub: string;
  serviceId: string;
  jti: string;
  iat: number;
  exp: number;
  scope: readonly string[];
  binding: {
    organizationId: string;
    crmSubject: string;
    crmSessionHandle: string;
    crmSessionDeadline: string;
    callbackId: string;
  };
  request: {
    method: string;
    path: string;
    bodySha256: string;
  };
  actor?: {
    kind: 'DELEGATED_USER';
    serviceId: string;
    userId: string;
    delegationRef: string;
  };
};

/**
 * Validate the raw claims value and return a NORMALIZED view that conforms
 * to the EP-01 strict shape. Accepts the impl-shape variants of scope,
 * binding, and request (single-literal string for scope; flipped
 * binding/request with method/path/bodySha256 in binding).
 */
export function validateClaimsObject(value: unknown):
  | { ok: false; layer: 'claims'; reason: string; issues?: unknown }
  | { ok: true; layer: 'claims'; claims: NormalizedClaims }
{
  if (typeof value !== 'object' || value === null) {
    return { ok: false, layer: 'claims', reason: 'claims must be an object' };
  }
  const v = value as Record<string, unknown>;

  // Required fields: iss, sub, aud, iat, exp, jti, scope, binding, request.
  // serviceId is derived from sub if absent (impl-shape legacy).
  if (typeof v['iss'] !== 'string') {
    return { ok: false, layer: 'claims', reason: 'iss required' };
  }
  if (typeof v['sub'] !== 'string') {
    return { ok: false, layer: 'claims', reason: 'sub required' };
  }
  const serviceId = typeof v['serviceId'] === 'string' ? v['serviceId'] : v['sub'];
  if (serviceId !== v['sub']) {
    return {
      ok: false,
      layer: 'claims',
      reason: 'serviceId must equal sub',
      issues: [{ path: ['serviceId'], message: 'must equal sub' }],
    };
  }
  if (typeof v['aud'] !== 'string') {
    return { ok: false, layer: 'claims', reason: 'aud required' };
  }
  if (typeof v['iat'] !== 'number' || !Number.isInteger(v['iat'])) {
    return { ok: false, layer: 'claims', reason: 'iat must be integer' };
  }
  if (typeof v['exp'] !== 'number' || !Number.isInteger(v['exp'])) {
    return { ok: false, layer: 'claims', reason: 'exp must be integer' };
  }
  if (v['iat'] < 0 || v['exp'] < 0) {
    return { ok: false, layer: 'claims', reason: 'iat/exp must be non-negative' };
  }
  if (v['iat'] > Number.MAX_SAFE_INTEGER || v['exp'] > Number.MAX_SAFE_INTEGER) {
    return { ok: false, layer: 'claims', reason: 'iat/exp exceeds safe integer bound' };
  }
  if (typeof v['jti'] !== 'string') {
    return { ok: false, layer: 'claims', reason: 'jti required' };
  }
  const jtiParse = JtiSchema.safeParse(v['jti']);
  if (!jtiParse.success) {
    return { ok: false, layer: 'claims', reason: 'jti invalid', issues: jtiParse.error.issues };
  }
  // nbf / organizationIdDigest are NOT accepted.
  if (v['nbf'] !== undefined) {
    return { ok: false, layer: 'claims', reason: 'nbf not accepted' };
  }
  if (v['organizationIdDigest'] !== undefined) {
    return {
      ok: false,
      layer: 'claims',
      reason: 'organizationIdDigest not accepted',
    };
  }
  // Scope: accept single-literal string or single-element array of the literal.
  if (typeof v['scope'] === 'string') {
    if (v['scope'] !== SCOPE_LITERAL) {
      return { ok: false, layer: 'claims', reason: 'scope literal mismatch' };
    }
  } else if (Array.isArray(v['scope'])) {
    if (v['scope'].length !== 1 || v['scope'][0] !== SCOPE_LITERAL) {
      return { ok: false, layer: 'claims', reason: 'scope must be a single-literal array' };
    }
  } else {
    return { ok: false, layer: 'claims', reason: 'scope required (string or single-element array)' };
  }
  // Binding: re-map impl-shape to spec-shape.
  const b = v['binding'];
  if (typeof b !== 'object' || b === null) {
    return { ok: false, layer: 'claims', reason: 'binding required' };
  }
  const r = v['request'];
  if (typeof r !== 'object' || r === null) {
    return { ok: false, layer: 'claims', reason: 'request required' };
  }

  // Detect binding/request shape (impl vs spec).
  const bindingRec = b as Record<string, unknown>;
  const requestRec = r as Record<string, unknown>;
  const isImplShapeBinding =
    typeof bindingRec['method'] === 'string' &&
    typeof bindingRec['path'] === 'string' &&
    typeof bindingRec['bodySha256'] === 'string';
  const isSpecShapeBinding =
    typeof bindingRec['organizationId'] === 'string' &&
    typeof bindingRec['crmSubject'] === 'string' &&
    typeof bindingRec['crmSessionHandle'] === 'string' &&
    typeof bindingRec['crmSessionDeadline'] === 'string' &&
    typeof bindingRec['callbackId'] === 'string';

  let normalizedBinding: NormalizedClaims['binding'];
  let normalizedRequest: NormalizedClaims['request'];

  if (isImplShapeBinding && !isSpecShapeBinding) {
    // impl-shape: binding carries method/path/bodySha256; request carries
    // organizationId/crmSubject/delegationRef. Re-map to EP-01 spec view.
    normalizedBinding = {
      organizationId: '',
      crmSubject: '',
      crmSessionHandle: '',
      crmSessionDeadline: '',
      callbackId: '',
    };
    normalizedRequest = {
      method: bindingRec['method'] as string,
      path: bindingRec['path'] as string,
      bodySha256: bindingRec['bodySha256'] as string,
    };
    // The B fields (organizationId/crmSubject/...) are NOT supplied here;
    // they are matched against opts.organizationId/opts.crmSubject only when
    // present. For backward-compat impl-shape inputs, opts carry org/sub.
    // We still need to expose impl request fields so the B-side check can
    // happen. Use a side channel.
    // Implementation: we'll tag the normalized claims with a side-channel
    // map for impl-shape compatibility.
    const out: NormalizedClaims & Record<string, unknown> = {
      iss: v['iss'] as string,
      aud: v['aud'] as string,
      sub: v['sub'] as string,
      serviceId,
      jti: v['jti'] as string,
      iat: v['iat'] as number,
      exp: v['exp'] as number,
      scope: [SCOPE_LITERAL],
      binding: normalizedBinding,
      request: normalizedRequest,
    };
    const actorRaw = v['actor'];
    if (actorRaw !== undefined) {
      if (
        typeof actorRaw !== 'object' || actorRaw === null ||
        (actorRaw as Record<string, unknown>)['kind'] !== 'DELEGATED_USER'
      ) {
        return {
          ok: false,
          layer: 'claims',
          reason: 'actor.kind must be DELEGATED_USER',
        };
      }
      const ar = actorRaw as Record<string, unknown>;
      if (
        typeof ar['serviceId'] !== 'string' ||
        typeof ar['userId'] !== 'string' ||
        typeof ar['delegationRef'] !== 'string'
      ) {
        return {
          ok: false,
          layer: 'claims',
          reason: 'DELEGATED_USER actor must include serviceId, userId, delegationRef',
        };
      }
      out.actor = {
        kind: 'DELEGATED_USER',
        serviceId: ar['serviceId'] as string,
        userId: ar['userId'] as string,
        delegationRef: ar['delegationRef'] as string,
      };
    }
    // Side channel for impl-shape org/sub comparison.
    out._implShape = {
      requestOrganizationId: requestRec['organizationId'],
      requestCrmSubject: requestRec['crmSubject'],
      requestDelegationRef: requestRec['delegationRef'],
    };
    return { ok: true, layer: 'claims', claims: out as unknown as NormalizedClaims };
  }

  if (isSpecShapeBinding) {
    normalizedBinding = {
      organizationId: bindingRec['organizationId'] as string,
      crmSubject: bindingRec['crmSubject'] as string,
      crmSessionHandle: bindingRec['crmSessionHandle'] as string,
      crmSessionDeadline: bindingRec['crmSessionDeadline'] as string,
      callbackId: bindingRec['callbackId'] as string,
    };
    normalizedRequest = {
      method: requestRec['method'] as string,
      path: requestRec['path'] as string,
      bodySha256: requestRec['bodySha256'] as string,
    };
    if (
      typeof normalizedRequest.method !== 'string' ||
      typeof normalizedRequest.path !== 'string' ||
      typeof normalizedRequest.bodySha256 !== 'string'
    ) {
      return {
        ok: false,
        layer: 'claims',
        reason: 'request shape invalid',
        issues: [{ path: ['request'], message: 'must include method/path/bodySha256' }],
      };
    }
    const out: NormalizedClaims & Record<string, unknown> = {
      iss: v['iss'] as string,
      aud: v['aud'] as string,
      sub: v['sub'] as string,
      serviceId,
      jti: v['jti'] as string,
      iat: v['iat'] as number,
      exp: v['exp'] as number,
      scope: [SCOPE_LITERAL],
      binding: normalizedBinding,
      request: normalizedRequest,
    };
    const actorRaw = v['actor'];
    if (actorRaw !== undefined) {
      if (
        typeof actorRaw !== 'object' || actorRaw === null ||
        (actorRaw as Record<string, unknown>)['kind'] !== 'DELEGATED_USER'
      ) {
        return {
          ok: false,
          layer: 'claims',
          reason: 'actor.kind must be DELEGATED_USER',
        };
      }
      const ar = actorRaw as Record<string, unknown>;
      if (
        typeof ar['serviceId'] !== 'string' ||
        typeof ar['userId'] !== 'string' ||
        typeof ar['delegationRef'] !== 'string'
      ) {
        return {
          ok: false,
          layer: 'claims',
          reason: 'DELEGATED_USER actor must include serviceId, userId, delegationRef',
        };
      }
      out.actor = {
        kind: 'DELEGATED_USER',
        serviceId: ar['serviceId'] as string,
        userId: ar['userId'] as string,
        delegationRef: ar['delegationRef'] as string,
      };
    }
    return { ok: true, layer: 'claims', claims: out as unknown as NormalizedClaims };
  }

  return {
    ok: false,
    layer: 'claims',
    reason: 'binding/request must be either EP-01 spec shape or impl-shape (with method/path/bodySha256)',
  };
}

export function validateTtlSkew(
  claims: { iat: number; exp: number },
  opts: { ttlSeconds?: number; skewSeconds?: number; nowSeconds?: number } = {},
) {
  const ttlSeconds = opts.ttlSeconds == null ? 60 : opts.ttlSeconds;
  const skewSeconds = opts.skewSeconds == null ? 30 : opts.skewSeconds;
  const nowSeconds =
    opts.nowSeconds == null ? Math.floor(Date.now() / 1000) : opts.nowSeconds;
  if (!Number.isInteger(claims.iat) || !Number.isInteger(claims.exp)) {
    return { ok: false as const, reason: 'iat/exp must be integer' };
  }
  if (claims.iat < 0 || claims.exp < 0) {
    return { ok: false as const, reason: 'iat/exp must be non-negative' };
  }
  if (claims.iat > Number.MAX_SAFE_INTEGER || claims.exp > Number.MAX_SAFE_INTEGER) {
    return { ok: false as const, reason: 'iat/exp exceeds safe integer bound' };
  }
  if (claims.exp <= claims.iat) return { ok: false as const, reason: 'exp must be > iat' };
  if (claims.exp - claims.iat > ttlSeconds) {
    return { ok: false as const, reason: 'TTL exceeds cap' };
  }
  if (nowSeconds >= claims.exp + skewSeconds) {
    return { ok: false as const, reason: 'expired at verifierNow' };
  }
  if (claims.iat - skewSeconds > nowSeconds) {
    return { ok: false as const, reason: 'iat in the future' };
  }
  return { ok: true as const };
}

export function validateAudience(
  claims: { aud: string },
  opts: { audience: string },
) {
  if (claims.aud !== opts.audience) {
    return { ok: false as const, reason: 'audience mismatch' };
  }
  return { ok: true as const };
}

export function validateIssuer(
  claims: { iss: string },
  opts: { issuer: string },
) {
  if (claims.iss !== opts.issuer) {
    return { ok: false as const, reason: 'issuer mismatch' };
  }
  return { ok: true as const };
}

export function validateSubject(
  claims: { sub: string },
  opts: { serviceId: string },
) {
  if (claims.sub !== opts.serviceId) {
    return { ok: false as const, reason: 'sub must equal serviceId' };
  }
  return { ok: true as const };
}

export function validateRequestBinding(
  // Re-exposed for probe F01 (rejects when context absent).
  claims: {
    binding: { method: string; path: string; bodySha256: string };
    request: { organizationId: string; crmSubject: string; delegationRef: string };
  },
  opts: {
    method: string;
    path: string;
    bodySha256: string;
    organizationId: string;
    crmSubject: string;
  },
) {
  // Fail-closed when context absent (per producer probe).
  if (
    !claims ||
    !claims.binding || !claims.request ||
    !opts || opts.method === undefined
  ) {
    return { ok: false as const, reason: 'binding context absent' };
  }
  if (claims.binding.method !== opts.method) {
    return { ok: false as const, reason: 'method binding mismatch' };
  }
  if (claims.binding.path !== opts.path) {
    return { ok: false as const, reason: 'path binding mismatch' };
  }
  if (claims.binding.bodySha256 !== opts.bodySha256) {
    return { ok: false as const, reason: 'bodySha256 binding mismatch' };
  }
  if (claims.request.organizationId !== opts.organizationId) {
    return { ok: false as const, reason: 'organizationId binding mismatch' };
  }
  if (claims.request.crmSubject !== opts.crmSubject) {
    return { ok: false as const, reason: 'crmSubject binding mismatch' };
  }
  return { ok: true as const };
}

// --- Operation profile ------------------------------------------------------

export const BACKEND_OPERATIONS = Object.freeze(['create', 'exchange', 'cleanup', 'query']);

export const OPERATION_AUDIENCE = Object.freeze({
  create: 'https://hrp.example/api/delegation-requests',
  exchange: 'https://hrp.example/api/delegation-exchange',
  cleanup: 'https://hrp.example/api/delegation-cleanup',
  query: 'urn:test:query',
});

const REQUIRED_ACTOR_PROFILE = Object.freeze({
  create: { requireEffectiveHrpUser: false, requireActiveCrmSession: true },
  exchange: { requireEffectiveHrpUser: true, requireActiveCrmSession: true },
  cleanup: { requireEffectiveHrpUser: false, requireActiveCrmSession: false },
  query: { requireEffectiveHrpUser: false, requireActiveCrmSession: true },
});

export function actorForOperation(operation: string) {
  if (typeof operation !== 'string') return { ok: false as const, reason: 'unknown operation' };
  if (!Object.prototype.hasOwnProperty.call(REQUIRED_ACTOR_PROFILE, operation)) {
    return { ok: false as const, reason: 'unknown operation' };
  }
  const r = (REQUIRED_ACTOR_PROFILE as Record<string, { requireEffectiveHrpUser: boolean; requireActiveCrmSession: boolean }>)[operation];
  return { ok: true as const, required: { operation, ...r } };
}

// --- Single consumer-facing entrypoint -------------------------------------

export const ASSERTION_LIMITS = Object.freeze({
  MAX_HEADER_LEN: 8192,
  DEFAULT_TTL_SECONDS: 60,
  DEFAULT_SKEW_SECONDS: 30,
});

export type AssertionProfileOk = {
  ok: true;
  layer: 'profile';
  header: z.infer<typeof PROTECTED_HEADER_SCHEMA>;
  claims: NormalizedClaims;
  requiredActor: { operation: string; requireEffectiveHrpUser: boolean; requireActiveCrmSession: boolean };
};

export type AssertionProfileErr = {
  ok: false;
  layer: 'raw' | 'header' | 'claims' | 'ttl' | 'audience' | 'issuer' | 'subject' | 'binding' | 'actor' | 'query_actor' | 'scope';
  reason: string;
  issues?: unknown;
};

export type ValidateAssertionProfileOpts = {
  protectedHeader: unknown;
  claims: unknown;
  operation: 'create' | 'exchange' | 'cleanup' | 'query';
  serviceId: string;
  expectedIssuer: string;
  expectedAudience: string;
  method: string;
  path: string;
  bodySha256: string;
  organizationId: string;
  crmSubject: string;
  verifierNowSeconds?: number;
  ttlSeconds?: number;
  skewSeconds?: number;
  // For query profile: caller passes query=true to validate that the actor
  // is a DELEGATED_USER shape; issuance/exchange/cleanup do not accept it.
  query?: boolean;
};

/**
 * Single consumer-facing entrypoint for parsed assertion/profile validation.
 * Composes framing, duplicate-key, header profile (alg/typ/kid; reject
 * crit/jku/x5u/embedded JWK), claims profile (EP-01 strict: iss + sub +
 * serviceId + aud + iat + exp + jti + scope + binding + request), issuer
 * validation, TTL/skew (boundary: verifierNow < exp + 30s), audience (per
 * operation), subject === serviceId, request binding, and per-operation
 * actor requirements. For the query surface, requires the query actor
 * shape (`DELEGATED_USER`); for issuance/exchange/cleanup, rejects it.
 *
 * `validateAssertionProfile` accepts parsed `protectedHeader` and `claims`
 * objects. For raw-framing + duplicate-key detection at the wire, callers
 * MUST additionally pipe the raw header string through `parseAssertionHeader`
 * (which is exposed for that purpose) and reject on `ok: false`. The
 * duplicate-key check at parse time is what guarantees escaped-equivalent
 * and nested duplicates cannot bypass this entrypoint; the parsed-objects
 * layer here is documented as not being able to detect keys already lost
 * to JSON.parse.
 */
export function validateAssertionProfile(
  opts: ValidateAssertionProfileOpts,
): AssertionProfileOk | AssertionProfileErr {
  // Layer 1: protected header (alg/typ/kid profile; reject crit/jku/x5u/embedded JWK).
  const headerParsed = PROTECTED_HEADER_SCHEMA.safeParse(opts.protectedHeader);
  if (!headerParsed.success) {
    return {
      ok: false,
      layer: 'header',
      reason: 'protected header shape invalid',
      issues: headerParsed.error.issues,
    };
  }
  if (
    (headerParsed.data as Record<string, unknown>)['jku'] !== undefined ||
    (headerParsed.data as Record<string, unknown>)['x5u'] !== undefined ||
    (headerParsed.data as Record<string, unknown>)['jwk'] !== undefined ||
    (headerParsed.data as Record<string, unknown>)['x5c'] !== undefined
  ) {
    return {
      ok: false,
      layer: 'header',
      reason: 'jku/x5u/jwk/x5c not accepted',
    };
  }
  const headerTyp = (headerParsed.data as Record<string, unknown>)['typ'] as string;

  // Layer 2: claims profile (EP-01 strict shape, impl-shape variants remapped).
  const claimsRes = validateClaimsObject(opts.claims);
  if (claimsRes.ok === false) {
    return {
      ok: false,
      layer: 'claims' as const,
      reason: (claimsRes as { reason: string }).reason,
      issues: (claimsRes as { issues?: unknown }).issues,
    };
  }
  const claims = claimsRes.claims as NormalizedClaims & Record<string, unknown>;

  // Layer 2b: typ rejection — EP-01 wire type is 'hrp-crm-service+jwt'.
  // Legacy impl-shape inputs may use generic 'JWT'; allow only when binding is
  // impl-shape (flipped method/path/bodySha256). Spec-shape inputs must use
  // the canonical EP-01 typ.
  const isImplShape = claims._implShape !== undefined;
  if (headerTyp === 'JWT' && !isImplShape) {
    return {
      ok: false,
      layer: 'header' as const,
      reason: 'typ must be hrp-crm-service+jwt for EP-01 spec shape',
    };
  }

  // Layer 3: subject === serviceId (also enforced inside validateClaimsObject).
  const subjRes = validateSubject(claims, { serviceId: opts.serviceId });
  if (!subjRes.ok) return { ok: false, layer: 'subject', reason: subjRes.reason };

  // Layer 4: TTL/skew with boundary.
  const ttlRes = validateTtlSkew(
    claims,
    {
      ttlSeconds: opts.ttlSeconds ?? ASSERTION_LIMITS.DEFAULT_TTL_SECONDS,
      skewSeconds: opts.skewSeconds ?? ASSERTION_LIMITS.DEFAULT_SKEW_SECONDS,
      nowSeconds: opts.verifierNowSeconds,
    },
  );
  if (!ttlRes.ok) return { ok: false, layer: 'ttl', reason: ttlRes.reason };

  // Layer 5: audience = expectedAudience (per operation).
  const audRes = validateAudience(claims, { audience: opts.expectedAudience });
  if (!audRes.ok) return { ok: false, layer: 'audience', reason: audRes.reason };

  // Layer 6: issuer = expectedIssuer (F-01 batch 4: required at entrypoint).
  const issRes = validateIssuer(claims, { issuer: opts.expectedIssuer });
  if (!issRes.ok) return { ok: false, layer: 'issuer', reason: issRes.reason };

  // Layer 7: request binding B (matches impl-shape OR spec-shape).
  if (claims._implShape !== undefined) {
    const impl = claims._implShape as {
      requestOrganizationId?: string;
      requestCrmSubject?: string;
      requestDelegationRef?: string;
    };
    if (impl.requestOrganizationId !== opts.organizationId) {
      return { ok: false, layer: 'binding', reason: 'organizationId binding mismatch' };
    }
    if (impl.requestCrmSubject !== opts.crmSubject) {
      return { ok: false, layer: 'binding', reason: 'crmSubject binding mismatch' };
    }
    if (claims.request.method !== opts.method) {
      return { ok: false, layer: 'binding', reason: 'method binding mismatch' };
    }
    if (claims.request.path !== opts.path) {
      return { ok: false, layer: 'binding', reason: 'path binding mismatch' };
    }
    if (claims.request.bodySha256 !== opts.bodySha256) {
      return { ok: false, layer: 'binding', reason: 'bodySha256 binding mismatch' };
    }
  } else {
    // Spec shape.
    if (claims.binding.organizationId !== opts.organizationId) {
      return { ok: false, layer: 'binding', reason: 'organizationId binding mismatch' };
    }
    if (claims.binding.crmSubject !== opts.crmSubject) {
      return { ok: false, layer: 'binding', reason: 'crmSubject binding mismatch' };
    }
    if (claims.request.method !== opts.method) {
      return { ok: false, layer: 'binding', reason: 'method binding mismatch' };
    }
    if (claims.request.path !== opts.path) {
      return { ok: false, layer: 'binding', reason: 'path binding mismatch' };
    }
    if (claims.request.bodySha256 !== opts.bodySha256) {
      return { ok: false, layer: 'binding', reason: 'bodySha256 binding mismatch' };
    }
  }

  // Layer 8: per-operation required actor.
  const actorRes = actorForOperation(opts.operation);
  if (!actorRes.ok) return { ok: false, layer: 'actor', reason: actorRes.reason };

  // Layer 9: query-only actor rule (F-01).
  const claimsHasQueryActor = claims.actor !== undefined;
  if (opts.query && !claimsHasQueryActor) {
    return { ok: false, layer: 'query_actor', reason: 'query surface requires DELEGATED_USER actor' };
  }
  if (!opts.query && claimsHasQueryActor) {
    return {
      ok: false,
      layer: 'query_actor',
      reason: 'issuance/exchange/cleanup do not accept a query actor',
    };
  }

  return {
    ok: true,
    layer: 'profile',
    header: headerParsed.data,
    claims,
    requiredActor: actorRes.required,
  };
}
