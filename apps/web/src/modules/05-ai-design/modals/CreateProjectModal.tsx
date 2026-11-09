'use client';

import { type AiProviderId } from '@toantrung/contracts';
import { useStudio } from '../StudioContext';

export function CreateProjectModal() {
  const {
    handleCreateProject,
    leadOptions,
    newContactName,
    newLeadId,
    newProjectName,
    newProjectType,
    newPrompt,
    providerStatus,
    selectedModelId,
    selectedProviderId,
    setNewContactName,
    setNewLeadId,
    setNewProjectName,
    setNewProjectType,
    setNewPrompt,
    setSelectedModelId,
    setSelectedProviderId,
    setShowCreateModal,
    showCreateModal,
    submitting,
  } = useStudio();

  return (
    <>
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Tạo dự án thiết kế mới</h3>
            <form onSubmit={handleCreateProject} className="space-y-3.5 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Loại dự án:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewProjectType('perspective_3d')}
                    className={`rounded-xl p-2.5 font-bold border text-center transition ${
                      newProjectType === 'perspective_3d'
                        ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Phối cảnh 3D LED
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewProjectType('banner')}
                    className={`rounded-xl p-2.5 font-bold border text-center transition ${
                      newProjectType === 'banner'
                        ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Banner khung LED
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên dự án *:</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hồ sơ Lead liên kết (Tùy chọn):
                </label>
                <select
                  value={newLeadId}
                  onChange={(e) => setNewLeadId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">-- Không gắn Lead (Thiết kế độc lập) --</option>
                  {leadOptions.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Người liên hệ:</label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Tên khách hàng / đại diện dự án"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Con AI thực thi ban đầu:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedProviderId}
                    onChange={(e) => {
                      const nextPid = e.target.value as AiProviderId;
                      setSelectedProviderId(nextPid);
                      const cat = providerStatus?.availableProviders?.find(
                        (p) => p.providerId === nextPid
                      );
                      if (cat && cat.models.length > 0) {
                        setSelectedModelId(cat.activeModel || cat.models[0].id);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium"
                  >
                    {(providerStatus?.availableProviders || []).map((prov) => (
                      <option key={prov.providerId} value={prov.providerId}>
                        {prov.shortName}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium"
                  >
                    {(
                      providerStatus?.availableProviders?.find(
                        (p) => p.providerId === selectedProviderId
                      )?.models || [{ id: 'imagen-3.0-generate-002', name: 'Google Imagen 3 Pro' }]
                    ).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mô tả yêu cầu dựng ban đầu *:
                </label>
                <textarea
                  rows={2}
                  required
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#1E3A8A] px-5 py-2 text-sm font-bold text-white hover:bg-[#2563EB] shadow-xs"
                >
                  {submitting ? 'Đang khởi tạo...' : 'Tạo dự án'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
