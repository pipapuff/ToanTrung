'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, FolderOpen, FolderKanban, Images } from 'lucide-react';
import { ProjectList } from './ProjectList';
import { AssetLibrary } from './AssetLibrary';
import { PanelToggleButton } from '@/core/layout/PanelToggleButton';
import { useStudio } from '../StudioContext';
import { ColumnResizeHandle, useResizableColumn } from '../layout/ColumnResizeHandle';

type Collapsed = 'none' | 'projects' | 'assets';
const KEY = 'm05.sidebarCollapsed';

/** Thanh gọn thay cho phần đã thu: luôn thấy được và bấm để mở lại. */
function CollapsedBar({
  title,
  badge,
  icon,
  expandIcon,
  onExpand,
  testId,
  trailing,
}: {
  title: string;
  badge?: number;
  icon?: React.ReactNode;
  expandIcon: React.ReactNode;
  onExpand: () => void;
  testId: string;
  /** Nút phụ nằm cuối thanh (vd. nút ẩn/hiện cột), tách khỏi nút mở lại phần đã thu. */
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex h-11 w-full shrink-0 items-center gap-1.5 bg-slate-50 pr-3.5">
      <button
        type="button"
        onClick={onExpand}
        aria-expanded={false}
        title={`Hiện ${title}`}
        data-testid={testId}
        className="flex h-full min-w-0 flex-1 items-center justify-between gap-2 pl-3.5 text-left transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {icon}
          <span className="truncate text-sm font-bold text-slate-900">{title}</span>
          {typeof badge === 'number' && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
              {badge}
            </span>
          )}
        </span>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700">
          {expandIcon}
        </span>
      </button>
      {trailing}
    </div>
  );
}

export function ProjectsSidebar() {
  const { hiddenPanels, mobilePane, filteredProjects, togglePanel } = useStudio();
  // Độ rộng cột kéo được (lưu lại cho lần sau)
  const col = useResizableColumn({ storageKey: 'm05.leftWidth', side: 'left', min: 200, max: 420 });
  // Chỉ thu gọn một phần tại một thời điểm để cột luôn còn nội dung
  const [collapsed, setCollapsed] = useState<Collapsed>('none');

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(KEY);
      if (v === 'projects' || v === 'assets') setCollapsed(v);
    } catch {
      /* bỏ qua */
    }
  }, []);

  const toggle = (part: 'projects' | 'assets') =>
    setCollapsed((prev) => {
      const next: Collapsed = prev === part ? 'none' : part;
      try {
        window.localStorage.setItem(KEY, next);
      } catch {
        /* bỏ qua */
      }
      return next;
    });

  // Cùng style với nút ẩn/hiện cột (PanelToggleButton variant="panel"), gọn hơn để nằm trên đường chia.
  const tab =
    'grid h-7 w-8 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 transition-colors hover:border-blue-400 hover:bg-blue-100 hover:text-[#1E3A8A] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

  // Nút ẩn/hiện cột: nằm cạnh header cột (khi mở) hoặc trên cùng thanh icon (khi thu gọn).
  const toggleButton = (
    <PanelToggleButton
      variant="panel"
      side="left"
      open={!hiddenPanels.left}
      onToggle={() => togglePanel('left')}
      label="cột Dự án"
      testId="toggle-left-panel"
      className="hidden md:grid"
    />
  );

  return (
    <aside
      className={`${mobilePane === 'projects' ? 'flex w-full' : 'hidden'} ${
        hiddenPanels.left
          ? 'md:flex md:w-14'
          : col.width !== null
            ? 'md:flex md:w-[var(--col-w)]'
            : 'md:flex md:w-56 lg:w-60 xl:w-64'
      } relative shrink-0 flex-col h-full min-h-0 border-r border-slate-200 bg-white ${
        col.dragging ? '' : 'transition-[width] duration-200'
      }`}
      style={col.widthStyle}
    >
      {!hiddenPanels.left && (
        <ColumnResizeHandle
          side="left"
          dragging={col.dragging}
          label="Đổi độ rộng cột Dự án"
          handleProps={col.handleProps}
          testId="resize-left-panel"
        />
      )}

      {/* Desktop icon rail: giữ nguyên một cột chức năng khi Sidebar được thu gọn. */}
      {hiddenPanels.left && (
        <nav aria-label="Điều hướng dự án" className="hidden md:flex h-full w-14 overflow-hidden shrink-0 flex-col items-center gap-2 bg-slate-50 py-3">
          {toggleButton}
          <button type="button" onClick={() => togglePanel('left')} title="Mở Dự án" aria-label="Mở Dự án" className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-blue-50 hover:text-[#1E3A8A]">
            <FolderKanban className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => togglePanel('left')} title="Mở Kho ảnh dự án" aria-label="Mở Kho ảnh dự án" className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-blue-50 hover:text-[#1E3A8A]">
            <Images className="h-5 w-5" />
          </button>
        </nav>
      )}

      {/* Nội dung đầy đủ vẫn dùng trên mobile; desktop chỉ hiển thị khi cột mở. */}
      <div className={`${hiddenPanels.left ? 'flex md:hidden' : 'flex'} min-h-0 flex-1 flex-col overflow-hidden`}>
        {collapsed === 'projects' ? (
          <CollapsedBar title="Dự án" badge={filteredProjects.length} expandIcon={<ChevronDown className="h-4 w-4" />} onExpand={() => toggle('projects')} testId="expand-projects-section" trailing={hiddenPanels.left ? null : toggleButton} />
        ) : (
          <ProjectList fill={collapsed === 'assets'} headerAction={hiddenPanels.left ? null : toggleButton} />
        )}

        <div className="relative z-10 h-0 shrink-0 border-t border-slate-200">
          <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1">
            <button type="button" onClick={() => toggle('projects')} aria-expanded={collapsed !== 'projects'} title={collapsed === 'projects' ? 'Hiện danh sách Dự án' : 'Thu gọn danh sách Dự án'} aria-label={collapsed === 'projects' ? 'Hiện danh sách Dự án' : 'Thu gọn danh sách Dự án'} data-testid="toggle-projects-section" className={tab}>
              {collapsed === 'projects' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => toggle('assets')} aria-expanded={collapsed !== 'assets'} title={collapsed === 'assets' ? 'Hiện Kho ảnh dự án' : 'Thu gọn Kho ảnh dự án'} aria-label={collapsed === 'assets' ? 'Hiện Kho ảnh dự án' : 'Thu gọn Kho ảnh dự án'} data-testid="toggle-assets-section" className={tab}>
              {collapsed === 'assets' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {collapsed === 'assets' ? (
          <CollapsedBar title="Kho ảnh dự án" icon={<FolderOpen className="h-4 w-4 text-[#1E3A8A]" />} expandIcon={<ChevronUp className="h-4 w-4" />} onExpand={() => toggle('assets')} testId="expand-assets-section" />
        ) : (
          <AssetLibrary />
        )}
      </div>
    </aside>
  );
}
