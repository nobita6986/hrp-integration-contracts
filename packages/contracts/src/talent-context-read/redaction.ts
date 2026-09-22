declare const Buffer: { from(input: string | Uint8Array, encoding?: string): Uint8Array; byteLength(input: string, encoding?: string): number; } | undefined;
function byteLengthUtf8(s: string): number { if (typeof Buffer !== "undefined" && typeof Buffer.byteLength === "function") return Buffer.byteLength(s, "utf8"); return new TextEncoder().encode(s).length; }
﻿// ============================================================================
// Redaction - S28 REDACTION.md "Proposed algorithm" (steps 1-6).
// Pure function; no side effects; no PII in output or logs.
//
// F-05 corrections:
//   - FEFF/Cf/format chars MUST be rejected BEFORE normalization (step 1).
//   - Code-point iteration, not UTF-16 code-unit, so SMP (U+10400+) is
//     processed correctly and not split across surrogate halves.
//   - Segmentation failure => unsafe (omission), never throw or leak raw input.
//   - Output <= 512 UTF-8 bytes (checked at function and at result-schema level).
//   - Over-limit input causes whole-projection omission (not partial).
//   - Format validation does NOT prove randomness / entropy.
// ============================================================================

const MASK = '\u2022\u2022'; // "••" (two bullet characters)
const SPACE = ' ';

const INPUT_MAX_CODEPOINTS = 256;
const TOKEN_MAX = 16;
const OUTPUT_MAX_BYTES = 512;

/** Token grammar from S28 REDACTION.md step 3. */
const TOKEN_GRAMMAR =
  /^[\p{L}][\p{L}\p{M}]*(?:['-][\p{L}][\p{L}\p{M}]*)*$/u;

/**
 * Iterate Unicode scalar values (code points) so SMP / surrogate pairs
 * are handled as a single unit. F-05: do NOT use UTF-16 code-unit iteration.
 */
function codePointsOf(input) {
  if (typeof input !== 'string') return [];
  // Iterator returns code points (handles surrogate pairs correctly).
  if (typeof input[Symbol.iterator] === 'function') {
    const out = [];
    for (const ch of input) out.push(ch);
    return out;
  }
  // Fallback (should not happen in V8 / modern JS).
  return Array.from(input);
}

/**
 * Check if a string contains any Cc/Cf control character OR FEFF (ZWNBSP)
 * OR bidi controls. The check is at the Unicode scalar value level so SMP
 * code points are inspected whole.
 */
function containsControlOrFormat(input) {
  const cps = codePointsOf(input);
  for (let i = 0; i < cps.length; i++) {
    const cp = cps[i].codePointAt(0);
    if (cp === undefined) return true;
    // FEFF (65279) — ZWNBSP, Cf category; reject even though it's narrow.
    if (cp === 0xFEFF) return true;
    // Cc general: 0..31, 127, 128..159.
    if (cp <= 0x1F) return true;
    if (cp === 0x7F) return true;
    if (cp >= 0x80 && cp <= 0x9F) return true;
    // Cf subset — bidi controls (LRE/RLE/PDF/LRO/RLO/LRI/RLI/FSI/PDI).
    if (
      cp === 0x202A ||
      cp === 0x202B ||
      cp === 0x202C ||
      cp === 0x202D ||
      cp === 0x202E ||
      cp === 0x2066 ||
      cp === 0x2067 ||
      cp === 0x2068 ||
      cp === 0x2069
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Unicode NFC normalization + whitespace trim/collapse.
 * Returns null if output is empty.
 */
function normalizeAndTrim(input) {
  const normalized = input.normalize('NFC');
  const wsRegex = /[\s\u00A0\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]+/gu;
  const collapsed = normalized.trim().replace(wsRegex, ' ');
  if (collapsed.length === 0) return null;
  return collapsed;
}

/**
 * Get the first letter-led grapheme cluster of a token.
 * Uses Intl.Segmenter at grapheme granularity. Returns null if the
 * segmenter is missing or the token is invalid. NEVER throws.
 */
function firstLetterGrapheme(token) {
  if (!TOKEN_GRAMMAR.test(token)) return null;

  let segmenter = null;
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
      segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    }
  } catch {
    return null;
  }
  if (!segmenter) return null;

  let clusters;
  try {
    clusters = [];
    for (const seg of segmenter.segment(token)) {
      clusters.push(seg.segment);
    }
  } catch {
    // Segmentation failure => unsafe (omission). Do not throw raw input.
    return null;
  }

  if (clusters.length < 2) return null;

  const firstCluster = clusters[0];
  if (!firstCluster) return null;

  // Inspect at code-point level so SMP initial letter counts.
  const cps = codePointsOf(firstCluster);
  if (cps.length === 0) return null;
  const firstCodePoint = cps[0].codePointAt(0);
  if (firstCodePoint === undefined) return null;
  if (!isLetterCodePoint(firstCodePoint)) return null;

  return firstCluster;
}

function isLetterCodePoint(cp) {
  // L category: a-z A-Z plus Unicode letters outside BMP.
  return (
    (cp >= 0x41 && cp <= 0x5A) ||
    (cp >= 0x61 && cp <= 0x7A) ||
    (cp >= 0x00C0 && cp <= 0x024F) || // Latin Extended
    (cp >= 0x0370 && cp <= 0x03FF) || // Greek
    (cp >= 0x0400 && cp <= 0x04FF) || // Cyrillic
    (cp >= 0x4E00 && cp <= 0x9FFF) || // CJK Unified Ideographs
    (cp >= 0x3400 && cp <= 0x4DBF) || // CJK Ext A
    (cp >= 0xFB00 && cp <= 0xFB06) || // Alphabetic Presentation Forms
    (cp >= 0x10400 && cp <= 0x1044F) || // Deseret (SMP)
    (cp >= 0x1E00 && cp <= 0x1EFF) || // Latin Extended Additional
    cp === 0x00C0 || cp === 0x00C9 // É, È (Vietnamese)
  );
}

/**
 * Pure redaction function. Returns:
 *  - { success: true, redacted: string, fullNameBytes } on safe input
 *  - { success: false, reason: 'unsafe' } on unsafe input (omits projection)
 *
 * Per S28 REDACTION.md (and F-05 corrections):
 *  1. Require string. Reject Cc/Cf/FEFF/bidi BEFORE whitespace normalization.
 *  2. Code-point cap (<=256).
 *  3. NFC normalize; trim+collapse whitespace; empty output => unsafe.
 *  4. Split on ASCII space; each token must match grammar.
 *  5. Token cap (<=16).
 *  6. First letter-led grapheme of each token + exactly "••"; join with space.
 *  7. Output byte cap (<=512 UTF-8 bytes).
 *  8. Missing/unavailable segmenter or malformed input => unsafe (NEVER throws).
 */
export function redactFullName(input) {
  // Step 1.
  if (typeof input !== 'string') return { success: false, reason: 'unsafe' };
  if (containsControlOrFormat(input)) return { success: false, reason: 'unsafe' };

  // Step 2 — code-point bound.
  if (codePointsOf(input).length > INPUT_MAX_CODEPOINTS) {
    return { success: false, reason: 'unsafe' };
  }

  // Step 3 — NFC + whitespace.
  let normalized;
  try {
    normalized = normalizeAndTrim(input);
  } catch {
    return { success: false, reason: 'unsafe' };
  }
  if (normalized === null) return { success: false, reason: 'unsafe' };

  // Step 4 — split tokens.
  const tokens = normalized.split(' ');
  if (tokens.length === 0) return { success: false, reason: 'unsafe' };

  // Step 5 — token bound.
  if (tokens.length > TOKEN_MAX) return { success: false, reason: 'unsafe' };

  // Step 6 — first letter-led grapheme.
  const initials = [];
  for (const token of tokens) {
    if (token.length === 0) return { success: false, reason: 'unsafe' };
    const initial = firstLetterGrapheme(token);
    if (initial === null) return { success: false, reason: 'unsafe' };
    initials.push(initial);
  }

  // Step 7 — emit masked initials.
  const redacted = initials.map((i) => i + MASK).join(SPACE);

  // Step 8 — output byte cap. Over-limit means WHOLE-PROJECTION omission,
  // not a partial truncation.
  let bytes;
  try {
    bytes = byteLengthUtf8(redacted);
  } catch {
    return { success: false, reason: 'unsafe' };
  }
  if (bytes > OUTPUT_MAX_BYTES) return { success: false, reason: 'unsafe' };

  return { success: true, redacted, fullNameBytes: bytes };
}

export const REDACTION_LIMITS = Object.freeze({
  INPUT_MAX_CODEPOINTS,
  TOKEN_MAX,
  OUTPUT_MAX_BYTES,
});
