'use client';

import { Check, Trash2 } from 'lucide-react';
import { useStudio } from '../StudioContext';

export function QuickEditModal() {
  const {
    currentProject,
    editingName,
    handleRenameProject,
    leadOptions,
    quickEditContactName,
    quickEditDesignType,
    quickEditHeightM,
    quickEditInstallInfo,
    quickEditLeadId,
    quickEditPitch,
    quickEditWidthM,
    renameTargetId,
    renameValue,
    requestDeleteProject,
    requests,
    savingQuickEdit,
    setEditingName,
    setQuickEditContactName,
    setQuickEditDesignType,
    setQuickEditHeightM,
    setQuickEditInstallInfo,
    setQuickEditLeadId,
    setQuickEditPitch,
    setQuickEditWidthM,
    setRenameTargetId,
    setRenameValue,
  } = useStudio();

  return (
    <>
      {editingName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">Sửa nhanh thông tin dự án</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cập nhật nhanh tên dự án, loại thiết kế, hồ sơ Lead liên kết và kích thước màn
                  hình LED
                </p>
              </div>
              <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#1E3A8A] border border-blue-200">
                DA-{String(renameTargetId || currentProject?.id || 1).padStart(4, '0')}
              </span>
            </div>

            <form onSubmit={handleRenameProject} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Tên dự án thiết kế <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  data-testid="quick-edit-project-name-input"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-900 focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Loại dự án
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickEditDesignType('perspective_3d')}
                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                      quickEditDesignType === 'perspective_3d'
                        ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Phối cảnh 3D LED
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickEditDesignType('banner')}
                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                      quickEditDesignType === 'banner'
                        ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Banner khung LED
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hồ sơ Lead liên kết:
                  </label>
                  <select
                    value={quickEditLeadId}
                    onChange={(e) => setQuickEditLeadId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value="">-- Không gắn Lead --</option>
                    {leadOptions.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Người liên hệ:
                  </label>
                  <input
                    type="text"
                    value={quickEditContactName}
                    onChange={(e) => setQuickEditContactName(e.target.value)}
                    placeholder="Tên khách hàng / đại diện"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dòng Pitch LED:
                  </label>
                  <select
                    value={quickEditPitch}
                    onChange={(e) => setQuickEditPitch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-800"
                  >
                    {[
                      'P1.25',
                      'P1.53',
                      'P1.86',
                      'P2.0',
                      'P2.5',
                      'P3.0',
                      'P4.0',
                      'P5.0',
                      'P8.0',
                      'P10',
                    ].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngang (m):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    value={quickEditWidthM}
                    onChange={(e) => setQuickEditWidthM(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cao (m):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    value={quickEditHeightM}
                    onChange={(e) => setQuickEditHeightM(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vị trí lắp đặt / Ghi chú công trình:
                </label>
                <input
                  type="text"
                  value={quickEditInstallInfo}
                  onChange={(e) => setQuickEditInstallInfo(e.target.value)}
                  placeholder="VD: Sảnh chính tầng 1, cách sàn 1.2m..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const targetProj = requests.find(
                      (r) => r.id === (renameTargetId || currentProject?.id)
                    );
                    setEditingName(false);
                    setRenameTargetId(null);
                    if (targetProj) {
                      requestDeleteProject(targetProj);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/70 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Xóa dự án này</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingName(false);
                      setRenameTargetId(null);
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    data-testid="quick-edit-save-btn"
                    disabled={savingQuickEdit || !renameValue.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#2563EB] disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{savingQuickEdit ? 'Đang lưu...' : 'Lưu cập nhật'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
