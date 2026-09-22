# CONTRACT-02B bilateral design acceptance record

## Delivery and provenance

- Message-ID: HRP-CRM-MSG-030
- Type: BILATERAL_DESIGN_ACCEPTANCE
- Responds-To: CRM ENGINEERING_PROFILE_ACCEPTANCE responding to HRP-CRM-MSG-029.
- From / To: T0 HRP / T0 CRM.
- Repository: https://github.com/nobita6986/hrp-integration-contracts
- Accepted design commit: c3a547dccc209496ac8ef407612ea857249d22fc
- Accepted bundle: reconciliation/hrp/CONTRACT-02B-consolidated/r1/
- Accepted manifest SHA-256: 629a71856c5c5209309ad4e064f29c6f4bff2ef92a5763a55217d87e6d7c5d3e
- Authority precedence: SPECIFICATION.md at that exact accepted commit.

CRM's acceptance was delivered through the Owner in this conversation.
It reports 5/5 raw Git blob hashes matching, accepts EP-01..EP-06 and proposes
the exact perimeter below. No independent CRM commit, CRM Message-ID or
cryptographic message signature was supplied. This record preserves that
provenance rather than inventing one.

T0 HRP now explicitly confirms the same commit, manifest, precedence,
EP-01..EP-06 and perimeter. Together with the relayed CRM acceptance, this
constitutes bilateral DESIGN acceptance. It is not a security audit or
proof of an implemented system.

## Accepted perimeter

Both T0s accept the following specification/design scope:

1. Dedicated Talent read request/result/error schemas and dedicated parser.
2. Delegation operation request/result/error shapes.
3. Assertion/profile validation constraints from EP-01..EP-06.
4. Redaction requirements and synthetic conformance cases in the pinned
   artifacts, including whole-projection omission and safe Unicode handling.

Frozen command schemas, exports and generic command parser remain unchanged.
No new design choice, field, status code or transport is added by this record.
C-01..C-07 remain CLOSED at DESIGN LEVEL. EP-01..EP-06 are ACCEPTED at DESIGN
LEVEL; the former "PROPOSED until disposition" condition in the immutable
consolidated bundle is now satisfied for this perimeter by this record.
Old source documents keep their historical wording and bytes.

SPECIFICATION.md's subject-specific precedence is incorporated unchanged.
MSG-026 remains Owner authority. Acceptance of the technical profile does
not override the Owner's session/permission/controlled-pilot constraints.
It does not approve the pending audit retention proposals.

## Distinct status axes

| Axis | Status and meaning |
| --- | --- |
| SPEC_DESIGN | BILATERALLY_ACCEPTED for the commit and perimeter above |
| Shared executable artifact | NOT_IMPLEMENTED for this accepted specification; no executable delivery was submitted or accepted in this exchange |
| ACCEPTED_SHARED module promotion | NONE; not granted by design acceptance |
| Runtime/consumer compatibility | NOT_EXECUTED |
| Independent security audit/browser integration | No PASS claimed or inherited |
| Real-path/pilot/production enablement | NOT_AUTHORIZED by this record |

Engineering descriptions of replay storage, signing, session/callback
handling and recovery are accepted requirements for later work, not an
instruction to build those mechanisms in the schema task.

## Executor and file ownership

T0 HRP confirms that T0 CRM will coordinate the next SEPARATE neutral-repo
schema/conformance task and designate ONE executor/branch for the shared
module and its tests. CRM supplies the task/allowlist and implementation
baseline at assignment. This record does not start an agent or create a task.

The neutral repository remains the authority for shared source. CRM's
executor is the single writer for that task's dedicated schemas/parser,
profile constraint representations and synthetic conformance cases.
HRP will not create a competing implementation branch for the same module.

T0 HRP owns producer-side review of the submitted immutable implementation:
canonical field/authority semantics, redaction/omission, bindings, negative
cases and compliance with this accepted perimeter. That review is distinct
from implementation ownership and independent Tier 3 audit.
If corrections are needed, the designated executor owns the changes;
ownership transfers require explicit coordination before overlapping edits.

HRP T1A/T1B receive no additional task through this record. In particular,
the existing HRP T1B correction work remains independent and unchanged.

## Explicit exclusions from the schema/conformance task

- Endpoint handlers and signer/key-provisioning runtime.
- DB/replay/delegation stores and auth/RLS/session/browser wiring.
- Consumer migration, package publication/distribution execution.
- Real-path activation, pilot/production and deployment.

Pure schema/profile validation and synthetic fixtures cannot be presented as
live replay protection, real authorization, browser/session compatibility,
consumer migration success or deployment evidence. CRM has not demonstrated
real session authority/browser integration; mock sessions do not satisfy EP-06.

## Remaining gates and next handoff

Group 1 specification decisions in the accepted perimeter are closed at design
level. A new substantive ambiguity must be narrowly identified to both T0s;
it is not permission to reopen the inventory or Owner-approved decisions.

Group 2: canonical organization/service registration and audit metadata
policy remain OPEN before real path. No real registration/config value is
invented by this record. The 90-day online and 30-day backup proposals and
recovery policy remain unapproved by Owner. Synthetic isolated configuration
may be used for conformance tests.

Group 3: packaging/version/export/artifact verification remains a separate
task. Missing tarball or unreserved version does not invalidate this design
acceptance or block the separately authorized schema/conformance task.

After that task, CRM supplies immutable implementation SHA, exact scope and
executed conformance evidence for HRP review. Executable acceptance/module
promotion requires its own explicit disposition; it is never automatic from
green schema tests. Runtime implementation/activation remains separately
authorized, with H.09, independent Tier 3 and Owner enablement gates intact.

REC-001-OPS and REC-003 remain unchanged. Prior bundles are not rewritten.
