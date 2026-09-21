# HRP T0 Design Response (CONTRACT-02B)

## D-01 — Request target/version

1. **Gap**: Frozen `TalentTargetRefSchema` yêu cầu `laborProfileVersion`, nhưng HRP không có nguồn version đáng tin cậy trước lần đọc đầu tiên. `ContextQueryRequestSchema` vì vậy không thể biểu diễn read-by-known-ID hiện tại mà không có additive wire change.
2. **HRP proposed option**: Đề xuất schema riêng tại read-query boundary, ví dụ `TalentContextReadTargetSchema` và `TalentContextReadQueryRequestSchema`. Target chỉ gồm `schemaVersion='1'`, `kind='TALENT'`, `laborProfileId`. Không yêu cầu `laborProfileVersion` cho lần đọc đầu tiên. Không dùng `0`, `updatedAt` hoặc synthetic version. Không sửa hoặc làm optional `laborProfileVersion` trong `TalentTargetRefSchema` dùng chung.
3. **Reason**: Additive read-query schemas are preferred over modifying generic frozen target/result definitions. It avoids workarounds on frozen schemas and explicitly defines the read boundary without impacting existing mutation flows.
4. **Affected contracts**: Shared schema packages (additive changes). D-01/D-02 là additive read-query schemas; không sửa generic frozen target/result.
5. **Affected consumers**: CRM B.03 là consumer mới; mutation/version-aware consumers hiện hữu không đổi.
6. **Remaining bilateral decisions**: Exact query envelope naming/transport vẫn là bilateral decision.
7. **Implementation owner**: HRP runtime implementation owner là HRP T1B (chỉ sau bilateral acceptance và task riêng). CRM consumer owner là CRM T1B sau acceptance. Shared contract change trên neutral repository cần cả hai T0 duyệt. Tier 3/H.09 audit bắt buộc trước real path.

## D-02 — Response snapshotVersion

1. **Gap**: HRP chưa có nguồn `snapshotVersion` đúng nghĩa cho read responses. Các schema response chung như `ContextPanelResultSchema` yêu cầu field này.
2. **HRP proposed option**: Đề xuất `TalentContextReadResultSchema` riêng cho slice này và không có `snapshotVersion`. Không sửa hoặc làm optional `snapshotVersion` trên `ContextPanelResultSchema` dùng chung. `resolvedAt` vẫn bắt buộc, là thời điểm xử lý query và không mang semantics concurrency/cache/version. `updatedAt` không được thay thế `snapshotVersion`.
3. **Reason**: Preventing fake/synthetic snapshot versions ensures data integrity semantics are maintained. Additive responses provide exact types for new consumers.
4. **Affected contracts**: Shared schema packages (additive changes). D-01/D-02 là additive read-query schemas; không sửa generic frozen target/result.
5. **Affected consumers**: CRM B.03 consumer mới. Mutation/version-aware consumers hiện hữu không đổi.
6. **Remaining bilateral decisions**: Exact query envelope naming/transport vẫn là bilateral decision.
7. **Implementation owner**: HRP runtime implementation owner: HRP T1B. CRM consumer owner: CRM T1B. Shared contract change: neutral repository (bilateral T0 acceptance). Tier 3/H.09 audit bắt buộc trước real path.

## D-03 — Auth, organization và object authorization

1. **Gap**: Authentication, role binding, and canonical organization ownership are not fully aligned for cross-service read queries on LaborProfile.
2. **HRP proposed option**: S2S credential xác thực service principal CRM. Actor của slice phải là `DELEGATED_USER`; service-only không được đọc `LaborProfile`. Actor trong body chỉ là claim, phải được bind với credential/delegation server-side. Delegated user phải tồn tại, active và được HRP resolve role/permission từ DB. Query chạy dưới effective delegated user và dùng authorization/RLS hiện hữu để kiểm canonical object visibility. Dùng integration context cục bộ của endpoint; không bắt buộc sửa global `AuthContext` hoặc RLS chỉ để đáp ứng proposal. HRP hiện chưa có multi-organization ownership trên `LaborProfile`. Slice đầu chỉ hỗ trợ một `organizationId` được pin trong cấu hình/service registration và bind server-side với CRM principal. `organizationId` khác giá trị đã pin phải bị từ chối trước object lookup. Không được tuyên bố hỗ trợ multi-org. Projection tối thiểu: `identitySummary.fullNameRedacted`, `displayOnly=true`. Omit `phoneRedacted` trong slice đầu; không trả raw phone, CCCD hoặc `cccdNumberRedacted`. Chấp nhận semantics requested-supported / requested-unsupported / unrequested và `unavailableFields` như proposal.
3. **Reason**: HRP infrastructure operates on effective delegated users mapping to existing internal RLS. Multi-org is not supported since `LaborProfile` lacks canonical organization ownership.
4. **Affected contracts**: Shared endpoint integration and authorization flow.
5. **Affected consumers**: CRM consumer integration calls.
6. **Remaining bilateral decisions**: D-03 còn mở: issuer/algorithm/key rotation/TTL/revocation, delegation format/lifetime/replay, exact effective-user role/capability mapping và canonical organizationId cấu hình. HRP chỉ hỗ trợ single pinned organization trong slice đầu; multi-org vẫn blocked.
7. **Implementation owner**: HRP runtime implementation owner: HRP T1B. CRM consumer owner: CRM T1B. Shared contract change: neutral repository (bilateral T0 acceptance). Tier 3/H.09 audit bắt buộc trước real path.

## D-04 — Error contract

1. **Gap**: Query response/error binding logic is not fully defined using shared errors.
2. **HRP proposed option**: HTTP 200: body theo `TalentContextReadResultSchema` riêng. Non-2xx: `QueryErrorResponseSchema` strict, tối thiểu gồm `schemaVersion='1'` và errors theo `ErrorListSchema`/`ContractErrorSchema`. Không dùng command response envelope, UI `ApiErrorCode` hoặc body HRP hiện tại `{error,message}` làm wire authority. Tái sử dụng `VALIDATION_ERROR=422`, `AUTHENTICATION_REQUIRED=401`, `FORBIDDEN=403`, `RATE_LIMITED=429` và `DEPENDENCY_UNAVAILABLE=503` theo đúng semantics. Đề xuất bổ음에 sung `NOT_FOUND=404` và `INTERNAL_ERROR=500` vào shared taxonomy (cả hai vẫn PROPOSED dưới REC-004b). Hidden object và nonexistent object trả cùng `NOT_FOUND` để không tạo existence oracle. Không dùng `UNRESOLVED_IDENTITY` cho canonical `laborProfileId` đã biết. Không dùng `UNKNOWN_COMMAND_OUTCOME` cho read query. `INTERNAL_ERROR` không được lộ exception, SQL, stack trace hoặc PII.
3. **Reason**: Adopting standardized error representations ensures cross-service robustness. Reusing `ContractErrorSchema` minimizes redundant formats while properly mapping to HTTP semantics.
4. **Affected contracts**: D-04 tái sử dụng `ContractErrorSchema`/`ErrorListSchema`; chỉ query envelope binding và `NOT_FOUND`/`INTERNAL_ERROR` là contract additions được đề xuất.
5. **Affected consumers**: CRM B.03 consumer mới và existing error parsers.
6. **Remaining bilateral decisions**: Additive enum compatibility và exhaustive consumers vẫn chờ REC-004b. Exact query envelope naming/transport vẫn là bilateral decision.
7. **Implementation owner**: HRP runtime implementation owner: HRP T1B. CRM consumer owner: CRM T1B. Shared contract change: neutral repository (bilateral T0 acceptance). Tier 3/H.09 audit bắt buộc trước real path.
