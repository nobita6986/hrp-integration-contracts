# HRP-REQ-4 — audit metadata proposal for Owner decision

This is a recommendation only. It creates no audit table, event stream,
retention job, access policy, or recovery process.

| Topic | Proposed policy | Owner decision required |
| --- | --- | --- |
| Who may view | Named HRP Security/Operations responders and a designated compliance owner; CRM users and ordinary business operators cannot browse the log. | Confirm the named role/group and break-glass approval path. |
| What is retained | Timestamp, outcome class, service ID, pseudonymous delegation reference, hashed/opaque correlation reference, endpoint/action, configured organization reference, policy version, and recovery action. Do not retain receipt, assertion, raw request/result, phone, CCCD, raw name, or LaborProfile DTO. | Confirm whether a canonical object reference may be retained or must be one-way pseudonymized. |
| Retention | Recommend 90 days online encrypted access-audit metadata, then irreversible purge; any longer retention requires an explicit legal/compliance reason. | Approve the duration and any legal-hold exception. |
| Recovery | HRP Platform Operations owns encrypted backup/restore testing and incident recovery; each restoration is itself audited. CRM may request evidence through the named incident process, not direct database access. | Confirm RTO/RPO, backup retention, and incident escalation owner. |

The proposal deliberately does not settle REC-001-OPS, REC-003, or
cross-system revocation guarantees.
