# 03 — Hidden vs nonexistent
Status: DRAFT / NOT_EXECUTED. These are synthetic design examples aligned with HRP MSG-025, not executable schemas or runtime evidence. Technical proposals still require bilateral acceptance. Owner approvals are limited by MSG-026.

Given valid authentication/delegation and otherwise valid query, hidden and nonexistent objects both return:
404 / NOT_FOUND / errors.talentContext.notFound / NEVER.
See fixtures/errors.json hidden_object and nonexistent_object.
Same sanitized semantics; legitimate per-request correlation IDs may differ. Do not claim constant-time/non-enumerability from equal JSON fixtures.
Invalid assertion -> 401 without echoing target IDs.
Use an empty canonical ID for 422; no UUID-only assumption.
Infrastructure 404 HTML/empty body is protocol failure, not typed object NOT_FOUND.
HRP producer filters output; CRM parser never displays raw response bodies.
