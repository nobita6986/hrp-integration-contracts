# RECONCILIATION PROTOCOL (Revision 2)

Tài liệu này định nghĩa giao thức giao tiếp và đồng thuận bằng chứng (Evidence Reconciliation) giữa Hệ thống HRP và Hệ thống CRM, diễn ra thông qua Neutral Repository `hrp-integration-contracts`.

## 1. Lưu trữ và Giao tiếp (Message Sequence)
- **Git lưu artifact:** Mọi bằng chứng, kết luận và quyết định phải được commit dưới dạng file Markdown/JSON vào Git của Neutral Repository (`reconciliation/hrp/...` hoặc `reconciliation/crm/...`).
- **Message Sequence:** Việc giao tiếp giữa Tier 0 HRP và Tier 0 CRM do Owner thực hiện thông qua tuần tự Message-ID (Ví dụ: `HRP-CRM-MSG-001` -> `CRM-HRP-MSG-002`). Không dùng bot, service hay webhook tự động.
- **Không tự động:** Yêu cầu sự can thiệp thủ công của Tier 0 để đảm bảo tính pháp lý và kiến trúc.

## 2. Các Mức Độ Xác Nhận
- **Integrity ACK:** Tin nhắn ACK (như `CRM-HRP-MSG-002`) chỉ xác nhận đã nhận bundle và verify manifest thành công (INTEGRITY_ONLY). Nó **KHÔNG** mang ý nghĩa chấp thuận nghiệp vụ (Semantic acceptance).
- **Semantic Response:** Sau khi ACK, bên nhận phải có phản hồi chi tiết về nội dung (Semantic Response) cho các đề xuất hoặc GAP report.
- **Decision Acceptance (ACCEPTED_SHARED):** Trạng thái này chỉ đạt được khi CẢ HAI PHÍA (Tier 0 HRP và Tier 0 CRM) đều xác nhận đồng thuận (Bilateral Acceptance) trên CÙNG MỘT REVISION và CÙNG MỘT BASELINE. HRP xác nhận không có nghĩa CRM đã xác nhận và ngược lại.

## 3. Acceptance Anchor, Supersedes Rule & Revision Pinning
- **Revision Pinning (Immutable commit SHA):** Điểm neo (Anchor) để kiểm định sự chấp thuận phải là một mã băm Git (Full SHA) bất biến. Không bao giờ dùng tên nhánh (branch name) làm bằng chứng cho trạng thái `ACCEPTED_SHARED`.
- **Supersedes Rule:** Mỗi khi có sự thay đổi, phải tạo thư mục/revision mới (VD: `r2` ghi đè logic của `r1`). Phải ghi chú rõ revision mới `supersedesCommit` của revision cũ.
- **Không sửa âm thầm (No stealth edits):** Không sửa lại nội dung của một revision đã được review. R1 vẫn immutable và không bị ghi đè.
- **Không force-push:** Tuyệt đối không dùng `git push --force` lên nhánh lưu bằng chứng.

## 4. Encoding Policy & Quy tắc Manifest
- **Encoding Policy:** Tất cả các file Markdown, JSON và manifest phải được lưu với định dạng UTF-8, Line Endings là LF (không dùng CRLF) và Không có BOM (No BOM).
- **Manifest bảo vệ tính toàn vẹn:** Mỗi bundle phải có file `manifest.sha256` chứa mã băm SHA-256 của toàn bộ các file trong thư mục.
- **Raw Git Blob Hash Verification:** Manifest hash raw bytes của file theo đúng chuẩn LF để tránh sai lệch hash giữa các hệ điều hành (Windows CRLF vs Linux LF).
- **Không hash chính nó:** `manifest.sha256` không được chứa hash của chính nó.
