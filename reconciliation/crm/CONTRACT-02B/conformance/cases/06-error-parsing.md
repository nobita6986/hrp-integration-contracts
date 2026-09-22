# 06 — Error fixture expectations
Status: DRAFT / NOT_EXECUTED. These are synthetic design examples aligned with HRP MSG-025, not executable schemas or runtime evidence. Technical proposals still require bilateral acceptance. Owner approvals are limited by MSG-026.

fixtures/errors.json separates proposed valid producer examples from negative consumer inputs.
- AUTHENTICATION_REQUIRED uses REAUTHENTICATE.
- Hidden/nonexistent use errors.talentContext.notFound.
- INTERNAL_ERROR uses errors.talentContext.internal / NEVER; annotations stay outside wire.
- Unknown code or wrong triple -> EXPECT_REJECT_PROTOCOL_FAILURE.
- Multiple errors -> EXPECT_REJECT_PROTOCOL_FAILURE, not prioritization or retry scheduling.
- Empty errors array -> EXPECT_REJECT_PROTOCOL_FAILURE.
- UNKNOWN_COMMAND_OUTCOME / RECONCILE_FIRST is an intentionally invalid query input, never a fallback produced by server or consumer.
- Any raw stack/SQL/PII field -> reject/no raw rendering.
Check response correlation against the logical query; malformed-request server-generated safe IDs are handled only in the corresponding error path.
The old CORR-4 substitution of command outcome for unclassified query error is WITHDRAWN.
JSON parsing success means JSON syntax only. Schema conformance and runtime execution remain NOT_EXECUTED.
