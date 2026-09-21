# Correction Ledger — CONTRACT-02B r2 (changes from r1)

r1 commit (immutable): 608d67daf9c0853b79862e72a117cf4bc520015c
r1 manifest SHA-256 (LF): a130b8ce8350b30dd8f84f012158051458a64739aa384bd222c47456beb94
r2 supersedes: r1
r1 remains immutable in Git history (no force-push per RECONCILIATION_PROTOCOL §3)

T0 verdict on r1: CHANGES_REQUIRED. 7 corrections (BR-1..BR-7) applied as narrow fixes.

## CR-2-1: TalentTargetRefSchema yeu cau laborProfileVersion — r1 chua address

T0 confirm: ContextQueryRequestSchema.target is CanonicalTargetRefSchema (queries.ts L335: union). TalentTargetRefSchema (mappings.ts L246-253) yeu cau day du: schemaVersion, kind=TALENT, laborProfileId, laborProfileVersion.

r1 da de cap target = kind + laborProfileId nhung bo sot laborProfileVersion. CR-2-1 bo sung gap rieng voi 3 cau hoi can T0/HRP quyet:

- CRM lay laborProfileVersion tu dau truoc lan doc dau?
- laborProfileVersion mang semantics gi (audit/concurrency/aging)?
- Neu chua co nguon dang tin cay, can HRP capability nao hoac contract change proposal nao?

CRM does NOT propose: dien 0 / dung updatedAt / bo version / chuyen sang external lookup de ne gap. laborProfileVersion tach bach khoi snapshotVersion (queries.ts L317 vs mappings.ts L251) — 2 fields khac nhau trong frozen schema.

## CR-2-2: Tach ba loai noi dung cho moi item

r1 CP1..CP5 danh dong FROZEN REQUIREMENT va SLICE PROPOSAL. CR-2-2 yeu cau moi muc ghi ro 3 loai:

- FROZEN REQUIREMENT: source dang yeu cau gi (trich tu frozen-schema line).
- SLICE PROPOSAL: hanh vi de xuat cho read-only Talent slice.
- CONTRACT CHANGE: schema/semantics actually changed.

CP1..CP5 khong tu dong tro thanh CONTRACT CHANGE chi vi HRP chua emit field. Phan lon are SLICE PROPOSAL.

Specific corrections:
- displayOnly hien la z.boolean() trong frozen schema (queries.ts L182) — khong phai literal. Neu de xuat true cho slice thi ghi slice constraint, khong goi la frozen literal. CRM does NOT claim UI guard bat buoc neu khong co evidence trong CRM source.
- SCHEMA_VERSION la string literal 1 trong enums.ts L210, khong phai numeric. r2 clarifies: ghi ro schema version la string literal 1.

## CR-2-3: Giu scope du lieu toi thieu

- cccdNumberRedacted khong ton tai trong ContextPanelIdentitySummarySchema (queries.ts L172-184). Bo khoi CP2, AC-17, AC-18.
- Bo AC-18 entirely: yeu cau tra full sensitive values cho caller co quyen — ngoai scope slice da giao.
- CCCD khong duoc dua vao slice duoi dang raw hay masked. CCCD khong phai field trong identity summary schema.
- phoneRedacted la z.string().min(1).max(64).optional() (queries.ts L178) — optional, khong tu bien thanh required.
- Khong dung thieu field trong response lam ly do xin mo quyen nhay cam.

## CR-2-4: Error contract khong xem ApiErrorCode cua mock UI la shared wire authority

r1 wording co the bi doc nhu ApiErrorCode = wire. CR-2-4 phan biet ro:

- HRP error envelope today: {error: code, message} voi codes FORBIDDEN/NOT_FOUND/INTERNAL (SOURCE-EVIDENCE.md route L24-40). PROPOSED as wire; chua chot.
- Frozen shared error/result schemas (queries.ts ContextPanelResultSchema + errors): chua co error sub-schema trong queries.ts; chua chot shared error envelope.
- CRM UI adapter mapping: apps/context-panel/src/ui/mock-api.ts L82-100 ApiErrorCode la mock-only; khong phai wire authority.

Gap ghi ro: ghi gap/mapping can thong nhat (T0 chua chot shared error envelope). Tuyen bo TypeScript union parseable hoac UI mapping parseable khac da dat wire validation.

RLS-hidden row -> 404 inference (HRP r3 §Q-A4): danh dau PROPOSED, khong phai runtime evidence da kiem chung. HTTP status can chot van PROPOSED.

## CR-2-5: Khong tu chot implementation details

- Read-only nghia la khong canonical mutation; khong bat buoc GET-only truoc khi chot request envelope transport (POST/GET voi envelope hop le cung OK theo connector §5; HRP chot). Doi AC-1 wording.
- Khong them idempotencyKey/409 command conflict vao query slice. Query la idempotent by nature. Bo AC related wording. AC-26 schemaVersion mismatch -> 422 (khong 409 cho query).
- Service JWT/issuer/delegation policy van PROPOSED. Khong ghi AC enforce.
- Sua mau thuan: r1 noi delegation optional nhung cung noi thieu thi reject. r2 ghi nhat quan: NEU HRP chot delegation trong slice, thieu delegation la reject. NEU HRP chot delegation optional, khong thieu delegation thi van OK. Day la HRP-side decision, khong co trong r1 frozen contract. Ghi PROPOSED.
- HRP quyet dinh cach enforce object permission va DB context (HRP-owned choice between RLS extension, ACL layer, query-time check). CRM khong mac dinh RLS extension. CR-2-5 wording CP7 does NOT presume RLS — ghi HRP-owned mechanism.
- Khong cam CRM defensive filtering; yeu cau cot loi la HRP khong gui du lieu ngoai quyen va CRM khong dung client masking thay authorization.

## CR-2-6: Unsupported projections — phan biet requested-supported / requested-unsupported / unrequested

r1 wording gom chung thanh unavailable. CR-2-6 chot ba trang thai:

- Requested-supported: CRM hoi X, HRP tra X voi data.
- Requested-unsupported: CRM hoi X nhung HRP khong ho tro; bieu dat unavailable theo contract (unavailableFields enum).
- Unrequested: CRM khong hoi X; HRP khong tra X, cung khong tinh unavailable.

AC-20 wording doi: chi nhung field trong request ma HRP khong ho tro moi duoc ghi unavailableFields. Field unrequested khong tu coi la unsupported.

CR-2-6 cung:
- Khong mac dinh liet ke ca 7 projection con lai la unavailable khi chi yeu cau identitySummary.
- contactability khong nam trong minimal slice.

## CR-2-7: Handoff, no duplication

- Giu r1 immutable (commit 608d67d).
- Bo sung correction ledger ngan (file nay).
- Khong nhan ban toan bo AC/proposal o nhieu file gay mau thuan.
- Cac file r2 tham chieu nguoc ve r1 (commit 608d67d) cho content khong doi.
- Ban giao theo 4 gap dau muc: target/version, snapshot-version, trusted-org/service/user-authorization, error mapping.

## Self-check allowed

T0 cho phep self-check proposed synthetic payload bang frozen validators trong scratch:
- Tao proposed envelope JSON.
- Dung Zod parse voi frozen schemas.
- Ghi nhan result trong SCRATCH-VALIDATION.md neu can.
- KHONG sua contracts.
- KHONG coi ket qua la HRP runtime evidence.
- Payload chua the hop le ghi ro missing decision (vi du laborProfileVersion chua co nguon -> payload INVALID pending decision).

## Boundaries confirmed

- r1 immutable.
- No frozen-contract changes (frozen schemas preserved).
- No source code changes in apps/**, packages/**, scripts/**.
- No bootstrap / tag / publish / merge / deploy / force-push.
- No promotion of any module to ACCEPTED_SHARED.
- No opening of HRP endpoint implementation.
- No independent Auditor PASS.
