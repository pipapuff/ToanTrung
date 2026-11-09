'use client';

import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { useStudio } from '../StudioContext';

export function ToastStack() {
  const { error, setError, setSuccessToast, successToast } = useStudio();

  return (
    <>
      {(successToast || error) && (
        <div className="fixed right-5 top-16 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
          {successToast && (
            <div
              role="status"
              data-testid="studio-toast-notification"
              className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-emerald-200/90 bg-white/95 p-3.5 shadow-xl backdrop-blur-md ring-1 ring-emerald-500/10 transition-all"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900">Đã cập nhật thành công</div>
                <div className="mt-0.5 text-xs text-slate-600 leading-relaxed">{successToast}</div>
              </div>
              <button
                type="button"
                onClick={() => setSuccessToast(null)}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                Đóng
              </button>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-red-200/90 bg-white/95 p-3.5 shadow-xl backdrop-blur-md ring-1 ring-red-500/10 transition-all"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-200/70">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-red-900">Thông báo hệ thống</div>
                <div className="mt-0.5 text-xs text-red-700 leading-relaxed">{error}</div>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
