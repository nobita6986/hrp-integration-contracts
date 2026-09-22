# CONTRACT-02B - Implementation Readiness Brief

Status: DRAFT
Related: CONSUMER-READINESS.md
Date: 2026-09-22

---

## 1. Overview

Implementation readiness cho CONTRACT-02B (Talent Context Read voi delegation).

Gia dinh:
- H.09/Tier 3 bat buoc truoc real path
- Package version tu HRP (PROPOSED: 0.0.9-contract02b.1)
- Chua co Owner policy expansion

---

## 2. Files/Modules Du Kien Anh Huong

### 2.1 New Files (CRM Implementation)

| File | Purpose |
|------|---------|
| apps/integration-api/src/receiver/talent-context-client.ts | Query client cho HRP TalentContextRead |
| apps/integration-api/src/receiver/delegation-flow.ts | Delegation issuance/exchange/cancel/revoke |
| apps/integration-api/src/receiver/callback-handler.ts | Callback endpoint cho HRP approval |
| apps/integration-api/src/receiver/query-retry-helper.ts | Query-specific retry logic |
| apps/integration-api/src/receiver/redaction-validator.ts | Redaction output validation |
| packages/contracts/src/talent-context-read/v1.ts | Query request/response schemas |
| packages/contracts/src/errors/delegate-errors.ts | Delegation-specific error codes |

### 2.2 Modified Files (CRM Implementation)

| File | Change |
|------|--------|
| apps/integration-api/src/server.ts | Add delegation flow routes |
| apps/integration-api/src/receiver/handler.ts | Integrate query client |
| packages/contracts/src/errors.ts | Add query-specific codes |
| packages/contracts/src/index.ts | Export new schemas |
| packages/integration-store/prisma/schema.prisma | Add delegation table |

### 2.3 NOT Affected (T1-A Scope)

Theo T1-A handoff va AGENTS.md, cac file sau KHONG dung:
- apps/context-panel/** (T1-A clean-build)
- scripts/v7.9a/** (deployment files)
- packages/integration-store/repos/** (existing store, chi them bang moi)

---

## 3. Phan Tai Su Dung Duoc

### 3.1 From Frozen Baseline

| Component | Reuse |
|-----------|-------|
| ERROR_POLICIES | Retry class mapping (khong query codes) |
| errorMessagesVi | Locale message renderer (can them keys) |
| ContractErrorSchema | Error envelope validation |
| ActorClaim type | Actor shape trong query |

### 3.2 From Existing CRM

| Component | Reuse |
|-----------|-------|
| GatewayClient pattern | HTTP client infrastructure |
| lease.ts patterns | Fencing/idempotency patterns |
| Error renderer pattern | Locale message lookup |

### 3.3 NOT Reusable

| Component | Reason |
|----------|--------|
| retry.ts helpers | Command retry, khong query retry |
| MOCK_IDENTITY_MAP | Mock only, khong production auth |
| Integration store repos | Khong co delegation table |

---

## 4. Dependency That Con Thieu

### 4.1 From HRP (HRP-PENDING)

| Dependency | Status | Blocker |
|------------|--------|---------|
| @hrp-engagement/contracts@0.0.9-contract02b.1 | NOT AVAILABLE | HRP chua release |
| TalentContextReadQueryRequestSchema | NOT AVAILABLE | Can HRP cung cap |
| TalentContextReadQueryResultSchema | NOT AVAILABLE | Can HRP cung cap |
| Delegation token format | NOT AVAILABLE | Can HRP chot |
| EffectiveHRPUserId format | NOT AVAILABLE | Can HRP chot |
| Canonical organizationId | NOT AVAILABLE | ORG-1 OPEN |

### 4.2 From Owner/Operations

| Dependency | Status | Blocker |
|------------|--------|---------|
| AUDIT-1 | OPEN | Owner chua duyet |
| Audit metadata schema | NOT AVAILABLE | Can Owner duyet |

### 4.3 Internal Dependencies

| Dependency | Status | Blocker |
|------------|--------|---------|
| H.09/Tier 3 | OPEN | Chua implement |
| Session authority | NOT AVAILABLE | Can xay moi |
| Callback URL | NOT AVAILABLE | Can HRP registration |

---

## 5. Acceptance Cases Can Cho Task Implementation

### 5.1 Delegation Flow

AC-01: Tao delegation request voi B binding
AC-02: Browser handoff va HRP approval
AC-03: Exchange receipt lay delegationRef
AC-04: Cancel pending request
AC-05: Revoke delegation

### 5.2 Query Flow

AC-06: Read query voi delegation
AC-07: Retry query
AC-08: Seven-code error handling

### 5.3 Redaction

AC-09: Redacted name validation (22 vectors tu MSG-028)

### 5.4 Negative Cases

AC-10: Service-only khong doc LaborProfile
AC-11: Revoked delegation -> 403
AC-12: Wrong organization -> 403

---

## 6. Counterproposal: Browser/Session Integration

### 6.1 Browser-Side Challenges

MSG-028 yeu cau:
- Form POST tu browser den HRP
- HRP callback voi receipt trong form response
- CSRF token bound to HRP session

Thach thuc:
1. Cross-site form POST: Can HRP origin whitelisted
2. Receipt in form response: Browser khong parse HTML response de dang
3. CSRF token: Can server-side HRP session

### 6.2 Recommended Approach

Implement MSG-028 transport as-is:
- Browser form POST la standard OAuth pattern
- HRP da xu ly CSRF/session
- CRM chi can callback endpoint

---

## 7. Implementation Phases

Phase 1: Contract Types (1-2 days) - Import package tu HRP
Phase 2: Mock Delegation (2-3 days) - Mock delegation flow endpoints
Phase 3: Mock Query (2-3 days) - Mock query client + retry
Phase 4: Real Integration (BLOCKED) - H.09/Tier 3 must pass first

---

## 8. Open Questions

1. Package availability: Khi nao HRP release 0.0.9-contract02b.1?
2. ORG-1: Gia tri nao cho organizationId?
3. AUDIT-1: Retention policy la gi?
4. H.09/Tier 3: Status hien tai?

---

T1-B Status: DRAFT - PENDING T0 REVIEW