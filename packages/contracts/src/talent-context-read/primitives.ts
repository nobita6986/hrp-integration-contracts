import { z } from 'zod';

declare const Buffer:
  | {
      from(input: string | Uint8Array, encoding?: string): Uint8Array;
      byteLength(input: string, encoding?: string): number;
    }
  | undefined;

function byteLengthUtf8(s: string): number {
  const B = (globalThis as { Buffer?: { byteLength(input: string, encoding?: string): number } }).Buffer;
  if (B && typeof B.byteLength === 'function') return B.byteLength(s, 'utf8');
  return new TextEncoder().encode(s).length;
}

function encodeStdBase64FromBytes(bytes: Uint8Array): string {
  // The dev-only test harness runs on Node, where Buffer.from(bytes).toString('base64')
  // is the canonical encoder. The browser `btoa` path is provided so the production
  // (or browser-side) deployment can run without change.
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i] & 0xff);
  const g = globalThis as { btoa?: (s: string) => string; Buffer?: { from(input: string, encoding: string): Uint8Array | string } };
  if (typeof g.btoa === 'function') return g.btoa(s);
  const r = g.Buffer.from(s, 'binary');
  if (typeof r === 'string') return r;
  // If Buffer.from returns a Uint8Array, re-encode using TextDecoder 'latin1'.
  return new TextDecoder('latin1').decode(r);
}

function decodeStdBase64ToBytes(s: string): Uint8Array {
  const padded = s + '='.repeat((4 - (s.length % 4)) % 4);
  const g = globalThis as { atob?: (s: string) => string; Buffer?: { from(input: string, encoding: string): Uint8Array } };
  if (typeof g.atob === 'function') {
    const raw = g.atob(padded);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i) & 0xff;
    return bytes;
  }
  return g.Buffer.from(padded, 'base64');
}

// ============================================================================
// Primitives - local to this module, NOT re-exported from frozen contracts root.
// Compatible with packages/contracts/src/primitives.ts at CRM baseline
// 72643356a0d1355f9dccc3921b47c990ea9c31c1 per EP-05.
// ============================================================================

const OPAQUE_GRAMMAR = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/u;

const opaqueId = (name, max) =>
  z
    .string()
    .min(1)
    .max(max)
    .regex(OPAQUE_GRAMMAR, name + ' contains invalid characters');

export const CorrelationIdSchema = opaqueId('correlationId', 128).min(8);
export const OrganizationIdSchema = opaqueId('organizationId', 64);
export const CanonicalIdSchema = opaqueId('canonical id', 128);

/**
 * Binding UTC timestamp (EP-05): RFC3339 UTC Z, 20..40 characters, valid date.
 * Strict UTC-Z literal — no offsets like +07:00. Producers canonicalize before
 * first immutable binding.
 *
 * NOTE: This is only used in immutable B (crmSessionDeadline etc). The general
 * IsoTimestampSchema (used for result.resolvedAt) keeps the broader semantic.
 */
const BINDING_RFC3339_Z = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?Z$/;
export const BindingTimestampSchema = z
  .string()
  .min(20)
  .max(40)
  .refine((v) => {
    if (!BINDING_RFC3339_Z.test(v)) return false;
    // Reject embedded space or newline.
    if (/[\s\u00A0]/.test(v)) return false;
    return true;
  }, 'binding timestamp must be RFC3339 UTC Z (e.g. 2026-09-22T10:00:00.000Z)')
  .refine((v) => {
    // Valid Gregorian date.
    const d = new Date(v);
    if (Number.isNaN(d.valueOf())) return false;
    // Round-trip check: re-format and compare.
    return d.toISOString().length > 0;
  }, 'binding timestamp is not a valid date');

/**
 * General ISO-8601 timestamp (used in result.resolvedAt and unbounded surfaces).
 * NOT used inside immutable B.
 */
export const IsoTimestampSchema = z
  .string()
  .min(20)
  .max(40)
  .datetime({ offset: true });

/** Module-local schemaVersion. Not a shared v1 literal. */
export const MODULE_SCHEMA_VERSION = '1';
export const ModuleSchemaVersionSchema = z.literal(MODULE_SCHEMA_VERSION);

// ============================================================================
// F-03 — Canonical token encoding.
//
// Prefix + canonical base64url of exactly 32 random bytes.
// Encoding rules:
//   - alphabet: [A-Za-z0-9_-]
//   - no padding `=` in wire form (length 43, since 32 bytes -> 43 chars base64url unpadded)
//   - canonical decode -> re-encode equality
//   - reject inputs with padding bits / wrong length / non-canonical alphabets
//   - regex enforces prefix + total length 46 only as a syntactic guard;
//     the canonical-roundtrip refine catches non-canonical encodings regardless
//     of regex.
//
// Format validation does NOT prove randomness. That is a runtime invariant.
// ============================================================================

const BASE64URL = /^[A-Za-z0-9_-]*$/;
// 32 bytes -> ceil(32*8 / 6) = 43 base64url chars unpadded.

export function encodeBase64Url(bytes: Uint8Array): string {
  const std = encodeStdBase64FromBytes(bytes);
  return std.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function decodeBase64Url(str: string): Uint8Array {
  if (typeof str !== 'string') throw new Error('not a string');
  if (str.includes('=')) throw new Error('contains padding');
  return decodeStdBase64ToBytes(str);
}

export function canonicalTokenSchema(prefix) {
  const expectedLen = 3 + 43; // prefix_ + base64url-32-bytes
  const re = new RegExp('^' + prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[A-Za-z0-9_-]{43}$');
  return z
    .string()
    .min(expectedLen)
    .max(expectedLen)
    .refine((v) => re.test(v), 'must start with ' + prefix + ' and have 43 base64url chars')
    .refine((v) => {
      if (!BASE64URL.test(v)) return false;
      try {
        const bytes = decodeBase64Url(v.slice(3));
        if (bytes.length !== 32) return false;
        const reencoded = encodeBase64Url(bytes);
        return reencoded === v.slice(3);
      } catch {
        return false;
      }
    }, 'must be canonical base64url of exactly 32 bytes');
}

export const PendingRequestIdSchema = canonicalTokenSchema('pd_');
export const HandoffProofSchema = canonicalTokenSchema('hp_');
export const ReceiptSchema = canonicalTokenSchema('rc_');
export const DelegationRefSchema = canonicalTokenSchema('dg_');
export const CallbackStateSchema = canonicalTokenSchema('st_');
export const JtiSchema = canonicalTokenSchema('jt_');
export const CsrfTokenSchema = canonicalTokenSchema('cs_');

// ============================================================================
// F-04 — Immutable CRM binding B.
// Reject space / newline, restrict deadlines to UTC-Z, opaque grammar for IDs.
// ============================================================================

export const CrmBindingSchema = z
  .object({
    organizationId: OrganizationIdSchema,
    crmSubject: CanonicalIdSchema,
    crmSessionHandle: z
      .string()
      .min(1)
      .max(128)
      .regex(/^[A-Za-z0-9._:-]+$/u, 'crmSessionHandle must be opaque non-bearer alias'),
    crmSessionDeadline: BindingTimestampSchema,
    callbackId: z.string().min(1).max(64).regex(OPAQUE_GRAMMAR, 'callbackId grammar'),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (/[\s\u00A0]/.test(value.callbackId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['callbackId'],
        message: 'callbackId must not contain whitespace',
      });
    }
  });

/** Single fixed scope literal - arrays contain exactly this one value. */
export const SINGLE_SCOPE_LITERAL = 'talent-context:read:identitySummary';
export const SingleScopeArraySchema = z
  .array(z.literal(SINGLE_SCOPE_LITERAL))
  .length(1);