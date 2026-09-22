# Decision register — r4

Mọi dòng là PROPOSED. Không có ACCEPTED_SHARED, không có quyền mở implementation. Hai T0 chốt wire/technical decisions; Owner chỉ được hỏi các lựa chọn sản phẩm/quyền hạn/vận hành thật sự, không phải toàn bộ chi tiết kỹ thuật.

## Recommendations để hai T0 disposition

| Gap | Recommendation / rationale | Affected / implementation owner | Remaining decision |
|---|---|---|---|
| Delegation không có trust bootstrap | HRP login + explicit approval, one-time receipt và CRM authenticated exchange; không map email/phone | HRP issuance/store/authorization; CRM session/UX/exchange | CRM đánh giá UX/callback/session integration; hai T0 chốt transport |
| Exchange outcome không rõ khi timeout | Atomic receipt consume + delegation create; không replay exchange result; bound cancel-pending rồi approval mới | HRP exchange/cancel lifecycle; CRM reconnect UX | Hai T0 chốt transport/response riêng trước implementation; Owner đánh giá UX approve lại |
| Service/request binding | CRM signed RS256 assertion, pinned trust, TTL 60s/skew30s, raw-body hash, single org, record delegation | HRP verifier/replay authority; CRM signer | Bilateral profile + key provisioning/runbook; không hỏi Owner chọn alg |
| Revoke/retry mâu thuẫn | Đồng bộ HRP revoke, fresh user permissions, jti mới mỗi attempt, correlationId giữ logical intent | HRP lifecycle/replay; CRM logout hook/retry | Bilateral confirm; window CRM revoke delivery cần Owner bên dưới |
| Role policy | Route allowlist ADMIN/HR_MANAGER/HR_STAFF + effective-user RLS, không service-only | HRP role/object gate; CRM eligibility UX | T0 HRP xác nhận source parity; Owner approve phạm vi external use |
| Error shape/parser | Dedicated seven-code query schema, exact triples, new query-only BOUNDED_NEW_ASSERTION; old schemas immutable | Shared neutral schema, HRP producer, CRM B.03/parser | Hai T0 chốt literal, `/talent-context-read/v1`, candidate `0.0.9-contract02b.1` và consumer audit; version chưa reserve/publish |
| Redacted name chưa thành thuật toán | identitySummary chỉ fullNameRedacted, fallback omit nếu unsafe | HRP producer, CRM display | Hai T0 chốt redaction test vectors trước code; không coi flag displayOnly là privacy proof |

Replay-store product/backend selection, JWT library, implementation file layout là HRP engineering decisions sau approved constraints; không tạo Owner blocker giả. Tên issuance endpoints chi tiết chốt trong bilateral spec, không cần Owner chọn tên route.

## OWNER_DECISION_REQUIRED thực sự

1. **Organization và external eligibility:** cung cấp canonical organizationId và xác nhận ba HRP roles trên được dùng Talent context từ CRM. RLS parity không tự tạo business authorization cho external workflow. Nếu không đồng ý, T0 thu hẹp allowlist, không nới RLS.
2. **Delegation UX/lifetime/revocation risk:** approve HRP user consent và hạn tối đa 15 phút; accept hay từ chối cửa sổ CRM revoke chưa tới HRP do network failure. Nếu yêu cầu immediate cross-system revocation, cần online session-authority design bổ sung; không tuyên bố cơ chế hiện tại đáp ứng. Không nhập quyết định suppression REC-001-OPS vào đây.
3. **Operational data handling:** Owner/operations xác định ai được xem audit metadata, retention và recovery trách nhiệm. Recommendation chỉ metadata tối thiểu, không payload/token/PII; exact retention chưa bịa số.

T0 có thể gửi proposal CRM trước khi các quyết định Owner đóng, nhưng phải giữ OPEN và chỉ rõ những điểm nào chặn real path. Không buộc mọi pending decision ngoài slice phải ACCEPTED_SHARED để tiếp tục design.

## Gate và ownership

HRP T0 review draft → CRM T0 đánh giá compatibility → bilateral decisions + Owner dispositions liên quan → immutable accepted spec nếu đủ → implementation contract riêng → H.09/independent T3 → release gate. Không ai tự ban hành bilateral acceptance từ draft này. REC-001 ownership giữ nguyên; REC-001-OPS/REC-003 không được chốt hoặc mở implementation ngầm. T1A/T1B đang làm các task khác không bị giao thêm việc qua bundle này.
