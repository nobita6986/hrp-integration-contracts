import { z } from 'zod';
import {
  CorrelationIdSchema,
  OrganizationIdSchema,
  CanonicalIdSchema,
  JtiSchema,
  DelegationRefSchema,
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
// Strictly enforced:
//   - Header: raw parsing detects duplicate JSON member keys BEFORE
//     JSON.parse silently drops them; framing rejects Cc/Cf/FEFF/bidi
//     and unknown header parameters (alg/typ/kid profile).
//   - Claims: iss/sub/serviceId/aud/iat/exp/jti/scope/binding/request.
//     sub === serviceId. aud must equal the operation audience (per-op).
//     scope must be a single-literal array. nbf is NOT accepted.
//     Integer epoch; exp > iat; lifetime <= 60s.
//     `now < exp + 30s` boundary enforced (verifierNow < exp + 30s).
//   - Request binding B: method/path/bodySha256 strictly compared.
//   - Query actor must be DELEGATED_USER; issuance/exchange/cleanup do
//     not accept a query actor shape.
//   - organizationIdDigest was removed: not part of the accepted profile.
//
// No signature cryptography, no signer, no replay store. Runtime
// invariants (signature verify, jti consume, session active, RLS,
// cancel atomicity) are recorded as future runtime test requirements.
// ============================================================================

// --- Raw header profile -----------------------------------------------------

const ALG_PROFILE = z.enum(['HS256', 'RS256']);
const TYP_PROFILE = z.enum(['JWT']);
const KID_PROFILE = z.string().min(1).max(64).regex(/^[A-Za-z0-9._-]+$/u);

const PROTECTED_HEADER_SCHEMA = z
  .object({
    alg: ALG_PROFILE,
    typ: TYP_PROFILE,
    kid: KID_PROFILE,
  })
  .strict()
  .refine(
    (v) => {
      // No crit, no jku, no x5u, no embedded JWK.
      return Object.prototype.hasOwnProperty.call(v, 'crit') === false;
    },
    { message: 'crit is not accepted' },
  );

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
  // Detect duplicate top-level JSON member names. JSON.parse silently keeps
  // only the last; we cannot trust parsed-object validation alone for this.
  const seen = new Set<string>();
  let i = 1;
  while (i < raw.length) {
    while (i < raw.length && /[\s,]/.test(raw[i])) i++;
    if (i >= raw.length || raw[i] === '}') break;
    if (raw[i] !== '"') {
      return { ok: false as const, layer: 'raw' as const, reason: 'expected quoted key' };
    }
    let j = i + 1;
    let key = '';
    while (j < raw.length) {
      const c = raw[j];
      if (c === '\\') {
        key += c + (raw[j + 1] ?? '');
        j += 2;
        continue;
      }
      if (c === '"') break;
      key += c;
      j++;
    }
    if (raw[j] !== '"') {
      return { ok: false as const, layer: 'raw' as const, reason: 'unterminated key' };
    }
    if (seen.has(key)) {
      return {
        ok: false as const,
        layer: 'raw' as const,
        reason: 'duplicate top-level key: ' + key,
      };
    }
    seen.add(key);
    i = j + 1;
    while (i < raw.length && /[\s]/.test(raw[i])) i++;
    if (raw[i] !== ':') {
      return { ok: false as const, layer: 'raw' as const, reason: 'expected colon' };
    }
    i++;
    while (i < raw.length && /[\s]/.test(raw[i])) i++;
    if (raw[i] === '"') {
      let k = i + 1;
      while (k < raw.length) {
        if (raw[k] === '\\') {
          k += 2;
          continue;
        }
        if (raw[k] === '"') break;
        k++;
      }
      i = k + 1;
    } else if (raw[i] === '{' || raw[i] === '[') {
      const open = raw[i];
      const close = open === '{' ? '}' : ']';
      let depth = 1;
      i++;
      while (i < raw.length && depth > 0) {
        if (raw[i] === open) depth++;
        else if (raw[i] === close) depth--;
        else if (raw[i] === '"') {
          let k = i + 1;
          while (k < raw.length) {
            if (raw[k] === '\\') {
              k += 2;
              continue;
            }
            if (raw[k] === '"') break;
            k++;
          }
          i = k + 1;
          continue;
        }
        i++;
      }
    } else {
      while (i < raw.length && /[^,}\s]/.test(raw[i])) i++;
    }
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false as const, layer: 'raw' as const, reason: 'not valid JSON' };
  }
  return { ok: true as const, layer: 'raw' as const, value: parsed };
}

// --- Claims profile ---------------------------------------------------------

// --- Claims profile ---------------------------------------------------------
//
// Schema output shapes (used by entrypoint and tests). The runtime ZodObject
// is .strict() so unknown keys are rejected; the explicit output types
// below document that all fields are required in the parsed result.

const integerTime = z.number().int();

type AssertionBindingFields = {
  method: string;
  path: string;
  bodySha256: string;
};
type AssertionRequestFields = {
  organizationId: string;
  crmSubject: string;
  delegationRef: string;
};
export type AssertionClaims = {
  iss: string;
  aud: string;
  sub: string;
  jti: string;
  iat: number;
  exp: number;
  scope: string;
  binding: AssertionBindingFields;
  request: AssertionRequestFields;
};
export const AssertionClaimsSchema = z
  .object({
    iss: z.string().min(1).max(256),
    aud: z.string().min(1).max(256),
    sub: z.string().min(1).max(256),
    jti: JtiSchema,
    iat: integerTime,
    exp: integerTime,
    scope: z.string().min(1).max(256),
    binding: z
      .object({
        method: z.string().regex(/^[A-Z]{3,8}$/u),
        path: z.string().min(1).max(2048),
        bodySha256: z.string().regex(/^[A-Fa-f0-9]{64}$/u),
      })
      .strict(),
    request: z
      .object({
        organizationId: OrganizationIdSchema,
        crmSubject: CanonicalIdSchema,
        delegationRef: DelegationRefSchema,
      })
      .strict(),
  })
  .strict();

export function validateClaimsObject(value: unknown):
  | { ok: false; layer: 'claims'; reason: string }
  | { ok: true; layer: 'claims'; claims: AssertionClaims }
{
  const parsed = AssertionClaimsSchema.safeParse(value);
  if (!parsed.success) {
    return { ok: false, layer: 'claims', reason: 'claims shape invalid' };
  }
  return { ok: true, layer: 'claims', claims: parsed.data as unknown as AssertionClaims };
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
  if (claims.exp <= claims.iat) return { ok: false as const, reason: 'exp must be > iat' };
  if (claims.exp - claims.iat > ttlSeconds) {
    return { ok: false as const, reason: 'TTL exceeds cap' };
  }
  // Boundary: verifierNow < exp + 30s.
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

export const BACKEND_OPERATIONS = Object.freeze(['create', 'exchange', 'cleanup']);

// Per-operation required audience. Query uses QueryDelegatedUserActor; the
// issuance/exchange/cleanup operations do NOT accept a query actor.
export const OPERATION_AUDIENCE = Object.freeze({
  create: 'https://hrp.example/api/delegation-requests',
  exchange: 'https://hrp.example/api/delegation-exchange',
  cleanup: 'https://hrp.example/api/delegation-cleanup',
});

const REQUIRED_ACTOR_PROFILE = Object.freeze({
  create: { requireEffectiveHrpUser: false, requireActiveCrmSession: true },
  exchange: { requireEffectiveHrpUser: true, requireActiveCrmSession: true },
  cleanup: { requireEffectiveHrpUser: false, requireActiveCrmSession: false },
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
  claims: z.infer<typeof AssertionClaimsSchema>;
  requiredActor: { operation: string; requireEffectiveHrpUser: boolean; requireActiveCrmSession: boolean };
};

export type AssertionProfileErr = {
  ok: false;
  layer: 'raw' | 'header' | 'claims' | 'ttl' | 'audience' | 'subject' | 'binding' | 'actor' | 'query_actor';
  reason: string;
  issues?: unknown;
};

export type ValidateAssertionProfileOpts = {
  protectedHeader: unknown;
  claims: unknown;
  operation: 'create' | 'exchange' | 'cleanup';
  serviceId: string;
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
 * Composes framing, duplicate-key, header profile, claims profile,
 * TTL/skew (boundary: verifierNow < exp + 30s), audience (per operation),
 * subject === serviceId, request binding, and per-operation actor
 * requirements. For the query surface, requires the query actor shape
 * (`DELEGATED_USER`); for issuance/exchange/cleanup, rejects it.
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
  // Explicit reject of jku/x5u/embedded JWK shape beyond .strict().
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

  // Layer 2: claims profile.
  const claimsRes = validateClaimsObject(opts.claims);
  if (claimsRes.ok === false) {
    return {
      ok: false,
      layer: 'claims' as const,
      reason: (claimsRes as { reason: string }).reason,
    };
  }
  const claims: AssertionClaims = (claimsRes as { claims: AssertionClaims }).claims;

  // Layer 3: subject === serviceId.
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

  // Layer 5: audience = expectedAudience (already per-op above).
  const audRes = validateAudience(claims, { audience: opts.expectedAudience });
  if (!audRes.ok) return { ok: false, layer: 'audience', reason: audRes.reason };

  // Layer 6: request binding B.
  const bindRes = validateRequestBinding(claims, {
    method: opts.method,
    path: opts.path,
    bodySha256: opts.bodySha256,
    organizationId: opts.organizationId,
    crmSubject: opts.crmSubject,
  });
  if (!bindRes.ok) return { ok: false, layer: 'binding', reason: bindRes.reason };

  // Layer 7: per-operation required actor.
  const actorRes = actorForOperation(opts.operation);
  if (!actorRes.ok) return { ok: false, layer: 'actor', reason: actorRes.reason };

  // Layer 8: query-only actor rule (F-01).
  const claimsRecord = claims as Record<string, unknown>;
  const claimsHasQueryActor =
    claimsRecord['actor'] !== undefined &&
    (claimsRecord['actor'] as Record<string, unknown>)['kind'] === 'DELEGATED_USER';
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

