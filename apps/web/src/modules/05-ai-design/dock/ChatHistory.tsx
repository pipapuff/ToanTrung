'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useStudio } from '../StudioContext';

/** Yêu cầu của người dùng: bong bóng bên phải, tối đa 3 dòng, bấm để xem hết. */
function UserBubble({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        title={expanded ? 'Thu gọn' : 'Bấm để xem đầy đủ'}
        className={`max-w-[92%] break-words rounded-2xl rounded-br-md bg-slate-100 px-3 py-2 text-left text-sm leading-relaxed text-slate-900 ${
          expanded ? '' : 'line-clamp-3'
        }`}
      >
        {text}
      </button>
    </div>
  );
}

export function ChatHistory() {
  const { aiConnected, currentProject, selectedModelId } = useStudio();
  const messages = currentProject?.chatMessages ?? [];

  if (messages.length === 0) {
    return (
      <p className="px-1 py-4 text-center text-xs text-slate-400">
        Mô tả yêu cầu ở ô bên dưới hoặc bấm + để chọn mẫu prompt.
      </p>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      {messages.map((msg) => {
        if (msg.role === 'user') return <UserBubble key={msg.id} text={msg.text} />;

        const failed = msg.status === 'timeout' || msg.status === 'failed';
        const modelName = msg.modelUsed || selectedModelId;
        // Kết quả thành công chỉ hiện 1 dòng meta; chỉ hiện nội dung khi lỗi/không có phiên bản.
        const showText = failed || !msg.versionNumber;

        return (
          <div key={msg.id} className="space-y-1">
            <div
              className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-slate-500"
              title={[
                modelName,
                aiConnected && msg.durationSec != null ? `${msg.durationSec}s` : null,
                aiConnected ? msg.cost : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#2563EB]" />
              {msg.versionNumber && (
                <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 font-bold text-[#1E3A8A]">
                  v{msg.versionNumber}
                </span>
              )}
              {msg.tokenUsed != null && (
                <span className="shrink-0 font-normal text-slate-400">
                  {msg.tokenUsed} token
                </span>
              )}
            </div>
            {showText && (
              <div
                className={`break-words rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  failed
                    ? 'border border-amber-200 bg-amber-50 text-amber-900'
                    : 'border border-blue-100 bg-blue-50/60 text-slate-900'
                }`}
              >
                {msg.text}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
