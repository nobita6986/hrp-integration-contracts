import { z } from 'zod';
/** Dedicated query target: read by known canonical LaborProfile ID. */
export declare const TalentContextReadTargetSchema: z.ZodObject<{
    kind: z.ZodLiteral<"TALENT">;
    laborProfileId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    kind?: "TALENT";
    laborProfileId?: string;
}, {
    kind?: "TALENT";
    laborProfileId?: string;
}>;
/**
 * Eight query fields. Only `identitySummary` is currently supported for the
 * thin slice; the other seven are recognized as "known but unsupported" so
 * they round-trip to `unavailableFields` when requested.
 */
export declare const TalentContextReadFieldSchema: z.ZodEnum<["identitySummary", "placementCase", "availability", "currentRelationship", "nextAction", "recentInteractions", "contactability", "suppressionSummary"]>;
/** fieldAllowlist: unique, length 1..8. */
export declare const TalentContextReadFieldAllowlistSchema: z.ZodEffects<z.ZodArray<z.ZodEnum<["identitySummary", "placementCase", "availability", "currentRelationship", "nextAction", "recentInteractions", "contactability", "suppressionSummary"]>, "many">, ("identitySummary" | "placementCase" | "availability" | "currentRelationship" | "nextAction" | "recentInteractions" | "contactability" | "suppressionSummary")[], ("identitySummary" | "placementCase" | "availability" | "currentRelationship" | "nextAction" | "recentInteractions" | "contactability" | "suppressionSummary")[]>;
/**
 * F-02 — DELEGATED_USER actor per EP-01 / S25.
 *
 * The actor is an untrusted REQUEST claim. The signed assertion must bind
 * the same serviceId/userId/delegationRef values and HRP server-side must
 * verify the stored delegation still owns the requested (organizationId,
 * laborProfileId) pair before releasing identitySummary.
 *
 * delegationRef reuses the canonical F-03 token schema.
 */
export declare const QueryDelegatedUserActorSchema: z.ZodObject<{
    kind: z.ZodLiteral<"DELEGATED_USER">;
    serviceId: z.ZodString;
    userId: z.ZodString;
    delegationRef: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
}, "strict", z.ZodTypeAny, {
    serviceId?: string;
    kind?: "DELEGATED_USER";
    userId?: string;
    delegationRef?: string;
}, {
    serviceId?: string;
    kind?: "DELEGATED_USER";
    userId?: string;
    delegationRef?: string;
}>;
export declare const TalentContextReadQueryRequestSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"1">;
    correlationId: z.ZodString;
    organizationId: z.ZodString;
    actor: z.ZodObject<{
        kind: z.ZodLiteral<"DELEGATED_USER">;
        serviceId: z.ZodString;
        userId: z.ZodString;
        delegationRef: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    }, "strict", z.ZodTypeAny, {
        serviceId?: string;
        kind?: "DELEGATED_USER";
        userId?: string;
        delegationRef?: string;
    }, {
        serviceId?: string;
        kind?: "DELEGATED_USER";
        userId?: string;
        delegationRef?: string;
    }>;
    target: z.ZodObject<{
        kind: z.ZodLiteral<"TALENT">;
        laborProfileId: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        kind?: "TALENT";
        laborProfileId?: string;
    }, {
        kind?: "TALENT";
        laborProfileId?: string;
    }>;
    fieldAllowlist: z.ZodEffects<z.ZodArray<z.ZodEnum<["identitySummary", "placementCase", "availability", "currentRelationship", "nextAction", "recentInteractions", "contactability", "suppressionSummary"]>, "many">, ("identitySummary" | "placementCase" | "availability" | "currentRelationship" | "nextAction" | "recentInteractions" | "contactability" | "suppressionSummary")[], ("identitySummary" | "placementCase" | "availability" | "currentRelationship" | "nextAction" | "recentInteractions" | "contactability" | "suppressionSummary")[]>;
}, "strict", z.ZodTypeAny, {
    correlationId?: string;
    organizationId?: string;
    actor?: {
        serviceId?: string;
        kind?: "DELEGATED_USER";
        userId?: string;
        delegationRef?: string;
    };
    schemaVersion?: "1";
    target?: {
        kind?: "TALENT";
        laborProfileId?: string;
    };
    fieldAllowlist?: ("identitySummary" | "placementCase" | "availability" | "currentRelationship" | "nextAction" | "recentInteractions" | "contactability" | "suppressionSummary")[];
}, {
    correlationId?: string;
    organizationId?: string;
    actor?: {
        serviceId?: string;
        kind?: "DELEGATED_USER";
        userId?: string;
        delegationRef?: string;
    };
    schemaVersion?: "1";
    target?: {
        kind?: "TALENT";
        laborProfileId?: string;
    };
    fieldAllowlist?: ("identitySummary" | "placementCase" | "availability" | "currentRelationship" | "nextAction" | "recentInteractions" | "contactability" | "suppressionSummary")[];
}>;
export declare const IdentitySummarySchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"1">;
    fullNameRedacted: z.ZodEffects<z.ZodString, string, string>;
    displayOnly: z.ZodLiteral<true>;
}, "strict", z.ZodTypeAny, {
    schemaVersion?: "1";
    fullNameRedacted?: string;
    displayOnly?: true;
}, {
    schemaVersion?: "1";
    fullNameRedacted?: string;
    displayOnly?: true;
}>;
/** unavailableFields: unique, length 0..8. */
export declare const UnavailableFieldsSchema: z.ZodEffects<z.ZodArray<z.ZodEnum<["identitySummary", "placementCase", "availability", "currentRelationship", "nextAction", "recentInteractions", "contactability", "suppressionSummary"]>, "many">, ("identitySummary" | "placementCase" | "availability" | "currentRelationship" | "nextAction" | "recentInteractions" | "contactability" | "suppressionSummary")[], ("identitySummary" | "placementCase" | "availability" | "currentRelationship" | "nextAction" | "recentInteractions" | "contactability" | "suppressionSummary")[]>;
export declare const TalentContextReadResultSchema: z.ZodEffects<z.ZodObject<{
    schemaVersion: z.ZodLiteral<"1">;
    correlationId: z.ZodString;
    organizationId: z.ZodString;
    target: z.ZodObject<{
        kind: z.ZodLiteral<"TALENT">;
        laborProfileId: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        kind?: "TALENT";
        laborProfileId?: string;
    }, {
        kind?: "TALENT";
        laborProfileId?: string;
    }>;
    identitySummary: z.ZodOptional<z.ZodObject<{
        schemaVersion: z.ZodLiteral<"1">;
        fullNameRedacted: z.ZodEffects<z.ZodString, string, string>;
        displayOnly: z.ZodLiteral<true>;
    }, "strict", z.ZodTypeAny, {
        schemaVersion?: "1";
        fullNameRedacted?: string;
        displayOnly?: true;
    }, {
        schemaVersion?: "1";
        fullNameRedacted?: string;
        displayOnly?: true;
    }>>;
    unavailableFields: z.ZodEffects<z.ZodArray<z.ZodEnum<["identitySummary", "placementCase", "availability", "currentRelationship", "nextAction", "recentInteractions", "contactability", "suppressionSummary"]>, "many">, ("identitySummary" | "placementCase" | "availability" | "currentRelationship" | "nextAction" | "recentInteractions" | "contactability" | "suppressionSummary")[], ("identitySummary" | "placementCase" | "availability" | "currentRelationship" | "nextAction" | "recentInteractions" | "contactability" | "suppressionSummary")[]>;
    resolvedAt: z.ZodString;
}, "strict", z.ZodTypeAny, {
    correlationId?: string;
    organizationId?: string;
    identitySummary?: {
        schemaVersion?: "1";
        fullNameRedacted?: string;
        displayOnly?: true;
    };
    schemaVersion?: "1";
    target?: {
        kind?: "TALENT";
        laborProfileId?: string;
    };
    unavailableFields?: ("identitySummary" | "placementCase" | "availability" | "currentRelationship" | "nextAction" | "recentInteractions" | "contactability" | "suppressionSummary")[];
    resolvedAt?: string;
}, {
    correlationId?: string;
    organizationId?: string;
    identitySummary?: {
        schemaVersion?: "1";
        fullNameRedacted?: string;
        displayOnly?: true;
    };
    schemaVersion?: "1";
    target?: {
        kind?: "TALENT";
        laborProfileId?: string;
    };
    unavailableFields?: ("identitySummary" | "placementCase" | "availability" | "currentRelationship" | "nextAction" | "recentInteractions" | "contactability" | "suppressionSummary")[];
    resolvedAt?: string;
}>, {
    correlationId?: string;
    organizationId?: string;
    identitySummary?: {
        schemaVersion?: "1";
        fullNameRedacted?: string;
        displayOnly?: true;
    };
    schemaVersion?: "1";
    target?: {
        kind?: "TALENT";
        laborProfileId?: string;
    };
    unavailableFields?: ("identitySummary" | "placementCase" | "availability" | "currentRelationship" | "nextAction" | "recentInteractions" | "contactability" | "suppressionSummary")[];
    resolvedAt?: string;
}, {
    correlationId?: string;
    organizationId?: string;
    identitySummary?: {
        schemaVersion?: "1";
        fullNameRedacted?: string;
        displayOnly?: true;
    };
    schemaVersion?: "1";
    target?: {
        kind?: "TALENT";
        laborProfileId?: string;
    };
    unavailableFields?: ("identitySummary" | "placementCase" | "availability" | "currentRelationship" | "nextAction" | "recentInteractions" | "contactability" | "suppressionSummary")[];
    resolvedAt?: string;
}>;
