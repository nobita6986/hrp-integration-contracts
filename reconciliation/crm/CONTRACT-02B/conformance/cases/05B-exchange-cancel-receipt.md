# Category 5B: Issuance, Exchange, Cancel, Receipt

## Status

- Issuance flow (HRP approval + back-channel exchange): PROPOSED (r4 followup REC-002 §1).
- Receipt exchange atomic + cancel idempotent: PROPOSED (r4 followup REC-002 §1).
- This file covers NEW capability (HRP-owned) required for delegation trust bootstrap; chưa có trong HRP baseline.

## Source of Decision / AC

- r4 REC-002 §1 (Cấp delegation: HRP approval rồi back-channel exchange).
- r4 REC-002 §1 (Receipt binding và exchange timeout): atomic consume, single delegation per receipt, no replay.
- r4 REC-002 §1 (Cancel idempotent, không trả existence data).
- r4 DECISION-REGISTER (Exchange outcome not clear when timeout; Cancel-pending bound).

## Nguyên tắc

1. Receipt là opaque token dùng một lần, entropy ≥ 256 bit, lưu digest server-side.
2. Receipt trao đổi sai service/session/pending transaction bị từ chối.
3. Atomic consume: hai exchange cạnh tranh cùng receipt → tối đa một transaction cấp delegation; loser không nhận lại kết quả.
4. Sau exchange thành công nhưng response bị mất, CRM không retry receipt cũ (kể cả đổi jti); CRM gọi cancel-pending qua back-channel.
5. Cancel-pending serialize với exchange trên cùng pending record; cancel idempotent, không trả existence data.
6. Sau cancel ACK, bắt đầu approval mới hoàn toàn (pendingId/state/receipt mới); không tái dùng consent.
7. Không nhập REC-001-OPS suppression vào đây.

## Cases

### Case 5B.1 - Exchange success: receipt hợp lệ, binding match, fresh jti

Input synthetic:
- Pending record `(pendingId=P, serviceId=CRM, organizationId=org-x, scope=talent-context:read:identitySummary, callbackId=https://crm/cb, crmSubject=sub-j, crmSessionHandle=sess-1, approvedAt=t0, expiresAt=t0+60s)`.
- Approval gắn `(effectiveHrpUserId=u-hrp, hrpSessionReference=hrp-sess-1)`.
- Receipt digest trao qua callback HTTPS POST tới `callbackId`.
- Exchange request: assertion mới (RS256, TTL 60s, skew 30s), method=`POST`, path=`/api/integrations/crm/exchange` (placeholder), body gồm `pendingId` và `receipt` (opaque), audience=`exchange`, jti=J2.

Expected behavior:
- HRP verify assertion binding (issuer/audience/time/method/path/raw-body hash).
- HRP atomic consume receipt digest, verify chưa consumed.
- HRP verify approval/session còn hiệu lực, user active, role đủ quyền.
- HRP tạo delegation với immutable tuple `(pendingId, serviceId, effectiveHrpUserId, organizationId, grantedScopes, exchangeAudience, queryAudience, crmSubject, crmSessionHandle, hrpSessionReference, callbackId, approvedAt, expiresAt)`.
- HTTP 200 với opaque `delegationRef` + `effectiveHrpUserId` + `expiresAt`.
- Atomic transaction đảm bảo duy nhất một delegation từ chính immutable tuple.
- CRM giữ delegationRef server-side; không đặt trong URL browser/log.

Nguon decision/AC:
- r4 REC-002 §1.
- r4 REC-002 §5 negative AC (Receipt sai effective user/org/scope/audience/hết hạn → Exchange deny).

Status: PROPOSED.

HRP confirmation point: exact exchange path/body/status code cần bilateral pin.

### Case 5B.2 - Exchange timeout sau commit: response mất, CRM không retry receipt cũ

Input synthetic:
- Exchange đã commit (atomic transaction thành công) nhưng response bị mất do network timeout.
- CRM giữ receipt (đã consume server-side) và assertion cũ.

Expected behavior:
- CRM KHÔNG retry exchange cùng receipt (kể cả đổi jti); retry sẽ bị từ chối generic (đã consume).
- CRM KHÔNG assume issuance thất bại; delegation có thể đã được cấp.
- CRM gọi cancel-pending authenticated với assertion mới, jti mới, binding tới `(pendingId, serviceId, crmSubject, crmSessionHandle, pendingId)`.
- HRP serialize cancel với exchange (đã commit) trên cùng pending record; đánh dấu pending canceled, revoke delegation đã cấp nếu có.
- HTTP 200 cancel ACK (cancel idempotent).
- Sau cancel ACK: CRM bắt đầu approval mới hoàn toàn (pendingId mới, state mới, receipt mới); KHÔNG tái dùng consent của giao dịch cũ.

Nguon decision/AC:
- r4 REC-002 §1 (Network timeout).
- r4 REC-002 §5 negative AC (Exchange đã commit nhưng response mất → cancel cạnh tranh exchange).

Status: PROPOSED.

### Case 5B.3 - Cancel idempotent: hai cancel cùng pendingId

Input synthetic:
- Pending record `(P, ...)` đã bị cancel trước đó (cancel ACK trả 200).
- CRM retry cancel do không nhận được ACK lần trước (idempotent retry).

Expected behavior:
- HTTP 200 ACK generic, KHÔNG trả lại secret/reference của lần trước.
- KHÔNG trả existence data (receipt còn consume, delegation đã revoke hay chưa).
- Pending state stays `canceled`.

Nguon decision/AC:
- r4 REC-002 §1 (Cancel idempotent).
- r4 REC-002 §5 negative AC (Cancel idempotent).

Status: PROPOSED.

### Case 5B.4 - Receipt hết hạn trước exchange

Input synthetic:
- Receipt được phát tại t0, expiresAt = t0+60s.
- Exchange đến HRP tại t1 > t0+60s.

Expected behavior:
- HTTP 401 (placeholder status) exchange denial.
- Code: AUTHENTICATION_REQUIRED (frozen triple); `messageKey: errors.authenticationRequired`; `retryClass: REAUTHENTICATE`.
- HRP KHÔNG tạo active delegation; receipt digest vẫn recorded nhưng không consumed.
- CRM phải bắt đầu approval mới; không có cơ chế kéo dài receipt.

Nguon decision/AC:
- r4 REC-002 §1 (Receipt sống tối đa 60 giây).
- r4 REC-002 §5 negative AC (Receipt hết hạn → Exchange deny).

Status: PROPOSED.

### Case 5B.5 - Receipt bị reuse sau consume (cùng receipt digest, jti mới)

Input synthetic:
- Receipt R đã consumed thành công qua exchange J1.
- Attacker (hoặc CRM do nhầm) gọi lại exchange với receipt R, assertion mới, jti J2.

Expected behavior:
- HTTP 401 (placeholder) exchange denial.
- Code: AUTHENTICATION_REQUIRED; `retryClass: REAUTHENTICATE`.
- HRP KHÔNG trả lại secret/reference của delegation cũ (no replay exchange result).
- KHÔNG tạo delegation mới.

Nguon decision/AC:
- r4 REC-002 §1 (no replay exchange result).
- r4 REC-002 §5 negative AC (Hai exchange cùng receipt, assertion khác nhau → tối đa một transaction cấp delegation; loser không nhận lại result).

Status: PROPOSED.

### Case 5B.6 - User inactive/revoke giữa approval và exchange

Input synthetic:
- Approval record lúc t0: user U active với role `HR_MANAGER`.
- Trước exchange: HRP user U disable HOẶC role giảm xuống `WORKER` HOẶC HRP logout tại t1.
- Exchange đến lúc t2 > t1.

Expected behavior:
- HTTP 403 FORBIDDEN; `code: FORBIDDEN`, `messageKey: errors.forbidden`, `retryClass: NEVER`.
- HRP KHÔNG lấy approval cũ thay user-state check hiện tại.
- Receipt digest vẫn chưa consumed; CRM bắt đầu approval mới sau khi đối chiếu với Owner.

Nguon decision/AC:
- r4 REC-002 §1 (HRP lấy effective HRP user từ session đã xác thực; user inactive → deny).
- r4 REC-002 §5 negative AC (User inactive/revoke sau approval nhưng trước exchange → Exchange deny).

Status: PROPOSED.

## Những gì case này KHÔNG cover

- Exact issuance/exchange/cancel transport paths/status codes (HRP-PENDING, xem HRP-REQUEST).
- Exact approval flow UX (Owner decision, không tự quyết).
- Redaction test vectors (HRP-PENDING, xem HRP-REQUEST).
- Exact retention/audit decision (Owner decision).

## Out-of-scope points

- HRP-OWNER-1 (organization canonical value) - Owner required.
- HRP-OWNER-2 (delegation UX/lifetime/revocation risk) - Owner required.
- HRP-OWNER-3 (operational data handling) - Owner required.
