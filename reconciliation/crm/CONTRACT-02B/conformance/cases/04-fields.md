# 04 — Projection selection
Status: DRAFT / NOT_EXECUTED. These are synthetic design examples aligned with HRP MSG-025, not executable schemas or runtime evidence. Technical proposals still require bilateral acceptance. Owner approvals are limited by MSG-026.

fieldAllowlist contains projection names, not dotted field paths.
Known names: identitySummary, placementCase, availability, currentRelationship, nextAction, recentInteractions, contactability, suppressionSummary.
Only identitySummary is supported in this slice.
- Request identitySummary -> return the complete minimal projection, including displayOnly=true and schemaVersion='1'.
- Request identitySummary + availability -> identitySummary plus unavailableFields=['availability'].
- Request availability only -> no identitySummary; unavailableFields=['availability'].
- Dotted path identitySummary.phoneRedacted, raw phone/CCCD or any unknown string -> 422.
- Duplicates or empty list -> 422 (unique 1..8).
- Unsafe/unavailable redaction -> omit identitySummary and mark identitySummary unavailable, only if requested.
unavailableFields is an array of known projection-name strings, not path/reason objects.
Unrequested projections appear in neither data nor unavailableFields.
Object authorization denial is not converted into projection unavailability.
See fixtures/requests.json case_4_* and fixtures/results.json case_4_*.
