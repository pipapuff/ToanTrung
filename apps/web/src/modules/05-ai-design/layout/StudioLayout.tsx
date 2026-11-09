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
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PanelToggleButton } from '@/core/layout/PanelToggleButton';
import { useStudio } from '../StudioContext';

export function StudioLayout() {
  const { activeWorkspaceArea, hiddenPanels, togglePanel, toggleZenMode } = useStudio();

  // Nút ẩn/hiện nằm trên header chung (WorkspaceShell) qua portal
  const [slots, setSlots] = useState<{ left: HTMLElement | null; right: HTMLElement | null }>({
    left: null,
    right: null,
  });
  useEffect(() => {
    setSlots({
      left: document.getElementById('studio-header-left-slot'),
      right: document.getElementById('studio-header-slot'),
    });
  }, []);

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
      {slots.left &&
        createPortal(
          <PanelToggleButton
            variant="header"
            side="left"
            open={!hiddenPanels.left}
            onToggle={() => togglePanel('left')}
            label="cột Dự án"
            testId="toggle-left-panel"
          />,
          slots.left
        )}
      {slots.right &&
        createPortal(
          <>
            <PanelToggleButton
              variant="header"
              side="right"
              open={!hiddenPanels.right}
              onToggle={() => togglePanel('right')}
              label="cột Trợ lý AI"
              testId="toggle-right-panel"
            />
            <PanelToggleButton
              variant="header"
              side="top"
              open={!hiddenPanels.top}
              onToggle={() => togglePanel('top')}
              label="thanh công cụ"
              testId="toggle-top-panel"
            />
          </>,
          slots.right
        )}

      {/* 1. COMPACT STUDIO TOOLBAR WITH 3 PROMINENT WORKSPACE AREAS */}
      {!hiddenPanels.top && <StudioToolbar />}

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
