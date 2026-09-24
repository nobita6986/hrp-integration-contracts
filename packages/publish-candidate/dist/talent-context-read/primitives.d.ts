import { z } from 'zod';
/** Encode bytes to canonical base64url (no padding). */
export declare function encodeBase64Url(bytes: Uint8Array): string;
/** Decode base64url to bytes. Throws if input contains `=` or non-alphabet. */
export declare function decodeBase64Url(str: string): Uint8Array;
export declare function canonicalTokenSchema(prefix: string): z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
export declare const PendingRequestIdSchema: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
export declare const HandoffProofSchema: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
export declare const ReceiptSchema: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
export declare const DelegationRefSchema: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
export declare const CallbackStateSchema: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
export declare const JtiSchema: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
export declare const CsrfTokenSchema: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
export declare function byteLengthUtf8(s: string): number;
/** Reusable opaque-binding-id primitive (no whitespace, no leading separator). */
export declare const OpaqueBindingLikeIdSchema: (max: number) => z.ZodString;
export declare const CorrelationIdSchema: z.ZodString;
export declare const OrganizationIdSchema: z.ZodString;
export declare const CanonicalIdSchema: z.ZodString;
export declare const BindingTimestampSchema: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
/**
 * General ISO-8601 timestamp (used in result.resolvedAt and unbounded surfaces).
 * NOT used inside immutable B.
 */
export declare const IsoTimestampSchema: z.ZodString;
/** Module-local schemaVersion. Not a shared v1 literal. */
export declare const MODULE_SCHEMA_VERSION = "1";
export declare const ModuleSchemaVersionSchema: z.ZodLiteral<"1">;
/** Reusable strict base binding object (used by delegation schemas that extend it). */
export declare const CrmBindingBaseSchema: z.ZodObject<{
    organizationId: z.ZodString;
    crmSubject: z.ZodString;
    crmSessionHandle: z.ZodString;
    crmSessionDeadline: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    callbackId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
}, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
}>;
export declare const CrmBindingSchema: z.ZodEffects<z.ZodObject<{
    organizationId: z.ZodString;
    crmSubject: z.ZodString;
    crmSessionHandle: z.ZodString;
    crmSessionDeadline: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    callbackId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
}, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
}>, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
}, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
}>;
/** Single fixed scope literal - arrays contain exactly this one value. */
export declare const SINGLE_SCOPE_LITERAL = "talent-context:read:identitySummary";
export declare const SingleScopeArraySchema: z.ZodArray<z.ZodLiteral<"talent-context:read:identitySummary">, "many">;
