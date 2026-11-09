'use client';

import { StudioToolbar } from '../toolbar/StudioToolbar';
import { ToastStack } from '../notifications/ToastStack';
import { MobilePaneSwitcher } from './MobilePaneSwitcher';
import { ProjectsSidebar } from '../sidebar/ProjectsSidebar';
import { SpecsWorkspace } from './SpecsWorkspace';
import { PerspectiveWorkspace } from './PerspectiveWorkspace';
import { CreateProjectModal } from '../modals/CreateProjectModal';
import { QuickEditModal } from '../modals/QuickEditModal';
import { ConfirmModal } from '../modals/ConfirmModal';
import { PromptModal } from '../modals/PromptModal';
import { AiConfigModal } from '../modals/AiConfigModal';
import { useStudio } from '../StudioContext';

export function StudioLayout() {
  const { activeWorkspaceArea } = useStudio();

  return (
    <div className="flex h-full w-full flex-col bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden select-none">
      {/* 1. COMPACT STUDIO TOOLBAR WITH 3 PROMINENT WORKSPACE AREAS */}
      <StudioToolbar />

      {/* SLEEK FLOATING WEB NOTIFICATION STACK (Success & Error Toasts) */}
      <ToastStack />

      {/* Mobile Switcher (<768px) */}
      <MobilePaneSwitcher />

      {/* 2. MAIN STUDIO BODY */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* ================= LEFT SIDEBAR: "Dự án" & "Kho ảnh dự án" (NO PARAMETER INPUTS HERE) ================= */}
        <ProjectsSidebar />

        {/* ================= MAIN WORKSPACE AREA ================= */}
        {activeWorkspaceArea === 'specs' ? (
          /* FULL-WIDTH "THÔNG SỐ" WORKSPACE AREA */
          <SpecsWorkspace />
        ) : (
          /* "PHỐI CẢNH" CANVAS + RIGHT DOCK ("TRỢ LÝ AI" / "THÔNG SỐ") */
          <PerspectiveWorkspace />
        )}
      </div>

      {/* MODAL: CREATE PROJECT */}
      <CreateProjectModal />

      {/* MODAL: QUICK EDIT PROJECT (SỬA NHANH DỰ ÁN) */}
      <QuickEditModal />

      {/* MODAL: CUSTOM AESTHETIC CONFIRM DIALOG (THAY THẾ HOÀN TOÀN NATIVE BROWSER CONFIRM) */}
      <ConfirmModal />

      {/* MODAL: CUSTOM AESTHETIC INPUT PROMPT (THAY THẾ HOÀN TOÀN NATIVE BROWSER PROMPT) */}
      <PromptModal />

      {/* MODAL: MULTI-AI HUB (CHUYỂN ĐỔI & CẤU HÌNH ĐA AI LINH HOẠT) */}
      <AiConfigModal />
    </div>
  );
}
