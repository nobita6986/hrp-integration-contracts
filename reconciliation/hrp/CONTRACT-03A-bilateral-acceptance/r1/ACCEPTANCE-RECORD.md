# CONTRACT-03A bilateral executable acceptance record

## 1. Authority and pinned evidence

T0 HRP accepts the disposition delivered by T0 CRM in `CRM-HRP-MSG-042` and pins:

- executable candidate `2eb6bd155399d5e0490c5a2b0c5037a57dc36bc3`;
- producer evidence commit `371267aeee58a45891af468e6f4799ca6dd23b0e`;
- producer evidence bundle `reconciliation/hrp/CONTRACT-03A-producer-recheck/r5/`;
- producer evidence manifest SHA-256 `b0e8dc636e3c3054acf998e9796e027a9e056fd2a8e68fa37f988717e35cf850`.

The producer evidence records PASS for F-01 through F-06 and I-01, canonical probes `41/41`, regression probes `60/60`, package tests `288/288`, generator checks `8/8`, authoritative redaction vectors `22/22`, package manifest `23/23 MATCH`, and CRM r2 manifest `4/4 MATCH`.

## 2. Accepted executable perimeter

The bilateral executable acceptance covers only:

1. Talent-context read query schemas and validators.
2. Strict assertion/profile validation.
3. Delegation transport schemas.
4. Query-local error parser and profile.
5. Canonical primitives and redaction behavior.
6. Synthetic conformance fixtures and tests.
7. Manifest and reproducibility tooling.

The accepted executable behavior is the content of the pinned candidate commit. No later branch head or mutable reference is accepted implicitly.

## 3. Explicit exclusions

The acceptance excludes:

- runtime endpoint or HTTP transport implementation;
- JWT signing or cryptographic-verification runtime;
- key provisioning or rotation implementation;
- replay, delegation, or audit stores;
- HRP authorization or RLS runtime;
- CRM consumer migration;
- package publication or registry distribution;
- real organization or service registration;
- pilot, production enablement, or deployment.

Pure schema and conformance evidence does not prove signature verification, replay enforcement, authorization, RLS, session/browser integration, atomic cleanup, or runtime consumer compatibility.

## 4. Governance state

- `SPEC_DESIGN = BILATERALLY_ACCEPTED`.
- `EXECUTABLE_CONTRACT = BILATERALLY_ACCEPTED` for the perimeter in section 2.
- `ACCEPTED_SHARED promotion = NOT_YET_PERFORMED`.
- `Runtime/consumer compatibility = NOT_EXECUTED`.
- H.09, Tier 3, Owner runtime, registration/configuration, and enablement gates remain closed.

The non-blocking CONTRACT-03B documentation cleanup is preserved: document the intentional `.gitignore` exclusion in the manifest header and synchronize stale compatibility comments in `assertion.ts` with strict executable behavior before publication. Those edits must not alter executable behavior; any new artifact SHA requires manifest regeneration and focused verification.

## 5. Authorization and ownership

T0 CRM is authorized to open CONTRACT-03B packaging and consumer compatibility as a separate gated task. CRM owns execution of that task unless the two T0s later record a different ownership decision. HRP must not create a competing implementation.

This authorization does not permit package publication, runtime implementation, endpoint/auth/DB changes, consumer migration, pilot, production enablement, or deployment.
