# HRP Field Mapping - r2 (revised from r1)

r1 HRP-FIELD-MAPPING.md was correct in source line references; r2 only adds talent target ref and CRC-2-1 detail. See r1 commit 608d67d for the original.

Sources pinned at:

## 1. CRM frozen wire fields (queries.ts) - r1 unchanged

See r1 HRP-FIELD-MAPPING.md section 1 (with all 27 line references verified at commit 608d67d). r2 unchanged.

## 2. CRM primitives / enums (frozen) - r1 unchanged

See r1 HRP-FIELD-MAPPING.md section 2. r2 unchanged.

## 3. HRP source (per HRP SOURCE-EVIDENCE.md, baseline a49ceaa) - r1 unchanged

See r1 HRP-FIELD-MAPPING.md section 3. r2 unchanged.

## 4. Talent target reference (CR-2-1 - NEW in r2)

### 4.1 TalentTargetRefSchema (frozen, mappings.ts L246-253)

Required fields:

The schema is z.object(...).strict() (mappings.ts L253).

### 4.2 CanonicalTargetRefSchema union (mappings.ts L275-278)


Discriminator: kind.

### 4.3 Gap (CR-2-1)


## 5. Field-by-field status (r1 unchanged for non-target fields)

See r1 HRP-FIELD-MAPPING.md sections 4 and 5 at commit 608d67d. r2 unchanged for these sections.

## 6. CR-2-3 / CR-2-4 / CR-2-5 / CR-2-6 corrections applied (r2 only)

CR-2-3: CCCD removed from wire / AC. cccdNumberRedacted not in frozen schema.

CR-2-4: ApiErrorCode is CRM-mock-only; HRP route uses {error, message} envelope; PROPOSED not frozen.

CR-2-5: AC-1 wording relaxed (idempotent request, not strictly GET-only).

CR-2-6: Three projection states. unrequested NOT in unavailableFields.

## Stop

STOP - awaiting T0 arbitration on field-mapping gaps.

