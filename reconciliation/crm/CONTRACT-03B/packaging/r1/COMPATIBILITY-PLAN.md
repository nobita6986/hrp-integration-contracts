# CONTRACT-03B.1 - Compatibility plan

## Export-map before vs after

### BEFORE (no candidate)

No `@hrp-engagement/contracts` package exists in npm registry or in the
CRM consumer repository. CRM today imports `@hrp-engagement/contracts`
as its OWN dev-harness package at `D:\CodeApp\Hrp-Crm\packages\contracts`
(version `0.0.8-g0.8-fixes`, private), which exposes CRM command/envelope
schemas only (enums, primitives, errors, envelopes, 28 commands).
That is a DIFFERENT package and is NOT touched by this task.

### AFTER (candidate exists, not promoted)

- New candidate: `@hrp-engagement/contracts@0.0.0-candidate.0`
- Lives in `D:\CodeApp\hrp-integration-contracts-02a\packages\publish-candidate\`.
- Exposes ONLY the executable `talent-context-read/v1` subpath surface.
- Both root `.` and `./talent-context-read/v1` map to the same
  `dist/talent-context-read/index.js` (compiled output only).

### Frozen root surface check

- CRM dev harness package `@hrp-engagement/contracts@0.0.8-g0.8-fixes`
  is private, not published, and has its own dist + 28 commands.
- The candidate package here is in a different repository
  (integration contracts) and is not promoted; CRM consumers do not
  see it unless they explicitly install the candidate tarball.
- No CRM source was modified.
- No CRM package.json was modified.

## CRM consumer inventory (impact surface)

The following CRM locations were inventoried for ANY use of the
`talent-context-read` subpath or its symbols:

| Source file | Current import | Runtime/type usage | Migration risk |
|-------------|---------------|--------------------|----------------|
| (no file matches) | (no consumer imports the subpath today) | n/a | GREENFIELD |

Searches performed:

- `Grep` for `talent-context-read` across `D:\CodeApp\Hrp-Crm\` -> 0 matches.
- `Grep` for `TalentContextRead` across `D:\CodeApp\Hrp-Crm\` -> 0 matches.
- `Grep` for `hrp-integration-contracts` across `D:\CodeApp\Hrp-Crm\` ->
  only matches in the integration-contracts repo itself.

Therefore the candidate is GREENFIELD on the CRM side: no consumer
currently imports it, so no migration is required for 03B.1. The next
task (CONTRACT-03B.2) will surface real CRM consumers.

## Handoff inputs for CONTRACT-03B.2

T1-A will execute the CRM consumer compatibility review with:

- Candidate commit SHA: `<TO_BE_FILLED_BY_HANDOFF>` (full 40-char SHA)
- Candidate parent SHA: `2eb6bd155399d5e0490c5a2b0c5037a57dc36bc3`
- Branch: `codex/contract03b-packaging`
- Package identity: `@hrp-engagement/contracts`
- Version: `0.0.0-candidate.0` (VERSION_CANDIDATE / NOT_PUBLISHED)
- Tarball filename: `hrp-engagement-contracts-0.0.0-candidate.0.tgz`
- Tarball SHA-256: `4fc0cef16e3dbf9f5412ccb9771e30ce3acd8bc438f9b7bd527395eac35f363a`
- Tarball byte size: 28 571
- Install command:
  `npm install "D:\CodeApp\hrp-integration-contracts-02a\packages\publish-candidate\hrp-engagement-contracts-0.0.0-candidate.0.tgz" --save`
- Supported Node version: `>=20`
- Expected subpath: `@hrp-engagement/contracts/talent-context-read/v1`
- Expected exports:
  - `import` -> `./dist/talent-context-read/index.js`
  - `types` -> `./dist/talent-context-read/index.d.ts`
- Required consumer tsconfig: `module: Node16` (or NodeNext) for subpath resolution.

## Compatibility list NOT executed (must be deferred to 03B.2)

- [ ] CRM dev-harness compile + test against the candidate
- [ ] CRM `apps/integration-worker` consumer compile
- [ ] CRM `apps/integration-api` consumer compile
- [ ] CRM `apps/context-panel` consumer compile
- [ ] Cross-repo package-lock.json rebuild
- [ ] Runtime smoke inside CRM apps

No compatibility claims are made in this bundle beyond "GREENFIELD
subpath; no current CRM consumer imports it".
