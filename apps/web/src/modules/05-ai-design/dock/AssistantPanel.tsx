'use client';

import { ShieldAlert } from 'lucide-react';
import { AiEngineSelector } from './AiEngineSelector';
import { ChatHistory } from './ChatHistory';
import { PromptComposer } from './PromptComposer';
import { useStudio } from '../StudioContext';

export function AssistantPanel() {
  const {
    computedLiveSpecs,
    handlePromptChange,
    paramForm,
    piiAlert,
    selectedPhoto,
    setActiveWorkspaceArea,
    setViewMode,
  } = useStudio();

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden p-3">
      {/* Vùng cuộn: tóm tắt, chọn AI, lịch sử, mẫu prompt. Ô nhập luôn ghim ở đáy. */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
      {/* Context Summary Card */}
      <div className="mb-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
        <div className="flex items-start justify-between gap-2">
          <span className="min-w-0 break-words font-bold text-slate-900">
            {paramForm.projectName} ({paramForm.pixelPitch})
          </span>
          <button
            type="button"
            onClick={() => setActiveWorkspaceArea('specs')}
            className="shrink-0 whitespace-nowrap font-semibold text-[#2563EB] hover:underline"
          >
            Sửa thông số
          </button>
        </div>
        <div className="text-slate-600">
          Kích thước: {paramForm.screenWidthM}m × {paramForm.screenHeightM}m (
          {computedLiveSpecs.areaM2} m²) · Tỷ lệ {paramForm.aspectRatio}
        </div>
        <div className="text-slate-500 truncate">
          Ảnh gốc đang chọn: {selectedPhoto?.name || 'Ảnh chính diện showroom'}
        </div>
      </div>

      {/* Multi-AI Engine & Model Selector Card inside Right Dock */}
      <AiEngineSelector />

      {/* Conversation History */}
      <ChatHistory />

      {/* Quick Prompt Suggestions by LED Scenario */}
      <div className="mt-3 space-y-1.5 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-500">
          <span>Mẫu Prompt chuẩn kỹ thuật LED Toàn Trung:</span>
          <button
            type="button"
            onClick={() => setViewMode('live_3d')}
            className="text-[#2563EB] hover:underline font-bold"
          >
            Mở Ghép 3D Thực tế →
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
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
          ].map((item) => (
            <button
              key={item.tag}
              type="button"
              onClick={() => handlePromptChange(item.prompt)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-[#1E3A8A] transition"
              title={item.prompt}
            >
              + {item.tag}
            </button>
          ))}
        </div>
      </div>

      </div>

      {/* PII Security Guard (ghim cạnh ô nhập để luôn thấy cảnh báo) */}
      {piiAlert && (
        <div className="mt-2 flex shrink-0 items-start gap-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
          <ShieldAlert className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <span>{piiAlert}</span>
        </div>
      )}

      {/* Prompt Composer (ghim ở đáy, không bị cuộn mất) */}
      <PromptComposer />
    </div>
  );
}
