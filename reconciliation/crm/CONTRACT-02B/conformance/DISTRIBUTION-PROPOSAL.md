DISTRIBUTION-PROPOSAL
===================

Status
------
PROPOSED. Khong publish trong task nay. Bilateral decision giu hai T0 truoc implementation.

Nguon
-----
- r4 REC-004B S1 (Placement, names va parser)
- r4 SOURCE-EVIDENCE.md E-03 (frozen package layout)

Muc tieu
--------
1. CRM B.03 consumer import query schemas tu mot artifact da pin.
2. Old consumers (root exports) khong bi anh huong.
3. Thay doi source can commit moi -> artifact moi -> consumers phat hien qua lockfile.
4. Khong copy toan bo frozen package vao neutral bundle.

Proposed Source Location
----------------------
| Artifact              | Path                                                                 |
| Source authority      | packages/contracts/src/talent-context-read/v1.ts trong neutral repo |
| Entrypoint wire name  | @hrp-engagement/contracts/talent-context-read/v1                   |

Note: neutral repo hien chua co layout nay; day la layout de xuat, khong phai path dang ton tai.
Package owner phe duyet distribution.

Proposed Exports (TypeScript)
-----------------------------
Schema exports:
  TalentContextReadTargetSchema
  TalentContextReadFieldSchema
  TalentContextReadQueryRequestSchema
  TalentContextReadResultSchema
  TalentContextReadErrorSchema
  TalentContextReadErrorResponseSchema
  parseTalentContextReadResponse

Consumer import:
  import { parseTalentContextReadResponse, TalentContextReadQueryRequestSchema } from "@hrp-engagement/contracts/talent-context-read/v1";

Khong re-export vao root hoac generic command parser.

Proposed package.json Addition
-----------------------------
Candidate version: @hrp-engagement/contracts@0.0.9-contract02b.1

JSON excerpt:
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
    "./talent-context-read/v1": {
      "import": "./dist/talent-context-read/v1.js",
      "types": "./dist/talent-context-read/v1.d.ts"
    }
  }

Ghi chu:
- "private": true -- khong public npm; chi internal consumers qua artifact registry.
- Root export "./" giu nguyen; old consumers khong bi anh huong.
- ESM only cho consumer moi; khong tao CJS condition khi chua co consumer can.
- "intended isolation" -- query module duoc thiet ke de khong anh huong root exports.
  Consumer compatibility testing: NOT_EXECUTED trong task nay.
  Khong tuyen bo zero impact tu source inspection.

Cach Hai Repo Cai Artifact
-------------------------
Day la co che de xuat, chua phai che do da duyet. Bilateral decision truoc implementation.

1. Bilateral acceptance: Khi REC-004b duoc T0 bilateral accept, mot commit moi
   duoc tao trong neutral repo chua source file:
   packages/contracts/src/talent-context-read/v1.ts

2. Build: Package maintainer chay tsc de tao:
   dist/talent-context-read/v1.js
   dist/talent-context-read/v1.d.ts

3. Checksum: SHA-256 cua moi artifact file duoc tinh va ghi vao provenance document.
   Chi du lieu nay duoc dung de verify pin.

4. CRM pin: CRM package.json ghi dependency:
   "@hrp-engagement/contracts": "0.0.9-contract02b.1"
   voi integrity hash tu buoc 3.

5. Detect change: Thay doi schema tao commit moi va artifact hash moi;
   CRM detect qua package-lock diff.

6. Breaking change: Dung module path moi /v2 hoac package version moi;
   khong sua frozen v1.

JSON_OK Chi chung minh JSON hop le
---------------------------------
JSON.parse() thanh cong chi xac nhan cau truc JSON dung, khong dam bao:
- Schema conformance
- TypeScript type matching
- Business logic correctness
- Frozen contract compatibility

Khong tuyen bo schema conformance tu JSON_OK.

Versioning Boundaries
--------------------
| Truc                   | Gia tri                                                    |
| Wire version           | schemaVersion: '1' trong namespace /v1, khong phai global |
| Module path            | /talent-context-read/v1                                    |
| Package version        | @hrp-engagement/contracts@0.0.9-contract02b.1 (candidate) |

Neu maintainer da dung version do, chon candidate chua dung trong bilateral disposition truoc publication.
Old consumers giu nguyen version/lockfile.

Consumer Compatibility
---------------------
| Consumer              | Intended impact                      | Action                                              |
| Old consumers         | Intended isolation; NOT_EXECUTED      | Giu nguyen version/lockfile                          |
| New consumers (B.03)  | Can pin new version + subpath          | Import tu ./talent-context-read/v1                   |
| Root export/lockfile  | Intended isolation; NOT_EXECUTED      | Package maintainer verify truoc publish              |

Consumer audit ownership:
- CRM: inventory package imports/root re-exports, B.03 parser, error renderer, locale message keys, retry helpers.
- HRP: producer/schema conformance va effective-user negative cases.
- Package maintainer: export-map/types/build tren old root consumers lan new ESM subpath.

Open Items
---------
| ID    | Item                                                           | Owner           |
| DIST-1 | Reserve version 0.0.9-contract02b.1 trong registry           | Package maintainer |
| DIST-2 | Xac nhan package placement (subpath vs separate package)       | Bilateral       |
| DIST-3 | Artifact storage (npm registry private hay internal registry)   | Operations      |
| DIST-4 | Consumer lockfile migration plan                                | CRM T1-B        |

Nhung gi task nay KHONG LAM
--------------------------
- Khong copy toan bo frozen package vao neutral bundle.
- Khong publish package.
- Khong reserve version trong registry.
- Khong tao npm token hay CI/CD pipeline.
- Khong commit built artifact vao repo (neu dung npm publish).