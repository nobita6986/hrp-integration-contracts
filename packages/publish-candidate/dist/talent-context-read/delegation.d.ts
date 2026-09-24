import { z } from 'zod';
import { CrmBindingSchema, PendingRequestIdSchema, HandoffProofSchema, ReceiptSchema, DelegationRefSchema, CallbackStateSchema, SingleScopeArraySchema } from './primitives.js';
export { PendingRequestIdSchema, HandoffProofSchema, ReceiptSchema, DelegationRefSchema, CallbackStateSchema, SingleScopeArraySchema, CrmBindingSchema, };
export declare const CreateDelegationRequestSchema: z.ZodEffects<z.ZodObject<z.objectUtil.extendShape<{
    organizationId: z.ZodString;
    crmSubject: z.ZodString;
    crmSessionHandle: z.ZodString;
    crmSessionDeadline: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    callbackId: z.ZodString;
}, {
    requestedScopes: z.ZodArray<z.ZodLiteral<"talent-context:read:identitySummary">, "many">;
    callbackState: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
}>, "strict", z.ZodTypeAny, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
    requestedScopes?: "talent-context:read:identitySummary"[];
    callbackState?: string;
}, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
    requestedScopes?: "talent-context:read:identitySummary"[];
    callbackState?: string;
}>, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
    requestedScopes?: "talent-context:read:identitySummary"[];
    callbackState?: string;
}, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
    requestedScopes?: "talent-context:read:identitySummary"[];
    callbackState?: string;
}>;
export declare const CreateDelegationSuccessSchema: z.ZodObject<{
    pendingRequestId: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    expiresAt: z.ZodString;
    handoffProof: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    handoffExpiresAt: z.ZodString;
}, "strict", z.ZodTypeAny, {
    pendingRequestId?: string;
    expiresAt?: string;
    handoffProof?: string;
    handoffExpiresAt?: string;
}, {
    pendingRequestId?: string;
    expiresAt?: string;
    handoffProof?: string;
    handoffExpiresAt?: string;
}>;
export declare const BrowserHandoffRequestSchema: z.ZodObject<{
    pendingRequestId: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    handoffProof: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    callbackState: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
}, "strict", z.ZodTypeAny, {
    callbackState?: string;
    pendingRequestId?: string;
    handoffProof?: string;
}, {
    callbackState?: string;
    pendingRequestId?: string;
    handoffProof?: string;
}>;
export declare const ApprovalDecisionSchema: z.ZodEnum<["APPROVE", "DENY"]>;
export declare const ApprovalDecisionRequestSchema: z.ZodObject<{
    pendingRequestId: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    decision: z.ZodEnum<["APPROVE", "DENY"]>;
    csrfToken: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
}, "strict", z.ZodTypeAny, {
    pendingRequestId?: string;
    decision?: "APPROVE" | "DENY";
    csrfToken?: string;
}, {
    pendingRequestId?: string;
    decision?: "APPROVE" | "DENY";
    csrfToken?: string;
}>;
export declare const ApprovedCallbackOutcomeSchema: z.ZodObject<z.objectUtil.extendShape<{
    pendingRequestId: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    callbackState: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    outcome: z.ZodEnum<["APPROVED", "DENIED"]>;
}, {
    outcome: z.ZodLiteral<"APPROVED">;
    receipt: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
}>, "strict", z.ZodTypeAny, {
    callbackState?: string;
    pendingRequestId?: string;
    outcome?: "APPROVED";
    receipt?: string;
}, {
    callbackState?: string;
    pendingRequestId?: string;
    outcome?: "APPROVED";
    receipt?: string;
}>;
export declare const DeniedCallbackOutcomeSchema: z.ZodObject<z.objectUtil.extendShape<{
    pendingRequestId: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    callbackState: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    outcome: z.ZodEnum<["APPROVED", "DENIED"]>;
}, {
    outcome: z.ZodLiteral<"DENIED">;
}>, "strict", z.ZodTypeAny, {
    callbackState?: string;
    pendingRequestId?: string;
    outcome?: "DENIED";
}, {
    callbackState?: string;
    pendingRequestId?: string;
    outcome?: "DENIED";
}>;
export declare const CallbackOutcomeSchema: z.ZodUnion<[z.ZodObject<z.objectUtil.extendShape<{
    pendingRequestId: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    callbackState: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    outcome: z.ZodEnum<["APPROVED", "DENIED"]>;
}, {
    outcome: z.ZodLiteral<"APPROVED">;
    receipt: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
}>, "strict", z.ZodTypeAny, {
    callbackState?: string;
    pendingRequestId?: string;
    outcome?: "APPROVED";
    receipt?: string;
}, {
    callbackState?: string;
    pendingRequestId?: string;
    outcome?: "APPROVED";
    receipt?: string;
}>, z.ZodObject<z.objectUtil.extendShape<{
    pendingRequestId: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    callbackState: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    outcome: z.ZodEnum<["APPROVED", "DENIED"]>;
}, {
    outcome: z.ZodLiteral<"DENIED">;
}>, "strict", z.ZodTypeAny, {
    callbackState?: string;
    pendingRequestId?: string;
    outcome?: "DENIED";
}, {
    callbackState?: string;
    pendingRequestId?: string;
    outcome?: "DENIED";
}>]>;
export declare const ExchangeDelegationRequestSchema: z.ZodEffects<z.ZodObject<z.objectUtil.extendShape<{
    organizationId: z.ZodString;
    crmSubject: z.ZodString;
    crmSessionHandle: z.ZodString;
    crmSessionDeadline: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    callbackId: z.ZodString;
}, {
    receipt: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
}>, "strict", z.ZodTypeAny, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
    receipt?: string;
}, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
    receipt?: string;
}>, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
    receipt?: string;
}, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
    receipt?: string;
}>;
export declare const ExchangeDelegationSuccessSchema: z.ZodObject<{
    delegationRef: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    effectiveHrpUserId: z.ZodString;
    expiresAt: z.ZodString;
}, "strict", z.ZodTypeAny, {
    delegationRef?: string;
    expiresAt?: string;
    effectiveHrpUserId?: string;
}, {
    delegationRef?: string;
    expiresAt?: string;
    effectiveHrpUserId?: string;
}>;
export declare const CancelDelegationReasonSchema: z.ZodEnum<["EXCHANGE_OUTCOME_UNKNOWN", "SESSION_ENDED", "USER_CANCELLED"]>;
export declare const CancelDelegationRequestSchema: z.ZodEffects<z.ZodObject<z.objectUtil.extendShape<{
    organizationId: z.ZodString;
    crmSubject: z.ZodString;
    crmSessionHandle: z.ZodString;
    crmSessionDeadline: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    callbackId: z.ZodString;
}, {
    reason: z.ZodEnum<["EXCHANGE_OUTCOME_UNKNOWN", "SESSION_ENDED", "USER_CANCELLED"]>;
}>, "strict", z.ZodTypeAny, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
    reason?: "EXCHANGE_OUTCOME_UNKNOWN" | "SESSION_ENDED" | "USER_CANCELLED";
}, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
    reason?: "EXCHANGE_OUTCOME_UNKNOWN" | "SESSION_ENDED" | "USER_CANCELLED";
}>, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
    reason?: "EXCHANGE_OUTCOME_UNKNOWN" | "SESSION_ENDED" | "USER_CANCELLED";
}, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
    reason?: "EXCHANGE_OUTCOME_UNKNOWN" | "SESSION_ENDED" | "USER_CANCELLED";
}>;
export declare const RevokeDelegationReasonSchema: z.ZodEnum<["SESSION_ENDED", "ACCOUNT_SWITCH", "USER_CANCELLED"]>;
export declare const RevokeDelegationRequestSchema: z.ZodEffects<z.ZodObject<z.objectUtil.extendShape<{
    organizationId: z.ZodString;
    crmSubject: z.ZodString;
    crmSessionHandle: z.ZodString;
    crmSessionDeadline: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    callbackId: z.ZodString;
}, {
    delegationRef: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    reason: z.ZodEnum<["SESSION_ENDED", "ACCOUNT_SWITCH", "USER_CANCELLED"]>;
}>, "strict", z.ZodTypeAny, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
    reason?: "SESSION_ENDED" | "USER_CANCELLED" | "ACCOUNT_SWITCH";
    delegationRef?: string;
}, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
    reason?: "SESSION_ENDED" | "USER_CANCELLED" | "ACCOUNT_SWITCH";
    delegationRef?: string;
}>, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
    reason?: "SESSION_ENDED" | "USER_CANCELLED" | "ACCOUNT_SWITCH";
    delegationRef?: string;
}, {
    organizationId?: string;
    crmSubject?: string;
    crmSessionHandle?: string;
    crmSessionDeadline?: string;
    callbackId?: string;
    reason?: "SESSION_ENDED" | "USER_CANCELLED" | "ACCOUNT_SWITCH";
    delegationRef?: string;
}>;
export declare const DelegationAckSchema: z.ZodObject<{
    acknowledged: z.ZodLiteral<true>;
}, "strict", z.ZodTypeAny, {
    acknowledged?: true;
}, {
    acknowledged?: true;
}>;
export declare const DELEGATION_ERROR_HTTP_STATUS: Readonly<{
    AUTHENTICATION_REQUIRED: 401;
    FORBIDDEN: 403;
    VALIDATION_ERROR: 422;
    RATE_LIMITED: 429;
    DEPENDENCY_UNAVAILABLE: 503;
    INTERNAL_ERROR: 500;
}>;
export declare const DelegationErrorCodeSchema: z.ZodEnum<["AUTHENTICATION_REQUIRED", "FORBIDDEN", "VALIDATION_ERROR", "RATE_LIMITED", "DEPENDENCY_UNAVAILABLE", "INTERNAL_ERROR"]>;
export declare const DelegationErrorSchema: z.ZodObject<{
    code: z.ZodEnum<["AUTHENTICATION_REQUIRED", "FORBIDDEN", "VALIDATION_ERROR", "RATE_LIMITED", "DEPENDENCY_UNAVAILABLE", "INTERNAL_ERROR"]>;
}, "strict", z.ZodTypeAny, {
    code?: "AUTHENTICATION_REQUIRED" | "FORBIDDEN" | "VALIDATION_ERROR" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR";
}, {
    code?: "AUTHENTICATION_REQUIRED" | "FORBIDDEN" | "VALIDATION_ERROR" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR";
}>;
export declare const DelegationErrorResponseSchema: z.ZodObject<{
    status: z.ZodLiteral<"FAILED">;
    error: z.ZodObject<{
        code: z.ZodEnum<["AUTHENTICATION_REQUIRED", "FORBIDDEN", "VALIDATION_ERROR", "RATE_LIMITED", "DEPENDENCY_UNAVAILABLE", "INTERNAL_ERROR"]>;
    }, "strict", z.ZodTypeAny, {
        code?: "AUTHENTICATION_REQUIRED" | "FORBIDDEN" | "VALIDATION_ERROR" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR";
    }, {
        code?: "AUTHENTICATION_REQUIRED" | "FORBIDDEN" | "VALIDATION_ERROR" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR";
    }>;
}, "strict", z.ZodTypeAny, {
    status?: "FAILED";
    error?: {
        code?: "AUTHENTICATION_REQUIRED" | "FORBIDDEN" | "VALIDATION_ERROR" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR";
    };
}, {
    status?: "FAILED";
    error?: {
        code?: "AUTHENTICATION_REQUIRED" | "FORBIDDEN" | "VALIDATION_ERROR" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR";
    };
}>;
export declare const InternalAggregateRecordSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"1-internal">;
    pendingRequestId: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    serviceId: z.ZodString;
    binding: z.ZodEffects<z.ZodObject<{
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
    scope: z.ZodLiteral<"talent-context:read:identitySummary">;
    audience: z.ZodString;
    callbackState: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    effectiveHrpUserId: z.ZodOptional<z.ZodString>;
    receiptDigest: z.ZodOptional<z.ZodString>;
    handoffProofDigest: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    pendingExpiresAt: z.ZodString;
    state: z.ZodEnum<["PENDING", "APPROVED", "DENIED", "EXCHANGED", "CANCELLED", "REVOKED", "EXPIRED"]>;
}, "strict", z.ZodTypeAny, {
    audience?: string;
    binding?: {
        organizationId?: string;
        crmSubject?: string;
        crmSessionHandle?: string;
        crmSessionDeadline?: string;
        callbackId?: string;
    };
    scope?: "talent-context:read:identitySummary";
    serviceId?: string;
    schemaVersion?: "1-internal";
    callbackState?: string;
    pendingRequestId?: string;
    effectiveHrpUserId?: string;
    receiptDigest?: string;
    handoffProofDigest?: string;
    createdAt?: string;
    pendingExpiresAt?: string;
    state?: "APPROVED" | "DENIED" | "PENDING" | "EXCHANGED" | "CANCELLED" | "REVOKED" | "EXPIRED";
}, {
    audience?: string;
    binding?: {
        organizationId?: string;
        crmSubject?: string;
        crmSessionHandle?: string;
        crmSessionDeadline?: string;
        callbackId?: string;
    };
    scope?: "talent-context:read:identitySummary";
    serviceId?: string;
    schemaVersion?: "1-internal";
    callbackState?: string;
    pendingRequestId?: string;
    effectiveHrpUserId?: string;
    receiptDigest?: string;
    handoffProofDigest?: string;
    createdAt?: string;
    pendingExpiresAt?: string;
    state?: "APPROVED" | "DENIED" | "PENDING" | "EXCHANGED" | "CANCELLED" | "REVOKED" | "EXPIRED";
}>;
export type InternalAggregateRecord = z.infer<typeof InternalAggregateRecordSchema>;
