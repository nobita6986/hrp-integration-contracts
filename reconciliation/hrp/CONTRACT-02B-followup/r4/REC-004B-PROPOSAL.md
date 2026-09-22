# REC-004b — dedicated read-query module

PROPOSED, DESIGN ONLY. Không sửa `TalentTargetRefSchema`, `ContextPanelResultSchema`, `ErrorCodeSchema`, `ContractErrorSchema`, `ErrorListSchema`, `ERROR_POLICIES` hoặc command consumers.

## 1. Placement, names và parser

Đề xuất source authority mới trong neutral repo: `packages/contracts/src/talent-context-read/v1.ts`, entrypoint `@hrp-engagement/contracts/talent-context-read/v1` khi package owner phê duyệt distribution. Nếu chưa có package layout đó trong neutral repo, đây là layout đề xuất, không phải path đang tồn tại. Không bắt buộc npm package mới. CRM frozen package hiện chỉ export `.`; việc thêm subpath, build/publish/version và consumer pin phải được hai T0 chốt, không suy ra neutral repo đã publish package.

Exports đề xuất: `TalentContextReadTargetSchema`, `TalentContextReadFieldSchema`, `TalentContextReadQueryRequestSchema`, `TalentContextReadResultSchema`, `TalentContextReadErrorSchema`, `TalentContextReadErrorResponseSchema`, `parseTalentContextReadResponse`. Có type tương ứng bỏ hậu tố Schema. Không re-export vào frozen root hoặc đưa query envelope vào generic command parser.

Exact distribution proposal để CRM disposition (chưa publish): thêm subpath `./talent-context-read/v1` vào bản package kế tiếp `@hrp-engagement/contracts@0.0.9-contract02b.1`, `types` trỏ `./dist/talent-context-read/v1.d.ts`, `import` trỏ `./dist/talent-context-read/v1.js`. Chỉ đề xuất ESM cho consumer mới; không tạo CJS condition khi chưa có consumer cần. CRM package maintainer giữ build/distribution của package đang tồn tại; accepted source/spec của read module do neutral repo quản lý, việc lấy module vào package phải pin immutable accepted commit và kiểm parity. Không chuyển ownership hoặc di chuyển frozen source sang neutral repo trong lượt này.

Version trên là candidate cho design review, chưa được reserve hoặc xác nhận registry availability. Nếu maintainer đã dùng version đó, chọn candidate chưa dùng trong bilateral disposition trước publication; không ghi đè version. Wire version `'1'`, subpath `/v1` và package version là ba trục khác nhau. Old consumers giữ nguyên version/lockfile; consumer mới pin exact prerelease, không dùng range. Mọi root export cũ phải giữ behavior/fixtures khi thử package candidate; chỉ thêm subpath không chứng minh compatibility. Đây là đề xuất đáp ứng request exact placement/version, không có package.json/runtime change trong bundle.

`schemaVersion: '1'` nằm trong namespace/module này, không phải chấp nhận mọi shared v1 shape. Parser riêng nhận HTTP status + unknown body: 200 phải parse direct result; non-2xx phải parse query error và khớp status/code. Unknown version/code/field hoặc shape mismatch là protocol failure, không render raw body, không auto-retry hay fallback parse bằng command schema. Transport 404 route chưa tồn tại không được giả làm object NOT_FOUND nếu body không parse đúng.

## 2. Shapes đề xuất, kế thừa r3

Conceptual TypeScript dưới đây là thiết kế, chưa phải schema implementation/tested code. Dùng constraints của frozen `CorrelationIdSchema`, `OrganizationIdSchema`, `CanonicalIdSchema`, `DelegatedUserActorClaimSchema`, `IsoTimestampSchema` tại baseline. Strict objects; bounded strings/arrays; không arbitrary detail field.

```typescript
type TalentContextReadTarget = { kind: 'TALENT'; laborProfileId: string };
type TalentContextReadField = 'identitySummary' | 'placementCase' |
  'availability' | 'currentRelationship' | 'nextAction' |
  'recentInteractions' | 'contactability' | 'suppressionSummary';
type TalentContextReadQueryRequest = {
  schemaVersion: '1'; correlationId: string; organizationId: string;
  actor: { kind: 'DELEGATED_USER'; serviceId: string; userId: string;
    delegationRef: string };
  target: TalentContextReadTarget;
  fieldAllowlist: TalentContextReadField[]; // unique, 1..8
};
type TalentContextReadResult = {
  schemaVersion: '1'; correlationId: string; organizationId: string;
  target: TalentContextReadTarget;
  identitySummary?: { schemaVersion: '1'; fullNameRedacted: string;
    displayOnly: true };
  unavailableFields: TalentContextReadField[]; // unique, 0..8
  resolvedAt: string;
};
type TalentContextReadErrorResponse = {
  schemaVersion: '1'; status: 'FAILED'; correlationId: string;
  errors: TalentContextReadError[]; // exactly one sanitized error in v1
};
```

200 trả `TalentContextReadResult` trực tiếp, không `data`/success wrapper. Error envelope không `commandId`, không numeric status. CorrelationId hợp lệ được echo; malformed/missing correlationId dùng safe server-generated ID theo schema, không echo raw input. `resolvedAt` là thời điểm hoàn thành authorization/query/filtering, không version, freshness guarantee hoặc concurrency token. Không laborProfileVersion, expectedVersion hay snapshotVersion.

Chỉ `identitySummary` supported. Nếu được request và được phép, output chỉ name đã redacted + displayOnly; không raw phone/CCCD/DTO. Nếu không tạo được redacted value an toàn, bỏ projection và ghi identitySummary vào unavailableFields (r3 fallback giữ nguyên). Không trả projection rỗng để giả supported. Bảy field đã biết nhưng unsupported chỉ vào unavailableFields khi được request. Unrequested không data và không unavailable marker. Unknown string (kể cả phone/CCCD) là 422, không coi là unsupported. Object authorization deny là 403/404 theo gate, không được ngụy trang thành unsupported. Redaction algorithm/test vectors còn cần chốt riêng trước implementation, không dùng displayOnly thay privacy control.

## 3. Lỗi: reuse code names, không reuse command retry semantics

Fresh frozen-source check cho thấy `ContractErrorSchema.superRefine` buộc chính xác messageKey/retryClass theo `ERROR_POLICIES`; enum retry không có `RETRY_SAFE` hoặc `RETRY_UNSAFE`. Hai transient codes dùng `BOUNDED_SAME_KEY`, vốn gắn command idempotency. CRM r6 illustrative JSON và r3 broad `ContractError | Additional` chưa đủ làm final query schema.

Recommendation r4: query-local strict discriminated union đúng bảy code dưới đây; reuse code/messageKey hiện có khi phù hợp nhưng dùng query-local retry profile. Không import broad ContractError union để vô tình nhận VERSION_CONFLICT, UNKNOWN_COMMAND_OUTCOME hoặc các command-only codes. `TalentContextReadError` chỉ có code/messageKey/retryClass, không raw message/stack/details. Các triple phải được refine cố định, producer không được đổi retryClass.

| Code | HTTP | Exact messageKey | Query retryClass |
|---|---|---|---|
| VALIDATION_ERROR | 422 | errors.validation | NEVER |
| AUTHENTICATION_REQUIRED | 401 | errors.authenticationRequired | REAUTHENTICATE |
| FORBIDDEN | 403 | errors.forbidden | NEVER |
| RATE_LIMITED | 429 | errors.rateLimited | BOUNDED_NEW_ASSERTION |
| DEPENDENCY_UNAVAILABLE | 503 | errors.dependencyUnavailable | BOUNDED_NEW_ASSERTION |
| NOT_FOUND | 404 | errors.talentContext.notFound | NEVER |
| INTERNAL_ERROR | 500 | errors.talentContext.internal | NEVER |

Phân loại authority: VALIDATION_ERROR/AUTHENTICATION_REQUIRED/FORBIDDEN giữ frozen triple; RATE_LIMITED/DEPENDENCY_UNAVAILABLE giữ frozen code và messageKey nhưng **đề xuất thay retryClass chỉ trong query schema mới**. NOT_FOUND/INTERNAL_ERROR và hai messageKey tương ứng là additions đề xuất. BOUNDED_NEW_ASSERTION không tồn tại trong frozen RetryClassSchema. HTTP mappings cho năm code có sẵn trùng frozen hints; 404/500 là additions của read slice. Không mô tả cả bảy triples là frozen-compatible.

`BOUNDED_NEW_ASSERTION` là đề xuất wire literal MỚI của query-only module, không thêm vào frozen RetryClassSchema. Nó cho phép retry read có bound/backoff, cùng logical correlationId nhưng jti mới và reauthorization; không đảm bảo success. `REAUTHENTICATE` yêu cầu sửa auth/reconnect trước request mới, không silent signing loop. Đây là compatibility decision explicit: query errors transient sẽ KHÔNG parse bằng frozen ContractErrorSchema. Nếu hai T0 không chấp thuận query-specific retry literal, phải chốt alternative trước spec; không âm thầm diễn giải `BOUNDED_SAME_KEY` là cùng jti hoặc đổi semantics command consumer.

Hidden/nonexistent object cùng sanitized 404 code/messageKey, không tiết lộ SQL/PII. Disabled feature/dependency lỗi là 503 khi query route xử lý được; unexpected server failure là 500. Infrastructure HTML/empty body là transport/protocol failure, không tin là typed HRP error. Response và intermediaries phải `Cache-Control: no-store`; không cache authorization bằng correlationId.

## 4. Consumer impact và draft audit cases

Affected: CRM B.03 query client/parser/error renderer/retry loop, CRM signer/delegation adapter, HRP future query boundary và package build/export/version consumers. Không audit lại 28 modules; phải inventory imports/re-exports/generic retry helpers của package bị publish để chứng minh phạm vi, không suy luận isolation chỉ từ path mới.

Draft tests, chưa chạy:

- Frozen command fixtures và existing imports giữ nguyên kết quả; frozen enum/policies/error parser unchanged. Old parser phải reject new query additions và new retry literal, không được nới nó để test xanh.
- Query parser nhận đúng bảy triples, reject command-only/unknown code, unknown version, extra fields, wrong HTTP mapping, wrong messageKey/retryClass và malformed correlation ID.
- Direct success không wrapper; optional projection consistency theo request; unsupported/unrequested/unknown tách biệt; không raw PII. CRM defensive filtering không thay HRP auth.
- B.03 dùng query-only parser và retry scheduler; không reuse command idempotency retry helper. Retry giữ logical correlationId, assertion/jti mới, bounded attempts; revoked user không retry thành công.
- Root export/lockfile/build resolution kiểm cả consumers cũ và entrypoint mới trước package publish. Package version mới pin exact artifact; wire breaking change tương lai dùng module/version mới, không sửa frozen v1 tại chỗ.

Consumer audit ownership: CRM inventory package imports/root re-exports, B.03 parser, error renderer, locale message keys và retry helpers; HRP kiểm producer/schema conformance và effective-user negative cases; package maintainer kiểm export-map/types/build trên old root consumers lẫn new ESM subpath. Shared conformance fixture phải pin cùng accepted contract commit. Chưa audit consumer execution ở lượt này; không claim zero impact hoặc PASS từ source inspection. Refinement so với r3: nếu identitySummary hiện diện thì fullNameRedacted bắt buộc; không trả object chỉ có displayOnly để giả có dữ liệu.

Rollout vẫn gated: bilateral spec → accepted artifact/distribution decision → implementations có test độc lập → H.09/Tier 3 → T0 bật real path. Package publication hoặc consumer migration chưa được phép từ document này. HRP sở hữu enforcement/projection/error production, CRM sở hữu parser/session/UI/retry; shared schema owner là neutral repository qua bilateral review.
