// ============================================================================
// Redaction - S28 REDACTION.md section "Proposed algorithm" (steps 1-6).
// Pure function; no side effects; no PII in output or logs.
// ============================================================================

const MASK = '\u2022\u2022'; // "••" (two bullet characters)
const SPACE = ' ';

/** Token grammar from S28 REDACTION.md step 3. */
const TOKEN_GRAMMAR =
  /^[\p{L}][\p{L}\p{M}]*(?:['-][\p{L}][\p{L}\p{M}]*)*$/u;

/**
 * Check if a string contains any Cc/Cf control characters or format chars
 * including bidi controls.
 */
function containsControlOrFormat(input) {
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (
      code <= 0x1F ||
      code === 0x7F ||
      (code >= 0x80 && code <= 0x9F) ||
      [0x202A, 0x202B, 0x202C, 0x202D, 0x202E, 0x2066, 0x2067, 0x2068, 0x2069].includes(code)
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
  // Trim Unicode White_Space and collapse internal runs to ASCII space.
  const wsRegex = /[\s\u00A0\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]+/gu;
  const collapsed = normalized.trim().replace(wsRegex, ' ');
  if (collapsed.length === 0) return null;
  return collapsed;
}

/**
 * Get the first letter-led grapheme cluster of a token.
 * Returns null if no such cluster exists or if token is invalid.
 */
function firstLetterGrapheme(token) {
  if (!TOKEN_GRAMMAR.test(token)) return null;

  let segmenter = null;
  try {
    segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  } catch {
    return null;
  }
  if (!segmenter) return null;

  // Count grapheme clusters first.
  const clusters = [];
  for (const seg of segmenter.segment(token)) {
    clusters.push(seg.segment);
  }

  // Must have at least 2 grapheme clusters (refined r1).
  if (clusters.length < 2) return null;

  // First cluster must start with a Unicode letter.
  const firstCluster = clusters[0];
  if (!firstCluster) return null;
  const firstChar = firstCluster[0];
  if (!firstChar || !/^\p{L}$/u.test(firstChar)) return null;

  return firstCluster;
}

/**
 * Pure redaction function. Returns:
 *  - { success: true, redacted: '<first-letter><mask>' } on safe input
 *  - { success: false, reason: 'unsafe' } on unsafe input (omits projection)
 *
 * Per S28 REDACTION.md:
 *  1. Require string; reject controls/format before whitespace normalization.
 *  2. NFC normalize; trim+collapse whitespace; empty output is unsafe.
 *  3. Split on ASCII space; each token must match grammar.
 *  4. First letter-led grapheme of each token + exactly "••"; join with space.
 *  5. Missing/unavailable segmenter or malformed input → unsafe.
 */
export function redactFullName(input) {
  // Step 1: require string.
  if (typeof input !== 'string') return { success: false, reason: 'unsafe' };
  if (containsControlOrFormat(input)) return { success: false, reason: 'unsafe' };

  // EP-05 bounds: input must be <= 256 Unicode scalar values.
  if (Array.from(input).length > 256) return { success: false, reason: 'unsafe' };

  // Step 2: NFC + whitespace.
  const normalized = normalizeAndTrim(input);
  if (normalized === null) return { success: false, reason: 'unsafe' };

  // Step 3: split tokens.
  const tokens = normalized.split(' ');
  if (tokens.length === 0) return { success: false, reason: 'unsafe' };

  // EP-05 bounds: max 16 tokens.
  if (tokens.length > 16) return { success: false, reason: 'unsafe' };

  // Step 4: each token must have first letter-led grapheme.
  const initials = [];
  for (const token of tokens) {
    if (token.length === 0) return { success: false, reason: 'unsafe' };
    const initial = firstLetterGrapheme(token);
    if (initial === null) return { success: false, reason: 'unsafe' };
    initials.push(initial);
  }

  // Step 5: emit masked initials.
  return {
    success: true,
    redacted: initials.map((i) => i + MASK).join(SPACE),
  };
}