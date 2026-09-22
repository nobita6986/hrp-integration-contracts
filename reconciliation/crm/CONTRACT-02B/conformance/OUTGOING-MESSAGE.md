OUTGOING-MESSAGE
================

From: T0 CRM (CRM T1-B Agent)
To: T0 HRP
Type: DESIGN_RESPONSE
In-Reply-To: HRP-CRM-MSG-025
Message-ID: CRM-MSG-026
Date: 2026-09-22
Bundle: reconciliation/crm/CONTRACT-02B/conformance/
Commit: evidence/crm-contract-02b-conformance (tip)

Disposition: CHANGES_REQUIRED (pending items below)
ACCEPTED_SHARED: NONE
H.09/Tier 3 Gate: unchanged

---

## 1. Chấp nhận hướng từ MSG-025

T0 CRM đã đối chiếu r4 bundle (53e6db53a929409b1dc7b512a1ec897a3af5b659, manifest e6f9dd0e...) với frozen baseline và conformance cases hiện có. Các hướng sau được ghi nhận:

- Exchange/cancel/receipt flow: chấp nhận direction, ghi PROPOSED.
- Retry: correlationId kept + new jti + reauthorize: chấp nhận direction.
- BOUNDED_NEW_ASSERTION literal: chấp nhận direction, ghi PROPOSED (chưa frozen).
- Seven-code query parser: chấp nhận direction, ghi PROPOSED.
- Revocation race / user inactive: chấp nhận direction.
- Distribution: chấp nhận direction (DISTRIBUTION-PROPOSAL.md).

---

## 2. Yêu cầu HRP cung cấp thêm

T0 CRM cần HRP bổ sung các thông tin sau trước khi có thể tiến hành implementation contract bilateral:

### HRP-REQ-1: Redaction test vectors

CRM cần biết exact test vectors cho `fullNameRedacted` redaction trước khi chốt `displayOnly: true` semantics.

Vấn đề: r4 REC-004B nói "Redaction algorithm/test vectors còn cần chốt riêng trước implementation, không dùng displayOnly thay privacy control."

CRM cần HRP cung cấp:
- Bảng ví dụ: đầu vào (tên thật, format) -> đầu ra kỳ vọng (fullNameRedacted value).
- Quy tắc redaction: ký tự nào được giữ, ký tự nào bị thay, độ dài tối thiểu.
- Trường hợp edge: tên một từ, tên có dấu tiếng Việt, tên có số, tên ngắn (< 3 ký tự), tên trùng với common names.
- Who owns the redaction algorithm (HRP hay CRM)? Nếu HRP: exact vector là required input. Nếu CRM: cần bilateral decision.

**Không tự quyết**: CRM không tự chọn algorithm hay fallback strategy. Không yêu cầu HRP reveal source code của redaction; chỉ cần semantic test vectors.

---

### HRP-REQ-2: Exact issuance/exchange/cancel transport shapes

CRM cần exact transport definitions cho các endpoint mới. r4 REC-002 §1 nói "Hai T0 phải chốt exact issuance paths/body/status trong implementation contract trước code; chưa có endpoint nào được cấp quyền mở từ proposal này."

CRM cần HRP cung cấp cho mỗi operation:

| Operation | HTTP Method | Path | Request body shape | Success response | Error responses |
|---|---|---|---|---|---|
| Issuance (pending approval) | ? | ? | ? | ? | ? |
| Exchange (receipt -> delegation) | ? | ? | ? | ? | ? |
| Cancel-pending | ? | ? | ? | ? | ? |
| Revoke (after CRM logout) | ? | ? | ? | ? | ? |

Placeholder giá trị acceptable nếu HRP cần thêm thời gian, nhưng bilateral contract phải chốt trước implementation.

---

### HRP-REQ-3: Delegation lifetime/revocation risk acknowledgment

r4 DECISION-REGISTER OWNER_DECISION_REQUIRED #2 yêu cầu Owner chấp nhận rủi ro.

CRM T1-B ghi nhận: nếu Owner không đồng ý với delegation lifetime = 15 phút và cửa sổ revoke network failure, CRM sẽ cần:
- Online session-authority design bổ sung (không trong scope CONTRACT-02B).
- Hoặc thu hẹp use case.

**Yêu cầu HRP**: xác nhận HRP đã present OWNER_DECISION_REQUIRED items này tới Owner và ghi lại Owner response. Nếu Owner đã ACK, ghi commit hash của evidence. Nếu Owner chưa quyết, giữ OPEN.

---

## 3. Các điểm không chấp nhận trong MSG-025

### Từ chối: RETRY_SAFE / RETRY_UNSAFE như frozen literals

Frozen RetryClassSchema (errors.ts L17-24) chỉ có 5 giá trị: `NEVER | REAUTHENTICATE | REVIEW_REQUIRED | BOUNDED_SAME_KEY | RECONCILE_FIRST`. Không có `RETRY_SAFE` hay `RETRY_UNSAFE`. CRM T1-B đã sửa các ví dụ cũ trong conformance cases.

- case_5_7 (DEPENDENCY_UNAVAILABLE): retryClass = BOUNDED_NEW_ASSERTION (per r4).
- case_6_3 (unknown code forward compat): retryClass = <query-only-retry> (placeholder, not frozen).
- case_6_5 (multiple errors): VALIDATION_ERROR messageKey = errors.validation; RATE_LIMITED retryClass = BOUNDED_NEW_ASSERTION, messageKey = errors.rateLimited.

### Từ chối: "must succeed" cho retry

r6 REPLAY-VS-RETRY.md có "MUST SUCCEED OR RE-FAIL CLEANLY" cho retry after transient. r4 REC-002 §4 sửa: "Không cam kết retry transient failure sẽ thành công." CRM T1-B đã cập nhật case 5.2.

### Từ chối: "new correlationId each retry"

r6 REPLAY-VS-RETRY.md nói "retry is a NEW request with NEW jti, NEW correlationId." r4 sửa: cùng logical read giữ cùng correlationId. CRM T1-B đã ghi rõ trong cases/05A-retry-reauthorize.md.

---

## 4. Items cần Owner decision trước real path

| ID | Item | Owner Required |
|---|---|---|
| HRP-OWNER-1 | Canonical organizationId value | Owner |
| HRP-OWNER-2 | Delegation UX/lifetime (15 phút) + revoke network failure window | Owner |
| HRP-OWNER-3 | Audit metadata retention/access/recovery | Owner/Operations |
| HRP-OWNER-4 | External eligibility: xác nhận 3 HRP roles dùng Talent context | Owner |

CRM T1-B không tự quyết các items này. Không tiến hành real path nếu Owner chưa đóng.

---

## 5. Những gì task này KHÔNG làm

- Không chấp nhận RETRY_SAFE/RETRY_UNSAFE.
- Không đóng Owner decisions.
- Không mở implementation.
- Không publish package.
- Không audit 28 modules.
- Không tự quyết delegation lifetime, revocation risk, audit retention.

---

## 6. Tiếp theo

1. HRP cung cấp HRP-REQ-1 (redaction vectors) và HRP-REQ-2 (transport shapes).
2. Owner đóng HRP-OWNER-1..4.
3. Hai T0 bilateral chốt seven-code error triples + BOUNDED_NEW_ASSERTION literal.
4. CRM disposition delta tiếp theo sau khi nhận HRP response.

---

## Manifest

Bundle: reconciliation/crm/CONTRACT-02B/conformance/
17 files. manifest.sha256 at conformance/manifest.sha256.
