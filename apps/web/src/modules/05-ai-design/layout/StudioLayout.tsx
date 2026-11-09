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
import { useEffect } from 'react';
import { PanelToggleButton } from '@/core/layout/PanelToggleButton';
import { useStudio } from '../StudioContext';

export function StudioLayout() {
  const { activeWorkspaceArea, hiddenPanels, togglePanel, toggleZenMode } = useStudio();

  // Phím tắt F: chế độ tập trung (bỏ qua khi đang gõ chữ)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'f' || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (/^(input|textarea|select)$/i.test(t.tagName) || t.isContentEditable)) return;
      toggleZenMode();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleZenMode]);


  return (
    <div className="flex h-full w-full flex-col bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden select-none">
      {/* Thanh công cụ có tay nắm riêng tại mép workspace, không portal lên header toàn ứng dụng. */}
      <div className={`relative z-20 w-full shrink-0 ${hiddenPanels.top ? 'h-0' : ''}`}>
        {!hiddenPanels.top && <StudioToolbar />}
        <PanelToggleButton
          variant="header"
          side="top"
          open={!hiddenPanels.top}
          onToggle={() => togglePanel('top')}
          label="thanh công cụ"
          testId="toggle-top-panel"
          className={`absolute left-1/2 z-40 -translate-x-1/2 shadow-sm ${
            hiddenPanels.top
              ? 'top-0 translate-y-0'
              : 'top-full -translate-y-1/2'
          }`}
        />
      </div>

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
