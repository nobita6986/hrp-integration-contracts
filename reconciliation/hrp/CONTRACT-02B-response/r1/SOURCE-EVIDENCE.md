# Source Evidence (HRP T0)

Evidence of stable paths and symbols in the new baseline: `0f46f0fbf2c8bc8d106c9aa2f0d3fc6143d2850b`.

## 1. LaborProfile Read
- **File**: `src/domains/talent/labor-profile.read-service.ts`
- **Symbol**: `export async function getLaborProfilesList`
- **Line**: 32
- **Symbol**: `export async function getLaborProfileDetail`
- **Line**: 178

## 2. AuthContext
- **File**: `src/shared/auth/auth-context.ts`
- **Symbol**: `export interface AuthContext`
- **Line**: 20

## 3. LaborProfile RLS
- **File**: `prisma/migrations/20260908150001_v6_phase1a_labor_profile_rls/migration.sql`
- **Symbol**: `CREATE POLICY hrp_labor_profile_scope ON labor_profiles`
- **Line**: 10

## 4. CRM Wire
- **File**: `src/domains/crm/client-read.service.ts`
- **Symbol**: `export async function getClientDetail`
- **Line**: 27
- **File**: `src/domains/crm/project-read.service.ts`
- **Symbol**: `export async function getProjectDetail`
- **Line**: 33
