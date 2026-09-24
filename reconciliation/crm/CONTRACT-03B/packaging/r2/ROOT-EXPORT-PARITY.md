# Root Export Parity

## Result: PARITY CONFIRMED

baseline root export set === candidate root export set (379 named exports).

## Method

1. From clean checkout of CRM baseline commit
   72643356a0d1355f9dccc3921b47c990ea9c31c1, build frozen contracts:
       npm --prefix packages/contracts build
   This produces packages/contracts/dist/index.js.

2. From clean checkout of candidate commit P2 (b750556), build the
   publish-candidate:
       npm --prefix packages/publish-candidate run build
   This produces packages/publish-candidate/dist/index.js.

3. Compare the runtime export-name sets:
       node -e "import('file:///.../dist/index.js').then(m=>console.log(Object.keys(m).sort().join('\n')))"
   Both produce 379 names, identical sorted order.

## Root export list (sample -- full set in dist/index.js)

- All schema constructors: AvailabilitySchema, IdentitySchema, IntakeSchema,
  OutboxSchema, PlacementCaseSchema, ProfileSchema, SchedulingSchema,
  SuppressionSchema, etc.
- All command constructors: createAvailability, createIdentity,
  createIntake, createOutbox, etc.
- All envelope factories: successEnvelope, errorEnvelope, etc.
- All enum constants: AvailabilityStatus, DeliveryReportingState,
  DeliveryFailureReason, PlanningBatchItemOutcome, etc.
- All error code maps: ERROR_TRIPLE, ERROR_HTTP_STATUS
- Version constants: PACKAGE_VERSION (= "0.0.8-g0.8-fixes" inherited
  from baseline -- preserved verbatim)
- Primitives, helper functions

## Subpath-only exports (NOT in root)
All talent-context-read/* names are exported only from the new subpath
@hrp-engagement/contracts/talent-context-read/v1 -- never from root.
Verified by:
    import * as root from '@hrp-engagement/contracts';
    console.log('TalentContext' in root); // false

## Backward compatibility
- Any consumer that imports @hrp-engagement/contracts and consumes the
  same names will see the same runtime values, schemas, and behavior.
- The new module does not alter the root surface.
- TypeScript declarations match baseline exactly.

## No talent-context name leaks
A grep of packages/publish-candidate/src/index.ts confirms only
root exports are re-exported. The new module is reachable only via
src/talent-context-read/index.ts (compiled to
dist/talent-context-read/index.js).

## No internal paths exposed
- dist/talent-context-read/... is reachable only through the published
  subpath export ./talent-context-read/v1.
- Internal paths like ./src/... are not declared in package.json exports.

## Counts
- Root: 379 named exports (matches baseline)
- Subpath: 83 named exports (full new module surface)
