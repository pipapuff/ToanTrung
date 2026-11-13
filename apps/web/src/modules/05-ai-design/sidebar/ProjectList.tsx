'use client';

import { Archive, Edit2, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { resolveAssetUrl } from '../lib/design-utils';
import { DESIGN_TYPE_LABELS } from '@toantrung/contracts';
import { useStudio } from '../StudioContext';

export function ProjectList({ fill = false }: { fill?: boolean }) {
  const {
    bulkSelectMode,
    currentProject,
    filteredProjects,
    handleToggleArchiveProject,
    openMenuProjectId,
    openQuickEditProject,
    requestBulkDeleteProjects,
    requestDeleteProject,
    searchProject,
    selectedProjectIds,
    setBulkSelectMode,
    setMobilePane,
    setOpenMenuProjectId,
    setSearchProject,
    setSelectedProjectIds,
    setShowArchivedProjects,
    setShowCreateModal,
    showArchivedProjects,
    syncProjectSelection,
    toggleSelectProjectId,
  } = useStudio();

  return (
    <div className={`flex flex-col min-h-0 ${fill ? 'flex-1' : 'basis-1/2'} p-3.5`}>
      <div className="mb-1.5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <h2 className="text-base font-semibold text-slate-900 whitespace-nowrap">Dự án</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
            {filteredProjects.length}
          </span>
        </div>
        <button
          type="button"
          data-testid="create-new-project-btn"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#1E3A8A] px-2.5 py-1 text-xs font-bold text-white shadow-2xs transition hover:bg-[#2563EB]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Mới</span>
        </button>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-1 shrink-0">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setBulkSelectMode((v) => {
                if (v) setSelectedProjectIds([]);
                return !v;
              });
            }}
            className={`whitespace-nowrap rounded-lg px-2 py-1 text-xs font-semibold transition ${
              bulkSelectMode || selectedProjectIds.length > 0
                ? 'bg-blue-50 text-[#1E3A8A] border border-blue-200'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
            title="Chọn nhiều dự án để xóa nhanh cùng lúc"
          >
            {bulkSelectMode ? 'Bỏ chọn' : 'Chọn nhiều'}
          </button>
          <button
            type="button"
            onClick={() => setShowArchivedProjects((v) => !v)}
            className={`whitespace-nowrap rounded-lg px-2 py-1 text-xs font-semibold transition ${
              showArchivedProjects
                ? 'bg-amber-100 text-amber-800'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
            title="Hiện/ẩn dự án đã lưu trữ"
          >
            Lưu trữ
          </button>
        </div>
      </div>

      {/* Bulk Action Bar when bulkSelectMode is active or projects are ticked */}
      {(bulkSelectMode || selectedProjectIds.length > 0) && (
        <div className="mb-2 flex items-center justify-between rounded-xl border border-blue-200/80 bg-blue-50/60 px-2.5 py-1.5 text-xs shrink-0">
          <label className="flex cursor-pointer items-center gap-1.5 font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={
                filteredProjects.length > 0 &&
                filteredProjects.every((p) => selectedProjectIds.includes(p.id))
              }
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedProjectIds(filteredProjects.map((p) => p.id));
                } else {
                  setSelectedProjectIds([]);
                }
              }}
              className="h-3.5 w-3.5 rounded border-slate-300 text-[#1E3A8A]"
            />
            <span>Tất cả ({selectedProjectIds.length})</span>
          </label>
          <button
            type="button"
            disabled={selectedProjectIds.length === 0}
            onClick={requestBulkDeleteProjects}
            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-red-700 disabled:opacity-40"
          >
            <Trash2 className="h-3 w-3" />
            <span>Xóa ({selectedProjectIds.length})</span>
          </button>
        </div>
      )}

      <div className="mb-2 shrink-0">
        <input
          type="text"
          placeholder="Tìm tên dự án, mã Lead..."
          value={searchProject}
          onChange={(e) => setSearchProject(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#2563EB] focus:bg-white focus:outline-none"
        />
      </div>

      {/* Scrollable Project List */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1 pb-28">
        {filteredProjects.map((proj) => {
          const isSelected = proj.id === currentProject?.id;
          const isCheckedForBulk = selectedProjectIds.includes(proj.id);
          const photoThumb = resolveAssetUrl(proj.photos[0]?.url || proj.sitePhotoDownloadUrl);

          return (
            <div
              key={proj.id}
              data-testid={`project-item-${proj.id}`}
              title={[
                proj.projectName,
                proj.leadCode ? `Lead ${proj.leadCode}` : null,
                proj.isArchived ? 'Đã lưu trữ' : null,
              ]
                .filter(Boolean)
                .join(' · ')}
              onClick={() => {
                syncProjectSelection(proj);
                setOpenMenuProjectId(null);
                setMobilePane('canvas');
              }}
              className={`group relative flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left transition cursor-pointer border ${
                isSelected
                  ? 'border-[#2563EB]/40 bg-blue-50/80 shadow-2xs'
                  : 'border-transparent hover:border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {(bulkSelectMode || selectedProjectIds.length > 0) && (
                  <input
                    type="checkbox"
                    checked={isCheckedForBulk}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleSelectProjectId(proj.id)}
                    className="h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-[#1E3A8A]"
                    title="Chọn dự án này"
                  />
                )}
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                  <img
                    src={photoThumb}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="line-clamp-2 break-words text-sm font-semibold leading-tight text-slate-900">
                      {proj.projectName}
                    </span>
                    <span
                      aria-label={proj.status === 'completed' ? 'Đã hoàn thành' : 'Đang thực hiện'}
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        proj.isArchived
                          ? 'bg-slate-300'
                          : proj.status === 'completed'
                            ? 'bg-emerald-500'
                            : 'bg-blue-500'
                      }`}
                    />
                  </div>
                  <div className="truncate text-[11px] text-slate-500">
                    {proj.leadCode ? `Lead: ${proj.leadCode}` : DESIGN_TYPE_LABELS[proj.designType]}
                  </div>
                </div>
              </div>

              {/* Menu thao tác (⋯): nhường chỗ cho tên dự án, vẫn đủ nhãn chữ */}
              <div className="relative shrink-0 ml-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  data-testid={`project-menu-btn-${proj.id}`}
                  aria-haspopup="menu"
                  aria-expanded={openMenuProjectId === proj.id}
                  aria-label={`Thao tác dự án ${proj.projectName}`}
                  title="Sửa / Lưu trữ / Xóa"
                  onClick={() => setOpenMenuProjectId(openMenuProjectId === proj.id ? null : proj.id)}
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white hover:text-[#1E3A8A] hover:shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {openMenuProjectId === proj.id && (
                  <>
                    <button
                      type="button"
                      aria-label="Đóng menu"
                      tabIndex={-1}
                      onClick={() => setOpenMenuProjectId(null)}
                      className="fixed inset-0 z-20 cursor-default"
                    />
                    <div
                      role="menu"
                      className="absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-xs font-semibold shadow-lg"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        data-testid={`edit-project-btn-${proj.id}`}
                        onClick={() => {
                          setOpenMenuProjectId(null);
                          openQuickEditProject(proj);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-blue-50 hover:text-[#1E3A8A]"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Sửa nhanh</span>
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenMenuProjectId(null);
                          handleToggleArchiveProject(proj);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                      >
                        <Archive className="h-3.5 w-3.5" />
                        <span>{proj.isArchived ? 'Khôi phục' : 'Lưu trữ'}</span>
                      </button>
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        type="button"
                        role="menuitem"
                        data-testid={`delete-project-btn-${proj.id}`}
                        onClick={() => {
                          setOpenMenuProjectId(null);
                          requestDeleteProject(proj);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Xóa dự án</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
