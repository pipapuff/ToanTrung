'use client';

import { Check, Edit2 } from 'lucide-react';
import { useStudio } from '../StudioContext';

export function PromptModal() {
  const { promptBusy, promptModal, setError, setPromptBusy, setPromptModal } = useStudio();

  return (
    <>
      {promptModal && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="custom-prompt-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!promptModal.value.trim()) return;
              setPromptBusy(true);
              try {
                await promptModal.onConfirm(promptModal.value);
                setPromptModal(null);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Không thể lưu thay đổi.');
                setPromptModal(null);
              } finally {
                setPromptBusy(false);
              }
            }}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A] border border-blue-200">
                <Edit2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">{promptModal.title}</h4>
                <p className="text-xs text-slate-500">{promptModal.label}</p>
              </div>
            </div>

            <input
              type="text"
              autoFocus
              required
              value={promptModal.value}
              placeholder={promptModal.placeholder}
              onChange={(e) =>
                setPromptModal((prev) => (prev ? { ...prev, value: e.target.value } : null))
              }
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-[#2563EB] focus:outline-none"
            />

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                disabled={promptBusy}
                onClick={() => setPromptModal(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={promptBusy || !promptModal.value.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#2563EB] disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{promptBusy ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
