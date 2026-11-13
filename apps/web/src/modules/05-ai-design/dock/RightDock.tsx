'use client';

import { Sparkles } from 'lucide-react';
import { AssistantPanel } from './AssistantPanel';
import { PanelToggleButton } from '@/core/layout/PanelToggleButton';
import { useStudio } from '../StudioContext';
import { ColumnResizeHandle, useResizableColumn } from '../layout/ColumnResizeHandle';

/** Cột phải chỉ dành cho "Tạo ảnh AI". Thông số nằm ở tab "Thông số" trên thanh ngang. */
export function RightDock() {
  const { hiddenPanels, mobilePane, togglePanel } = useStudio();
  // Độ rộng cột kéo được (lưu lại cho lần sau)
  const col = useResizableColumn({ storageKey: 'm05.rightWidth', side: 'right', min: 260, max: 560 });
  const openWidth =
    col.width !== null ? 'md:w-[var(--col-w)]' : 'md:w-72 lg:w-[19rem] xl:w-[20rem]';

  return (
    <aside
      className={`${
        hiddenPanels.right
          ? mobilePane === 'assistant'
            ? 'flex w-full md:flex md:w-14'
            : 'hidden md:flex md:w-14'
          : mobilePane === 'assistant'
            ? `flex w-full ${openWidth}`
            : `hidden md:flex ${openWidth}`
      } relative shrink-0 flex-col border-l border-slate-200 bg-white h-full min-h-0 ${
        col.dragging ? '' : 'transition-[width] duration-200'
      }`}
      style={col.widthStyle}
    >
      {!hiddenPanels.right && (
        <ColumnResizeHandle
          side="right"
          dragging={col.dragging}
          label="Đổi độ rộng cột Tạo ảnh AI"
          handleProps={col.handleProps}
          testId="resize-right-panel"
        />
      )}

      {hiddenPanels.right ? (
        <>
          <nav
            aria-label="Công cụ trợ lý"
            className="hidden md:flex h-full w-14 overflow-hidden shrink-0 flex-col items-center gap-2 bg-slate-50 py-3"
          >
            {/* Nút ẩn/hiện nằm trên cùng, phía trên các icon chức năng */}
            <PanelToggleButton
              variant="panel"
              side="right"
              open={false}
              onToggle={() => togglePanel('right')}
              label="cột Tạo ảnh AI"
              testId="toggle-right-panel"
            />
            <button
              type="button"
              onClick={() => togglePanel('right')}
              title="Mở Tạo ảnh AI"
              aria-label="Mở Tạo ảnh AI"
              className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-blue-50 hover:text-[#1E3A8A]"
            >
              <Sparkles className="h-5 w-5" />
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
  const { hiddenPanels, togglePanel } = useStudio();
  return (
    <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-[#1E3A8A]">
        <Sparkles className="h-4 w-4 text-[#2563EB]" />
        <span>Tạo ảnh AI</span>
      </h2>
      {!hiddenPanels.right && (
        <PanelToggleButton
          variant="panel"
          side="right"
          open={!hiddenPanels.right}
          onToggle={() => togglePanel('right')}
          label="cột Tạo ảnh AI"
          testId="toggle-right-panel"
          className="hidden md:grid"
        />
      )}
    </div>
  );
}
