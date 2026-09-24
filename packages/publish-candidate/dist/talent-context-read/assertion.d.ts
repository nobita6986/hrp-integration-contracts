import { z } from 'zod';
declare const PROTECTED_HEADER_SCHEMA: z.ZodObject<{
    alg: z.ZodEnum<["RS256"]>;
    typ: z.ZodEnum<["hrp-crm-service+jwt"]>;
    kid: z.ZodString;
}, "strict", z.ZodTypeAny, {
    alg?: "RS256";
    typ?: "hrp-crm-service+jwt";
    kid?: string;
}, {
    alg?: "RS256";
    typ?: "hrp-crm-service+jwt";
    kid?: string;
}>;
export declare function parseAssertionHeader(raw: unknown): {
    ok: false;
    layer: "raw";
    reason: string;
    value?: undefined;
} | {
    ok: true;
    layer: "raw";
    value: unknown;
    reason?: undefined;
};
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
export declare function validateAssertionFromWire(rawProtectedHeader: unknown, opts: ValidateAssertionProfileOpts): AssertionProfileOk | AssertionProfileErr;
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
export declare function validateClaimsObject(value: unknown): {
    ok: false;
    layer: 'claims';
    reason: string;
    issues?: unknown;
} | {
    ok: true;
    layer: 'claims';
    claims: NormalizedClaims;
};
export declare function validateTtlSkew(claims: {
    iat: number;
    exp: number;
}, opts?: {
    ttlSeconds?: number;
    skewSeconds?: number;
    nowSeconds?: number;
}): {
    ok: false;
    reason: string;
} | {
    ok: true;
    reason?: undefined;
};
export declare function validateAudience(claims: {
    aud: string;
}, opts: {
    audience: string;
}): {
    ok: false;
    reason: string;
} | {
    ok: true;
    reason?: undefined;
};
export declare function validateIssuer(claims: {
    iss: string;
}, opts: {
    issuer: string;
}): {
    ok: false;
    reason: string;
} | {
    ok: true;
    reason?: undefined;
};
export declare function validateSubject(claims: {
    sub: string;
}, opts: {
    serviceId: string;
}): {
    ok: false;
    reason: string;
} | {
    ok: true;
    reason?: undefined;
};
export declare function validateRequestBinding(claims: {
    binding: {
        organizationId: string;
        crmSubject: string;
    };
    request: {
        method: string;
        path: string;
        bodySha256: string;
    };
}, opts: {
    method: string;
    path: string;
    bodySha256: string;
    organizationId: string;
    crmSubject: string;
}): {
    ok: false;
    reason: string;
} | {
    ok: true;
    reason?: undefined;
};
export declare const BACKEND_OPERATIONS: readonly string[];
export declare const OPERATION_AUDIENCE: Readonly<{
    create: "https://hrp.example/api/delegation-requests";
    exchange: "https://hrp.example/api/delegation-exchange";
    cleanup: "https://hrp.example/api/delegation-cleanup";
    query: "urn:test:query";
}>;
export declare function actorForOperation(operation: string): {
    ok: false;
    reason: string;
    required?: undefined;
} | {
    ok: true;
    required: {
        requireEffectiveHrpUser: boolean;
        requireActiveCrmSession: boolean;
        operation: string;
    };
    reason?: undefined;
};
export declare const ASSERTION_LIMITS: Readonly<{
    MAX_HEADER_LEN: 8192;
    DEFAULT_TTL_SECONDS: 60;
    DEFAULT_SKEW_SECONDS: 30;
}>;
export type AssertionProfileOk = {
    ok: true;
    layer: 'profile';
    header: z.infer<typeof PROTECTED_HEADER_SCHEMA>;
    claims: NormalizedClaims;
    requiredActor: {
        operation: string;
        requireEffectiveHrpUser: boolean;
        requireActiveCrmSession: boolean;
    };
} | {
    ok: true;
    layer: 'diagnostic';
    header: {
        alg: string;
        typ: string;
        kid: string;
    };
    claims: NormalizedClaims;
    requiredActor: {
        operation: string;
        requireEffectiveHrpUser: boolean;
        requireActiveCrmSession: boolean;
    };
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
export declare function validateAssertionProfile(opts: ValidateAssertionProfileOpts): AssertionProfileOk | AssertionProfileErr;
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
export declare function diagnosticValidateAssertion(opts: ValidateAssertionProfileOpts): AssertionProfileOk | AssertionProfileErr;
export {};
