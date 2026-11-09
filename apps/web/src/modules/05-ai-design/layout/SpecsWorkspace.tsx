'use client';

import { ParametersForm } from '../params/ParametersForm';
import { useStudio } from '../StudioContext';

export function SpecsWorkspace() {
  const { canUseAiDesign, handleSaveParameters, savingParams, setActiveWorkspaceArea } =
    useStudio();

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-100">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-2xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Thông số dự án & Cấu hình kỹ thuật LED
            </h2>
            <p className="text-sm text-slate-500">
              Mọi thay đổi được lưu trực tiếp vào hồ sơ dự án và giữ nguyên khi chuyển dự án hoặc
              tải lại trang.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveWorkspaceArea('perspective')}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Quay lại Phối cảnh
            </button>
            <button
              type="button"
              onClick={() => void handleSaveParameters()}
              disabled={savingParams || !canUseAiDesign}
              className="rounded-xl bg-[#1E3A8A] px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-[#2563EB] disabled:opacity-50"
            >
              {savingParams ? 'Đang lưu...' : 'Lưu thông số dự án'}
            </button>
          </div>
        </div>

        <ParametersForm compact={false} />
      </div>
    </div>
  );
}
