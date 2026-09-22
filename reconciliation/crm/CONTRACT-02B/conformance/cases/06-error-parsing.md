# Category 6: Consumer Error Parsing

## Status

- Reuse-frozen codes behavior: AGREED_DIRECTION (D-04).
- Query-specific codes (NOT_FOUND, INTERNAL_ERROR): PROPOSED (CRM r6 REC-004B).
- Consumer parser policy: PROPOSED (CRM T1-B drafts; HRP can revise).
- DRAFT only.

## Source of Decision / AC

- r6 REC-004B: reuse VALIDATION_ERROR, AUTHENTICATION_REQUIRED, FORBIDDEN, RATE_LIMITED, DEPENDENCY_UNAVAILABLE; query-specific NOT_FOUND/INTERNAL_ERROR PROPOSED.
- HRP r6 D-04 sec 2: ErrorListSchema + ContractErrorSchema; HTTP 401/403/404/422/429/503 mapping.
- HRP r6 D-04 sec 2: INTERNAL_ERROR MUST NOT leak exception, SQL, stack trace, or PII.

## Why this category

The consumer (CRM client) sits behind an error parser. The parser policy is part of the bilateral design even if it lives on one side. Crashes or echo of raw errors break the safety floor.

## Cases

### Case 6.1 - Known frozen code (e.g., AUTHENTICATION_REQUIRED) - MUST parse cleanly

Input synthetic:
Server response:
```json
{
  "schemaVersion": "1",
  "status": "FAILED",
  "correlationId": "<corr-...>",
  "errors": [
    {
      "code": "AUTHENTICATION_REQUIRED",
      "messageKey": "errors.talentContext.auth.missing",
      "retryClass": "NEVER"
    }
  ]
}
```

Expected consumer behavior:
- Parser identifies code in known set.
- Consumer maps to local UX state (e.g., re-auth flow).
- retryClass=NEVER -> consumer does NOT auto-retry.
- MUST NOT crash.
- MUST NOT echo messageKey or correlationId to end-user in raw form.
- Nguon decision/AC: D-04 (frozen reuse) + REPLAY-VS-RETRY.md retry semantics.
- Status: AGREED_DIRECTION.

### Case 6.2 - Query-specific PROPOSED code (NOT_FOUND) - MUST parse cleanly

Input synthetic:
Server response (NOT_FOUND from Case 3.1):
```json
{
  "schemaVersion": "1",
  "status": "FAILED",
  "correlationId": "<corr-...>",
  "errors": [
    {
      "code": "NOT_FOUND",
      "messageKey": "errors.talentContext.read.hidden",
      "retryClass": "NEVER"
    }
  ]
}
```

Expected consumer behavior:
- Parser sees NOT_FOUND - either as known (if consumer was updated) or as new-code.
- If known: same as Case 6.1.
- If unknown: consumer treats as "unknown" branch - logs, shows a generic "temporarily unable to view profile" message, MUST NOT crash, MUST NOT echo raw messageKey.
- The wire-level uniqueness of NOT_FOUND == FORBIDDEN 403 is REQUIRED to avoid existence oracle.
- Nguon decision/AC: r6 REC-004B (NOT_FOUND PROPOSED).
- Status: PROPOSED (HRP confirms code).

HRP confirmation point: confirm NOT_FOUND code; confirm parser can extend without consumer crash.

### Case 6.3 - Unknown code (forward compatibility) - MUST NOT crash

Input synthetic:
Server response with a code the consumer parser does NOT know yet:
```json
{
  "schemaVersion": "1",
  "status": "FAILED",
  "correlationId": "<corr-...>",
  "errors": [
    {
      "code": "BRAND_NEW_CODE_FROM_FUTURE_RELEASE",
      "messageKey": "errors.talentContext.future.something",
      "retryClass": "RETRY_SAFE"
    }
  ]
}
```

Expected consumer behavior:
- Parser does NOT crash on unknown code.
- Consumer MAY treat the response as a generic failure with a logged unknown-code warning.
- MAY honor retryClass if known (RETRY_SAFE -> schedule backoff; NEVER -> suppress).
- MUST NOT echo raw code or messageKey to end-user.
- The exhaustiveness of switch statements MUST be avoided (per CRM r6 REC-004B principle, even though that exact principle is now applied to the parser since the codes are additive).
- Nguon decision/AC: r6 REC-004B (forward-compat note).
- Status: PROPOSED. CRM T1-B drafts the policy; HRP can revise.

HRP confirmation point: confirm no requirement that consumers exhaustively handle codes (vs. a parser that requires exhaustiveness).

### Case 6.4 - INTERNAL_ERROR - MUST NOT leak exception/SQL/stack/PII

Input synthetic:
Server response (placeholder; shows the safety floor):
```json
{
  "schemaVersion": "1",
  "status": "FAILED",
  "correlationId": "<corr-...>",
  "errors": [
    {
      "code": "INTERNAL_ERROR",
      "messageKey": "errors.talentContext.read.internal",
      "retryClass": "RETRY_SAFE"
    }
  ]
}
```

NOTE: The synthetic response above is the safe shape. The NOT-safe variants listed below MUST NOT appear in the response and MUST NOT be inferred by the consumer.

Expected server behavior (i.e. what MUST NOT leak):
- No SQL: "SELECT * FROM LaborProfile WHERE id = '...'"
- No stack trace: "at Object.<anonymous> (/var/www/src/...)"
- No PII: "user john.doe@example.com attempted..."
- No exception class name: "TypeError: cannot read property..."
- No environment hints: "/var/lib/postgresql/data/..."

Expected consumer behavior:
- Parser sees INTERNAL_ERROR - maps to generic error UX.
- retryClass=NEVER (CORR-1: corrected from RETRY_SAFE per HRP r3 REC-004B-PROPOSAL; PROPOSED awaiting HRP confirmation).
- Consumer MUST NOT schedule a retry on INTERNAL_ERROR.
- MUST NOT echo any of the unsafe variants (even if they appear; consumer should treat the body as opaque beyond code/retryClass/correlationId).
- Nguon decision/AC: HRP r6 D-04 sec 2 ("INTERNAL_ERROR MUST NOT leak exception, SQL, stack trace or PII").
- Status: PROPOSED (HRP r3 proposes NEVER; awaiting bilateral confirmation).

### Case 6.5 - Multiple errors in errors[] - MUST parse all

Input synthetic:
Server response with two errors:
```json
{
  "schemaVersion": "1",
  "status": "FAILED",
  "correlationId": "<corr-...>",
  "errors": [
    {"code": "VALIDATION_ERROR", "messageKey": "errors.talentContext.field.bad", "retryClass": "NEVER"},
    {"code": "RATE_LIMITED", "messageKey": "errors.talentContext.rate.tooMany", "retryClass": "RETRY_SAFE"}
  ]
}
```

Expected consumer behavior:
- Parser iterates ALL entries.
- Consumer MAY prioritize: VALIDATION_ERROR first (user-fixable), then RATE_LIMITED.
- retryClass=RETRY_SAFE only if at least one entry says RETRY_SAFE AND the higher-priority entries do not say NEVER - this is a consumer policy decision.
- MUST NOT crash.
- Nguon decision/AC: r6 REC-004B (error envelope).
- Status: AGREED_DIRECTION.

HRP confirmation point: confirm errors[] size upper bound (bilateral).

### Case 6.6 - Missing errors[] - MUST be treated as INTERNAL_ERROR-like at consumer

Input synthetic:
Server response with empty errors[]:
```json
{
  "schemaVersion": "1",
  "status": "FAILED",
  "correlationId": "<corr-...>",
  "errors": []
}
```

Expected consumer behavior:
- Treat as INTERNAL_ERROR-like fallback.
- retryClass=RETRY_UNSAFE (cannot classify).
- MUST NOT crash.
- Log empty errors as anomaly.
- Nguon decision/AC: PROPOSED (CRM T1-B drafts; HRP can revise).
- Status: PROPOSED.

HRP confirmation point: confirm server MUST always include at least one error entry on FAILED status.

## What these cases do NOT cover

- i18n messageKey catalogue completion.
- Real correlationId format/contents.
- Server-side logging policy.

## Out-of-scope points

- Exact code set - PROPOSED (NOT_FOUND/INTERNAL_ERROR).
- Parser scope (shared vs query-specific) - bilateral.
