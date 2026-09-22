# REC-002 — đề xuất cơ chế giới hạn cho Talent read

PROPOSED, DESIGN ONLY. CRM chứng minh service identity; HRP cấp và kiểm tra quyền delegation. Body actor, CRM session và chữ ký của service không tự cấp quyền đóng vai user HRP.

## 1. Cấp delegation: HRP approval rồi back-channel exchange

Đề xuất một flow cố định cho đúng CRM integration, không xây authorization platform dùng chung:

1. CRM backend xác thực session/user local và quyền dùng B.03; tạo pending link ngắn hạn với random state, CRM immutable subject, session handle/deadline, serviceId, organizationId và scope `talent-context:read:identitySummary`. Chỉ đăng ký một callback HTTPS do hai T0 pin. CRM ký assertion riêng cho thao tác bắt đầu delegation; không dùng assertion query cho thao tác này.
2. Browser tới trang approval của HRP. HRP xác minh signed pending request, org cấu hình và nonce một lần; user đăng nhập trực tiếp HRP bằng cơ chế hiện có. HRP lấy effective HRP user từ session đã xác thực, không từ `actor.userId`, email hoặc phone. Hiển thị rõ CRM account/organization/scope được liên kết, yêu cầu xác nhận chủ động và chống CSRF/login swapping. CRM subject do CRM xác nhận; HRP user do HRP xác nhận; approval nối hai identity, không tự suy ra chúng là cùng người từ thuộc tính cá nhân.
3. HRP lưu approval record với binding bên dưới; CHƯA tạo active delegation. Phát một opaque authorization receipt dùng một lần, entropy tối thiểu 256 bit, lưu digest server-side, sống tối đa 60 giây và không quá expiry của approval/session. Chuyển qua HTTPS form POST tới callback cố định. Không đặt receipt, HRP session token hoặc delegation reference trong URL browser/log; callback chỉ nhận receipt/state, không dữ liệu hồ sơ.
4. Callback CRM kiểm state và cùng CRM user/session đang active. Backend CRM đổi receipt qua authenticated back-channel được pin với assertion mới; HRP consume receipt nguyên tử và trả opaque `delegationRef` + `effectiveHrpUserId` + expiry. CRM giữ server-side. Receipt trao đổi sai service/session/pending transaction bị từ chối. Không đưa HRP admin/human token cho CRM và không mở admin route hiện tại thành S2S.
5. Mỗi query CRM kiểm lại session local, lấy đúng delegation của session đó; assertion ký bao gồm `crmSubject`, session handle và mọi binding bên dưới. HRP đối chiếu record đã cấp. Không cho CRM thay userId trong request để chuyển principal.

Đây là capability MỚI cần implementation sau approval: pending transaction/receipt/delegation store, approval flow, exchange và revoke surface. Chưa có chúng trong HRP baseline. Tên/path issuance cuối cùng là bilateral transport decision, không phải endpoint đã tồn tại. Lý do chọn flow: cả hai hệ thống chứng minh identity của mình, HRP user xác nhận delegation, CRM không có quyền tự mint HRP delegation. CRM phải đánh giá UX đăng nhập/consent bổ sung và session lifecycle; HRP sở hữu enforcement.

### Receipt binding và exchange timeout

Receipt digest trỏ tới immutable binding: `(pendingId, serviceId, effectiveHrpUserId, organizationId, grantedScopes, exchangeAudience, queryAudience, crmSubject, crmSessionHandle, hrpSessionReference, callbackId, approvedAt, expiresAt)`. Audience được pin theo environment và endpoint purpose; exchange assertion không dùng làm query assertion. HRP user/org/scope lấy từ approval đã verify, không chấp nhận override tại exchange; `scope` không rộng hơn `talent-context:read:identitySummary`.

Exchange dùng assertion mới, method/path/raw-body binding và jti guard như §2, nhưng audience là exchange riêng. Sau authentication/binding, HRP kiểm receipt chưa hết hạn/chưa dùng, approval/session còn hiệu lực, user active và role đủ quyền. Một transaction consume receipt có điều kiện và tạo duy nhất một delegation từ chính immutable tuple. Unique receipt-to-delegation invariant và atomic consume đảm bảo hai exchange cạnh tranh không cấp hai delegation. Nếu transaction fail trước commit, không để active delegation hoặc receipt consumed dở dang; jti đã dùng vẫn không được tái sử dụng.

Đề xuất v1 chọn **không replay kết quả exchange**: receipt đã consume trả generic exchange denial, kể cả caller đúng service; không trả lại secret/reference của lần trước. Network timeout có outcome chưa biết: CRM không tự retry receipt cũ (dù đổi jti), không giả định issuance thất bại. CRM gọi cancel-pending qua authenticated back-channel, bind service/CRM subject/session/pendingId; HRP serialize cancel với exchange trên cùng pending record, đánh dấu canceled và revoke delegation của record nếu đã tạo. Cancel idempotent, không trả object existence hoặc receipt/delegation data. Sau cancel ACK, bắt đầu approval mới với pendingId/state/receipt mới; không tái dùng consent của giao dịch cũ. Nếu không nhận cancel ACK thì dừng flow đó và retry cancel có bound bằng assertion mới; không mở approval thay thế cho cùng flow cho tới cancel ACK hoặc HRP-confirmed expiry. Cancel/revoke không cần receipt còn hạn, nhưng luôn cần authenticated binding hợp lệ.

Đây là tradeoff UX đơn giản, không phải command delivery protocol chung: timeout có thể cần user approve lại. Exchange/cancel dùng response thiết kế riêng, không giả làm Talent read result/error schema tại REC-004b. Hai T0 phải chốt exact issuance paths/body/status trong implementation contract trước code; chưa có endpoint nào được cấp quyền mở từ proposal này.

## 2. Binding và thứ tự enforcement

Query transport kế thừa đề xuất `POST /api/integrations/crm/talent-context/query`, JSON, `Authorization: Bearer <signed-service-assertion>`; token chỉ server-to-server qua TLS. JWT service assertion dùng pinned issuer/service/audience/kid và duy nhất RS256; key được provision qua vận hành tin cậy, không fetch URL do token cung cấp. Đây là recommendation, chưa bilateral accepted.

Claims phải bind method `POST`, exact configured pathname (không query string/alias), SHA-256 của raw request bytes, serviceId, actor tuple, organizationId, CRM subject/session, `iat`, `exp`, `jti`. Body hash bao gồm target, projections và correlationId. Không reserialize JSON trước kiểm hash; bounded body, reject duplicate JSON member/ambiguous framing. `delegationRef` không phải bearer authority độc lập: cần service assertion hợp lệ và record khớp.

Thứ tự đề xuất:

1. Giới hạn kích thước/content-type, parse envelope đủ để bind; không object lookup.
2. Verify pinned key/profile/signature/issuer/audience/time. `exp > iat`, `exp - iat <= 60s`, `iat <= now + 30s`, `now < exp + 30s`; nếu có `nbf`, phải nhất quán và không vượt skew. Không nhận assertion có thời gian vô hạn.
3. Verify method/path/raw-body hash và actor/service/org/session claims. Body mismatch: 401.
4. So org với cấu hình HRP và binding service; mismatch: 403 trước lookup LaborProfile. Đây không phải bằng chứng multi-org isolation; chỉ một org hỗ trợ.
5. Consume replay key nguyên tử sau binding, trước query. Key là tuple có encoding không nhập nhằng `(issuer, serviceId, audience, jti)`, không phụ thuộc kid để rotation không mở replay. Lưu đến mốc tuyệt đối `exp + skew`, không tính lại `TTL + skew` từ lúc nhận. Duplicate: 401. Không hoàn lại jti sau downstream lỗi.
6. Đọc delegation active/unexpired/unrevoked và so service, subject/session, HRP user, org, scope; sai: 403. Không cache positive delegation authorization.
7. Đọc user active và role/quyền hiện thời từ HRP DB. Body/signed role không authority. Giới hạn route đề xuất `ADMIN`, `HR_MANAGER`, `HR_STAFF`; các role khác và SERVICE-only bị từ chối. Đây là parity với human route, chưa phải policy S2S được duyệt.
8. Chạy read bằng effective user qua transaction-local `withDbContext`/RLS hiện có; không service bypass, không sửa global AuthContext chỉ để chứa org. HR_STAFF giữ scope đối tượng thật, không giả định mọi LaborProfile thuộc họ.
9. Lọc DTO thành projection cho phép, không trả DTO nội bộ. Recheck delegation/user authorization trước serialize response nếu đã thay đổi trong lúc query; hủy response khi deny. Không hứa thu hồi dữ liệu đã trả hoặc request vượt qua authorization checkpoint trước revoke commit.

## 3. Lifetime, revoke và availability

Recommendation: delegation tối đa 15 phút, không auto-refresh; expiry là min của 15 phút, HRP authenticated session expiry đã verify, CRM session deadline đã bind. Không coi deadline CRM tự khai là authority để kéo dài HRP lifetime. Hết hạn cần flow cấp lại. CRM logout/account switch ngừng ký ngay và gửi revoke authenticated/idempotent; HRP logout, user disable, security reset, admin revoke, unlink hoặc service disable làm mất hiệu lực delegation tương ứng. Session-level revocation hooks là implementation mới, không mặc nhận JWT baseline đã có chúng.

HRP ghi revoke đồng bộ vào authority store. Query bắt đầu authorization sau commit revoke phải deny; không dùng propagation cache. Với permission thay đổi, đọc quyền hiện thời mỗi query; role xuống dưới allowlist deny, object permission thay đổi do RLS quyết định. Emergency service/key disable phải được HRP kiểm trước nhận query, không giữ quyền nhờ rotation overlap.

Nếu CRM revoke chưa đến HRP do network lỗi, không hứa immediate cross-system revocation: CRM chặn tại local session và retry revoke; HRP còn bound bởi expiry tối đa 15 phút. Rủi ro cửa sổ này phải được Owner chấp nhận hoặc yêu cầu online CRM session check trước real path. Không ngầm chọn chính sách này thay Owner.

Replay/delegation/user authority store lỗi hoặc kết quả không xác định: deny read, 503 `DEPENDENCY_UNAVAILABLE`; không dùng stale allow, không fallback service-only. Atomic shared store có durability và không eviction sớm là yêu cầu; HRP implementation chọn backend. Sau mất replay state, fence query đến khi hết horizon assertion có thể còn sống hoặc revoke credential epoch có kiểm soát; không bật lại với store rỗng và nhận token cũ. Rotation planned: provision key mới trước, ngừng ký key cũ rồi giữ verify đủ horizon token còn hợp lệ; đề xuất overlap vận hành 24 giờ, emergency revoke không chờ overlap.

## 4. Retry không phải replay

Chọn một quy tắc: giữ `correlationId` cho cùng logical read và các lần retry, nhưng mỗi attempt dùng assertion/jti mới; refresh do user chủ động là logical read mới nên correlationId mới. CorrelationId chỉ trace, không dedup/cache key hay authority. CRM cần trace attempt riêng bằng jti hash trong metadata nội bộ, không thêm field wire chỉ để trace.

429/503 có thể retry có bound/backoff và tôn trọng Retry-After hợp lệ. Timeout sau consume jti cũng phải dùng jti mới. Mọi retry kiểm toàn bộ authentication, delegation, user, org và object authorization lại; có thể trả 403/404 sau revoke hoặc permission change. Không cam kết retry transient failure sẽ thành công. Không auto-retry 401/403/404/422/500; 401 không được tạo signing loop vô hạn. Đây chỉ read, không đưa REC-003 delivery/idempotency vào scope.

## 5. Draft negative AC — chưa chạy

| Case | Kỳ vọng |
|---|---|
| Service-only, fake actor hoặc chưa HRP approval | Deny; CRM không tự tạo delegation |
| Callback state/session đổi, receipt dùng lại/sai service | Exchange deny, không cấp delegation |
| Receipt sai effective user/org/scope/audience hoặc hết hạn | Exchange deny, không tạo active delegation |
| Hai exchange cùng receipt, assertion khác nhau | Tối đa một transaction cấp delegation; loser không nhận lại result |
| Exchange đã commit nhưng response mất; cancel cạnh tranh exchange | Không retry receipt; cancel serialize và revoke kết quả nếu có; approval mới chỉ sau cancel ACK/confirmed expiry |
| User inactive/revoke sau approval nhưng trước exchange | Exchange deny; không lấy approval cũ thay user-state check |
| Wrong kid/alg/time/hash; same jti hai connection | 401; cùng jti tối đa một attempt qua consume |
| Wrong org | 403 trước object lookup |
| Delegation mismatch/revoked/expired; user disabled hoặc role giảm | 403; không dùng quyền cached |
| Hidden và nonexistent object | Cùng 404 query error; không SQL/stack/PII |
| Timeout sau consume rồi retry mới | Reauthorize; success hoặc lỗi phù hợp, không reuse jti |
| Revoke commit trước retry | Retry 403 dù lần trước transient |
| Replay/delegation store unavailable/mất state | 503/fence; không fail-open |
| Request raw phone/CCCD dưới unknown projection | 422; output filter không có raw field |

Audit lưu metadata tối thiểu (outcome/time/correlation, pseudonymous service/user/delegation identifiers theo policy), không raw assertion/body/PII. Retention/access/recovery là Owner/operations decision trong register. Tất cả mechanisms đề xuất mới cần HRP implementation; CRM sở hữu session safeguards, signer và consumer compatibility.
