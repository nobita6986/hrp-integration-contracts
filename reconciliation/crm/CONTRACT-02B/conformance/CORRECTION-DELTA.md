# CORRECTION-DELTA - Retry Class and MessageKey Bindings

## Metadata

- **Bundle**: CONTRACT-02B conformance cases supplement
- **Branch**: evidence/crm-contract-02b-conformance
- **Derived from**: r6 fixtures + HRP CONTRACT-02B followup r3 commit 8a28678 (REC-004B proposal)
- **Status**: DRAFT - READY FOR T0 REVIEW (no frozen contract modified)

## Governing Rules

### Frozen baseline rules (CRM baseline 72643356a0d1355f9dccc3921b47c990ea9c31c1)

Source: `packages/contracts/src/errors.ts`

**Frozen RetryClassSchema** (L17-24):
```typescript
z.enum(['NEVER', 'REAUTHENTICATE', 'REVIEW_REQUIRED', 'BOUNDED_SAME_KEY', 'RECONCILE_FIRST'])
```

**Frozen ERROR_POLICIES** (L31-62):
| Code | messageKey (REQUIRED) | retryClass (REQUIRED) |
|---|---|---|
| VALIDATION_ERROR | errors.validation | NEVER |
| AUTHENTICATION_REQUIRED | errors.authenticationRequired | REAUTHENTICATE |
| FORBIDDEN | errors.forbidden | NEVER |
| UNRESOLVED_IDENTITY | errors.unresolvedIdentity | REVIEW_REQUIRED |
| POLICY_REJECTION | errors.policyRejection | REVIEW_REQUIRED |
| VERSION_CONFLICT | errors.versionConflict | REFRESH_AND_REVIEW |
| IDEMPOTENCY_CONFLICT | errors.idempotencyConflict | NEVER |
| DEPENDENCY_UNAVAILABLE | errors.dependencyUnavailable | BOUNDED_SAME_KEY |
| RATE_LIMITED | errors.rateLimited | BOUNDED_SAME_KEY |
| UNKNOWN_COMMAND_OUTCOME | errors.unknownCommandOutcome | RECONCILE_FIRST |

**Frozen ErrorCodeSchema** (L4-13):
```typescript
z.enum(['VALIDATION_ERROR', 'AUTHENTICATION_REQUIRED', 'FORBIDDEN',
        'DEPENDENCY_UNAVAILABLE', 'RATE_LIMITED', 'UNKNOWN_COMMAND_OUTCOME'])
```
NOTE: NOT_FOUND and INTERNAL_ERROR are NOT in the frozen enum. They are PROPOSED additive codes.

**ContractErrorSchema validation** (L101): `messageKey` MUST exactly match `ERROR_POLICIES[code].messageKey`.

### HRP followup r3 (commit 8a28678) retry semantics

Source: reconciliation/hrp/CONTRACT-02B-followup/r3/REC-004B-PROPOSAL.md

**QueryAdditionalError** (PROPOSED, not frozen):
```typescript
type QueryAdditionalError =
  | { code: 'NOT_FOUND'; messageKey: 'errors.talentContext.notFound'; retryClass: 'NEVER' }
  | { code: 'INTERNAL_ERROR'; messageKey: 'errors.talentContext.internal'; retryClass: 'NEVER' }
```

Key correction from r6 fixtures: **INTERNAL_ERROR retryClass is NEVER**, not RETRY_SAFE.

---

## Corrections Required

### CORR-1: INTERNAL_ERROR retryClass

**File**: `fixtures/errors.json`
**Case**: `case_6_4_internal_error_no_leak` (also `case_6_6_empty_errors_array`)

**Current (from r6 fixtures)**:
```json
"retryClass": "RETRY_SAFE"
```

**Corrected per HRP followup r3 (PROPOSED)**:
```json
"retryClass": "NEVER"
```

**Source evidence**: reconciliation/hrp/CONTRACT-02B-followup/r3/REC-004B-PROPOSAL.md (L119)
**AGREED_DIRECTION or PROPOSED**: PROPOSED (HRP r3, awaiting bilateral confirmation)
**HRP confirmation point**: Confirm INTERNAL_ERROR retryClass = NEVER.
**Affected case files**: `cases/06-error-parsing.md` Case 6.4 (text says "MAY schedule backoff retry"; correct to "MUST NOT retry").

---

### CORR-2: Frozen codes messageKey must use frozen keys

**Principle**: ContractErrorSchema enforces exact `messageKey` match. Custom keys cause validation failure.

**Corrections**:

#### CORR-2a: AUTHENTICATION_REQUIRED codes

| Case | Current messageKey | Correct per frozen baseline |
|---|---|---|
| `case_2_1_service_only_no_actor` | errors.talentContext.auth.noActor | errors.authenticationRequired |
| `case_2_2_service_only_stub_actor_no_delegation` | errors.talentContext.auth.noDelegation | errors.authenticationRequired |
| `case_3_3_auth_failure_no_id_echo` | errors.talentContext.auth.missingKid | errors.authenticationRequired |
| `case_5_1_replay_same_jti` | errors.talentContext.auth.duplicateJti | errors.authenticationRequired |

**Source evidence**: errors.ts L32, L34
**Frozen messageKey**: `errors.authenticationRequired`
**PROPOSED**: These custom keys are illustrative only; for frozen ContractErrorSchema compliance, MUST use `errors.authenticationRequired`.

#### CORR-2b: FORBIDDEN codes

| Case | Current messageKey | Correct per frozen baseline |
|---|---|---|
| `case_2_3a_user_inactive` | errors.talentContext.perm.userInactive | errors.forbidden |
| `case_2_3b_delegation_revoked` | errors.talentContext.perm.delegationRevoked | errors.forbidden |
| `case_2_4_pinned_org_mismatch` | errors.talentContext.perm.orgMismatch | errors.forbidden |
| `case_5_4_retry_after_403` | errors.talentContext.perm.insufficient | errors.forbidden |

**Source evidence**: errors.ts L37
**Frozen messageKey**: `errors.forbidden`
**PROPOSED**: Custom keys are illustrative; frozen ContractErrorSchema compliance requires `errors.forbidden`.

#### CORR-2c: VALIDATION_ERROR codes

| Case | Current messageKey | Correct per frozen baseline |
|---|---|---|
| `case_3_4_validation_malformed_uuid` | errors.talentContext.field.typeMismatch.laborProfileId | errors.validation |
| `case_4_4_unknown_field` | errors.talentContext.fieldAllowlist.unknown | errors.validation |
| `case_5_5_retry_after_422_identical_body` | errors.talentContext.field.typeMismatch.laborProfileId | errors.validation |

**Source evidence**: errors.ts L32
**Frozen messageKey**: `errors.validation`
**PROPOSED**: Custom keys illustrative; frozen compliance requires `errors.validation`.

---

### CORR-3: DEPENDENCY_UNAVAILABLE messageKey

**Case**: `case_5_7_replay_store_unavailable`

**Current**: `errors.talentContext.replayStore.down`
**Correct per frozen baseline**: `errors.dependencyUnavailable`

**Source evidence**: errors.ts L54-56
**Frozen messageKey**: `errors.dependencyUnavailable`
**PROPOSED**: Custom key illustrative; frozen compliance requires `errors.dependencyUnavailable`.

---

### CORR-4: UNKNOWN_COMMAND_OUTCOME for empty errors fallback

**Case**: `case_6_6_empty_errors_array`

**Current**: HTTP 500, code: INTERNAL_ERROR, messageKey: errors.talentContext.read.emptyErrors, retryClass: RETRY_UNSAFE

**Corrected per HRP followup r3**:
```json
{
  "httpStatus": 500,
  "code": "UNKNOWN_COMMAND_OUTCOME",
  "messageKey": "errors.unknownCommandOutcome",
  "retryClass": "RECONCILE_FIRST"
}
```

**Source evidence**: errors.ts L59-61 (UNKNOWN_COMMAND_OUTCOME), reconciliation/hrp/CONTRACT-02B-followup/r3/REC-004B-PROPOSAL.md
**Note**: `case_6_6_empty_errors_array` was marked PROPOSED (no frozen definition). Using UNKNOWN_COMMAND_OUTCOME aligns with frozen baseline semantics for "cannot classify" errors.
**Status**: PROPOSED (HRP may revise).

---

## HRP r3 Structural Corrections (PROPOSED)

HRP CONTRACT-02B followup r3 (commit 8a28678) introduced structural corrections that differ from r6 fixtures:

### STRUCT-1: Request envelope

**Difference from r6 fixtures**: Followup r3 specifies:
```typescript
type TalentContextReadQueryRequestSchema = {
  schemaVersion: '1';
  correlationId: string;   // NEW: required in request
  organizationId: string; // NEW: required in request
  actor: {
    kind: 'DELEGATED_USER';
    serviceId: string;
    userId: string;
    delegationRef: string;
  };
  target: TalentContextReadTarget;
  fieldAllowlist: TalentContextReadField[]; // enum type
};
```

**Current in fixtures**: correlationId and organizationId absent from request; actor is simpler shape.

**Status**: PROPOSED. HRP r3 recommends these additions. CRM T1-B should verify and confirm.

### STRUCT-2: actor shape

**Current in fixtures**: `actor: { kind: 'DELEGATED_USER'; userId: '...' }`
**HRP r3 recommended**: `actor: { kind: 'DELEGATED_USER'; serviceId: '...'; userId: '...'; delegationRef: '...' }`

**Status**: PROPOSED. HRP r3 adds serviceId and delegationRef as untrusted claims that must match signed assertion.

### STRUCT-3: fieldAllowlist type

**Current in fixtures**: `fieldAllowlist: string[]`
**HRP r3 recommended**: `fieldAllowlist: TalentContextReadField[]` (enum)

```typescript
type TalentContextReadField =
  | 'identitySummary'
  | 'placementCase'
  | 'availability'
  | 'currentRelationship'
  | 'nextAction'
  | 'recentInteractions'
  | 'contactability'
  | 'suppressionSummary';
```

**Status**: PROPOSED. Unknown string is rejected 422 per existing AC #12.

---

## Cases Already Correct

- `case_3_1_hidden_object` / `case_3_2_nonexistent_object`: NOT_FOUND code + NEVER = CORRECT (matches HRP r3).
- `case_5_2_retry_after_5xx` / `case_5_3_retry_after_429`: Success body same shape = CORRECT.
- `case_5_6_retry_after_404`: NOT_FOUND NEVER = CORRECT.
- `case_6_1_known_frozen_code`: VALIDATION_ERROR NEVER = CORRECT.
- `case_6_3_unknown_code_forward_compat`: Custom code + RETRY_SAFE = acceptable (not frozen).
- `case_6_5_multiple_errors`: VALIDATION_ERROR NEVER + RATE_LIMITED BOUNDED_SAME_KEY = CORRECT (respects frozen per-code retryClass).

---

## Summary of Changes

| ID | File | Severity | Description |
|---|---|---|---|
| CORR-1 | fixtures/errors.json | MUST | INTERNAL_ERROR retryClass NEVER (was RETRY_SAFE) |
| CORR-2a | fixtures/errors.json | MUST | AUTHENTICATION_REQUIRED: use frozen errors.authenticationRequired |
| CORR-2b | fixtures/errors.json | MUST | FORBIDDEN: use frozen errors.forbidden |
| CORR-2c | fixtures/errors.json | MUST | VALIDATION_ERROR: use frozen errors.validation |
| CORR-3 | fixtures/errors.json | MUST | DEPENDENCY_UNAVAILABLE: use frozen errors.dependencyUnavailable |
| CORR-4 | fixtures/errors.json | PROPOSED | Empty errors fallback: use UNKNOWN_COMMAND_OUTCOME / errors.unknownCommandOutcome (EXPECT_REJECT in 6.6: server MUST NOT return empty errors[]) |
| STRUCT-1 | fixtures/requests.json | PROPOSED | Add correlationId + organizationId to request envelope |
| STRUCT-2 | fixtures/requests.json | PROPOSED | Expand actor shape with serviceId + delegationRef |
| STRUCT-3 | fixtures/requests.json | PROPOSED | fieldAllowlist enum type (TalentContextReadField) |
| TEXT | cases/06-error-parsing.md | MUST | Remove "MAY schedule backoff retry" for INTERNAL_ERROR |

## Delta-r5 (T1-B correction, post MSG-026)

| ID | File | Severity | Description |
|---|---|---|---|
| MSGS-1 | OUTGOING-MESSAGE.md | MUST | Sync Owner decisions: 3 roles APPROVED (with conditions), delegation 15 min APPROVED, revoke network-failure window APPROVED. ORG-1 + AUDIT-1 remain OPEN. Source: MSG-026 c0ede9aeaba3ba26d620ae4e535d9e6a77cf9343. |
| MSGS-2 | CONFORMANCE-INDEX.md | MUST | Add "Owner Disposition (MSG-026)" section recording 3-role, lifetime, revoke approvals and 2 OPEN items. |
| MSGS-3 | cases/06-error-parsing.md | MUST | Case 6.6 (empty errors[]): mark EXPECT_REJECT. Server MUST NOT return empty errors[]. RECONCILE_FIRST belongs to frozen UNKNOWN_COMMAND_OUTCOME; does NOT appear in valid query responses. |
| MSGS-4 | fixtures/errors.json | MUST | Case 6.6: update note to "EXPECT_REJECT: Server MUST NOT return empty errors[]. This case shows consumer fallback behavior when server misbehaves." |
| MSGS-5 | DISTRIBUTION-PROPOSAL.md | MUST | Replace "no frozen consumer impact" with "intended isolation; consumer compatibility NOT_EXECUTED". Add "Cach Hai Repo Cai Artifact" section: bilateral acceptance, build, checksum, CRM pin, lockfile detection, breaking-change handling. Clarify JSON_OK only proves JSON parseability, not schema conformance. |
| MSGS-6 | OUTGOING-MESSAGE.md | MUST | Replace Owner-OPEN list with already-approved items, marking ORG-1 + AUDIT-1 as still OPEN. Distribution section references proposed mechanism (no claim of isolation impact). Metadata section: 19 files = 18 data + 1 manifest; pull link is "create PR" not "open PR". |
| MSGS-7 | manifest.sha256 | MUST | Regenerated without self-referential entry. Records 18 data file SHA-256. Manifest itself NOT hashed into manifest. |
| MSGS-8 | README.md | MUST | Add HRP Owner disposition source line. Files in supplement updated to 18 data + 1 manifest = 19. Manifest encoding statement updated. |

### Frozen binding rules reaffirmed (delta-r5)

- VALIDATION_ERROR / FORBIDDEN / NOT_FOUND / INTERNAL_ERROR -> retryClass = NEVER.
- AUTHENTICATION_REQUIRED -> REAUTHENTICATE.
- RATE_LIMITED / DEPENDENCY_UNAVAILABLE -> BOUNDED_NEW_ASSERTION.
- RETRY_SAFE / RETRY_UNSAFE are NOT frozen literals; do not reintroduce.
- RECONCILE_FIRST is from frozen UNKNOWN_COMMAND_OUTCOME only; do NOT place in valid query response fixture.
