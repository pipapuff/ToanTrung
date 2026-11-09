'use client';

import { Download } from 'lucide-react';
import { useStudio } from '../StudioContext';

export function VersionStrip() {
  const { currentProject, currentVersion, setSelectedVersionId, setViewMode, viewMode } =
    useStudio();

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-2 flex items-center gap-3">
      <span className="text-[13px] font-semibold text-slate-700 whitespace-nowrap">
        Phiên bản ({currentProject?.assetVersions.length || 0})
      </span>
      <div className="flex flex-1 min-w-0 items-center gap-2 overflow-x-auto">
        {(currentProject?.assetVersions.length || 0) === 0 && (
          <span className="text-[13px] text-slate-500">Chưa có phiên bản nào.</span>
        )}
        {currentProject?.assetVersions.map((ver) => {
          const isSelected = ver.id === currentVersion?.id;
          return (
            <button
              key={ver.id}
              type="button"
              data-testid={`version-card-v${ver.versionNumber}`}
              title={`Phiên bản v${ver.versionNumber}${ver.isApprovedFinal ? ' · Đã duyệt' : ''}`}
              onClick={() => {
                setSelectedVersionId(ver.id);
                if (viewMode === 'original') setViewMode('result');
              }}
              className={`relative shrink-0 h-10 w-16 overflow-hidden rounded-md border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] ${
                isSelected ? 'border-[#2563EB]' : 'border-transparent hover:border-slate-300'
              }`}
            >
              <img
                src={`/api/v1/design/asset/${ver.id}`}
                alt={`Phiên bản v${ver.versionNumber}`}
                className="h-full w-full object-cover bg-slate-900"
              />
              <span className="absolute bottom-0 left-0 rounded-tr bg-slate-900/80 px-1 text-[11px] font-semibold text-white">
                v{ver.versionNumber}
              </span>
              {ver.isApprovedFinal && (
                <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </button>
          );
        })}
      </div>
      {currentVersion && (
        <a
          href={`/api/v1/design/asset/${currentVersion.id}`}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 inline-flex items-center gap-1 text-[13px] font-semibold text-[#1E3A8A] hover:underline"
        >
          <Download className="h-3.5 w-3.5" />
          Tải v{currentVersion.versionNumber}
        </a>
      )}
    </div>
  );
}
