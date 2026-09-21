# HRP T0 Design Response (CONTRACT-02B)

## D-01 — Request target/version

Đề xuất schema riêng tại read-query boundary, ví dụ `TalentContextReadTargetSchema` và `TalentContextReadQueryRequestSchema`:
- Target chỉ gồm `schemaVersion='1'`, `kind='TALENT'`, `laborProfileId`.
- Không yêu cầu `laborProfileVersion` cho lần đọc đầu tiên.
- Không dùng `0`, `updatedAt` hoặc synthetic version.
- Không sửa hoặc làm optional `laborProfileVersion` trong `TalentTargetRefSchema` dùng chung.
- `ContextQueryRequestSchema` và mutation/version-aware consumers hiện hữu giữ nguyên.
- **Lưu ý**: Đây là additive wire change cho read-only query, không được mô tả là workaround giữ nguyên frozen schema.

## D-02 — Response snapshotVersion

HRP chưa có nguồn `snapshotVersion` đúng nghĩa.
- Đề xuất `TalentContextReadResultSchema` riêng cho slice này và không có `snapshotVersion`.
- Không sửa hoặc làm optional `snapshotVersion` trên `ContextPanelResultSchema` dùng chung.
- `resolvedAt` vẫn bắt buộc, là thời điểm xử lý query và không mang semantics concurrency/cache/version.
- `updatedAt` không được thay thế `snapshotVersion`.

## D-03 — Auth, organization và object authorization

- S2S credential xác thực service principal CRM.
- Actor của slice phải là `DELEGATED_USER`; service-only không được đọc `LaborProfile`.
- Actor trong body chỉ là claim, phải được bind với credential/delegation server-side.
- Delegated user phải tồn tại, active và được HRP resolve role/permission từ DB.
- Query chạy dưới effective delegated user và dùng authorization/RLS hiện hữu để kiểm canonical object visibility.
- Dùng integration context cục bộ của endpoint; không bắt buộc sửa global `AuthContext` hoặc RLS chỉ để đáp ứng proposal.
- HRP hiện chưa có multi-organization ownership trên `LaborProfile`. Slice đầu chỉ hỗ trợ một `organizationId` được pin trong cấu hình/service registration và bind server-side với CRM principal.
- `organizationId` khác giá trị đã pin phải bị từ chối trước object lookup. Không được tuyên bố hỗ trợ multi-org.
- Nếu tương lai cần nhiều organization, implementation bị BLOCKED cho tới khi có canonical organization ownership.
- Projection tối thiểu: `identitySummary.fullNameRedacted`, `displayOnly=true`.
- Omit `phoneRedacted` trong slice đầu; không trả raw phone, CCCD hoặc `cccdNumberRedacted`.
- Chấp nhận semantics requested-supported / requested-unsupported / unrequested và `unavailableFields` như proposal.
- **Lưu ý**: Các chi tiết issuer, algorithm, key rotation, TTL, revocation, delegation lifetime/replay vẫn thuộc REC-002 và chưa được tự quyết.

## D-04 — Error contract

CRM baseline đã có `packages/contracts/src/errors.ts` và `envelopes.ts`. Gap thực tế là query response/error binding, không phải thiếu toàn bộ shared errors.
- Đề xuất HTTP 200: body theo `TalentContextReadResultSchema` riêng.
- Non-2xx: `QueryErrorResponseSchema` strict, tối thiểu gồm `schemaVersion='1'` và errors theo `ErrorListSchema`/`ContractErrorSchema`.
- Không dùng command response envelope, UI `ApiErrorCode` hoặc body HRP hiện tại `{error,message}` làm wire authority.
- Tái sử dụng `VALIDATION_ERROR=422`, `AUTHENTICATION_REQUIRED=401`, `FORBIDDEN=403`, `RATE_LIMITED=429` và `DEPENDENCY_UNAVAILABLE=503` theo đúng semantics.
- Đề xuất bổ sung `NOT_FOUND=404` và `INTERNAL_ERROR=500` vào shared taxonomy; cả hai vẫn PROPOSED dưới REC-004b.
- Hidden object và nonexistent object trả cùng `NOT_FOUND` để không tạo existence oracle.
- Không dùng `UNRESOLVED_IDENTITY` cho canonical `laborProfileId` đã biết.
- Không dùng `UNKNOWN_COMMAND_OUTCOME` cho read query.
- `INTERNAL_ERROR` không được lộ exception, SQL, stack trace hoặc PII.
- **Lưu ý**: Ghi rõ tác động additive enum đối với exhaustive consumers và quyết định compatibility còn lại.
