import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  CreateDelegationRequestSchema, CreateDelegationSuccessSchema,
  ExchangeDelegationRequestSchema, ExchangeDelegationSuccessSchema,
  CancelDelegationRequestSchema,
  RevokeDelegationRequestSchema,
  DelegationAckSchema,
  DelegationErrorResponseSchema,
  PendingRequestIdSchema, HandoffProofSchema, ReceiptSchema,
  DelegationRefSchema, CallbackStateSchema,
  SingleScopeArraySchema, CrmBindingSchema,
  DELEGATION_ERROR_HTTP_STATUS, DELEGATION_ERROR_MESSAGE_KEY,
} from '../../dist/index.js';

const baseCreate = {
  organizationId: 'org-abc',
  crmSubject: 'user-12345',
  crmSessionHandle: 'sess-abcdef0123456789',
  crmSessionDeadline: '2026-09-22T10:15:00.000Z',
  callbackId: 'cb-12345678',
  requestedScopes: ['talent-context:read:identitySummary'],
  callbackState: 'st_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
};

describe('Delegation create positive', () => {
  test('valid create parses', () => {
    const r = CreateDelegationRequestSchema.safeParse(baseCreate);
    assert.equal(r.success, true);
  });
  test('create success parses', () => {
    const r = CreateDelegationSuccessSchema.safeParse({
      pendingRequestId: 'pd_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      expiresAt: '2026-09-22T10:05:00.000Z',
      handoffProof: 'hp_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      handoffExpiresAt: '2026-09-22T10:02:00.000Z',
    });
    assert.equal(r.success, true);
  });
});

describe('Delegation create negative', () => {
  test('empty scope rejected', () => {
    const r = CreateDelegationRequestSchema.safeParse({...baseCreate, requestedScopes: []});
    assert.equal(r.success, false);
  });
  test('extra scope rejected', () => {
    const r = CreateDelegationRequestSchema.safeParse({...baseCreate, requestedScopes: ['talent-context:read:identitySummary','something-else']});
    assert.equal(r.success, false);
  });
  test('wrong scope literal rejected', () => {
    const r = CreateDelegationRequestSchema.safeParse({...baseCreate, requestedScopes: ['different:scope']});
    assert.equal(r.success, false);
  });
  test('extra fields rejected', () => {
    const r = CreateDelegationRequestSchema.safeParse({...baseCreate, extra: 'X'});
    assert.equal(r.success, false);
  });
  test('wrong prefix pending id rejected', () => {
    const r = PendingRequestIdSchema.safeParse('xx-123456789012345678901234567890123456');
    assert.equal(r.success, false);
  });
  test('wrong length pending id rejected', () => {
    const r = PendingRequestIdSchema.safeParse('pd-short');
    assert.equal(r.success, false);
  });
  test('correct prefix accepted pd', () => {
    const r = PendingRequestIdSchema.safeParse('pd_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    assert.equal(r.success, true);
  });
  test('correct prefix accepted dg', () => {
    const r = DelegationRefSchema.safeParse('dg_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    assert.equal(r.success, true);
  });
  test('correct prefix accepted hp', () => {
    const r = HandoffProofSchema.safeParse('hp_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    assert.equal(r.success, true);
  });
  test('correct prefix accepted rc', () => {
    const r = ReceiptSchema.safeParse('rc_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    assert.equal(r.success, true);
  });
  test('correct prefix accepted st', () => {
    const r = CallbackStateSchema.safeParse('st_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    assert.equal(r.success, true);
  });
});

describe('Delegation exchange cancel revoke', () => {
  test('exchange valid', () => {
    const r = ExchangeDelegationRequestSchema.safeParse({
      pendingRequestId: 'pd_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      organizationId: 'org-abc',
      crmSubject: 'user-12345',
      crmSessionHandle: 'sess-abcdef0123456789',
      crmSessionDeadline: '2026-09-22T10:15:00.000Z',
      callbackId: 'cb-12345678',
      receipt: 'rc_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    });
    assert.equal(r.success, true);
  });
  test('exchange success parses', () => {
    const r = ExchangeDelegationSuccessSchema.safeParse({
      delegationRef: 'dg_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      effectiveHrpUserId: 'hrp-user-12345',
      expiresAt: '2026-09-22T10:15:00.000Z',
    });
    assert.equal(r.success, true);
  });
  test('cancel valid reason', () => {
    const r = CancelDelegationRequestSchema.safeParse({
      pendingRequestId: 'pd_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      organizationId: 'org-abc',
      crmSubject: 'user-12345',
      crmSessionHandle: 'sess-abcdef0123456789',
      crmSessionDeadline: '2026-09-22T10:15:00.000Z',
      callbackId: 'cb-12345678',
      reason: 'EXCHANGE_OUTCOME_UNKNOWN',
    });
    assert.equal(r.success, true);
  });
  test('cancel unknown reason rejected', () => {
    const r = CancelDelegationRequestSchema.safeParse({
      pendingRequestId: 'pd_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      organizationId: 'org-abc',
      crmSubject: 'user-12345',
      crmSessionHandle: 'sess-abcdef0123456789',
      crmSessionDeadline: '2026-09-22T10:15:00.000Z',
      callbackId: 'cb-12345678',
      reason: 'OTHER_REASON',
    });
    assert.equal(r.success, false);
  });
  test('revoke valid', () => {
    const r = RevokeDelegationRequestSchema.safeParse({
      delegationRef: 'dg_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      organizationId: 'org-abc',
      crmSubject: 'user-12345',
      crmSessionHandle: 'sess-abcdef0123456789',
      crmSessionDeadline: '2026-09-22T10:15:00.000Z',
      callbackId: 'cb-12345678',
      reason: 'SESSION_ENDED',
    });
    assert.equal(r.success, true);
  });
  test('ack parses', () => {
    const r = DelegationAckSchema.safeParse({ acknowledged: true });
    assert.equal(r.success, true);
  });
});

describe('Delegation error envelope', () => {
  for (const code of Object.keys(DELEGATION_ERROR_HTTP_STATUS)) {
    test('valid ' + code, () => {
      const r = DelegationErrorResponseSchema.safeParse({
        status: 'FAILED',
        error: { code: code, messageKey: DELEGATION_ERROR_MESSAGE_KEY[code] },
      });
      assert.equal(r.success, true);
    });
  }
  test('wrong messageKey rejected', () => {
    const r = DelegationErrorResponseSchema.safeParse({
      status: 'FAILED',
      error: { code: 'VALIDATION_ERROR', messageKey: 'errors.forbidden' },
    });
    assert.equal(r.success, false);
  });
  test('extra fields rejected', () => {
    const r = DelegationErrorResponseSchema.safeParse({
      status: 'FAILED',
      error: { code: 'VALIDATION_ERROR', messageKey: 'errors.validation', extra: 'X' },
    });
    assert.equal(r.success, false);
  });
  test('status=OK rejected', () => {
    const r = DelegationErrorResponseSchema.safeParse({
      status: 'OK',
      error: { code: 'VALIDATION_ERROR', messageKey: 'errors.validation' },
    });
    assert.equal(r.success, false);
  });
});
