OUTGOING-MESSAGE
================

From: T0 CRM (CRM T1-B Agent)
To: T0 HRP
Type: DESIGN_RESPONSE
In-Reply-To: HRP-CRM-MSG-025
Message-ID: CRM-MSG-026
Date: 2026-09-22
Bundle: reconciliation/crm/CONTRACT-02B/conformance/
Commit: e63bb483b4c7616b0bd0034b481287fd70cb177f
Branch: evidence/crm-contract-02b-conformance

Disposition: CHANGES_REQUIRED (pending items below)
ACCEPTED_SHARED: NONE
H.09/Tier 3 Gate: unchanged

---

## 1. Chap nhan huong tu MSG-025

T0 CRM da doi chieu r4 bundle (53e6db53a929409b1dc7b512a1ec897a3af5b659, manifest e6f9dd0e...) voi frozen baseline va conformance cases hien co. Cac huong sau duoc ghi nhan:

- Exchange/cancel/receipt flow: chap nhan direction, ghi PROPOSED.
- Retry: correlationId kept + new jti + reauthorize: chap nhan direction.
- BOUNDED_NEW_ASSERTION literal: chap nhan direction, ghi PROPOSED (chua frozen).
- Seven-code query parser: chap nhan direction, ghi PROPOSED.
- Revocation race / user inactive: chap nhan direction.
- Distribution: chap nhan direction (DISTRIBUTION-PROPOSAL.md).

---

## 2. Yeu cau HRP cung cap them

T0 CRM can HRP bo sung cac thong tin sau truoc khi co the tien hanh implementation contract bilateral:

### HRP-REQ-1: Redaction test vectors

CRM can biet exact test vectors cho fullNameRedacted truoc khi chot displayOnly: true semantics.

Vande: r4 REC-004B noi "Redaction algorithm/test vectors con can chot rieng truoc implementation, khong dung displayOnly thay privacy control."

CRM can HRP cung cap:
- Bang vi du: dau vao (ten that, format) dau ra ky vong (fullNameRedacted value).
- Quy tac redaction: ky tu nao duoc giu, ky tu nao bi thay, do dai toi thieu.
- Truong hop edge: ten mot tu, ten co dau tieng Viet, ten co so, ten ngan, ten trung voi common names.
- Who owns the redaction algorithm (HRP hay CRM)? Neu HRP: exact vector la required input. Neu CRM: can bilateral decision.

Khong tu quyet: CRM khong tu chon algorithm hay fallback strategy. Khong yeu cau HRP reveal source code cua redaction chi can semantic test vectors.

---

### HRP-REQ-2: Exact issuance/exchange/cancel transport shapes

CRM can exact transport definitions cho cac endpoint moi. r4 REC-002 S1 noi "Hai T0 phai chot exact issuance paths/body/status trong implementation contract truoc code chua co endpoint nao duoc cap quyen mo tu proposal nay."

CRM can HRP cung cap cho moi operation:

| Operation | HTTP Method | Path | Request body | Success response | Error responses |
|---|---|---|---|---|---|
| Issuance (pending approval) | ? | ? | ? | ? | ? |
| Exchange (receipt -> delegation) | ? | ? | ? | ? | ? |
| Cancel-pending | ? | ? | ? | ? | ? |
| Revoke (after CRM logout) | ? | ? | ? | ? | ? |

Placeholder gia tri acceptable neu HRP can them thoi gian, nhung bilateral contract phai chot truoc implementation.

---

## 3. Cac diem khong chap nhan trong MSG-025

### Tu choi: RETRY_SAFE / RETRY_UNSAFE nhu frozen literals

Frozen RetryClassSchema (errors.ts L17-24) chi co 5 gia tri: NEVER | REAUTHENTICATE | REVIEW_REQUIRED | BOUNDED_SAME_KEY | RECONCILE_FIRST. Khong co RETRY_SAFE hay RETRY_UNSAFE. CRM T1-B da sua cac vi du cu trong conformance cases.

- case_5_7 (DEPENDENCY_UNAVAILABLE): retryClass = BOUNDED_NEW_ASSERTION (per r4).
- case_6_3 (unknown code forward compat): retryClass = <query-only-retry> (placeholder, not frozen).
- case_6_5 (multiple errors): VALIDATION_ERROR messageKey = errors.validation; RATE_LIMITED retryClass = BOUNDED_NEW_ASSERTION, messageKey = errors.rateLimited.

### Tu choi: "must succeed" cho retry

r6 REPLAY-VS-RETRY.md co "MUST SUCCEED OR RE-FAIL CLEANLY" cho retry after transient. r4 REC-002 S4 sua: "Khong cam ket retry transient failure se thanh cong." CRM T1-B da cap nhat case 5.2.

### Tu choi: "new correlationId each retry"

r6 REPLAY-VS-RETRY.md noi "retry is a NEW request with NEW jti, NEW correlationId." r4 sua: cung logical read giu cung correlationId. CRM T1-B da ghi ro trong cases/05A-retry-reauthorize.md.

---

## 4. Owner decisions da duyet (MSG-026)

Nguon: MSG-026 OWNER-DECISION.md, commit c0ede9aeaba3ba26d620ae4e535d9e6a77cf9343
Manifest SHA-256: f2a7a4cb5ee7c3c7483f73298e2c703170a270bfacc72104473aa51a66e00612 (T0 verified 1/1)

### Da duyet - 3 roles (OWNER_APPROVED)

Owner cho phep ADMIN, HR_MANAGER, HR_STAFF su dung Talent context tu CRM, voi dieu kien:
- HRP kiem tra effective user dang active, role va quyen tung ho so o moi query.
- Khong mo rong quyen so voi HRP. Service-only khong duoc doc LaborProfile.
- Projection duy nhat la identitySummary.fullNameRedacted, voi displayOnly=true; khong phone, CCCD hoac DTO noi bo.
- Slice dau chi ho tro mot organizationId do HRP cung cap va bind server-side.

### Da duyet - Delegation 15 phut (OWNER_APPROVED cho pilot)

- Nguoi dung dang nhap va chu dong approve tai HRP.
- Delegation toi da 15 phut, khong vuot han han session lien quan, khong tu gia han.
- Khi exchange timeout khong ro ket qua: phai cancel va nhan ACK, hoac xac nhan expiry tu HRP, truoc khi mo approval moi.

### Da duyet - Cua so revoke (OWNER_APPROVED dung pham vi)

Owner chap nhan gioi han rui ro revoke cho pilot nay:
- CRM logout/account switch phai chan su dung ngay tai CRM.
- Neu revoke chua toi HRP do loi mang, delegation co the con hieu luc tai HRP den expiry, toi da thoi gian con lai cua han 15 phut.
- Khi HRP revoke da commit, query di qua authorization checkpoint sau do phai bi tu choi.
- Khong tuyen bo thu hoi tuyet doi xuyen he thong.

### Van OPEN - Khong yeu cau Owner dong lai

| ID | Item | Trang thai |
|---|---|---|
| ORG-1 | Canonical organizationId cu the | OPEN - HRP cung cap |
| AUDIT-1 | Audit metadata access/retention/recovery | OPEN - Owner/Operations |

---

## 5. Distribution - Hieu chinh claim

DISTRIBUTION-PROPOSAL.md duoc hieu chinh:

CHINH SUA 1: "no frozen consumer impact" thanh "intended isolation; consumer compatibility NOT_EXECUTED"

CHINH SUA 2: Bo sung section:

"CACH HAI REPO CAI ARTIFACT

Proposed distribution mechanism:

1. Bilateral acceptance: Khi REC-004b duoc T0 bilateral accept, mot commit moi duoc tao trong neutral repo chua source file: packages/contracts/src/talent-context-read/v1.ts
2. Build: Package maintainer chay tsc de tao dist/talent-context-read/v1.js va dist/talent-context-read/v1.d.ts
3. Checksum: SHA-256 cua dist artifact duoc tinh va ghi vao provenance document
4. CRM pin: CRM package.json ghi dependency: @hrp-engagement/contracts@0.0.9-contract02b.1 voi integrity hash tu buoc 3
5. Detect change: Thay doi schema tao commit moi va artifact hash moi; CRM detect qua package-lock diff

package.json changes (chi them, khong sua root export):
  "dependencies": {
    "@hrp-engagement/contracts": "0.0.9-contract02b.1"
  },
  "@hrp-engagement/contracts": {
    "0.0.9-contract02b.1": {
      "integrity": "sha256-<base64-checksum>",
      "resolved": "https://internal-registry.example.com/@hrp-engagement/contracts/-hrp-engagement/contracts-0.0.9-contract02b.1.tgz",
      "fileHashes": {
        "dist/talent-context-read/v1.js": "sha256:<hex>"
      }
    }
  }

JSON_OK: Chi xac nhan JSON parse thanh cong; khong dam bao schema conformance."

---

## 6. Metadata ban giao

| Thuoc tinh | Gia tri |
|---|---|
| Bundle path | reconciliation/crm/CONTRACT-02B/conformance/ |
| Commit SHA | e63bb483b4c7616b0bd0034b481287fd70cb177f |
| Bundle files | 19 (18 data files + 1 manifest.sha256) |
| Manifest SHA-256 | <compute from conformance/manifest.sha256 bytes> |
| MSG-026 commit | c0ede9aeaba3ba26d620ae4e535d9e6a77cf9343 |
| MSG-026 manifest SHA | f2a7a4cb5ee7c3c7483f73298e2c703170a270bfacc72104473aa51a66e00612 |
| Pull link | https://github.com/nobita6986/hrp-integration-contracts/pull/new/evidence/crm-contract-02b-conformance |

Luu y: Pull link tren la link tao PR (tao PR moi), khong phai PR da duoc mo.

---

## 7. Nhung gi task nay KHONG lam

- Khong chap nhan RETRY_SAFE / RETRY_UNSAFE.
- Khong dong Owner decisions da duyet (khong yeu cau Owner dong lai).
- Khong mo implementation.
- Khong publish package.
- Khong audit 28 modules.
- Khong tu quyet delegation lifetime, revocation risk, audit retention.
- Khong tu gui HRP (dang trong trang thai T0 CRM da ghi nhan, chua tuyen bo).

---

## 8. Tiep theo

1. HRP cung cap HRP-REQ-1 (redaction vectors) va HRP-REQ-2 (transport shapes).
2. HRP cung cap canonical organizationId (ORG-1).
3. Owner/Operations quyet dinh AUDIT-1.
4. Hai T0 bilateral chot seven-code error triples + BOUNDED_NEW_ASSERTION literal.
5. CRM disposition tiep theo sau khi nhan HRP response.