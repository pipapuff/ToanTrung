'use client';

import { Settings2, Sparkles } from 'lucide-react';
import { AssistantPanel } from './AssistantPanel';
import { ParametersForm } from '../params/ParametersForm';
import { useStudio } from '../StudioContext';

export function RightDock() {
  const {
    activeWorkspaceArea,
    focusCanvas,
    mobilePane,
    setActiveWorkspaceArea,
    setSideDockTab,
    sideDockTab,
  } = useStudio();

  return (
    <aside
      className={`${
        mobilePane === 'assistant' || activeWorkspaceArea === 'assistant'
          ? 'flex w-full md:w-80 xl:w-[22rem]'
          : focusCanvas
            ? 'hidden'
            : 'hidden xl:flex xl:w-[22rem]'
      } shrink-0 flex-col border-l border-slate-200 bg-white h-full min-h-0`}
    >
      {/* Side Dock Switcher */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSideDockTab('assistant');
              setActiveWorkspaceArea('assistant');
            }}
            className={`flex items-center gap-1.5 whitespace-nowrap py-2.5 text-sm font-semibold border-b-2 transition ${
              sideDockTab === 'assistant'
                ? 'border-[#1E3A8A] text-[#1E3A8A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="h-4 w-4 text-[#2563EB]" />
            <span>Tạo ảnh AI</span>
          </button>
          <button
            type="button"
            onClick={() => setSideDockTab('specs')}
            className={`flex items-center gap-1.5 whitespace-nowrap py-2.5 text-sm font-semibold border-b-2 transition ml-4 ${
              sideDockTab === 'specs'
                ? 'border-[#1E3A8A] text-[#1E3A8A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings2 className="h-4 w-4 text-slate-500" />
            <span>Thông số</span>
          </button>
        </div>
      </div>

      {sideDockTab === 'assistant' ? (
        <AssistantPanel />
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5">
          <ParametersForm compact={true} />
        </div>
      )}
    </aside>
  );
}
