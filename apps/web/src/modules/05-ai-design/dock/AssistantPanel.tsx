'use client';

import { useEffect, useRef } from 'react';
import { ShieldAlert } from 'lucide-react';
import { ChatHistory } from './ChatHistory';
import { PromptComposer } from './PromptComposer';
import { useStudio } from '../StudioContext';

export function AssistantPanel() {
  const {
    computedLiveSpecs,
    currentProject,
    paramForm,
    piiAlert,
    setActiveWorkspaceArea,
  } = useStudio();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messageCount = currentProject?.chatMessages?.length ?? 0;

  // Tự cuộn xuống tin mới nhất khi đổi dự án hoặc có thêm tin nhắn.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [currentProject?.id, messageCount]);

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden p-3">
      {/* Ngữ cảnh dự án: gọn trong một thẻ, thông số chi tiết nằm ở tab Thông số. */}
      <div className="mb-2 flex shrink-0 items-start justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
        <div className="min-w-0 break-words text-slate-600">
          <span className="font-bold text-slate-900">
            {paramForm.projectName} ({paramForm.pixelPitch})
          </span>
          <span>
            {' '}
            · {paramForm.screenWidthM}m × {paramForm.screenHeightM}m ({computedLiveSpecs.areaM2} m²)
          </span>
        </div>
        <button
          type="button"
          onClick={() => setActiveWorkspaceArea('specs')}
          className="shrink-0 whitespace-nowrap font-semibold text-[#2563EB] hover:underline"
        >
          Sửa thông số
        </button>
      </div>

      {/* Vùng cuộn chỉ chứa hội thoại. Ô nhập luôn ghim ở đáy. */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1"
      >
        <ChatHistory />
      </div>

      {/* PII Security Guard (ghim cạnh ô nhập để luôn thấy cảnh báo) */}
      {piiAlert && (
        <div className="mt-2 flex shrink-0 items-start gap-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
          <ShieldAlert className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <span>{piiAlert}</span>
        </div>
      )}

      {/* Prompt Composer (ghim ở đáy, không bị cuộn mất) */}
      <PromptComposer />
    </div>
  );
}
