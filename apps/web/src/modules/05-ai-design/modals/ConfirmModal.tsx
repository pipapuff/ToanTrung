'use client';

import { Trash2 } from 'lucide-react';
import { useStudio } from '../StudioContext';

export function ConfirmModal() {
  const { confirmBusy, confirmModal, setConfirmBusy, setConfirmModal, setError } = useStudio();

  return (
    <>
      {confirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="custom-confirm-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-200/80">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-bold text-slate-900">{confirmModal.title}</h4>
                {confirmModal.subtitle && (
                  <p className="mt-0.5 text-xs font-semibold text-slate-500">
                    {confirmModal.subtitle}
                  </p>
                )}
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={confirmBusy}
                onClick={() => setConfirmModal(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                data-testid="custom-confirm-accept-btn"
                disabled={confirmBusy}
                onClick={async () => {
                  setConfirmBusy(true);
                  try {
                    await confirmModal.onConfirm();
                    setConfirmModal(null);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Thao tác thất bại.');
                    setConfirmModal(null);
                  } finally {
                    setConfirmBusy(false);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{confirmBusy ? 'Đang xử lý...' : confirmModal.confirmLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
