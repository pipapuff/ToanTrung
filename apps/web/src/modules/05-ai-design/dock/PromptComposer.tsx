'use client';

import { RefreshCw, Send } from 'lucide-react';
import { useStudio } from '../StudioContext';

export function PromptComposer() {
  const {
    aiConnected,
    canUseAiDesign,
    chatPrompt,
    chatQuality,
    handlePromptChange,
    handleSendChatEdit,
    piiAlert,
    setChatQuality,
    submitting,
  } = useStudio();

  return (
    <form
      onSubmit={handleSendChatEdit}
      className="mt-2.5 shrink-0 pt-2.5 border-t border-slate-200"
    >
      <label
        htmlFor="ai-chat-prompt"
        className="mb-1 block text-[11px] font-semibold text-slate-500"
      >
        Yêu cầu mới
      </label>
      <textarea
        id="ai-chat-prompt"
        rows={3}
        data-testid="ai-chat-prompt-input"
        value={chatPrompt}
        onChange={(e) => handlePromptChange(e.target.value)}
        placeholder={
          aiConnected
            ? 'Mô tả yêu cầu dựng phối cảnh / chỉnh nội dung màn hình LED…'
            : 'Chưa kết nối AI — yêu cầu sẽ tạo ảnh mô phỏng để thử quy trình…'
        }
        className="w-full resize-none rounded-xl border border-slate-200 p-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#2563EB] focus:outline-none"
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex shrink-0 items-center gap-1.5 text-xs text-slate-600">
          <span className="font-semibold whitespace-nowrap">Chế độ</span>
          <select
            value={chatQuality}
            onChange={(e) => setChatQuality(e.target.value as 'draft' | 'high_quality')}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none"
          >
            <option value="draft">Nháp nhanh</option>
            <option value="high_quality">Độ nét cao</option>
          </select>
        </div>

        <button
          type="submit"
          data-testid="ai-chat-submit-btn"
          disabled={!chatPrompt.trim() || submitting || Boolean(piiAlert) || !canUseAiDesign}
          className="inline-flex min-w-[9.5rem] flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1E3A8A] px-4 py-2 text-sm font-bold text-white shadow-xs transition hover:bg-[#2563EB] disabled:opacity-50"
        >
          {submitting ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Đang dựng...</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">Tạo phiên bản</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
