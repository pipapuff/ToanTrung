'use client';

import { ProjectList } from './ProjectList';
import { AssetLibrary } from './AssetLibrary';
import { useStudio } from '../StudioContext';

export function ProjectsSidebar() {
  const { focusCanvas, mobilePane } = useStudio();

  return (
    <aside
      className={`${
        mobilePane === 'projects' ? 'flex w-full' : 'hidden'
      } ${focusCanvas ? 'md:hidden' : 'md:flex'} md:w-64 xl:w-72 shrink-0 flex-col h-full min-h-0 border-r border-slate-200 bg-white overflow-hidden`}
    >
      {/* SECTION A: "Dự án" (Compact Searchable List with Direct Add / Edit / Delete & Bulk Clean) */}
      <ProjectList />

      {/* SECTION B: "Kho ảnh dự án" (Two Project-Scoped Folders: "Ảnh kỹ thuật" & "Bản thiết kế") */}
      <AssetLibrary />
    </aside>
  );
}
