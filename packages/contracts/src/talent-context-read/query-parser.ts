import {
  TalentContextReadResultSchema,
} from './query-types.js';
import {
  TalentContextReadErrorResponseSchema,
  QUERY_ERROR_HTTP_STATUS,
} from './query-errors.js';

// ============================================================================
// Parser - REC-004B section 1 + S28 TRANSPORT section 5.
// ============================================================================

/**
 * parseTalentContextReadResponse: HTTP status + unknown body.
 *
 * - 200: MUST parse direct result. No wrapper.
 * - non-2xx: MUST parse query error envelope and verify status/code/shape.
 * - unknown version/code/field or shape mismatch: PROTOCOL_ERROR, not raw body.
 * - transport 404 (no body) is NOT treated as object NOT_FOUND unless body
 *   parses correctly.
 */
export function parseTalentContextReadResponse(httpStatus, body) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return {
      success: false,
      status: 'PROTOCOL_ERROR',
      httpStatus,
      reason: 'body must be a non-null JSON object',
    };
  }

  if (httpStatus === 200) {
    const parsed = TalentContextReadResultSchema.safeParse(body);
    if (!parsed.success) {
      return {
        success: false,
        status: 'PROTOCOL_ERROR',
        httpStatus,
        reason: '200 body failed TalentContextReadResult validation',
      };
    }
    return {
      success: true,
      status: 'OK',
      result: parsed.data,
    };
  }

  const errParsed = TalentContextReadErrorResponseSchema.safeParse(body);
  if (!errParsed.success) {
    return {
      success: false,
      status: 'PROTOCOL_ERROR',
      httpStatus,
      reason: 'non-2xx body failed error envelope validation',
    };
  }

  const error = errParsed.data.errors[0];

  const expectedStatus = QUERY_ERROR_HTTP_STATUS[error.code];
  if (httpStatus !== expectedStatus) {
    return {
      success: false,
      status: 'PROTOCOL_ERROR',
      httpStatus,
      error,
      reason: 'HTTP ' + httpStatus + ' does not match triple HTTP ' + expectedStatus + ' for code ' + error.code,
    };
  }

  return {
    success: false,
    status: 'QUERY_ERROR',
    httpStatus,
    error,
  };
}