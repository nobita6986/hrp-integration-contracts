/**
 * Pure redaction function.
 *  - { success: true,  redacted, fullNameBytes }   on safe input
 *  - { success: false, reason: 'unsafe' }          on unsafe input
 *
 * Algorithm (S28 REDACTION.md + F-05 corrections):
 *  1. Require string. Reject Cc/Cf/FEFF/bidi BEFORE whitespace normalization.
 *  2. Code-point cap (<=256).
 *  3. NFC normalize; trim+collapse whitespace; empty output => unsafe.
 *  4. Split on ASCII space; each token must match the Unicode-property
 *     grammar `^[\p{L}][\p{L}\p{M}]*(?:['-][\p{L}][\p{L}\p{M}]*)*$`.
 *  5. Token cap (<=16).
 *  6. First letter-led grapheme cluster of each token + exactly "••";
 *     join with ASCII space.
 *  7. Output byte cap (<=512 UTF-8 bytes). Over-limit => unsafe (omit,
 *     never truncate).
 *  8. Missing/unavailable/throwing segmenter or malformed input => unsafe
 *     (NEVER throws; NEVER leaks raw input).
 */
export declare function redactFullName(input: unknown): {
    success: false;
    reason: "unsafe";
    redacted?: undefined;
    fullNameBytes?: undefined;
} | {
    success: true;
    redacted: string;
    fullNameBytes: number;
    reason?: undefined;
};
export declare const REDACTION_LIMITS: Readonly<{
    INPUT_MAX_CODEPOINTS: 256;
    TOKEN_MAX: 16;
    OUTPUT_MAX_BYTES: 512;
}>;
