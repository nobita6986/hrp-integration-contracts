export declare function parseTalentContextReadResponse(httpStatus: any, body: any): {
    success: boolean;
    status: string;
    httpStatus: any;
    reason: string;
    result?: undefined;
    error?: undefined;
} | {
    success: boolean;
    status: string;
    result: {
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
    };
    httpStatus?: undefined;
    reason?: undefined;
    error?: undefined;
} | {
    success: boolean;
    status: string;
    httpStatus: any;
    error: {
        code?: "AUTHENTICATION_REQUIRED" | "FORBIDDEN" | "VALIDATION_ERROR" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR" | "NOT_FOUND";
        messageKey?: string;
        retryClass?: "NEVER" | "REAUTHENTICATE" | "BOUNDED_NEW_ASSERTION";
    };
    reason: string;
    result?: undefined;
} | {
    success: boolean;
    status: string;
    httpStatus: any;
    error: {
        code?: "AUTHENTICATION_REQUIRED" | "FORBIDDEN" | "VALIDATION_ERROR" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR" | "NOT_FOUND";
        messageKey?: string;
        retryClass?: "NEVER" | "REAUTHENTICATE" | "BOUNDED_NEW_ASSERTION";
    };
    reason?: undefined;
    result?: undefined;
};
