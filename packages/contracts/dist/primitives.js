import { z } from 'zod';
// ============================================================================
// Primitives - local to this module, NOT re-exported from frozen contracts root.
// Compatible with packages/contracts/src/primitives.ts at CRM baseline
// 72643356a0d1355f9dccc3921b47c990ea9c31c1 per EP-05.
// ============================================================================
const opaqueId = (name, max) => z
    .string()
    .min(1)
    .max(max)
    .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/u, name + ' contains invalid characters');
export const CorrelationIdSchema = opaqueId('correlationId', 128).min(8);
export const OrganizationIdSchema = opaqueId('organizationId', 64);
export const CanonicalIdSchema = opaqueId('canonical id', 128);
/** ISO-8601 timestamp with explicit UTC offset, 20..40 chars. */
export const IsoTimestampSchema = z
    .string()
    .min(20)
    .max(40)
    .datetime({ offset: true });
/** Module-local schemaVersion. Not a shared v1 literal. */
export const MODULE_SCHEMA_VERSION = '1';
export const ModuleSchemaVersionSchema = z.literal(MODULE_SCHEMA_VERSION);
