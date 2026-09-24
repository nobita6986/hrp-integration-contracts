# Package Inventory

## Package identity
- Name: @hrp-engagement/contracts
- Version (npm artifact candidate): 0.0.0-r2-candidate.0
- Type: module (ESM)

## Tarball
- Filename: hrp-engagement-contracts-0.0.0-r2-candidate.0.tgz
- Total files: 79
- Package size: 169360 bytes (169.4 kB packed / 1.2 MB unpacked)
- SHA-256: b1db1cb28aeab10bb85497661e1d976dc7370c9abb280db9a3aff16567732dfc
- npm shasum: 4713b1ce639acdc070a9fa95f868bc08b99d0f9b
- Integrity: sha512-+27AdjodOKTVc[...]I9ZkvEND06HFw==

## Full tarball file inventory (79 files)
package.json
CHANGELOG.md
README.md
dist/index.js
dist/index.d.ts
dist/enums.js
dist/enums.d.ts
dist/envelopes.js
dist/envelopes.d.ts
dist/errors.js
dist/errors.d.ts
dist/primitives.js
dist/primitives.d.ts
dist/commands/ai-proposals.js
dist/commands/ai-proposals.d.ts
dist/commands/ai-provider-config.js
dist/commands/ai-provider-config.d.ts
dist/commands/analytics.js
dist/commands/analytics.d.ts
dist/commands/availability.js
dist/commands/availability.d.ts
dist/commands/dnc.js
dist/commands/dnc.d.ts
dist/commands/events.js
dist/commands/events.d.ts
dist/commands/evidence.js
dist/commands/evidence.d.ts
dist/commands/gateway.js
dist/commands/gateway.d.ts
dist/commands/identity.js
dist/commands/identity.d.ts
dist/commands/intake.js
dist/commands/intake.d.ts
dist/commands/interactions.js
dist/commands/interactions.d.ts
dist/commands/kpi.js
dist/commands/kpi.d.ts
dist/commands/mappings.js
dist/commands/mappings.d.ts
dist/commands/merge-review.js
dist/commands/merge-review.d.ts
dist/commands/next-action.js
dist/commands/next-action.d.ts
dist/commands/outbox.js
dist/commands/outbox.d.ts
dist/commands/placement-case.js
dist/commands/placement-case.d.ts
dist/commands/ports.js
dist/commands/ports.d.ts
dist/commands/profile.js
dist/commands/profile.d.ts
dist/commands/providers.js
dist/commands/providers.d.ts
dist/commands/queries.js
dist/commands/queries.d.ts
dist/commands/routing.js
dist/commands/routing.d.ts
dist/commands/scheduling.js
dist/commands/scheduling.d.ts
dist/commands/suppression.js
dist/commands/suppression.d.ts
dist/talent-context-read/index.js
dist/talent-context-read/index.d.ts
dist/talent-context-read/assertion.js
dist/talent-context-read/assertion.d.ts
dist/talent-context-read/conformance.js
dist/talent-context-read/conformance.d.ts
dist/talent-context-read/delegation.js
dist/talent-context-read/delegation.d.ts
dist/talent-context-read/primitives.js
dist/talent-context-read/primitives.d.ts
dist/talent-context-read/query-errors.js
dist/talent-context-read/query-errors.d.ts
dist/talent-context-read/query-parser.js
dist/talent-context-read/query-parser.d.ts
dist/talent-context-read/query-types.js
dist/talent-context-read/query-types.d.ts
dist/talent-context-read/redaction.js
dist/talent-context-read/redaction.d.ts

## Breakdown
- Root surface files (38): index.js, index.d.ts + 18 commands x 2 + enums/envelopes/errors/primitives x 2 = 38
- Subpath surface files (18): 9 modules x 2 (index, assertion, conformance, delegation, primitives, query-errors, query-parser, query-types, redaction) = 18
- Metadata (3): package.json, CHANGELOG.md, README.md

## Root vs subpath export counts (runtime)
- Root: 379 named exports (matches baseline)
- Subpath: 83 named exports (full new module surface)

## No src/, tests/, node_modules/, or scripts in the tarball
The package.json files array is restricted to:
- dist (all compiled output)
- README.md, CHANGELOG.md, LICENSE

The tarball is clean for distribution. There is no risk of a consumer
accidentally importing from dist/commands/x (no exports entry exposes
that path); only . and ./talent-context-read/v1 are public surfaces.
