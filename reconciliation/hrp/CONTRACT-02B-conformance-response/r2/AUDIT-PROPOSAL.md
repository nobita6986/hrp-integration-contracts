# Audit metadata — proposal clarification, still OPEN

Retain r1's proposed restricted HRP Security/Operations/compliance access and
minimal metadata. No receipts, handoff proofs, delegation references,
assertions, session tokens, raw bodies/results, raw names, phone or CCCD in
audit records. References needed for investigations should be keyed
pseudonymous identifiers under restricted access, not authentication values.

Recommend 90 days online metadata from event time; this is NOT Owner-approved.
Online purge deletes expired records and derived indexes/caches/search copies.
It does not assert that immutable backups were already erased.

Proposed backup profile for Owner/operations review: encrypted backups with a
maximum 30-day rolling lifetime, no indefinite replicas/snapshots. These may
contain metadata already purged online, up to a conservative 120 days from
event time. Backup access is restricted to recovery operators; routine audit
viewers cannot query backups. Any legal hold requires an explicit exception,
scope, approver and end/review date; it is not implied.

Restore occurs in an isolated recovery environment. Before any restored
service, viewer, index or export is enabled, apply current event-time expiry,
current deletion/hold policy and deletion tombstones from an independently
retained durable journal; rebuild derived stores and verify aggregates.
If the current deletion journal/policy is unavailable, keep the restored data
inaccessible until reconciled. Restoring an older backup never resets event
age or reinstates expired/deleted access.

Keep deletion journal entries at least through the oldest backup that could
resurrect the record; then purge corresponding journal metadata under the
approved policy. Backup expiry must also cover off-site copies and retired
snapshots. Cryptographic erasure is usable only with evidence that every
relevant key copy is destroyed.

HRP Operations owns restricted restore, purge reconciliation and recovery
evidence. Owner still decides access roles, 90-day/30-day limits, permitted
identifiers, exceptions, RTO/RPO and named recovery accountability. These
recommendations neither create controls nor settle REC-001-OPS/REC-003.
