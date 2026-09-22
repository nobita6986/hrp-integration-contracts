import { z } from 'zod';
import {
  OrganizationIdSchema,
  CanonicalIdSchema,
  CrmBindingSchema,
  PendingRequestIdSchema,
  HandoffProofSchema,
  ReceiptSchema,
  DelegationRefSchema,
  CallbackStateSchema,
  CsrfTokenSchema,
  SingleScopeArraySchema,
  BindingTimestampSchema,
} from './primitives.js';

// ============================================================================
// Delegation operation schemas - S28 TRANSPORT sections 1-5.
// Distinct from query envelope; NO shared error parser with query.
//
// F-02 corrections:
//   - pendingRequestId is in the PATH of exchange and cancel, not in the body.
//   - delegation error envelope is { status: 'FAILED', error: { code } }
//     only. No messageKey, no detail.
//   - Added: handoff request, approval decision, APPROVED/DENIED callback
//     outcomes, CSRF token schemas.
//   - Internal/aggregate DTOs are separate from wire schemas.
// ============================================================================

// Re-export for backward compatibility in the same module.
export {
  PendingRequestIdSchema,
  HandoffProofSchema,
  ReceiptSchema,
  DelegationRefSchema,
  CallbackStateSchema,
  SingleScopeArraySchema,
  CrmBindingSchema,
};

// ============================================================================
// Create delegation request (backend POST)
// Body: B + requestedScopes + callbackState.
// ============================================================================

export const CreateDelegationRequestSchema = z
  .object({
    organizationId: OrganizationIdSchema,
    crmSubject: CanonicalIdSchema,
    crmSessionHandle: z.string().min(1).max(128),
    crmSessionDeadline: BindingTimestampSchema,
    callbackId: z.string().min(1).max(64),
    requestedScopes: SingleScopeArraySchema,
    callbackState: CallbackStateSchema,
  })
  .strict();

export const CreateDelegationSuccessSchema = z
  .object({
    pendingRequestId: PendingRequestIdSchema,
    expiresAt: BindingTimestampSchema,
    handoffProof: HandoffProofSchema,
    handoffExpiresAt: BindingTimestampSchema,
  })
  .strict();

// ============================================================================
// Browser handoff (HRP front-door form POST).
// Body: pendingRequestId + handoffProof + callbackState.
// pendingRequestId is NOT authenticated by itself; HRP verifies
// digest/binding/deadline + consumes the proof atomically once.
// ============================================================================

export const BrowserHandoffRequestSchema = z
  .object({
    pendingRequestId: PendingRequestIdSchema,
    handoffProof: HandoffProofSchema,
    callbackState: CallbackStateSchema,
  })
  .strict();

// ============================================================================
// Approval decision (browser front-door form POST).
// Local CSRF token bound to HRP session + pending flow.
// Body: pendingRequestId + decision + csrfToken.
// ============================================================================

export const ApprovalDecisionSchema = z.enum(['APPROVE', 'DENY']);

export const ApprovalDecisionRequestSchema = z
  .object({
    pendingRequestId: PendingRequestIdSchema,
    decision: ApprovalDecisionSchema,
    csrfToken: CsrfTokenSchema,
  })
  .strict();

// ============================================================================
// Callback outcome (HRP -> CRM browser response).
// Two outcomes with DIFFERENT shapes:
//   APPROVED: { pendingRequestId, callbackState, outcome: 'APPROVED', receipt }
//   DENIED:   { pendingRequestId, callbackState, outcome: 'DENIED' }
//
// Receipt accompanies APPROVED only. DENIED never carries a receipt.
// Both share the common header (pendingRequestId, callbackState, outcome).
// ============================================================================

const CallbackOutcomeHeader = z
  .object({
    pendingRequestId: PendingRequestIdSchema,
    callbackState: CallbackStateSchema,
    outcome: z.enum(['APPROVED', 'DENIED']),
  })
  .strict();

export const ApprovedCallbackOutcomeSchema = CallbackOutcomeHeader.extend({
  outcome: z.literal('APPROVED'),
  receipt: ReceiptSchema,
}).strict();

export const DeniedCallbackOutcomeSchema = CallbackOutcomeHeader.extend({
  outcome: z.literal('DENIED'),
}).strict();

export const CallbackOutcomeSchema = z.union([
  ApprovedCallbackOutcomeSchema,
  DeniedCallbackOutcomeSchema,
]);

// ============================================================================
// Exchange (receipt -> delegation).
// pendingRequestId is in the route PATH:
//   POST /api/.../delegation-requests/{pendingRequestId}/exchange
// Body normative: B + receipt (no pendingRequestId, no delegationRef).
// ============================================================================

export const ExchangeDelegationRequestSchema = z
  .object({
    organizationId: OrganizationIdSchema,
    crmSubject: CanonicalIdSchema,
    crmSessionHandle: z.string().min(1).max(128),
    crmSessionDeadline: BindingTimestampSchema,
    callbackId: z.string().min(1).max(64),
    receipt: ReceiptSchema,
  })
  .strict();

export const ExchangeDelegationSuccessSchema = z
  .object({
    delegationRef: DelegationRefSchema,
    effectiveHrpUserId: CanonicalIdSchema,
    expiresAt: BindingTimestampSchema,
  })
  .strict();

// ============================================================================
// Cancel pending.
// pendingRequestId is in the route PATH:
//   POST /api/.../delegation-requests/{pendingRequestId}/cancel
// Body normative: B + reason.
// ============================================================================

export const CancelDelegationReasonSchema = z.enum([
  'EXCHANGE_OUTCOME_UNKNOWN',
  'SESSION_ENDED',
  'USER_CANCELLED',
]);

export const CancelDelegationRequestSchema = z
  .object({
    organizationId: OrganizationIdSchema,
    crmSubject: CanonicalIdSchema,
    crmSessionHandle: z.string().min(1).max(128),
    crmSessionDeadline: BindingTimestampSchema,
    callbackId: z.string().min(1).max(64),
    reason: CancelDelegationReasonSchema,
  })
  .strict();

// ============================================================================
// Revoke.
// delegationRef IS in the authenticated POST BODY (NOT URL).
// Body: B + delegationRef + reason.
// ============================================================================

export const RevokeDelegationReasonSchema = z.enum([
  'SESSION_ENDED',
  'ACCOUNT_SWITCH',
  'USER_CANCELLED',
]);

export const RevokeDelegationRequestSchema = z
  .object({
    organizationId: OrganizationIdSchema,
    crmSubject: CanonicalIdSchema,
    crmSessionHandle: z.string().min(1).max(128),
    crmSessionDeadline: BindingTimestampSchema,
    callbackId: z.string().min(1).max(64),
    delegationRef: DelegationRefSchema,
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
// Delegation error envelope (F-02):
//   { status: 'FAILED', error: { code } }  — no messageKey, no detail.
// Backend errors table from S28 TRANSPORT section 5:
//   401 AUTHENTICATION_REQUIRED
//   403 FORBIDDEN
//   422 VALIDATION_ERROR
//   429 RATE_LIMITED
//   503 DEPENDENCY_UNAVAILABLE
//   500 INTERNAL_ERROR
// ============================================================================

export const DELEGATION_ERROR_HTTP_STATUS = Object.freeze({
  AUTHENTICATION_REQUIRED: 401,
  FORBIDDEN: 403,
  VALIDATION_ERROR: 422,
  RATE_LIMITED: 429,
  DEPENDENCY_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
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
  })
  .strict();

export const DelegationErrorResponseSchema = z
  .object({
    status: z.literal('FAILED'),
    error: DelegationErrorSchema,
  })
  .strict();

// ============================================================================
// Internal aggregate DTO (NOT a wire schema).
// Internal-only record combining immutable B, scope, audience, deadline hashes,
// HRP session id and effective user id. Exposed only to internal callers and
// tests; never accepted on any HTTP route or browser surface.
// ============================================================================

export const InternalAggregateRecordSchema = z
  .object({
    schemaVersion: z.literal('1-internal'),
    pendingRequestId: PendingRequestIdSchema,
    serviceId: CanonicalIdSchema,
    binding: CrmBindingSchema,
    scope: z.literal('talent-context:read:identitySummary'),
    audience: z.string().min(1).max(256),
    callbackState: CallbackStateSchema,
    effectiveHrpUserId: CanonicalIdSchema.optional(),
    receiptDigest: z.string().regex(/^[A-Fa-f0-9]{64}$/).optional(),
    handoffProofDigest: z.string().regex(/^[A-Fa-f0-9]{64}$/).optional(),
    createdAt: BindingTimestampSchema,
    pendingExpiresAt: BindingTimestampSchema,
    state: z.enum(['PENDING', 'APPROVED', 'DENIED', 'EXCHANGED', 'CANCELLED', 'REVOKED', 'EXPIRED']),
  })
  .strict();

export type InternalAggregateRecord = z.infer<typeof InternalAggregateRecordSchema>;
