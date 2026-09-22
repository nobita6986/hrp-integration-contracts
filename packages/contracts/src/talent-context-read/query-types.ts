import { z } from 'zod';
import {
  CorrelationIdSchema,
  OrganizationIdSchema,
  CanonicalIdSchema,
  IsoTimestampSchema,
  ModuleSchemaVersionSchema,
} from './primitives.js';

// ============================================================================
// TalentContextReadQuery - per REC-004B section 2.
// ============================================================================

/** Dedicated query target: read by known canonical LaborProfile ID. */
export const TalentContextReadTargetSchema = z
  .object({
    kind: z.literal('TALENT'),
    laborProfileId: CanonicalIdSchema,
  })
  .strict();

/**
 * Eight query fields. Only `identitySummary` is currently supported for the
 * thin slice; the other seven are recognized as "known but unsupported" so
 * they round-trip to `unavailableFields` when requested.
 */
export const TalentContextReadFieldSchema = z.enum([
  'identitySummary',
  'placementCase',
  'availability',
  'currentRelationship',
  'nextAction',
  'recentInteractions',
  'contactability',
  'suppressionSummary',
]);

/** fieldAllowlist: unique, length 1..8. */
export const TalentContextReadFieldAllowlistSchema = z
  .array(TalentContextReadFieldSchema)
  .min(1)
  .max(8)
  .refine((arr) => new Set(arr).size === arr.length, {
    message: 'fieldAllowlist must contain unique values',
  });

/**
 * DELEGATED_USER actor per EP-01 / S25. Includes serviceId/userId/delegationRef
 * as untrusted claims that must match signed assertion server-side.
 */
export const QueryDelegatedUserActorSchema = z
  .object({
    kind: z.literal('DELEGATED_USER'),
    serviceId: CanonicalIdSchema,
    userId: CanonicalIdSchema,
    delegationRef: CanonicalIdSchema,
  })
  .strict();

export const TalentContextReadQueryRequestSchema = z
  .object({
    schemaVersion: ModuleSchemaVersionSchema,
    correlationId: CorrelationIdSchema,
    organizationId: OrganizationIdSchema,
    actor: QueryDelegatedUserActorSchema,
    target: TalentContextReadTargetSchema,
    fieldAllowlist: TalentContextReadFieldAllowlistSchema,
  })
  .strict();

// ============================================================================
// Direct success result - 200 returns TalentContextReadResultSchema.
// No `data` / success wrapper. resolvedAt is query processing time only.
// ============================================================================

export const IdentitySummarySchema = z
  .object({
    schemaVersion: ModuleSchemaVersionSchema,
    fullNameRedacted: z.string().min(1).max(512),
    displayOnly: z.literal(true),
  })
  .strict();

/** unavailableFields: unique, length 0..8. */
export const UnavailableFieldsSchema = z
  .array(TalentContextReadFieldSchema)
  .max(8)
  .refine((arr) => new Set(arr).size === arr.length, {
    message: 'unavailableFields must contain unique values',
  });

export const TalentContextReadResultSchema = z
  .object({
    schemaVersion: ModuleSchemaVersionSchema,
    correlationId: CorrelationIdSchema,
    organizationId: OrganizationIdSchema,
    target: TalentContextReadTargetSchema,
    identitySummary: IdentitySummarySchema.optional(),
    unavailableFields: UnavailableFieldsSchema,
    resolvedAt: IsoTimestampSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.identitySummary && value.unavailableFields.includes('identitySummary')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['unavailableFields'],
        message: 'identitySummary present but also marked unavailable',
      });
    }
  });