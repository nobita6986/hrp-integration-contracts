import { z } from 'zod';
import { IdentitySummarySchema, UnavailableFieldsSchema } from './query-types.js';
export type RedactOutcome = {
    success: true;
    redacted: string;
} | {
    success: false;
    reason: string;
};
export type ConformanceResult = {
    identitySummary?: z.infer<typeof IdentitySummarySchema>;
    unavailableFields: z.infer<typeof UnavailableFieldsSchema>;
};
/**
 * Single consumer-facing helper for projection conformance. Tests must
 * call this directly; it is NOT invoked indirectly through the parser.
 */
export declare function checkResultConformance(requested: readonly string[], redactOutcome: RedactOutcome): ConformanceResult;
/**
 * Compare two unavailableFields arrays by sorted content (test helper).
 */
export declare function compareUnavailableFields(actual: readonly string[], expected: readonly string[]): boolean;
/**
 * Compare two unavailableFields arrays by exact content + first-appearance
 * order (unique + ordered). Used by tests that must observe the spec's
 * "multiple known requested fields keep unique/order" semantics.
 */
export declare function compareUnavailableFieldsInOrder(actual: readonly string[], expected: readonly string[]): boolean;
export declare const CONFORMANCE_KNOWN_UNSUPPORTED: readonly string[];
export declare const CONFORMANCE_SUPPORTED: readonly string[];
