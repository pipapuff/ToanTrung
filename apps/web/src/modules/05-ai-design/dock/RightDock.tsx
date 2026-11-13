'use client';

import { Settings2, Sparkles, PanelRightOpen } from 'lucide-react';
import { AssistantPanel } from './AssistantPanel';
import { ParametersForm } from '../params/ParametersForm';
import { PanelToggleButton } from '@/core/layout/PanelToggleButton';
import { useStudio } from '../StudioContext';

export function RightDock() {
  const {
    activeWorkspaceArea,
    hiddenPanels,
    mobilePane,
    setActiveWorkspaceArea,
    setSideDockTab,
    sideDockTab,
    togglePanel,
  } = useStudio();

  return (
    <aside
      className={`${
        hiddenPanels.right
          ? mobilePane === 'assistant' ? 'flex w-full md:flex md:w-14' : 'hidden md:flex md:w-14'
          : mobilePane === 'assistant' || activeWorkspaceArea === 'assistant'
            ? 'flex w-full md:w-80 lg:w-[19rem] xl:w-[20rem]'
            : 'hidden lg:flex lg:w-[19rem] xl:w-[20rem]'
      } relative shrink-0 flex-col border-l border-slate-200 bg-white h-full min-h-0 transition-[width] duration-200`}
    >
      {/* Tay nắm ẩn/hiện ghim ở mép trái cột (aside không overflow-hidden để không bị cắt). */}
      <div className="hidden md:block">
        <PanelToggleButton
          side="right"
          open={!hiddenPanels.right}
          onToggle={() => togglePanel('right')}
          label="cột Trợ lý AI"
          testId="toggle-right-panel"
        />
      </div>

      {hiddenPanels.right ? (
        <>
          <nav aria-label="Công cụ trợ lý" className="hidden md:flex h-full w-14 overflow-hidden shrink-0 flex-col items-center gap-2 bg-slate-50 py-3">
            <button type="button" onClick={() => { setSideDockTab('assistant'); setActiveWorkspaceArea('assistant'); togglePanel('right'); }} title="Tạo ảnh AI" aria-label="Mở Tạo ảnh AI" className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-blue-50 hover:text-[#1E3A8A]">
              <Sparkles className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => { setSideDockTab('specs'); togglePanel('right'); }} title="Thông số" aria-label="Mở Thông số" className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-blue-50 hover:text-[#1E3A8A]">
              <Settings2 className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => togglePanel('right')} title="Mở rộng panel" aria-label="Mở rộng panel" className="mt-auto grid h-10 w-10 place-items-center rounded-xl text-slate-400 hover:bg-blue-50 hover:text-[#1E3A8A]">
              <PanelRightOpen className="h-5 w-5" />
            </button>
          </nav>
          <div className={`${mobilePane === 'assistant' ? 'flex md:hidden' : 'hidden'} min-h-0 flex-1 flex-col`}>
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-slate-200 px-3">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setSideDockTab('assistant'); setActiveWorkspaceArea('assistant'); }} className="flex items-center gap-1.5 whitespace-nowrap py-2.5 text-sm font-semibold border-b-2 border-[#1E3A8A] text-[#1E3A8A]"><Sparkles className="h-4 w-4" /><span>Tạo ảnh AI</span></button>
                <button type="button" onClick={() => setSideDockTab('specs')} className="ml-3 flex items-center gap-1.5 whitespace-nowrap py-2.5 text-sm font-semibold text-slate-500"><Settings2 className="h-4 w-4" /><span>Thông số</span></button>
              </div>
            </div>
            {sideDockTab === 'assistant' ? <AssistantPanel /> : <div className="flex-1 min-h-0 overflow-y-auto p-3"><ParametersForm compact={true} /></div>}
          </div>
        </>
      ) : (
        <>
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-slate-200 px-3">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setSideDockTab('assistant'); setActiveWorkspaceArea('assistant'); }} className={`flex items-center gap-1.5 whitespace-nowrap py-2.5 text-sm font-semibold border-b-2 transition ${sideDockTab === 'assistant' ? 'border-[#1E3A8A] text-[#1E3A8A]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}><Sparkles className="h-4 w-4 text-[#2563EB]" /><span>Tạo ảnh AI</span></button>
              <button type="button" onClick={() => setSideDockTab('specs')} className={`ml-3 flex items-center gap-1.5 whitespace-nowrap py-2.5 text-sm font-semibold border-b-2 transition ${sideDockTab === 'specs' ? 'border-[#1E3A8A] text-[#1E3A8A]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}><Settings2 className="h-4 w-4 text-slate-500" /><span>Thông số</span></button>
            </div>
          </div>
          {sideDockTab === 'assistant' ? <AssistantPanel /> : <div className="flex-1 min-h-0 overflow-y-auto p-3"><ParametersForm compact={true} /></div>}
        </>
      )}
    </aside>
  );
}
