'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Plus, RefreshCw, Send } from 'lucide-react';
import { useStudio } from '../StudioContext';
import { AiEngineMenu, useAiEngineLabel } from './AiEngineSelector';
import { PromptTemplatesMenu } from './PromptTemplatesMenu';

type OpenMenu = 'templates' | 'engine' | null;

export function PromptComposer() {
  const {
    aiConnected,
    canUseAiDesign,
    chatPrompt,
    handlePromptChange,
    handleSendChatEdit,
    piiAlert,
    submitting,
  } = useStudio();
  const { label: engineLabel, modelName } = useAiEngineLabel();
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openMenu]);

  // Chọn mẫu: chỉ điền vào ô nhập để người dùng chỉnh sửa, không gửi ngay.
  const applyTemplate = (prompt: string) => {
    const current = chatPrompt.replace(/\s+$/, '');
    const next = current ? `${current}\n${prompt}` : prompt;
    handlePromptChange(next);
    setOpenMenu(null);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(next.length, next.length);
    });
  };

  const toggle = (menu: Exclude<OpenMenu, null>) =>
    setOpenMenu((prev) => (prev === menu ? null : menu));

  return (
    <form onSubmit={handleSendChatEdit} className="mt-2 shrink-0 border-t border-slate-200 pt-2.5">
      <div className="relative">
        {openMenu && (
          <button
            type="button"
            aria-label="Đóng menu"
            tabIndex={-1}
            onClick={() => setOpenMenu(null)}
            className="fixed inset-0 z-20 cursor-default"
          />
        )}
        {openMenu === 'templates' && (
          <PromptTemplatesMenu onPick={applyTemplate} onClose={() => setOpenMenu(null)} />
        )}
        {openMenu === 'engine' && <AiEngineMenu onClose={() => setOpenMenu(null)} />}

        <div className="rounded-2xl border border-slate-200 bg-white transition focus-within:border-[#2563EB]">
          <label htmlFor="ai-chat-prompt" className="sr-only">
            Yêu cầu mới
          </label>
          <textarea
            id="ai-chat-prompt"
            ref={textareaRef}
            rows={3}
            data-testid="ai-chat-prompt-input"
            value={chatPrompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder={
              aiConnected
                ? 'Mô tả yêu cầu dựng phối cảnh / chỉnh nội dung màn hình LED…'
                : 'Chưa kết nối AI — yêu cầu sẽ tạo ảnh mô phỏng để thử quy trình…'
            }
            className="w-full resize-none bg-transparent px-3 pb-1 pt-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />

          <div className="flex items-center justify-between gap-1.5 px-2 pb-2">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={openMenu === 'templates'}
              title="Mẫu prompt"
              aria-label="Mở mẫu prompt"
              data-testid="ai-prompt-templates-btn"
              onClick={() => toggle('templates')}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 active:scale-95"
            >
              <Plus className="h-4 w-4" />
            </button>

            <div className="flex min-w-0 items-center gap-1.5">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={openMenu === 'engine'}
                title={`${modelName} — đổi AI / chế độ`}
                data-testid="ai-engine-btn"
                onClick={() => toggle('engine')}
                className="inline-flex min-w-0 max-w-[11rem] items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <span className="truncate">{engineLabel}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              </button>

              <button
                type="submit"
                data-testid="ai-chat-submit-btn"
                title="Tạo phiên bản"
                aria-label="Tạo phiên bản"
                disabled={!chatPrompt.trim() || submitting || Boolean(piiAlert) || !canUseAiDesign}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#1E3A8A] text-white shadow-xs transition hover:bg-[#2563EB] disabled:opacity-50"
              >
                {submitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
