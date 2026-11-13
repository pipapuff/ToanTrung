'use client';

import { useStudio } from '../StudioContext';

export function MobilePaneSwitcher() {
  const { mobilePane, setMobilePane } = useStudio();

  return (
    <div className="md:hidden grid grid-cols-3 gap-1 bg-white border-b border-slate-200 px-3 py-1.5 shrink-0 text-xs font-bold">
      {[
        { id: 'projects' as const, label: 'Dự án & Kho ảnh' },
        { id: 'canvas' as const, label: 'Phối cảnh' },
        { id: 'assistant' as const, label: 'Tạo ảnh AI' },
      ].map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setMobilePane(tab.id)}
          className={`py-1.5 rounded-lg text-center transition ${
            mobilePane === tab.id ? 'bg-[#1E3A8A] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
