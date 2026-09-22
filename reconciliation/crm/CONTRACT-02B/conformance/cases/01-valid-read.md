# 01 — Valid read
Status: DRAFT / NOT_EXECUTED. These are synthetic design examples aligned with HRP MSG-025, not executable schemas or runtime evidence. Technical proposals still require bilateral acceptance. Owner approvals are limited by MSG-026.

Use fixtures/requests.json case_1_1_valid_read and fixtures/results.json case_1_1_valid.
Authentication, session/delegation binding and object permission are preconditions, not properties established by the body.
Request has schemaVersion, correlationId, organizationId, delegated actor (serviceId/userId/delegationRef), target and fieldAllowlist.
Result is direct (no data wrapper), with schemaVersion, correlationId, organizationId, target, unavailableFields and resolvedAt.
identitySummary, when present, has schemaVersion='1', fullNameRedacted and displayOnly=true.
No phone/CCCD, internal DTO, laborProfileVersion, snapshotVersion or expectedVersion.
resolvedAt is query completion time, not a version/cache/concurrency authority.
The redacted value is only a synthetic placeholder; exact algorithm and vectors remain OPEN.
HRP confirmation: redaction vectors and source mapping. Wire shape remains PROPOSED.
