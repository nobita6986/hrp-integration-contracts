# Phạm vi Producer recheck

- Authorization: Owner yêu cầu tiếp tục xử lý CRM-HRP-MSG-038; producer review theo accepted spec, không sửa module CRM.
- In scope: candidate `272e883ef48c552054849905d7b75695b7ac4d8f`, correction probe HRP và recheck F-01/F-03/F-04/F-05/F-06/I-01; F-02 wire shape carry-forward/recheck.
- Network profile: Git remote và npm registry chỉ để lấy source/dependencies. Không gọi HRP/CRM runtime hay DB.
- Writes: chỉ bundle evidence mới này. Không sửa source/tests/config CRM; giữ branch/worktree/evidence cũ nguyên trạng.
- Inputs: synthetic IDs/tokens; không credential, dữ liệu cá nhân hoặc registration thật.
- Exclusions: signature execution, replay consumption, effective authorization, RLS, browser/session integration, cleanup transaction, packaging/publish/merge/deploy.
- Flavor: null; báo cáo producer review với evidence/callflow, không phải pentest production.
