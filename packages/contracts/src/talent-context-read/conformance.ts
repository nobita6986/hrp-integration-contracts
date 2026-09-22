import { z } from 'zod';
import {
  TalentContextReadFieldSchema,
  TalentContextReadFieldAllowlistSchema,
} from './query-types.js';
import {
  IdentitySummarySchema,
  UnavailableFieldsSchema,
} from './query-types.js';

// ============================================================================
// F-06 - request/result conformance helper.
//
// Pure function `checkResultConformance(requested, fullNameInput)` that
// decides, for a given fieldAllowlist + the raw fullNameInput:
//
//   - Requested but unsafe (rejected by redaction)  -> omit identitySummary,
//                                                     single `identitySummary`
//                                                     marker.
//   - Known unsupported (field present in allowlist but not currently
//     available)                                    -> marker ONLY IF requested.
//   - Unrequested (not in allowlist)                -> neither data nor marker.
//
// This is a pure helper — no I/O, no logging. Caller provides the redaction
// function and supplies the unsafe-flag.
// ============================================================================

const SUPPORTED_FIELDS = Object.freeze(['identitySummary']);
const KNOWN_UNSUPPORTED = Object.freeze([
  'placementCase',
  'availability',
  'currentRelationship',
  'nextAction',
  'recentInteractions',
  'contactability',
  'suppressionSummary',
]);

/**
 * @param {string[]} requested - validated fieldAllowlist.
 * @param {{ success: true, redacted: string } | { success: false, reason: string }} redactOutcome
 * @returns {{ identitySummary?: object, unavailableFields: string[] }}
 */
export function checkResultConformance(requested, redactOutcome) {
  const reqParsed = TalentContextReadFieldAllowlistSchema.parse(requested);

  const unavailable = new Set<string>();

  // Decide data + marker for identitySummary specifically.
  let identitySummary = undefined;
  if (reqParsed.indexOf('identitySummary') !== -1) {
    if (redactOutcome && redactOutcome.success) {
      const ok = IdentitySummarySchema.safeParse({
        schemaVersion: '1',
        fullNameRedacted: redactOutcome.redacted,
        displayOnly: true,
      });
      if (ok.success) {
        identitySummary = ok.data;
      } else {
        unavailable.add('identitySummary');
      }
    } else {
      // Unsafe OR omitted: omit data and add marker exactly once.
      unavailable.add('identitySummary');
    }
  }

  // Known unsupported: marker ONLY if requested.
  for (const f of KNOWN_UNSUPPORTED) {
    const reqAsStrings = reqParsed as unknown as string[];
    if (reqAsStrings.indexOf(f) !== -1) unavailable.add(f as never);
  }
  const unavailableFields = UnavailableFieldsSchema.parse(Array.from(unavailable) as never[]);
  return { identitySummary, unavailableFields };
}

/**
 * `expectedUnavailableFields` should match the array, with stable ordering.
 */
export function compareUnavailableFields(actual, expected) {
  if (!Array.isArray(actual) || !Array.isArray(expected)) return false;
  if (actual.length !== expected.length) return false;
  const a = [...actual].sort();
  const b = [...expected].sort();
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export const CONFORMANCE_KNOWN_UNSUPPORTED = KNOWN_UNSUPPORTED;
export const CONFORMANCE_SUPPORTED = SUPPORTED_FIELDS;
