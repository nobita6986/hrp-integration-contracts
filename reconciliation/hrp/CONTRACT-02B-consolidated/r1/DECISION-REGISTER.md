# Decision register and dependency split

## Existing disposition

C-01..C-07 are CLOSED at DESIGN LEVEL by CRM acceptance recorded here.
CD-02/CD-03/CD-04 direction is agreed; CD-05 version/distribution is a
packaging responsibility. No repeated review of those subjects is requested.

## Group 1 — specification/schema decisions before implementation

| ID | HRP recommendation for CRM disposition | Acceptance requested |
| --- | --- | --- |
| EP-01 | Strict RS256 assertion header/claims; operation audiences, raw-body/B/actor binding and fixed clock bounds | ACCEPT or targeted COUNTERPROPOSAL |
| EP-02 | Restricted manual pilot provisioning, distinct environment keys, rotation and immediate emergency disable | ACCEPT or targeted COUNTERPROPOSAL |
| EP-03 | Durable PostgreSQL replay consumption and 120-second coordinated lost-state fence, separate delegation rollback recovery | ACCEPT or targeted COUNTERPROPOSAL |
| EP-04 | Query 3 attempts/10s; cleanup 6 attempts/60s; no exchange retry; terminal ACK and bounded recovery | ACCEPT or targeted COUNTERPROPOSAL |
| EP-05 | Concrete limits and token encodings compatible with pinned primitives | ACCEPT or targeted COUNTERPROPOSAL |
| EP-06 | Top-level form flow, first-party cookie completion, state/session checks and browser compatibility gates | ACCEPT or targeted COUNTERPROPOSAL |

These routine technical choices belong to both T0s. No new Owner approval
is requested for them. After disposition, both T0s must explicitly name the
accepted spec/profile revision, schema surfaces and exclusions. Only then
can a separate schema/conformance task be assigned; it is not opened here.

That task's proposed boundary: dedicated query and delegation schemas,
assertion/profile validation contracts and synthetic positive/negative
conformance cases, with unchanged frozen command consumers. No endpoint,
DB/RLS/auth wiring, publication or consumer rollout is implied.

## Group 2 — registration/configuration before real path

Canonical HRP organization value and registration authority remain OPEN for
Owner/HRP authority. Exact issuer, audiences, service identity, key thumbprints,
callback origin/path, CRM subject-label source and environment bindings are
provisioned through restricted operations. Never invent these values in
fixtures; conformance tests use clearly synthetic isolated registrations.

Audit metadata access/retention/backup/restore policy remains OPEN for Owner:
S28 proposes 90 days online, 30-day rolling backups and restore reconciliation.
None is approved. Those values are not engineering approval in this message.

Before activation: production-quality auth/session/browser/cleanup tests,
replay/recovery drills, H.09 and independent Tier 3 plus T0 enablement gate.
Missing deployment values do not trigger renewed contract inventory or block
isolated schema/conformance tests after group 1 acceptance.

## Group 3 — separate packaging/artifact task

Maintainer confirms exact candidate version availability, subpath/export map,
build/type resolution, private immutable artifact provenance/hash and access
channel. Test both old-root and new-subpath consumers and pin exact artifact.
Compatibility execution and distribution remain NOT_EXECUTED.
Absent tarball/version is not a blocker for group 1 design acceptance.

## Ownership and final state

HRP implements future canonical enforcement and consent only after a separate
authorized task. CRM implements its signer/session/callback/parser integration
only after a separate authorized task. Both own shared design review; the
neutral repository owns the accepted contract source.

ACCEPTED_SHARED remains NONE. This proposed acceptance perimeter excludes
Owner-open configuration/audit decisions, packaging execution, runtime
capability and rollout. Owner decisions MSG-026 and H.09/Tier 3 remain intact.
