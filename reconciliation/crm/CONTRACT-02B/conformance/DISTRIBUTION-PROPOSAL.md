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
------------------------
| Artifact              | Path                                                                 |
| Source authority      | packages/contracts/src/talent-context-read/v1.ts trong neutral repo |
| Entrypoint wire name  | @hrp-engagement/contracts/talent-context-read/v1                   |

Note: neutral repo hien chua co layout nay; day la layout de xuat, khong phai path dang ton tai.
Package owner phe duyet distribution.

Proposed Exports (TypeScript)
-----------------------------
// Schema types
export const TalentContextReadTargetSchema: z.ZodType<TalentContextReadTarget>;
export const TalentContextReadFieldSchema: z.ZodType<TalentContextReadField>;
export const TalentContextReadQueryRequestSchema: z.ZodType<TalentContextReadQueryRequest>;
export const TalentContextReadResultSchema: z.ZodType<TalentContextReadResult>;
export const TalentContextReadErrorSchema: z.ZodType<TalentContextReadError>;
export const TalentContextReadErrorResponseSchema: z.ZodType<TalentContextReadErrorResponse>;
export const parseTalentContextReadResponse: (status: number, body: unknown) => ParseResult;

// Named types
export type TalentContextReadTarget = { kind: 'TALENT'; laborProfileId: string };
export type TalentContextReadField = 'identitySummary' | 'placementCase' | 'availability' | 'currentRelationship' | 'nextAction' | 'recentInteractions' | 'contactability' | 'suppressionSummary';

Consumer import:
  import { parseTalentContextReadResponse, TalentContextReadQueryRequestSchema } from '@hrp-engagement/contracts/talent-context-read/v1';

Khong re-export vao root hoac generic command parser.

Proposed package.json Addition
-------------------------------
Candidate version: @hrp-engagement/contracts@0.0.9-contract02b.1

{
  "name": "@hrp-engagement/contracts",
  "version": "0.0.9-contract02b.1",
  "private": true,
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./talent-context-read/v1": {
      "import": "./dist/talent-context-read/v1.js",
      "types": "./dist/talent-context-read/v1.d.ts"
    }
  }
}

Ghi chu:
- "private": true -- khong public npm; chi internal consumers qua artifact registry.
- Root export "./" giu nguyen; old consumers khong bi anh huong.
- ESM only cho consumer moi; khong tao CJS condition khi chua co consumer can.

Build va Artifact
-----------------
- Source TypeScript compiled qua tsc vao dist/talent-context-read/v1.js va dist/talent-context-read/v1.d.ts.
- Package build output duoc commit vao neutral repo (hoac publish len internal artifact registry).
- Source file packages/contracts/src/talent-context-read/v1.ts duoc quan ly trong neutral repo.
- Khong copy toan bo frozen package (errors.ts, primitives.ts, envelopes.ts, etc.) vao neutral bundle.

Reproducibility
--------------
1. Pin point: Consumers lock @hrp-engagement/contracts@0.0.9-contract02b.1 trong package.json / lockfile.
2. Change detection: Thay doi schema can commit moi -> artifact hash moi -> consumers phat hien qua lockfile diff.
3. Manifest bundle: Provenance document trong neutral repo ghi commit hash goc cua source.
4. Source integrity: Neu artifact duoc publish, verify qua integrity hash trong package metadata.
5. Breaking change: Dung module path moi /v2 hoac package version moi; khong sua frozen v1.

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
| Consumer              | Impact                      | Action                                              |
| Old consumers         | Khong anh huong             | Giu nguyen version/lockfile                          |
| New consumers (B.03)  | Can pin new version + subpath | Import tu ./talent-context-read/v1                   |
| Root export/lockfile  | Kiem ca hai                 | Package maintainer verify truoc publish              |

Consumer audit ownership:
- CRM: inventory package imports/root re-exports, B.03 parser, error renderer, locale message keys, retry helpers.
- HRP: producer/schema conformance va effective-user negative cases.
- Package maintainer: export-map/types/build tren old root consumers lan new ESM subpath.

Open Items
----------
| ID    | Item                                                           | Owner           |
| DIST-1 | Reserve version 0.0.9-contract02b.1 trong registry           | Package maintainer |
| DIST-2 | Xac nhan package placement (subpath vs separate package)       | Bilateral       |
| DIST-3 | Artifact storage (npm registry private hay internal registry)   | Operations      |
| DIST-4 | Consumer lockfile migration plan                                | CRM T1-B        |

Nhung gi task nay KHONG LAM
---------------------------
- Khong copy toan bo frozen package vao neutral bundle.
- Khong publish package.
- Khong reserve version trong registry.
- Khong tao npm token hay CI/CD pipeline.
- Khong commit built artifact vao repo (neu dung npm publish).
