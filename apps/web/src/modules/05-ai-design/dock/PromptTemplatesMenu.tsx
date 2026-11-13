'use client';

import { Box } from 'lucide-react';
import { useStudio } from '../StudioContext';
import { MENU_BODY, MENU_FOOTER, MENU_SURFACE, MENU_TITLE } from './menuStyles';

/** Mẫu prompt chuẩn kỹ thuật LED Toàn Trung. */
export const PROMPT_TEMPLATES = [
  {
    tag: 'Hội trường P2.5',
    prompt:
      'Giữ nguyên nội thất phòng họp/hội trường, lắp màn hình LED P2.5 không viền hiển thị slide hội nghị Toàn Trung nền xanh navy sắc nét',
  },
  {
    tag: 'Showroom 4K',
    prompt:
      'Giữ nguyên kiến trúc showroom, hiển thị video đại dương 4K độ tương phản cao, ánh sáng phản chiếu nhẹ xuống sàn',
  },
  {
    tag: 'Tòa nhà Outdoor',
    prompt:
      'Màn hình LED P4 Outdoor gắn mặt tiền tòa nhà thương mại, độ sáng cao 5500 nits hiển thị thương hiệu bất động sản',
  },
  {
    tag: 'Nhà máy Andon',
    prompt:
      'Bảng điện tử LED hiển thị năng suất chuyền sản xuất & chỉ số an toàn lao động trong nhà xưởng công nghiệp',
  },
] as const;

/**
 * Menu của nút "+": chọn mẫu prompt (chỉ điền vào ô nhập, KHÔNG gửi ngay)
 * và mở chế độ Ghép 3D thực tế (ghim ở chân menu, luôn thấy).
 */
export function PromptTemplatesMenu({
  onPick,
  onClose,
}: {
  onPick: (prompt: string) => void;
  onClose: () => void;
}) {
  const { setViewMode } = useStudio();

  return (
    <div role="menu" aria-label="Mẫu prompt" className={MENU_SURFACE}>
      <div className={MENU_BODY}>
        <div className={MENU_TITLE}>Mẫu prompt</div>
        {PROMPT_TEMPLATES.map((item) => (
          <button
            key={item.tag}
            type="button"
            role="menuitem"
            title={item.prompt}
            onClick={() => onPick(item.prompt)}
            className="block w-full rounded-lg px-2.5 py-1.5 text-left transition hover:bg-white hover:shadow-2xs"
          >
            <span className="block font-semibold text-slate-800">{item.tag}</span>
            <span className="block truncate text-[11px] text-slate-500">{item.prompt}</span>
          </button>
        ))}
      </div>

      <div className={MENU_FOOTER}>
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            setViewMode('live_3d');
            onClose();
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left font-semibold text-slate-700 transition hover:bg-white hover:text-[#1E3A8A]"
        >
          <Box className="h-4 w-4 text-[#2563EB]" />
          <span>Ghép 3D thực tế</span>
        </button>
      </div>
    </div>
  );
}
