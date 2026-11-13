'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, FolderOpen, FolderKanban, Images } from 'lucide-react';
import { ProjectList } from './ProjectList';
import { AssetLibrary } from './AssetLibrary';
import { PanelToggleButton } from '@/core/layout/PanelToggleButton';
import { useStudio } from '../StudioContext';

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
}: {
  title: string;
  badge?: number;
  icon?: React.ReactNode;
  expandIcon: React.ReactNode;
  onExpand: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onExpand}
      aria-expanded={false}
      title={`Hiện ${title}`}
      data-testid={testId}
      className="flex h-11 w-full shrink-0 items-center justify-between gap-2 bg-slate-50 px-3.5 text-left transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600"
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
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-slate-300 bg-white text-slate-500 shadow-sm">
        {expandIcon}
      </span>
    </button>
  );
}

export function ProjectsSidebar() {
  const { hiddenPanels, mobilePane, filteredProjects, togglePanel } = useStudio();
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

  const tab =
    'grid h-5 w-9 place-items-center rounded-full border border-slate-300 bg-white text-slate-500 shadow-md transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

  return (
    <aside
      className={`${mobilePane === 'projects' ? 'flex w-full' : 'hidden'} ${
        hiddenPanels.left ? 'md:flex md:w-14' : 'md:flex md:w-56 lg:w-60 xl:w-64'
      } relative shrink-0 flex-col h-full min-h-0 border-r border-slate-200 bg-white transition-[width] duration-200`}
    >
      {/* Tay nắm ẩn/hiện ghim ở mép phải cột (aside không overflow-hidden để không bị cắt). */}
      <div className="hidden md:block">
        <PanelToggleButton
          side="left"
          open={!hiddenPanels.left}
          onToggle={() => togglePanel('left')}
          label="cột Dự án"
          testId="toggle-left-panel"
        />
      </div>

      {/* Desktop icon rail: giữ nguyên một cột chức năng khi Sidebar được thu gọn. */}
      {hiddenPanels.left && (
        <nav aria-label="Điều hướng dự án" className="hidden md:flex h-full w-14 overflow-hidden shrink-0 flex-col items-center gap-2 bg-slate-50 py-3">
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
          <CollapsedBar title="Dự án" badge={filteredProjects.length} expandIcon={<ChevronDown className="h-3.5 w-3.5" />} onExpand={() => toggle('projects')} testId="expand-projects-section" />
        ) : (
          <ProjectList fill={collapsed === 'assets'} />
        )}

        <div className="relative z-10 h-0 shrink-0 border-t border-slate-200">
          <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1">
            <button type="button" onClick={() => toggle('projects')} aria-expanded={collapsed !== 'projects'} title={collapsed === 'projects' ? 'Hiện danh sách Dự án' : 'Thu gọn danh sách Dự án'} aria-label={collapsed === 'projects' ? 'Hiện danh sách Dự án' : 'Thu gọn danh sách Dự án'} data-testid="toggle-projects-section" className={tab}>
              {collapsed === 'projects' ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </button>
            <button type="button" onClick={() => toggle('assets')} aria-expanded={collapsed !== 'assets'} title={collapsed === 'assets' ? 'Hiện Kho ảnh dự án' : 'Thu gọn Kho ảnh dự án'} aria-label={collapsed === 'assets' ? 'Hiện Kho ảnh dự án' : 'Thu gọn Kho ảnh dự án'} data-testid="toggle-assets-section" className={tab}>
              {collapsed === 'assets' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {collapsed === 'assets' ? (
          <CollapsedBar title="Kho ảnh dự án" icon={<FolderOpen className="h-4 w-4 text-[#1E3A8A]" />} expandIcon={<ChevronUp className="h-3.5 w-3.5" />} onExpand={() => toggle('assets')} testId="expand-assets-section" />
        ) : (
          <AssetLibrary />
        )}
      </div>
    </aside>
  );
}
