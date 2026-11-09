'use client';

import { DESIGN_STATUS_LABELS, DESIGN_TYPE_LABELS } from '@toantrung/contracts';
import {
  Check,
  Cpu,
  Edit2,
  FileArchive,
  FileSpreadsheet,
  Maximize2,
  Minimize2,
  Monitor,
  Settings2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useStudio } from '../StudioContext';

export function StudioToolbar() {
  const {
    activeWorkspaceArea,
    canExport,
    canUseAiDesign,
    currentProject,
    currentVersion,
    focusCanvas,
    handleDownloadProjectZip,
    handleSaveFinished,
    openQuickEditProject,
    providerStatus,
    requestDeleteProject,
    savingFinal,
    selectedModelId,
    selectedProviderId,
    setActiveWorkspaceArea,
    setConfigCustomModelInput,
    setConfigEndpointInput,
    setConfigModalProviderId,
    setMobilePane,
    setShowAiConfigModal,
    setSideDockTab,
    toggleFocusCanvas,
  } = useStudio();

  return (
    <div className="flex min-h-12 w-full shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-b border-slate-200 bg-white px-3 py-1.5">
      {/* Left: Active Project Title, Quick Edit / Delete & Lead Reference */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className="text-[15px] font-semibold text-slate-900 truncate max-w-[140px] lg:max-w-[190px] xl:max-w-[230px]"
          title={
            currentProject
              ? `${currentProject.projectName} · ${DESIGN_TYPE_LABELS[currentProject.designType]} · ${DESIGN_STATUS_LABELS[currentProject.status]}`
              : undefined
          }
        >
          {currentProject ? currentProject.projectName : 'Dự án thiết kế'}
        </span>

        {currentProject && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              data-testid="toolbar-quick-edit-project-btn"
              onClick={() => openQuickEditProject(currentProject)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/80 px-2 py-1 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-[#1E3A8A] transition"
              title="Sửa nhanh tên dự án, loại thiết kế, Lead liên kết & kích thước"
            >
              <Edit2 className="h-3 w-3" />
              <span className="hidden sm:inline">Sửa</span>
            </button>
            <button
              type="button"
              data-testid="toolbar-quick-delete-project-btn"
              onClick={() => requestDeleteProject(currentProject)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/80 px-2 py-1 text-xs font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
              title="Xóa dự án đang chọn"
            >
              <Trash2 className="h-3 w-3" />
              <span className="hidden xl:inline">Xóa</span>
            </button>
          </div>
        )}

        {currentProject?.leadCode && (
          <a
            href={`/leads?search=${encodeURIComponent(currentProject.leadCode)}`}
            className="hidden lg:inline-flex items-center gap-1 rounded-lg bg-blue-50/70 px-2 py-0.5 text-xs font-mono font-semibold text-[#1E3A8A] hover:bg-blue-100 transition"
            title="Mở hồ sơ Lead liên kết"
          >
            <span>Lead: {currentProject.leadCode}</span>
          </a>
        )}
      </div>

      {/* Center: THREE PROMINENT WORKSPACE AREAS ("Phối cảnh", "Trợ lý AI", "Thông số") */}
      <div
        role="tablist"
        aria-label="Khu vực làm việc Studio"
        className="flex shrink-0 items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-100 p-0.5"
      >
        <button
          type="button"
          role="tab"
          data-testid="workspace-tab-perspective"
          aria-selected={activeWorkspaceArea === 'perspective'}
          onClick={() => {
            setActiveWorkspaceArea('perspective');
            setMobilePane('canvas');
          }}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
            activeWorkspaceArea === 'perspective'
              ? 'bg-[#1E3A8A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
          }`}
        >
          <Monitor className="h-4 w-4" />
          <span>Phối cảnh</span>
        </button>

        <button
          type="button"
          role="tab"
          data-testid="workspace-tab-assistant"
          aria-selected={activeWorkspaceArea === 'assistant'}
          onClick={() => {
            setActiveWorkspaceArea('assistant');
            setSideDockTab('assistant');
            setMobilePane('assistant');
          }}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
            activeWorkspaceArea === 'assistant'
              ? 'bg-[#1E3A8A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Tạo ảnh AI</span>
        </button>

        <button
          type="button"
          role="tab"
          data-testid="workspace-tab-specs"
          aria-selected={activeWorkspaceArea === 'specs'}
          onClick={() => {
            setActiveWorkspaceArea('specs');
            setSideDockTab('specs');
          }}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
            activeWorkspaceArea === 'specs'
              ? 'bg-[#1E3A8A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
          }`}
        >
          <Settings2 className="h-4 w-4" />
          <span>Thông số</span>
        </button>
      </div>

      {/* Right: Provider Status, Excel Export, ZIP Download & Approve Final */}
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={toggleFocusCanvas}
          aria-pressed={focusCanvas}
          title={
            focusCanvas ? 'Hiện lại cột Dự án và Trợ lý AI' : 'Ẩn hai cột bên để xem ảnh to hơn'
          }
          className={`hidden md:inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] ${
            focusCanvas
              ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {focusCanvas ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          <span className="hidden xl:inline">{focusCanvas ? 'Thu nhỏ ảnh' : 'Mở rộng ảnh'}</span>
        </button>
        <button
          type="button"
          data-testid="open-multi-ai-hub-btn"
          onClick={() => {
            const currentPid =
              selectedProviderId || providerStatus?.defaultProviderId || 'google_imagen';
            setConfigModalProviderId(currentPid);
            const cat = providerStatus?.availableProviders?.find(
              (p) => p.providerId === currentPid
            );
            if (cat) {
              setConfigEndpointInput(cat.apiEndpoint || '');
              setConfigCustomModelInput(cat.activeModel || selectedModelId || '');
            }
            setShowAiConfigModal(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/80 px-2 py-1.5 text-xs font-semibold text-[#1E3A8A] shadow-2xs transition hover:bg-blue-100"
          title="Bấm để chuyển đổi qua lại giữa nhiều con AI (Google Imagen 3, OpenAI GPT-Image-1, FLUX.1 Pro, Stability SD 3.5, Custom AI, Studio v3) hoặc cấu hình API Key"
        >
          <Cpu className="h-3.5 w-3.5 text-[#2563EB]" />
          <span className="hidden lg:inline">
            AI:{' '}
            {providerStatus?.availableProviders?.find((p) => p.providerId === selectedProviderId)
              ?.shortName ||
              providerStatus?.providerName ||
              'Đa AI Studio'}{' '}
            ({selectedModelId})
          </span>
          <span className="lg:hidden">Đổi AI</span>
          <span className="rounded bg-[#1E3A8A] px-1.5 py-0.5 text-[10px] font-bold text-white">
            Đổi AI
          </span>
        </button>

        <details className="group relative">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]">
            <FileArchive className="h-4 w-4 text-[#1E3A8A]" />
            <span className="hidden xl:inline">Xuất dữ liệu</span>
            <span className="xl:hidden">Xuất</span>
          </summary>
          <div className="absolute right-0 top-full z-50 mt-2 min-w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
            {canExport && (
              <a
                href="/api/v1/design/export"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                title="Xuất báo cáo Excel Dự án & Kho ảnh"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                Xuất Excel
              </a>
            )}
            <button
              type="button"
              onClick={() => handleDownloadProjectZip('all')}
              disabled={!currentProject}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              title="Tải gói ZIP Kho ảnh dự án"
            >
              <FileArchive className="h-4 w-4 text-[#1E3A8A]" />
              Tải ZIP dự án
            </button>
          </div>
        </details>

        {canUseAiDesign && (
          <button
            type="button"
            onClick={handleSaveFinished}
            disabled={!currentProject || !currentVersion || savingFinal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-2.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#2563EB] disabled:opacity-50"
            title="Phê duyệt phiên bản đang chọn làm bản thiết kế chính thức bàn giao cho Lead / Sales"
          >
            <Check className="h-4 w-4" />
            <span>{savingFinal ? 'Đang duyệt...' : 'Duyệt bản chốt'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
