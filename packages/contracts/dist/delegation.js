import { z } from 'zod';
import { OrganizationIdSchema, CanonicalIdSchema, } from './primitives.js';
// ============================================================================
// Delegation operation schemas - S28 TRANSPORT sections 1-4.
// Distinct from query envelope; NO shared error parser with query.
// ============================================================================
/**
 * Immutable CRM binding B:
 * { organizationId, crmSubject, crmSessionHandle, crmSessionDeadline, callbackId }
 */
export const CrmBindingSchema = z
    .object({
    organizationId: OrganizationIdSchema,
    crmSubject: CanonicalIdSchema,
    crmSessionHandle: z.string().min(1).max(128),
    crmSessionDeadline: z.string().min(20).max(40).datetime({ offset: true }),
    callbackId: z.string().min(1).max(64),
})
    .strict();
/** Canonical ID encodings (EP-05). 46 ASCII chars after prefix. */
const prefixedOpaque = (prefix) => z.string().regex(new RegExp('^' + prefix + '[A-Za-z0-9_-]{43}$'), 'must start with ' + prefix + ' and have 43 base64url chars');
export const PendingRequestIdSchema = prefixedOpaque('pd_');
export const HandoffProofSchema = prefixedOpaque('hp_');
export const ReceiptSchema = prefixedOpaque('rc_');
export const DelegationRefSchema = prefixedOpaque('dg_');
export const CallbackStateSchema = prefixedOpaque('st_');
/** Single fixed scope literal - arrays contain exactly this one value. */
export const SINGLE_SCOPE_LITERAL = 'talent-context:read:identitySummary';
export const SingleScopeArraySchema = z
    .array(z.literal(SINGLE_SCOPE_LITERAL))
    .length(1);
// ============================================================================
// Create delegation request (backend POST)
// ============================================================================
export const CreateDelegationRequestSchema = z
    .object({
    organizationId: OrganizationIdSchema,
    crmSubject: CanonicalIdSchema,
    crmSessionHandle: z.string().min(1).max(128),
    crmSessionDeadline: z.string().min(20).max(40).datetime({ offset: true }),
    callbackId: z.string().min(1).max(64),
    requestedScopes: SingleScopeArraySchema,
    callbackState: CallbackStateSchema,
})
    .strict();
export const CreateDelegationSuccessSchema = z
    .object({
    pendingRequestId: PendingRequestIdSchema,
    expiresAt: z.string().min(20).max(40).datetime({ offset: true }),
    handoffProof: HandoffProofSchema,
    handoffExpiresAt: z.string().min(20).max(40).datetime({ offset: true }),
})
    .strict();
// ============================================================================
// Exchange (receipt -> delegation)
// ============================================================================
export const ExchangeDelegationRequestSchema = z
    .object({
    pendingRequestId: PendingRequestIdSchema,
    organizationId: OrganizationIdSchema,
    crmSubject: CanonicalIdSchema,
    crmSessionHandle: z.string().min(1).max(128),
    crmSessionDeadline: z.string().min(20).max(40).datetime({ offset: true }),
    callbackId: z.string().min(1).max(64),
    receipt: ReceiptSchema,
})
    .strict();
export const ExchangeDelegationSuccessSchema = z
    .object({
    delegationRef: DelegationRefSchema,
    effectiveHrpUserId: CanonicalIdSchema,
    expiresAt: z.string().min(20).max(40).datetime({ offset: true }),
})
    .strict();
// ============================================================================
// Cancel pending (S28 section 4)
// ============================================================================
export const CancelDelegationReasonSchema = z.enum([
    'EXCHANGE_OUTCOME_UNKNOWN',
    'SESSION_ENDED',
    'USER_CANCELLED',
]);
export const CancelDelegationRequestSchema = z
    .object({
    pendingRequestId: PendingRequestIdSchema,
    organizationId: OrganizationIdSchema,
    crmSubject: CanonicalIdSchema,
    crmSessionHandle: z.string().min(1).max(128),
    crmSessionDeadline: z.string().min(20).max(40).datetime({ offset: true }),
    callbackId: z.string().min(1).max(64),
    reason: CancelDelegationReasonSchema,
})
    .strict();
// ============================================================================
// Revoke (S28 section 4)
// ============================================================================
export const RevokeDelegationReasonSchema = z.enum([
    'SESSION_ENDED',
    'ACCOUNT_SWITCH',
    'USER_CANCELLED',
]);
export const RevokeDelegationRequestSchema = z
    .object({
    delegationRef: DelegationRefSchema,
    organizationId: OrganizationIdSchema,
    crmSubject: CanonicalIdSchema,
    crmSessionHandle: z.string().min(1).max(128),
    crmSessionDeadline: z.string().min(20).max(40).datetime({ offset: true }),
    callbackId: z.string().min(1).max(64),
    reason: RevokeDelegationReasonSchema,
})
    .strict();
// ============================================================================
// Generic delegation ACK (200 for cancel/revoke, known/unknown/expired all same)
// ============================================================================
export const DelegationAckSchema = z
    .object({
    acknowledged: z.literal(true),
})
    .strict();
// ============================================================================
// Delegation error envelope (S28 TRANSPORT section 5)
// DISTINCT from query seven-code parser.
// ============================================================================
export const DELEGATION_ERROR_HTTP_STATUS = Object.freeze({
    AUTHENTICATION_REQUIRED: 401,
    FORBIDDEN: 403,
    VALIDATION_ERROR: 422,
    RATE_LIMITED: 429,
    DEPENDENCY_UNAVAILABLE: 503,
    INTERNAL_ERROR: 500,
});
export const DELEGATION_ERROR_MESSAGE_KEY = Object.freeze({
    AUTHENTICATION_REQUIRED: 'errors.authenticationRequired',
    FORBIDDEN: 'errors.forbidden',
    VALIDATION_ERROR: 'errors.validation',
    RATE_LIMITED: 'errors.rateLimited',
    DEPENDENCY_UNAVAILABLE: 'errors.dependencyUnavailable',
    INTERNAL_ERROR: 'errors.talentContext.internal',
});
export const DelegationErrorCodeSchema = z.enum([
    'AUTHENTICATION_REQUIRED',
    'FORBIDDEN',
    'VALIDATION_ERROR',
    'RATE_LIMITED',
    'DEPENDENCY_UNAVAILABLE',
    'INTERNAL_ERROR',
]);
export const DelegationErrorSchema = z
    .object({
    code: DelegationErrorCodeSchema,
    messageKey: z.string(),
})
    .strict()
    .superRefine((value, ctx) => {
    if (value.messageKey !== DELEGATION_ERROR_MESSAGE_KEY[value.code]) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['messageKey'],
            message: 'messageKey does not match delegation triple for code ' + value.code,
        });
    }
});
export const DelegationErrorResponseSchema = z
    .object({
    status: z.literal('FAILED'),
    error: DelegationErrorSchema,
})
    .strict();
