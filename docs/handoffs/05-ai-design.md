# Handoff 05-ai-design — Hỗ trợ thiết kế & phối cảnh AI (Giai đoạn 2)

Cập nhật: 06/11/2026.  
Nhóm 5 — Lý Tăng Hữu.  
Nhánh Git: `feature/ai-design`.  
Kho mã nguồn GitHub: `https://github.com/truongvanlong1905/ToanTrungMar` (nhánh `main`).

---

## 1. Hiện trạng & Nguồn nghiệp vụ chuẩn
- Đã tiếp nhận và phân tích toàn diện **Tài liệu đặc tả BA: UC06 (Hỗ trợ thiết kế & phối cảnh AI)** kèm Sơ đồ hoạt động, Sơ đồ tuần tự và BPMN As-is/To-be.
- Chi tiết đặc tả nghiệp vụ đầy đủ đã được ghi nhận tại [docs/modules/05-ai-design.md](../modules/05-ai-design.md).
- Mã nguồn hiện tại: Đã triển khai hoàn chỉnh (`apps/web/src/modules/05-ai-design/AiDesignWorkspace.tsx`, `apps/api/src/modules/05-ai-design/service.ts`, `packages/contracts/src/05-ai-design/index.ts`), bao gồm Studio 3 cột kéo thả 4 góc màn hình LED 3D, tạo Banner đa tỷ lệ, bảo vệ CSRF & chặn PII gửi sang AI, quản lý lịch sử phiên bản và tải ảnh hiện trạng/thành phẩm.

---

## 2. Các nghiệp vụ trọng tâm đã chốt
1. **Dựng nháp phối cảnh 3D màn hình LED bằng AI**:
   - Đầu vào: Ảnh hiện trạng công trình thực tế (từ máy hoặc đính kèm từ Lead UC01) + Chủng loại/kiểu dáng LED + Kích thước/vị trí trên ảnh + Prompt mô tả.
   - AI render màn hình LED 3D chân thực lên ảnh hiện trạng. Lưu vào Thư viện ấn phẩm, ghi nhận thời gian và chi phí token AI.
2. **Tạo hình ảnh & Banner bằng AI**:
   - Thiết lập kích thước pixel, tỷ lệ khung hình màn hình LED cần hiển thị.
   - AI sinh ảnh banner độ nét cao đúng tỷ lệ khung hình.
3. **Quản lý Thư viện ấn phẩm & Hoàn thiện**:
   - Lưu trữ bản nháp AI (`ai_draft_image_url`) và bản hoàn thiện sau khi Designer chỉnh sửa qua Photoshop/3DsMax (`final_render_url`).
   - Tải file độ phân giải cao bàn giao cho bộ phận Kinh doanh đính kèm báo giá.
4. **Bảo mật & Database Model (Đã hoàn thiện tại `packages/database/prisma/models/05-ai-design.prisma`)**:
   - Tuyệt đối không gửi thông tin cá nhân khách hàng (SĐT, email, tên công ty) sang AI bên thứ 3.
   - Gồm 2 bảng thuộc Nhóm 5: `design_requests` (hỗ trợ `lead_id` tùy chọn cho Banner độc lập, `version`, `approved_version_id`, `total_cost_micros BigInt?`) và `design_asset_versions` (`@@unique([design_request_id, version_number])`, lưu đầy đủ từng phiên bản nháp AI và bản hoàn thiện Designer).
   - Nhật ký từng lượt gọi AI (kể cả lỗi/timeout) dùng bảng chung `ai_usage_logs` tại `core.prisma` thông qua contract `recordAiUsageAttempt`. Quy tắc bắt buộc gắn Lead cho riêng phối cảnh 3D và điểm tạo ticket theo dõi tại [Q14](../decisions/OPEN_QUESTIONS.md#q14).

---

## 3. Cấu trúc mã sau đợt tách (task `M05-REFACTOR-STRUCTURE`)
- **FE** `apps/web/src/modules/05-ai-design/`: `AiDesignWorkspace.tsx` (bọc provider) → `StudioContext.tsx` + `hooks/useAiDesignStudio.ts` (toàn bộ state/handler) → `layout/ toolbar/ sidebar/ canvas/ versions/ dock/ params/ modals/ notifications/` (component chỉ lấy state qua `useStudio()`). Hàm thuần ở `lib/` (`led-specs`, `read-file`, `render-live-composite`, `design-utils`), kiểu ở `types.ts`.
- **BE** `apps/api/src/modules/05-ai-design/`: `service.ts` chỉ re-export; logic ở `domain/` (mapper, metadata, led-spec) và `services/` (query, command, generation, version, photo, provider-config).
- **Contracts** `packages/contracts/src/05-ai-design/`: `index.ts` re-export từ `constants / dto / providers.dto / schemas / pii-guard`.
- Chưa làm (bước tiếp theo): tách `useAiDesignStudio` thành các hook nhỏ, gom `apiRequest` vào `api/designApi.ts`, tách `providers/index.ts` (factory/catalog/config-store), tách `route.ts` theo `action`, chuyển test M05 khỏi `apps/api/src/core/__tests__/`.
- Kiểm tra: `tsc --noEmit` ở contracts/api/web không phát sinh lỗi mới (lỗi nền do Prisma client chưa generate). Chưa chạy `test:core` và chạy UI thủ công.


---

## Cập nhật 13/11/2026 — nút ẩn/hiện 2 cột bên (Studio)
- Nguyên nhân: commit `67fa0ad` bỏ nút ẩn/hiện cột Dự án/Trợ lý AI khỏi header nhưng chưa thêm tay nắm thay thế, nên khi cột đang mở không có nút ẩn riêng.
- Đã sửa: thêm `PanelToggleButton` (variant edge, `data-testid` `toggle-left-panel` / `toggle-right-panel`) ở mép `sidebar/ProjectsSidebar.tsx` và `dock/RightDock.tsx`; `aside` đổi sang `relative`, `overflow-hidden` chuyển xuống phần nội dung bên trong để tay nắm không bị cắt. Sửa lỗi class `text-[#1E3A8A"` thiếu `]` trong `RightDock.tsx`.
- Kiểm tra: `tsc --noEmit` ở `apps/web` 178 lỗi trước và sau (lỗi nền, Prisma chưa generate), không phát sinh lỗi mới. Chưa chạy UI thủ công.

---

## Cập nhật 13/11/2026 — rà soát giao diện Studio (đợt 2)
- `dock/PromptComposer.tsx`: hàng "Chế độ + Tạo phiên bản" cho phép xuống dòng, nút `flex-1 min-w-[9.5rem]` nên không còn bị cắt ở mép cột; thêm nhãn "Yêu cầu mới" cho ô nhập.
- `dock/AssistantPanel.tsx` + `dock/ChatHistory.tsx`: gom tóm tắt/chọn AI/lịch sử/mẫu prompt vào một vùng cuộn, ô nhập và cảnh báo PII ghim ở đáy; lịch sử không còn tự co về ~1 dòng; nhãn tin nhắn người dùng đổi thành "Yêu cầu đã gửi" để khác ô nhập.
- `dock/AiEngineSelector.tsx`: Provider và Model xếp dọc, rộng đủ dòng, có `title` tên đầy đủ.
- `sidebar/ProjectList.tsx`: tiêu đề tách 2 hàng (Dự án + Mới / Chọn nhiều + Lưu trữ); nút "Xóa" đổi nhãn "Chọn nhiều"; Sửa/Lưu trữ/Xóa gom vào menu ⋯ (giữ `data-testid` `edit-project-btn-*`, `delete-project-btn-*`, thêm `project-menu-btn-*`); tên dự án tối đa 2 dòng.
- `sidebar/AssetLibrary.tsx`: Đổi tên/Tải/Xóa thành icon có `title`/`aria-label`, nút Xóa tách xa hai nút còn lại.
- `canvas/CanvasStage.tsx`: khung neo 4 góc và nút "Khung neo LED" chỉ hiện ở "Ảnh gốc" và "Ghép 3D" (ở "Kết quả AI"/"So sánh" 4 chấm lệch khỏi màn hình LED trong ảnh đã render). Cần xác nhận lại với nghiệp vụ nếu Designer vẫn muốn kéo góc ngay trên ảnh kết quả.
- `layout/StudioLayout.tsx`: nút thu/hiện thanh công cụ trên chuyển từ giữa sang góc phải, không đè lên tab canvas; ẩn trên mobile.
- Chưa làm: tay nắm sidebar toàn app (`core/layout/WorkspaceShell.tsx`) bị sát mép trái ở ảnh chụp — thuộc phần dùng chung, chưa xác định nguyên nhân.
- Kiểm tra: chỉ đọc lại diff, chưa chạy `tsc`, test hay UI.

---

## Cập nhật 13/11/2026 — tách vai trò thanh ngang và cột phải
- Thanh ngang (`toolbar/StudioToolbar.tsx`) chỉ còn 2 tab: "Phối cảnh" và "Thông số" (bỏ tab "Tạo ảnh AI", test id `workspace-tab-assistant` không còn).
- Cột phải (`dock/RightDock.tsx`) chỉ chứa "Tạo ảnh AI" (`AssistantPanel`); bỏ tab "Thông số" và icon Thông số ở thanh icon khi thu gọn. Cột hiện từ md trở lên (trước đây từ lg) vì không còn tab nào để mở nó.
- Thông số chỉnh qua tab "Thông số" hoặc link "Sửa thông số" trong cột phải. `ParametersForm compact` không còn nơi dùng.
- Còn tồn: state `sideDockTab` và giá trị `'assistant'` của `activeWorkspaceArea` trong `useAiDesignStudio.ts` không còn được dùng, chưa dọn để tránh đụng hook lớn.
- Kiểm tra: chỉ đọc lại diff, chưa chạy `tsc`, test hay UI.

---

## Cập nhật 13/11/2026 — chuyển Đăng xuất về sidebar chính (phần dùng chung, theo yêu cầu trực tiếp)
- `apps/web/src/core/layout/WorkspaceShell.tsx` (ảnh hưởng mọi trang): header chỉ còn breadcrumb + chuông thông báo; bỏ chip tên/avatar và nút Đăng xuất; bỏ 2 slot rỗng `studio-header-slot` / `studio-header-left-slot` (không còn nơi nào portal vào).
- Sidebar: thêm nhãn nhóm (Nghiệp vụ / Cá nhân / Hệ thống, ẩn khi thu gọn); chân sidebar gồm thẻ tài khoản (avatar 36px, tên, vai trò, bấm vào `/profile`, có trạng thái active) và nút Đăng xuất đầy đủ chiều rộng; khi thu gọn còn avatar + icon, có tooltip. Mục nav "Tài khoản" bỏ vì thẻ tài khoản thay thế (mobile dùng drawer có cùng chân sidebar).
- Cần reviewer phần Core xem xét vì đây là phần dùng chung. Chưa chạy `tsc`, test hay UI.

---

## Cập nhật 13/11/2026 — menu tài khoản ở chân sidebar (phần dùng chung)
- `core/layout/WorkspaceShell.tsx`: chân sidebar là một nút tài khoản (avatar, tên, vai trò, mũi tên); bấm mở menu "Thông tin tài khoản" (`/profile`) và "Đăng xuất", có hiện email. Đóng bằng bấm ra ngoài, Escape, hoặc khi đổi trang. Khi sidebar thu gọn menu bung sang phải, khi mở rộng/drawer mobile bung lên trên nút.
- Thay cho nút Đăng xuất rời đã thêm ở đợt trước. Chưa chạy `tsc`, test hay UI.

---

## Cập nhật 13/11/2026 — tab Thông số: chỉ còn một nút Lưu
- `params/ParametersForm.tsx`: bỏ nút "Lưu thông số dự án" ở cuối cột 3 (và các biến không còn dùng). Form vẫn giữ `onSubmit`, nhưng không còn nút submit nên Enter trong ô nhập không tự lưu.
- `layout/SpecsWorkspace.tsx`: bỏ nút "Quay lại Phối cảnh" (quay lại bằng tab "Phối cảnh" trên thanh ngang); nút "Lưu thông số dự án" trên thanh ngang giữ `data-testid="save-project-params-btn"` của nút cũ.
- Chưa chạy `tsc`, test hay UI.
