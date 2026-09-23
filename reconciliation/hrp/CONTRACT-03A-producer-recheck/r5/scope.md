# Phạm vi producer recheck

- Authorization: CRM-HRP-MSG-040 yêu cầu HRP producer recheck candidate bất biến `2eb6bd155399d5e0490c5a2b0c5037a57dc36bc3`.
- In scope: raw-blob manifest integrity; clean `npm ci`, build và tests; 41 corrected canonical F-01 probes; regression F-02–F-06 và I-01; source-delta review từ candidate trước.
- Writes: chỉ bundle evidence HRP tại `reconciliation/hrp/CONTRACT-03A-producer-recheck/r5/` trên branch evidence riêng.
- Inputs: ID, token và tên synthetic; không có credential, dữ liệu cá nhân hoặc registration thật.
- Network: npm registry cho clean install và Git remote cho source provenance; không gọi HRP/CRM runtime.
- Exclusions: signature verification, signer/key provisioning, endpoint, DB/replay/delegation store, RLS, browser/session integration, package publication, consumer migration, pilot và deploy.
- Flavor: null; đây là producer conformance review, không phải pentest hoặc security audit của runtime.

