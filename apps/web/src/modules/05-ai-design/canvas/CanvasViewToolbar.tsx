'use client';

import { Wand2 } from 'lucide-react';
import { useStudio } from '../StudioContext';

export function CanvasViewToolbar() {
  const {
    canUseAiDesign,
    currentProject,
    currentVersion,
    handleSaveLiveCompositeToVersion,
    live3dTheme,
    savingComposite,
    setLive3dTheme,
    setViewMode,
    viewMode,
  } = useStudio();

  return (
    <div className="absolute left-3 top-3 z-20 flex flex-wrap items-center gap-2">
      <div
        role="group"
        aria-label="Chế độ xem ảnh"
        className="flex items-center rounded-lg bg-white/95 p-0.5 text-[13px] font-semibold shadow-md ring-1 ring-slate-200"
      >
        {(
          [
            { id: 'original', label: 'Ảnh gốc' },
            { id: 'result', label: 'Kết quả AI' },
            { id: 'live_3d', label: 'Ghép 3D Thực tế' },
            { id: 'compare', label: 'So sánh' },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            data-testid={`view-mode-${m.id}`}
            aria-pressed={viewMode === m.id}
            onClick={() => setViewMode(m.id)}
            className={`rounded-md px-3 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] ${
              viewMode === m.id ? 'bg-[#1E3A8A] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      {currentVersion && viewMode === 'result' && (
        <span className="rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-white">
          v{currentVersion.versionNumber} · {currentVersion.modelUsed || 'AI Studio'} ·{' '}
          {currentProject?.aspectRatio || '16:9'}
        </span>
      )}
      {viewMode === 'live_3d' && (
        <div className="flex items-center gap-1.5 rounded-lg bg-white/95 px-2 py-1 text-xs shadow-md ring-1 ring-slate-200">
          <span className="font-semibold text-slate-700">Màn hình:</span>
          <select
            value={live3dTheme}
            onChange={(e) =>
              setLive3dTheme(
                e.target.value as
                  | 'ai_version'
                  | 'conference_navy'
                  | 'ocean_4k'
                  | 'gala_stage'
                  | 'factory_andon'
              )
            }
            className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs font-semibold text-slate-800 focus:outline-none"
          >
            <option value="conference_navy">Hội nghị Toàn Trung (Xanh Navy)</option>
            <option value="ocean_4k">Đại dương 4K Showroom</option>
            <option value="gala_stage">Sân khấu Sự kiện Gala</option>
            <option value="factory_andon">Bảng Năng suất Nhà máy (Andon)</option>
            <option value="ai_version">Ghép ảnh Phiên bản AI đang chọn</option>
          </select>
          {canUseAiDesign && (
            <button
              type="button"
              onClick={handleSaveLiveCompositeToVersion}
              disabled={savingComposite}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 disabled:opacity-50"
              title="Xuất ảnh hiện trạng đã ghép màn hình LED 4 góc thành phiên bản thiết kế mới trong Kho ảnh"
            >
              <Wand2 className="h-3 w-3" />
              <span>
                {savingComposite
                  ? 'Đang kết xuất...'
                  : `Lưu bản ghép (v${(currentProject?.assetVersions.length || 0) + 1})`}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
