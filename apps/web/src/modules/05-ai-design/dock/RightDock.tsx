'use client';

import { Sparkles, PanelRightOpen } from 'lucide-react';
import { AssistantPanel } from './AssistantPanel';
import { PanelToggleButton } from '@/core/layout/PanelToggleButton';
import { useStudio } from '../StudioContext';

/** Cột phải chỉ dành cho "Tạo ảnh AI". Thông số nằm ở tab "Thông số" trên thanh ngang. */
export function RightDock() {
  const { hiddenPanels, mobilePane, togglePanel } = useStudio();

  return (
    <aside
      className={`${
        hiddenPanels.right
          ? mobilePane === 'assistant'
            ? 'flex w-full md:flex md:w-14'
            : 'hidden md:flex md:w-14'
          : mobilePane === 'assistant'
            ? 'flex w-full md:w-72 lg:w-[19rem] xl:w-[20rem]'
            : 'hidden md:flex md:w-72 lg:w-[19rem] xl:w-[20rem]'
      } relative shrink-0 flex-col border-l border-slate-200 bg-white h-full min-h-0 transition-[width] duration-200`}
    >
      {/* Tay nắm ẩn/hiện ghim ở mép trái cột (aside không overflow-hidden để không bị cắt). */}
      <div className="hidden md:block">
        <PanelToggleButton
          side="right"
          open={!hiddenPanels.right}
          onToggle={() => togglePanel('right')}
          label="cột Tạo ảnh AI"
          testId="toggle-right-panel"
        />
      </div>

      {hiddenPanels.right ? (
        <>
          <nav
            aria-label="Công cụ trợ lý"
            className="hidden md:flex h-full w-14 overflow-hidden shrink-0 flex-col items-center gap-2 bg-slate-50 py-3"
          >
            <button
              type="button"
              onClick={() => togglePanel('right')}
              title="Mở Tạo ảnh AI"
              aria-label="Mở Tạo ảnh AI"
              className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-blue-50 hover:text-[#1E3A8A]"
            >
              <Sparkles className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => togglePanel('right')}
              title="Mở rộng panel"
              aria-label="Mở rộng panel"
              className="mt-auto grid h-10 w-10 place-items-center rounded-xl text-slate-400 hover:bg-blue-50 hover:text-[#1E3A8A]"
            >
              <PanelRightOpen className="h-5 w-5" />
            </button>
          </nav>
          <div
            className={`${mobilePane === 'assistant' ? 'flex md:hidden' : 'hidden'} min-h-0 flex-1 flex-col`}
          >
            <DockHeader />
            <AssistantPanel />
          </div>
        </>
      ) : (
        <>
          <DockHeader />
          <AssistantPanel />
        </>
      )}
    </aside>
  );
}

function DockHeader() {
  return (
    <div className="flex h-11 shrink-0 items-center border-b border-slate-200 px-3">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-[#1E3A8A]">
        <Sparkles className="h-4 w-4 text-[#2563EB]" />
        <span>Tạo ảnh AI</span>
      </h2>
    </div>
  );
}
