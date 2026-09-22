# Distribution proposal — private reproducible tarball
PROPOSED; no build, package publication, dependency migration or source extraction executed.

Source authority: future bilateral accepted neutral commit for packages/contracts/src/talent-context-read/v1.ts.
Entrypoint: @hrp-engagement/contracts/talent-context-read/v1.
Candidate package version: 0.0.9-contract02b.1; not reserved or released.
ESM subpath with .js and .d.ts outputs; types condition precedes import in proposed export map.
No re-export into generic root/parser. Preserve existing root exports without reconstructing them from this document.
Wire '1', module /v1 and package version are separate version axes.

## One proposed consumption mechanism
1. Package maintainer pins accepted neutral module commit plus existing package base commit and exact build tool/lockfile versions.
2. Future packaging checkout assembles only the accepted module into the existing private package build; frozen root sources retain their baseline bytes. This controlled source integration requires its own task and provenance; no whole frozen package is copied to neutral repo.
3. Build and consumer compatibility checks, then npm pack the actual package with required dist/.js/.d.ts, export map and runtime dependencies. Record source commits, tool versions, archive file list, full tarball SHA-256 and package-manager integrity.
4. Deliver the same immutable .tgz to both repos through an agreed access-controlled artifact channel. For initial local conformance, stage the identical archive at vendor/<versioned-name>.tgz in each isolated test checkout and pin dependency via file:vendor/<versioned-name>.tgz plus generated lockfile. No archive or lockfile is added in this task.
5. Verify archive hash before install and verify lockfile/installed subpath resolution. Per-file hashes supplement provenance; they are NOT the tarball integrity field. A bare version string does not locate a private artifact.
6. Rebuild the pinned inputs independently and compare archive identity; normalize packaging nondeterminism through a documented procedure if necessary. Reproducibility NOT_EXECUTED, not assumed.

private:true prevents accidental npm publication; it does not by itself set up a private registry or distribute anything.
Artifact channel/access and lifecycle are still bilateral/operations decisions. Registry publication is not part of this proposal.

## Consumer scope
Old consumers retain existing version/lockfiles unless explicitly migrated.
New CRM B.03 and HRP producer/conformance checkout consume exact same candidate artifact.
Same-package upgrades may affect workspace resolution/dedup/root imports even with a new subpath.
Intended isolation only; consumer compatibility NOT_EXECUTED.
Maintainer checks old root fixtures, new export/types resolution, dependency graph and both consumer lockfiles before any migration.
A query-only parser must reject command errors/new unknown codes; frozen parser must not be loosened to accept query-only additions.

No publish/token/CI pipeline or new npm package is authorized here.
