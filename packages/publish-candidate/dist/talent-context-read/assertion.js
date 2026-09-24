import { z } from 'zod';
import { JtiSchema, DelegationRefSchema, OrganizationIdSchema, CanonicalIdSchema, OpaqueBindingLikeIdSchema, BindingTimestampSchema, SingleScopeArraySchema, } from './primitives.js';
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
//     - serviceId required (string field; not derived from sub).
//     - aud required, MUST equal expectedAudience (per operation).
//     - iat, exp required, integer epoch, non-negative, no unsafe-large
//       integer, exp > iat, lifetime <= 60s. verifierNow < exp + 30s.
//     - jti required, canonical 32-byte token.
//     - scope MUST be exactly [canonical literal] (single-element array).
//       String form and arbitrary literals REJECTED.
//     - binding (B): organizationId/crmSubject/crmSessionHandle/
//       crmSessionDeadline/callbackId, each validated by EP-05 canonical
//       grammar and BindingTimestampSchema.
//     - request: method MUST equal 'POST'; path as registered;
//       bodySha256 MUST be 64 lowercase hex chars and match registered.
//     - nbf NOT accepted. organizationIdDigest NOT accepted.
//     - actor (query surface only): kind MUST be 'DELEGATED_USER';
//       serviceId MUST equal top-level serviceId; userId OPAQUE_GRAMMAR;
//       delegationRef canonical 32-byte token.
//     - Unknown top-level / binding / request / actor fields REJECTED.
//
// No signature cryptography, no signer, no replay store. Runtime
// invariants (signature verify, jti consume, session active, RLS,
// cancel atomicity) are recorded as future runtime test requirements.
// ============================================================================
// --- Raw header profile -----------------------------------------------------
const ALG_PROFILE_STRICT = z.enum(['RS256']);
// EP-01 wire typ is 'hrp-crm-service+jwt'. No legacy 'JWT' variant is
// accepted at the consumer-facing profile. Diagnostics that need to test
// impl-shape binding must use the separate `diagnosticValidateAssertion`
// helper (which is explicitly NOT a profile entrypoint).
const TYP_PROFILE_STRICT = z.enum(['hrp-crm-service+jwt']);
const KID_PROFILE = z.string().min(1).max(64).regex(/^[A-Za-z0-9._-]+$/u);
const PROTECTED_HEADER_SCHEMA = z
    .object({
    alg: ALG_PROFILE_STRICT,
    typ: TYP_PROFILE_STRICT,
    kid: KID_PROFILE,
})
    .strict();
export function parseAssertionHeader(raw) {
    if (typeof raw !== 'string') {
        return { ok: false, layer: 'raw', reason: 'assertion header must be a string' };
    }
    if (raw.length === 0 || raw.length > 8192) {
        return { ok: false, layer: 'raw', reason: 'header length out of bounds' };
    }
    // Reject Cc/Cf/FEFF/bidi in the framing string.
    for (let i = 0; i < raw.length; i++) {
        const cp = raw.codePointAt(i);
        if (cp === undefined) {
            return { ok: false, layer: 'raw', reason: 'unexpected EOF' };
        }
        if (cp <= 0x1F && cp !== 0x09 && cp !== 0x0A && cp !== 0x0D) {
            return { ok: false, layer: 'raw', reason: 'contains control characters' };
        }
        if (cp === 0x7F) {
            return { ok: false, layer: 'raw', reason: 'contains DEL' };
        }
        if (cp === 0xFEFF) {
            return { ok: false, layer: 'raw', reason: 'contains FEFF' };
        }
        if (cp === 0x202A || cp === 0x202B || cp === 0x202C ||
            cp === 0x202D || cp === 0x202E ||
            cp === 0x2066 || cp === 0x2067 || cp === 0x2068 || cp === 0x2069) {
            return { ok: false, layer: 'raw', reason: 'contains bidi control' };
        }
        if (cp > 0xFFFF)
            i++;
    }
    if (raw[0] !== '{') {
        return { ok: false, layer: 'raw', reason: 'must start with brace' };
    }
    // Detect duplicate JSON member names AT ANY DEPTH (escaped-equivalent +
    // nested duplicates). JSON.parse silently keeps only the last.
    const dupErr = detectDuplicateKeys(raw);
    if (dupErr !== null) {
        return {
            ok: false,
            layer: 'raw',
            reason: 'duplicate top-level key: ' + dupErr,
        };
    }
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        return { ok: false, layer: 'raw', reason: 'not valid JSON' };
    }
    return { ok: true, layer: 'raw', value: parsed };
}
/**
 * Consumer-facing WIRE entrypoint for JWT assertion profile validation.
 *
 * Accepts raw header bytes (as would arrive on the wire before base64url
 * decoding).  All security checks run before any parsed-object is produced:
 *   1. Raw framing check  — length, control chars, BOM, bidi.
 *   2. Duplicate-key scan  — catches top-level, nested, and escaped-equivalent
 *      duplicates that JSON.parse would silently discard.
 *   3. JSON parse.
 *   4. Protected header profile (alg / typ / kid; reject embedded JWKs).
 *   5. Claims object profile  — iss / sub / serviceId / aud / iat / exp / jti /
 *      scope / binding / request / actor.
 *   6. Subject = serviceId.
 *   7. TTL / skew boundary.
 *   8. Operation audience.
 *   9. Issuer.
 *   10. Per-operation actor profile (create / exchange / cleanup / query).
 *
 * Callers do NOT need to call separate framing/duplicate/claims helpers to
 * achieve the EP-01 security posture — one function call covers everything.
 */
export function validateAssertionFromWire(rawProtectedHeader, opts) {
    // Layer 0: raw header framing + duplicate-key detection.
    const rawResult = parseAssertionHeader(rawProtectedHeader);
    if (!rawResult.ok) {
        return {
            ok: false,
            layer: rawResult.layer,
            reason: rawResult.reason,
        };
    }
    return validateAssertionProfile({
        ...opts,
        protectedHeader: rawResult.value,
    });
}
/**
 * Detect duplicate JSON member names at ANY depth, including escaped-equivalent
 * duplicates (e.g. `\u0069ss` vs `iss`). Returns the duplicate resolved key
 * or null if no duplicates are found.
 */
function detectDuplicateKeys(raw) {
    const stack = [];
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
                if (cc === '"')
                    break;
                rawStr += cc;
                j++;
            }
            if (raw[j] !== '"')
                return 'unterminated string';
            const resolved = resolveJsonEscapes(rawStr);
            // Skip whitespace
            let k = j + 1;
            while (k < n && /\s/.test(raw[k]))
                k++;
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
            stack.push({ kind: 'object', seen: new Set() });
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
function resolveJsonEscapes(s) {
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
            }
            else if (nxt === 'n') {
                out += '\n';
                i += 1;
                continue;
            }
            else if (nxt === 't') {
                out += '\t';
                i += 1;
                continue;
            }
            else if (nxt === 'r') {
                out += '\r';
                i += 1;
                continue;
            }
            else if (nxt === 'b') {
                out += '\b';
                i += 1;
                continue;
            }
            else if (nxt === 'f') {
                out += '\f';
                i += 1;
                continue;
            }
            else if (nxt === '"') {
                out += '"';
                i += 1;
                continue;
            }
            else if (nxt === '\\') {
                out += '\\';
                i += 1;
                continue;
            }
            else if (nxt === '/') {
                out += '/';
                i += 1;
                continue;
            }
            out += c;
            continue;
        }
        out += c;
    }
    return out.normalize('NFKC');
}
// --- Claims profile ---------------------------------------------------------
//
// EP-01 spec shape (bilateral acceptance, post-batch-5):
//   iss, sub, serviceId, aud, iat, exp, jti, scope, binding, request.
//   Optionally: actor (required when query surface is in use).
//
// Strict EP-01 spec only at the consumer-facing validator:
//   Spec binding:    { organizationId, crmSubject, crmSessionHandle,
//                       crmSessionDeadline, callbackId }
//   Spec request:    { method: 'POST', path, bodySha256: 64 lowercase hex }
//
// Impl-shape inputs (binding={method,path,bodySha256} or
// request={organizationId,crmSubject,delegationRef}) are NO LONGER accepted.
// The diagnostic helper `diagnosticValidateAssertion` exists for tests that
// must exercise legacy shapes; it does NOT confer profile conformance.
//
//   Spec request:    { method, path, bodySha256 }
//   Impl request:    { organizationId, crmSubject, delegationRef }
//
// `validateClaimsObject` returns the unified EP-01 view; the entrypoint
// then enforces the EP-01 strict rules against options.
const SCOPE_LITERAL = 'talent-context:read:identitySummary';
const integerTime = z.number().int().min(0);
/**
 * Validate EP-01 strict claims and return a NORMALIZED view.
 *
 * All strict EP-01 rules enforced directly:
 * - serviceId is a mandatory string field (not derived from sub).
 * - scope must be exactly a single-element array of the canonical literal.
 * - binding fields (organizationId, crmSubject, crmSessionHandle, crmSessionDeadline,
 *   callbackId) are validated against canonical EP-05 grammars.
 * - actor fields (serviceId, userId, delegationRef) are validated against
 *   canonical EP-05 grammars / token schemas.
 * - Unknown fields at the top level, inside binding, request, or actor cause rejection.
 * - Impl-shape (flipped binding/request) is not accepted.
 *
 * This function is the consumer-facing claims validator for EP-01 strict compliance.
 * Diagnostics that need to test legacy impl-shape inputs must use the separate
 * `diagnosticValidateAssertion` helper (which is NOT a profile entrypoint).
 */
export function validateClaimsObject(value) {
    if (typeof value !== 'object' || value === null) {
        return { ok: false, layer: 'claims', reason: 'claims must be an object' };
    }
    const v = value;
    // Required top-level fields.
    if (typeof v['iss'] !== 'string') {
        return { ok: false, layer: 'claims', reason: 'iss required' };
    }
    if (typeof v['sub'] !== 'string') {
        return { ok: false, layer: 'claims', reason: 'sub required' };
    }
    // serviceId must be present as a string (not derived from sub).
    if (typeof v['serviceId'] !== 'string') {
        return { ok: false, layer: 'claims', reason: 'serviceId required' };
    }
    if (v['serviceId'] !== v['sub']) {
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
    // Forbidden claims.
    if (v['nbf'] !== undefined) {
        return { ok: false, layer: 'claims', reason: 'nbf not accepted' };
    }
    if (v['organizationIdDigest'] !== undefined) {
        return { ok: false, layer: 'claims', reason: 'organizationIdDigest not accepted' };
    }
    if (v['role'] !== undefined) {
        return { ok: false, layer: 'claims', reason: 'role not accepted' };
    }
    // Scope: must be exactly a single-element array of the canonical literal.
    const scopeParse = SingleScopeArraySchema.safeParse(v['scope']);
    if (!scopeParse.success) {
        return { ok: false, layer: 'claims', reason: 'scope must be a single-element array of the canonical literal' };
    }
    // Binding: must be spec-shape with canonical grammar on each field.
    const b = v['binding'];
    if (typeof b !== 'object' || b === null) {
        return { ok: false, layer: 'claims', reason: 'binding required' };
    }
    const bindingRec = b;
    // Validate each B field against canonical EP-05 grammars.
    const orgIdParse = OrganizationIdSchema.safeParse(bindingRec['organizationId']);
    if (!orgIdParse.success) {
        return { ok: false, layer: 'claims', reason: 'binding.organizationId invalid', issues: orgIdParse.error.issues };
    }
    const crmSubjParse = CanonicalIdSchema.safeParse(bindingRec['crmSubject']);
    if (!crmSubjParse.success) {
        return { ok: false, layer: 'claims', reason: 'binding.crmSubject invalid', issues: crmSubjParse.error.issues };
    }
    // crmSessionHandle: opaque non-bearer alias.
    const sessionHandleParse = OpaqueBindingLikeIdSchema(128).safeParse(bindingRec['crmSessionHandle']);
    if (!sessionHandleParse.success) {
        return { ok: false, layer: 'claims', reason: 'binding.crmSessionHandle invalid', issues: sessionHandleParse.error.issues };
    }
    // crmSessionDeadline: RFC3339 UTC Z, valid calendar date.
    const deadlineParse = BindingTimestampSchema.safeParse(bindingRec['crmSessionDeadline']);
    if (!deadlineParse.success) {
        return { ok: false, layer: 'claims', reason: 'binding.crmSessionDeadline invalid', issues: deadlineParse.error.issues };
    }
    // callbackId: opaque alias.
    const callbackIdParse = OpaqueBindingLikeIdSchema(64).safeParse(bindingRec['callbackId']);
    if (!callbackIdParse.success) {
        return { ok: false, layer: 'claims', reason: 'binding.callbackId invalid', issues: callbackIdParse.error.issues };
    }
    // Unknown binding fields: .strict() equivalent.
    const knownBindingKeys = new Set(['organizationId', 'crmSubject', 'crmSessionHandle', 'crmSessionDeadline', 'callbackId']);
    for (const key of Object.keys(bindingRec)) {
        if (!knownBindingKeys.has(key)) {
            return { ok: false, layer: 'claims', reason: `binding.unknown field: ${key}` };
        }
    }
    // Request: must be spec-shape.
    const r = v['request'];
    if (typeof r !== 'object' || r === null) {
        return { ok: false, layer: 'claims', reason: 'request required' };
    }
    const requestRec = r;
    if (typeof requestRec['method'] !== 'string') {
        return { ok: false, layer: 'claims', reason: 'request.method required' };
    }
    if (typeof requestRec['path'] !== 'string') {
        return { ok: false, layer: 'claims', reason: 'request.path required' };
    }
    if (typeof requestRec['bodySha256'] !== 'string') {
        return { ok: false, layer: 'claims', reason: 'request.bodySha256 required' };
    }
    // Unknown request fields.
    const knownRequestKeys = new Set(['method', 'path', 'bodySha256']);
    for (const key of Object.keys(requestRec)) {
        if (!knownRequestKeys.has(key)) {
            return { ok: false, layer: 'claims', reason: `request.unknown field: ${key}` };
        }
    }
    // Reject impl-shape binding (method/path/bodySha256 inside binding object).
    if (typeof bindingRec['method'] === 'string' ||
        typeof bindingRec['path'] === 'string' ||
        typeof bindingRec['bodySha256'] === 'string') {
        return { ok: false, layer: 'claims', reason: 'binding/request must be EP-01 spec shape only' };
    }
    // Unknown top-level fields.
    const knownTopKeys = new Set([
        'iss', 'sub', 'serviceId', 'aud', 'iat', 'exp', 'jti',
        'scope', 'binding', 'request', 'actor',
    ]);
    for (const key of Object.keys(v)) {
        if (!knownTopKeys.has(key)) {
            return { ok: false, layer: 'claims', reason: `unknown top-level field: ${key}` };
        }
    }
    // Actor (optional): must be DELEGATED_USER with grammatically valid fields.
    const actorRaw = v['actor'];
    let actor;
    if (actorRaw !== undefined) {
        if (typeof actorRaw !== 'object' || actorRaw === null) {
            return { ok: false, layer: 'claims', reason: 'actor must be an object' };
        }
        const ar = actorRaw;
        if (ar['kind'] !== 'DELEGATED_USER') {
            return { ok: false, layer: 'claims', reason: 'actor.kind must be DELEGATED_USER' };
        }
        if (typeof ar['serviceId'] !== 'string') {
            return { ok: false, layer: 'claims', reason: 'actor.serviceId required' };
        }
        if (ar['serviceId'] !== v['serviceId']) {
            return { ok: false, layer: 'claims', reason: 'actor.serviceId must match serviceId' };
        }
        const userIdParse = OpaqueBindingLikeIdSchema(128).safeParse(ar['userId']);
        if (!userIdParse.success) {
            return { ok: false, layer: 'claims', reason: 'actor.userId invalid', issues: userIdParse.error.issues };
        }
        const delegationRefParse = DelegationRefSchema.safeParse(ar['delegationRef']);
        if (!delegationRefParse.success) {
            return { ok: false, layer: 'claims', reason: 'actor.delegationRef invalid', issues: delegationRefParse.error.issues };
        }
        // Unknown actor fields.
        const knownActorKeys = new Set(['kind', 'serviceId', 'userId', 'delegationRef']);
        for (const key of Object.keys(ar)) {
            if (!knownActorKeys.has(key)) {
                return { ok: false, layer: 'claims', reason: `actor.unknown field: ${key}` };
            }
        }
        actor = {
            kind: 'DELEGATED_USER',
            serviceId: ar['serviceId'],
            userId: ar['userId'],
            delegationRef: ar['delegationRef'],
        };
    }
    return {
        ok: true,
        layer: 'claims',
        claims: {
            iss: v['iss'],
            aud: v['aud'],
            sub: v['sub'],
            serviceId: v['serviceId'],
            jti: v['jti'],
            iat: v['iat'],
            exp: v['exp'],
            scope: [scopeParse.data[0]],
            binding: {
                organizationId: orgIdParse.data,
                crmSubject: crmSubjParse.data,
                crmSessionHandle: sessionHandleParse.data,
                crmSessionDeadline: deadlineParse.data,
                callbackId: callbackIdParse.data,
            },
            request: {
                method: requestRec['method'],
                path: requestRec['path'],
                bodySha256: requestRec['bodySha256'],
            },
            actor,
        },
    };
}
export function validateTtlSkew(claims, opts = {}) {
    const ttlSeconds = opts.ttlSeconds == null ? 60 : opts.ttlSeconds;
    const skewSeconds = opts.skewSeconds == null ? 30 : opts.skewSeconds;
    const nowSeconds = opts.nowSeconds == null ? Math.floor(Date.now() / 1000) : opts.nowSeconds;
    if (!Number.isInteger(claims.iat) || !Number.isInteger(claims.exp)) {
        return { ok: false, reason: 'iat/exp must be integer' };
    }
    if (claims.iat < 0 || claims.exp < 0) {
        return { ok: false, reason: 'iat/exp must be non-negative' };
    }
    if (claims.iat > Number.MAX_SAFE_INTEGER || claims.exp > Number.MAX_SAFE_INTEGER) {
        return { ok: false, reason: 'iat/exp exceeds safe integer bound' };
    }
    if (claims.exp <= claims.iat)
        return { ok: false, reason: 'exp must be > iat' };
    if (claims.exp - claims.iat > ttlSeconds) {
        return { ok: false, reason: 'TTL exceeds cap' };
    }
    if (nowSeconds >= claims.exp + skewSeconds) {
        return { ok: false, reason: 'expired at verifierNow' };
    }
    if (claims.iat - skewSeconds > nowSeconds) {
        return { ok: false, reason: 'iat in the future' };
    }
    return { ok: true };
}
export function validateAudience(claims, opts) {
    if (claims.aud !== opts.audience) {
        return { ok: false, reason: 'audience mismatch' };
    }
    return { ok: true };
}
export function validateIssuer(claims, opts) {
    if (claims.iss !== opts.issuer) {
        return { ok: false, reason: 'issuer mismatch' };
    }
    return { ok: true };
}
export function validateSubject(claims, opts) {
    if (claims.sub !== opts.serviceId) {
        return { ok: false, reason: 'sub must equal serviceId' };
    }
    return { ok: true };
}
export function validateRequestBinding(
// Re-exposed for probe F01 (rejects when context absent).
claims, opts) {
    // Fail-closed when context absent (per producer probe).
    if (!claims ||
        !claims.binding || !claims.request ||
        !opts || opts.method === undefined) {
        return { ok: false, reason: 'binding context absent' };
    }
    if (claims.binding.organizationId !== opts.organizationId) {
        return { ok: false, reason: 'organizationId binding mismatch' };
    }
    if (claims.binding.crmSubject !== opts.crmSubject) {
        return { ok: false, reason: 'crmSubject binding mismatch' };
    }
    // Format validation: POST must be exact; bodySha256 must be lowercase hex.
    if (claims.request.method !== 'POST') {
        return { ok: false, reason: 'method must be POST' };
    }
    if (claims.request.method !== opts.method) {
        return { ok: false, reason: 'method binding mismatch' };
    }
    if (claims.request.path !== opts.path) {
        return { ok: false, reason: 'path binding mismatch' };
    }
    if (!/^[a-f0-9]{64}$/.test(claims.request.bodySha256)) {
        return { ok: false, reason: 'bodySha256 must be 64 lowercase hex chars' };
    }
    if (claims.request.bodySha256 !== opts.bodySha256) {
        return { ok: false, reason: 'bodySha256 binding mismatch' };
    }
    return { ok: true };
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
export function actorForOperation(operation) {
    if (typeof operation !== 'string')
        return { ok: false, reason: 'unknown operation' };
    if (!Object.prototype.hasOwnProperty.call(REQUIRED_ACTOR_PROFILE, operation)) {
        return { ok: false, reason: 'unknown operation' };
    }
    const r = REQUIRED_ACTOR_PROFILE[operation];
    return { ok: true, required: { operation, ...r } };
}
// --- Single consumer-facing entrypoint -------------------------------------
export const ASSERTION_LIMITS = Object.freeze({
    MAX_HEADER_LEN: 8192,
    DEFAULT_TTL_SECONDS: 60,
    DEFAULT_SKEW_SECONDS: 30,
});
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
export function validateAssertionProfile(opts) {
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
    if (headerParsed.data['jku'] !== undefined ||
        headerParsed.data['x5u'] !== undefined ||
        headerParsed.data['jwk'] !== undefined ||
        headerParsed.data['x5c'] !== undefined) {
        return {
            ok: false,
            layer: 'header',
            reason: 'jku/x5u/jwk/x5c not accepted',
        };
    }
    // Layer 2: claims profile (EP-01 strict shape).
    const claimsRes = validateClaimsObject(opts.claims);
    if (claimsRes.ok === false) {
        return {
            ok: false,
            layer: 'claims',
            reason: claimsRes.reason,
            issues: claimsRes.issues,
        };
    }
    const claims = claimsRes.claims;
    // Layer 3: subject === serviceId (also enforced inside validateClaimsObject).
    const subjRes = validateSubject(claims, { serviceId: opts.serviceId });
    if (!subjRes.ok)
        return { ok: false, layer: 'subject', reason: subjRes.reason };
    // Layer 4: TTL/skew with EP-01 fixed caps (60s / 30s). Caller cannot relax.
    const ttlRes = validateTtlSkew(claims, {
        ttlSeconds: ASSERTION_LIMITS.DEFAULT_TTL_SECONDS,
        skewSeconds: ASSERTION_LIMITS.DEFAULT_SKEW_SECONDS,
        nowSeconds: opts.verifierNowSeconds,
    });
    if (!ttlRes.ok)
        return { ok: false, layer: 'ttl', reason: ttlRes.reason };
    // Layer 5: audience = expectedAudience (per operation).
    const audRes = validateAudience(claims, { audience: opts.expectedAudience });
    if (!audRes.ok)
        return { ok: false, layer: 'audience', reason: audRes.reason };
    // Layer 6: issuer = expectedIssuer.
    const issRes = validateIssuer(claims, { issuer: opts.expectedIssuer });
    if (!issRes.ok)
        return { ok: false, layer: 'issuer', reason: issRes.reason };
    // Layer 7: request binding B (EP-01 strict: POST + lowercase 64-hex).
    if (claims.binding.organizationId !== opts.organizationId) {
        return { ok: false, layer: 'binding', reason: 'organizationId binding mismatch' };
    }
    if (claims.binding.crmSubject !== opts.crmSubject) {
        return { ok: false, layer: 'binding', reason: 'crmSubject binding mismatch' };
    }
    // Format validation: POST must be uppercase and exact; bodySha256 must be lowercase hex.
    if (claims.request.method !== 'POST') {
        return { ok: false, layer: 'binding', reason: 'request.method must be POST' };
    }
    if (claims.request.path !== opts.path) {
        return { ok: false, layer: 'binding', reason: 'path binding mismatch' };
    }
    if (!/^[a-f0-9]{64}$/.test(claims.request.bodySha256)) {
        return { ok: false, layer: 'binding', reason: 'request.bodySha256 must be 64 lowercase hex chars' };
    }
    if (claims.request.bodySha256 !== opts.bodySha256) {
        return { ok: false, layer: 'binding', reason: 'bodySha256 binding mismatch' };
    }
    // Layer 8: per-operation required actor.
    const actorRes = actorForOperation(opts.operation);
    if (!actorRes.ok)
        return { ok: false, layer: 'actor', reason: actorRes.reason };
    // Layer 9: query-only actor rule (F-01). Derive from operation, NOT from caller flag.
    const claimsHasQueryActor = claims.actor !== undefined;
    const isQueryOp = opts.operation === 'query';
    if (isQueryOp && !claimsHasQueryActor) {
        return { ok: false, layer: 'query_actor', reason: 'query surface requires DELEGATED_USER actor' };
    }
    if (!isQueryOp && claimsHasQueryActor) {
        return {
            ok: false,
            layer: 'query_actor',
            reason: 'create/exchange/cleanup do not accept a query actor',
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
/**
 * Diagnostics-only helper for testing implementation-shaped binding variants.
 *
 * NOT a consumer-facing profile entrypoint.  This helper is intended for
 * internal diagnostic / probe use only.  A PASS from this helper does NOT
 * constitute EP-01 profile conformance and MUST NOT be used as a security
 * gate in production.
 *
 * The only difference from `validateAssertionProfile` is that the header
 * schema accepts `typ:'JWT'` (legacy producer compatibility) and the
 * impl-shape binding (flipped method/path/bodySha256 in the request field).
 */
export function diagnosticValidateAssertion(opts) {
    // Accept typ:'JWT' at the header schema level (diagnostic only).
    const diagHeaderSchema = z
        .object({
        alg: z.enum(['RS256']),
        typ: z.enum(['hrp-crm-service+jwt', 'JWT']),
        kid: z.string().min(1).max(64).regex(/^[A-Za-z0-9._-]+$/u),
    })
        .strict();
    const headerParsed = diagHeaderSchema.safeParse(opts.protectedHeader);
    if (!headerParsed.success) {
        return {
            ok: false,
            layer: 'header',
            reason: 'protected header shape invalid',
            issues: headerParsed.error.issues,
        };
    }
    if (headerParsed.data['jku'] !== undefined ||
        headerParsed.data['x5u'] !== undefined ||
        headerParsed.data['jwk'] !== undefined ||
        headerParsed.data['x5c'] !== undefined) {
        return {
            ok: false,
            layer: 'header',
            reason: 'jku/x5u/jwk/x5c not accepted',
        };
    }
    // Layer 2: claims (same as public profile).
    const claimsRes = validateClaimsObject(opts.claims);
    if (claimsRes.ok === false) {
        return {
            ok: false,
            layer: 'claims',
            reason: claimsRes.reason,
            issues: claimsRes.issues,
        };
    }
    const claims = claimsRes.claims;
    // Diagnostic helper delegates to the public validator for layers 3-9, only
    // substituting the header schema so legacy typ:'JWT' is accepted.
    const publicOpts = {
        protectedHeader: { alg: 'RS256', typ: 'hrp-crm-service+jwt', kid: 'diagnostic-key' },
        claims: opts.claims,
        operation: opts.operation,
        serviceId: opts.serviceId,
        expectedIssuer: opts.expectedIssuer,
        expectedAudience: opts.expectedAudience,
        method: opts.method,
        path: opts.path,
        bodySha256: opts.bodySha256,
        organizationId: opts.organizationId,
        crmSubject: opts.crmSubject,
        verifierNowSeconds: opts.verifierNowSeconds,
    };
    const pubResult = validateAssertionProfile(publicOpts);
    if (pubResult.ok === false) {
        return pubResult;
    }
    return {
        ok: true,
        layer: 'diagnostic',
        header: headerParsed.data,
        claims,
        requiredActor: pubResult.requiredActor,
    };
}
