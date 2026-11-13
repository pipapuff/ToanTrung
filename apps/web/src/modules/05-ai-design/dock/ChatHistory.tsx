'use client';

import { Sparkles } from 'lucide-react';
import { useStudio } from '../StudioContext';

export function ChatHistory() {
  const { aiConnected, currentProject, selectedModelId } = useStudio();

  return (
    <div className="space-y-3 text-sm">
      {currentProject?.chatMessages.map((msg) => {
        const isUser = msg.role === 'user';
        return (
          <div key={msg.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{isUser ? 'Yêu cầu đã gửi' : `Kết quả AI (${msg.modelUsed || selectedModelId})`}</span>
              {msg.versionNumber && (
                <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[11px] font-bold text-[#1E3A8A]">
                  Phiên bản v{msg.versionNumber}
                </span>
              )}
            </div>
            <div
              className={`break-words rounded-xl p-3 leading-relaxed text-sm ${
                isUser
                  ? 'bg-slate-100 text-slate-900'
                  : msg.status === 'timeout' || msg.status === 'failed'
                    ? 'border border-amber-200 bg-amber-50 text-amber-900'
                    : 'border border-blue-100 bg-blue-50/60 text-slate-900 font-medium'
              }`}
            >
              {!isUser && <Sparkles className="h-4 w-4 text-[#2563EB] inline mr-1.5 -mt-0.5" />}
              <span>{msg.text}</span>
              {aiConnected && msg.cost && (
                <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 border-t border-slate-200/60 pt-1 font-normal">
                  <span>Thời gian: {msg.durationSec}s</span>
                  <span>·</span>
                  <span>Token: {msg.tokenUsed ?? '—'}</span>
                  <span>·</span>
                  <span>Chi phí: {msg.cost}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
