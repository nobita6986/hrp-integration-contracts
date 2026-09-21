# RECONCILIATION PROTOCOL

Tài liệu này định nghĩa giao thức giao tiếp và đồng thuận bằng chứng (Evidence Reconciliation) giữa Hệ thống HRP và Hệ thống CRM, diễn ra thông qua Neutral Repository `hrp-integration-contracts`.

## 1. Lưu trữ và Giao tiếp
- **Git lưu artifact:** Mọi bằng chứng, kết luận và quyết định phải được commit dưới dạng file Markdown/JSON vào Git của Neutral Repository (`reconciliation/hrp/...` hoặc `reconciliation/crm/...`).
- **Owner chuyển message:** Việc giao tiếp giữa Tier 0 HRP và Tier 0 CRM do Owner thực hiện thông qua Message-ID. Không dùng bot, service hay webhook tự động.
- **Không tự động:** Yêu cầu sự can thiệp thủ công của Tier 0 để đảm bảo tính pháp lý và kiến trúc.

## 2. Acceptance Anchor & Immutable Commits
- **Immutable commit SHA:** Điểm neo (Anchor) để kiểm định sự chấp thuận phải là một mã băm Git (Full SHA) bất biến. Không bao giờ dùng tên nhánh (branch name) làm bằng chứng cho trạng thái `ACCEPTED_SHARED`.
- **Revision mới ghi supersedes:** Mỗi khi có sự thay đổi, phải tạo thư mục/revision mới (VD: `r2` ghi đè logic của `r1`). Phải ghi chú rõ revision mới `supersedes` revision cũ.
- **Không sửa âm thầm (No stealth edits):** Không sửa lại nội dung của một revision đã được review.
- **Không force-push:** Tuyệt đối không dùng `git push --force` lên nhánh lưu bằng chứng.
- **Không ghi đè:** Không ghi đè bundle revision cũ của CRM hay HRP.

## 3. Khái niệm Xác nhận (ACK vs. ACCEPTED_SHARED)
- **ACK chỉ xác nhận nhận và verify:** Khi một bên trả lời `ACK`, nó chỉ có nghĩa là "Đã nhận bundle và verify manifest thành công". Nó **KHÔNG** mang ý nghĩa chấp thuận nghiệp vụ (Semantic acceptance).
- **HRP và CRM confirmation tách riêng:** Việc HRP xác nhận (HRP_IMPLEMENTED) không có nghĩa là CRM đã xác nhận, và ngược lại.
- **ACCEPTED_SHARED:** Trạng thái này chỉ đạt được khi CẢ HAI PHÍA (Tier 0 HRP và Tier 0 CRM) đều xác nhận đồng thuận trên CÙNG MỘT REVISION và CÙNG MỘT BASELINE.
- **Quyết định Breaking:** Các thay đổi mang tính phá vỡ cấu trúc nghiệp vụ hoặc dữ liệu phải được đệ trình lên Owner quyết định. Tier 1/Tier 0 không tự quyết định breaking semantics.

## 4. Quy tắc Manifest
- **Manifest bảo vệ tính toàn vẹn:** Mỗi bundle phải có file `manifest.sha256` chứa mã băm SHA-256 của toàn bộ các file trong thư mục.
- **Không hash chính nó:** `manifest.sha256` không được chứa hash của chính nó.
- **Chuẩn hóa Line Endings:** Khuyến nghị dùng raw Git blob hash hoặc cấu hình `core.autocrlf=false` để tránh lỗi sai lệch hash giữa Windows (CRLF) và Linux (LF).
