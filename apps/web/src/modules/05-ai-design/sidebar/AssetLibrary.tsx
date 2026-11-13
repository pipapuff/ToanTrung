'use client';

import { Download, Edit2, FolderOpen, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { resolveAssetUrl } from '../lib/design-utils';
import { apiRequest } from '@/core/http/client';
import { useStudio } from '../StudioContext';

export function AssetLibrary() {
  const {
    assetFolder,
    canUseAiDesign,
    currentProject,
    currentVersion,
    handleDownloadProjectZip,
    handleImportLeadPhotos,
    handleUploadDesignerFinal,
    handleUploadTechnicalPhotos,
    loadData,
    selectedAssetIds,
    setActiveWorkspaceArea,
    setAssetFolder,
    setConfirmModal,
    setPromptModal,
    setSelectedVersionId,
    setSuccessToast,
    setViewMode,
    toggleAssetSelection,
    uploadingFinalFile,
    uploadingPhoto,
    user,
  } = useStudio();

  return (
    <div className="flex flex-col flex-1 min-h-0 p-3.5 bg-slate-50/50">
      <div className="mb-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <FolderOpen className="h-4 w-4 text-[#1E3A8A]" />
          <h3 className="text-sm font-bold text-slate-900">Kho ảnh dự án</h3>
        </div>
        <button
          type="button"
          onClick={() =>
            handleDownloadProjectZip(assetFolder === 'technical' ? 'technical' : 'designs')
          }
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-[#1E3A8A] hover:bg-blue-50 transition"
          title="Tải xuống thư mục đang chọn dưới dạng ZIP"
        >
          <Download className="h-3 w-3" />
          <span>
            {selectedAssetIds.length > 0 ? `Tải ZIP (${selectedAssetIds.length})` : 'Tải ZIP'}
          </span>
        </button>
      </div>

      {/* Folder Tabs: "Ảnh kỹ thuật" vs "Bản thiết kế" */}
      <div className="mb-2.5 grid grid-cols-2 gap-1 rounded-xl bg-slate-200/70 p-1 text-xs font-bold shrink-0">
        <button
          type="button"
          data-testid="folder-tab-technical"
          onClick={() => setAssetFolder('technical')}
          className={`rounded-lg py-1.5 transition ${
            assetFolder === 'technical'
              ? 'bg-white text-[#1E3A8A] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ảnh kỹ thuật ({currentProject?.photos.length || 0})
        </button>
        <button
          type="button"
          data-testid="folder-tab-designs"
          onClick={() => setAssetFolder('designs')}
          className={`rounded-lg py-1.5 transition ${
            assetFolder === 'designs'
              ? 'bg-white text-[#1E3A8A] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Bản thiết kế ({currentProject?.assetVersions.length || 0})
        </button>
      </div>

      {/* Folder Content List */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
        {assetFolder === 'technical' ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              {currentProject?.photos.map((photo) => {
                const resolvedSrc = resolveAssetUrl(photo.url);
                const isChecked = selectedAssetIds.includes(photo.id);
                return (
                  <div
                    key={photo.id}
                    onClick={async () => {
                      if (!currentProject) return;
                      setViewMode('original');
                      await apiRequest(`/api/v1/design/${currentProject.id}`, {
                        method: 'PATCH',
                        csrfToken: user?.csrfToken,
                        body: {
                          action: 'update_project',
                          selectedPhotoId: photo.id,
                        },
                      });
                      await loadData(currentProject.id);
                    }}
                    className={`group relative cursor-pointer overflow-hidden rounded-xl border bg-white transition ${
                      photo.selected
                        ? 'border-[#2563EB] ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="relative aspect-video w-full bg-slate-900">
                      <img
                        src={resolvedSrc}
                        alt={photo.name}
                        className="h-full w-full object-cover"
                      />
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleAssetSelection(photo.id)}
                        className="absolute left-1.5 top-1.5 h-3.5 w-3.5 rounded border-white"
                        title="Chọn ảnh để tải gói ZIP"
                      />
                      {photo.selected && (
                        <span className="absolute right-1.5 top-1.5 rounded bg-[#1E3A8A] px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                          Đang dùng
                        </span>
                      )}
                    </div>
                    <div className="p-1.5 text-xs">
                      <div className="truncate font-semibold text-slate-800">{photo.name}</div>
                      <div
                        className="mt-1 flex items-center gap-0.5 text-[11px] text-slate-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (!currentProject) return;
                            const targetPid = currentProject.id;
                            setPromptModal({
                              title: 'Đổi tên ảnh kỹ thuật',
                              label: 'Tên hiển thị mới cho ảnh hiện trạng:',
                              value: photo.name,
                              placeholder: 'VD: Mặt tiền sảnh chính góc rộng',
                              onConfirm: async (nextName) => {
                                await apiRequest(`/api/v1/design/${targetPid}`, {
                                  method: 'PATCH',
                                  csrfToken: user?.csrfToken,
                                  body: {
                                    action: 'update_project',
                                    renamePhotoId: photo.id,
                                    renamePhotoName: nextName.trim(),
                                  },
                                });
                                setSuccessToast(
                                  `Đã đổi tên ảnh kỹ thuật thành "${nextName.trim()}".`
                                );
                                await loadData(targetPid);
                              },
                            });
                          }}
                          title="Đổi tên ảnh"
                          aria-label={`Đổi tên ảnh ${photo.name}`}
                          className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-[#2563EB]"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <a
                          href={resolvedSrc}
                          download={photo.name}
                          target="_blank"
                          rel="noreferrer"
                          title="Tải ảnh về máy"
                          aria-label={`Tải ảnh ${photo.name}`}
                          className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-[#1E3A8A]"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                        <span className="flex-1" />
                        <button
                          type="button"
                          onClick={() => {
                            if (!currentProject) return;
                            const targetPid = currentProject.id;
                            setConfirmModal({
                              title: 'Xóa ảnh kỹ thuật',
                              subtitle: `Dự án: ${currentProject.projectName}`,
                              message: `Bạn có chắc chắn muốn xóa ảnh hiện trạng "${photo.name}" khỏi kho ảnh dự án?`,
                              confirmLabel: 'Xóa ảnh này',
                              onConfirm: async () => {
                                await apiRequest(
                                  `/api/v1/design/${targetPid}?photoId=${encodeURIComponent(photo.id)}`,
                                  {
                                    method: 'DELETE',
                                    csrfToken: user?.csrfToken,
                                  }
                                );
                                setSuccessToast(`Đã xóa ảnh kỹ thuật "${photo.name}".`);
                                await loadData(targetPid);
                              },
                            });
                          }}
                          title="Xóa ảnh khỏi kho"
                          aria-label={`Xóa ảnh ${photo.name}`}
                          className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upload Multiple Technical Photos & Import from Lead */}
            <div className="pt-1 space-y-1.5">
              <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 transition hover:border-[#2563EB] hover:bg-blue-50/40 hover:text-[#1E3A8A]">
                <Upload className="h-3.5 w-3.5" />
                <span>{uploadingPhoto ? 'Đang tải ảnh...' : 'Tải ảnh kỹ thuật (Nhiều tệp)'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleUploadTechnicalPhotos}
                />
              </label>

              {currentProject?.leadId && (
                <button
                  type="button"
                  onClick={handleImportLeadPhotos}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/60 py-1.5 text-xs font-semibold text-[#1E3A8A] hover:bg-blue-100 transition"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Nhập ảnh khảo sát từ hồ sơ Lead</span>
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              {currentProject?.assetVersions.map((ver) => {
                const thumbUrl = `/api/v1/design/asset/${ver.id}`;
                const isSelectedVer = ver.id === currentVersion?.id;
                const isChecked = selectedAssetIds.includes(`ver-${ver.id}`);
                return (
                  <div
                    key={ver.id}
                    onClick={() => {
                      setSelectedVersionId(ver.id);
                      setViewMode('result');
                      setActiveWorkspaceArea('perspective');
                    }}
                    className={`group relative cursor-pointer overflow-hidden rounded-xl border bg-white transition ${
                      isSelectedVer
                        ? 'border-[#2563EB] ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="relative aspect-video w-full bg-slate-900">
                      <img
                        src={thumbUrl}
                        alt={`Phiên bản v${ver.versionNumber}`}
                        className="h-full w-full object-cover"
                      />
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleAssetSelection(`ver-${ver.id}`)}
                        className="absolute left-1.5 top-1.5 h-3.5 w-3.5 rounded border-white"
                        title="Chọn bản thiết kế để tải ZIP"
                      />
                      {ver.isApprovedFinal && (
                        <span className="absolute right-1.5 top-1.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                          Bản chốt
                        </span>
                      )}
                    </div>
                    <div className="p-1.5 text-xs">
                      <div className="truncate font-bold text-slate-800">
                        v{ver.versionNumber} ·{' '}
                        {ver.sourceType === 'DESIGNER_FINAL_UPLOAD'
                          ? 'Bản Designer'
                          : ver.modelUsed || 'Bản AI'}
                      </div>
                      <div className="truncate text-[11px] text-slate-500">
                        {ver.promptUsed || `Phiên bản v${ver.versionNumber}`}
                      </div>
                      <div
                        className="mt-1 flex items-center justify-between text-[11px] text-slate-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (!currentProject) return;
                            const targetPid = currentProject.id;
                            setPromptModal({
                              title: `Đổi tên / ghi chú phiên bản v${ver.versionNumber}`,
                              label: 'Tên hoặc ghi chú hiển thị của phiên bản thiết kế:',
                              value: ver.promptUsed || `Bản thiết kế v${ver.versionNumber}`,
                              placeholder: 'VD: Bản chốt phối cảnh sảnh chính P2.5',
                              onConfirm: async (nextLabel) => {
                                await apiRequest(`/api/v1/design/${targetPid}`, {
                                  method: 'PATCH',
                                  csrfToken: user?.csrfToken,
                                  body: {
                                    action: 'update_project',
                                    renameVersionId: ver.id,
                                    renameVersionLabel: nextLabel.trim(),
                                  },
                                });
                                setSuccessToast(
                                  `Đã cập nhật ghi chú phiên bản v${ver.versionNumber}.`
                                );
                                await loadData(targetPid);
                              },
                            });
                          }}
                          title="Đổi tên / ghi chú phiên bản"
                          aria-label={`Đổi tên phiên bản v${ver.versionNumber}`}
                          className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-[#2563EB]"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <a
                          href={thumbUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Tải ảnh phiên bản"
                          aria-label={`Tải ảnh phiên bản v${ver.versionNumber}`}
                          className="rounded-md p-1.5 text-[#1E3A8A] transition hover:bg-blue-50"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upload Final Render by Designer */}
            {canUseAiDesign && (
              <label className="mt-1 flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-blue-300 bg-white py-2 text-xs font-semibold text-[#1E3A8A] transition hover:bg-blue-50">
                <Upload className="h-3.5 w-3.5" />
                <span>
                  {uploadingFinalFile ? 'Đang tải bản chốt...' : 'Tải bản thiết kế hoàn thiện'}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleUploadDesignerFinal}
                />
              </label>
            )}
          </>
        )}
      </div>
    </div>
  );
}
