import { z } from 'zod';
export declare const QUERY_RETRY_NEVER = "NEVER";
export declare const QUERY_RETRY_REAUTH = "REAUTHENTICATE";
export declare const QUERY_RETRY_BOUNDED_NEW = "BOUNDED_NEW_ASSERTION";
export declare const QueryRetryClassSchema: z.ZodEnum<["NEVER", "REAUTHENTICATE", "BOUNDED_NEW_ASSERTION"]>;
export declare const QUERY_ERROR_HTTP_STATUS: Readonly<{
    VALIDATION_ERROR: 422;
    AUTHENTICATION_REQUIRED: 401;
    FORBIDDEN: 403;
    RATE_LIMITED: 429;
    DEPENDENCY_UNAVAILABLE: 503;
    NOT_FOUND: 404;
    INTERNAL_ERROR: 500;
}>;
export declare const QUERY_ERROR_MESSAGE_KEY: Readonly<{
    VALIDATION_ERROR: "errors.validation";
    AUTHENTICATION_REQUIRED: "errors.authenticationRequired";
    FORBIDDEN: "errors.forbidden";
    RATE_LIMITED: "errors.rateLimited";
    DEPENDENCY_UNAVAILABLE: "errors.dependencyUnavailable";
    NOT_FOUND: "errors.talentContext.notFound";
    INTERNAL_ERROR: "errors.talentContext.internal";
}>;
export declare const QUERY_ERROR_RETRY_CLASS: Readonly<{
    VALIDATION_ERROR: "NEVER";
    AUTHENTICATION_REQUIRED: "REAUTHENTICATE";
    FORBIDDEN: "NEVER";
    RATE_LIMITED: "BOUNDED_NEW_ASSERTION";
    DEPENDENCY_UNAVAILABLE: "BOUNDED_NEW_ASSERTION";
    NOT_FOUND: "NEVER";
    INTERNAL_ERROR: "NEVER";
}>;
export declare const QueryErrorCodeSchema: z.ZodEnum<["VALIDATION_ERROR", "AUTHENTICATION_REQUIRED", "FORBIDDEN", "RATE_LIMITED", "DEPENDENCY_UNAVAILABLE", "NOT_FOUND", "INTERNAL_ERROR"]>;
export declare const TalentContextReadErrorSchema: z.ZodEffects<z.ZodObject<{
    code: z.ZodEnum<["VALIDATION_ERROR", "AUTHENTICATION_REQUIRED", "FORBIDDEN", "RATE_LIMITED", "DEPENDENCY_UNAVAILABLE", "NOT_FOUND", "INTERNAL_ERROR"]>;
    messageKey: z.ZodString;
    retryClass: z.ZodEnum<["NEVER", "REAUTHENTICATE", "BOUNDED_NEW_ASSERTION"]>;
}, "strict", z.ZodTypeAny, {
    code?: "AUTHENTICATION_REQUIRED" | "FORBIDDEN" | "VALIDATION_ERROR" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR" | "NOT_FOUND";
    messageKey?: string;
    retryClass?: "NEVER" | "REAUTHENTICATE" | "BOUNDED_NEW_ASSERTION";
}, {
    code?: "AUTHENTICATION_REQUIRED" | "FORBIDDEN" | "VALIDATION_ERROR" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR" | "NOT_FOUND";
    messageKey?: string;
    retryClass?: "NEVER" | "REAUTHENTICATE" | "BOUNDED_NEW_ASSERTION";
}>, {
    code?: "AUTHENTICATION_REQUIRED" | "FORBIDDEN" | "VALIDATION_ERROR" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR" | "NOT_FOUND";
    messageKey?: string;
    retryClass?: "NEVER" | "REAUTHENTICATE" | "BOUNDED_NEW_ASSERTION";
}, {
    code?: "AUTHENTICATION_REQUIRED" | "FORBIDDEN" | "VALIDATION_ERROR" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR" | "NOT_FOUND";
    messageKey?: string;
    retryClass?: "NEVER" | "REAUTHENTICATE" | "BOUNDED_NEW_ASSERTION";
}>;
export declare const TalentContextReadErrorResponseSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"1">;
    status: z.ZodLiteral<"FAILED">;
    correlationId: z.ZodString;
    errors: z.ZodArray<z.ZodEffects<z.ZodObject<{
        code: z.ZodEnum<["VALIDATION_ERROR", "AUTHENTICATION_REQUIRED", "FORBIDDEN", "RATE_LIMITED", "DEPENDENCY_UNAVAILABLE", "NOT_FOUND", "INTERNAL_ERROR"]>;
        messageKey: z.ZodString;
        retryClass: z.ZodEnum<["NEVER", "REAUTHENTICATE", "BOUNDED_NEW_ASSERTION"]>;
    }, "strict", z.ZodTypeAny, {
        code?: "AUTHENTICATION_REQUIRED" | "FORBIDDEN" | "VALIDATION_ERROR" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR" | "NOT_FOUND";
        messageKey?: string;
        retryClass?: "NEVER" | "REAUTHENTICATE" | "BOUNDED_NEW_ASSERTION";
    }, {
        code?: "AUTHENTICATION_REQUIRED" | "FORBIDDEN" | "VALIDATION_ERROR" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR" | "NOT_FOUND";
        messageKey?: string;
        retryClass?: "NEVER" | "REAUTHENTICATE" | "BOUNDED_NEW_ASSERTION";
    }>, {
        code?: "AUTHENTICATION_REQUIRED" | "FORBIDDEN" | "VALIDATION_ERROR" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR" | "NOT_FOUND";
        messageKey?: string;
        retryClass?: "NEVER" | "REAUTHENTICATE" | "BOUNDED_NEW_ASSERTION";
    }, {
        code?: "AUTHENTICATION_REQUIRED" | "FORBIDDEN" | "VALIDATION_ERROR" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR" | "NOT_FOUND";
        messageKey?: string;
        retryClass?: "NEVER" | "REAUTHENTICATE" | "BOUNDED_NEW_ASSERTION";
    }>, "many">;
}, "strict", z.ZodTypeAny, {
    correlationId?: string;
    status?: "FAILED";
    schemaVersion?: "1";
    errors?: {
        code?: "AUTHENTICATION_REQUIRED" | "FORBIDDEN" | "VALIDATION_ERROR" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR" | "NOT_FOUND";
        messageKey?: string;
        retryClass?: "NEVER" | "REAUTHENTICATE" | "BOUNDED_NEW_ASSERTION";
    }[];
}, {
    correlationId?: string;
    status?: "FAILED";
    schemaVersion?: "1";
    errors?: {
        code?: "AUTHENTICATION_REQUIRED" | "FORBIDDEN" | "VALIDATION_ERROR" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR" | "NOT_FOUND";
        messageKey?: string;
        retryClass?: "NEVER" | "REAUTHENTICATE" | "BOUNDED_NEW_ASSERTION";
    }[];
}>;
