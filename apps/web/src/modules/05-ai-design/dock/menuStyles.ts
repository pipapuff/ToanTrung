/**
 * Nền menu nổi của ô nhập (mẫu prompt / chọn AI): xanh nhạt + viền xanh + bóng đổ,
 * khác với nền trắng của cột nên mở lên là nhận ra ngay. Các mục bên trong là thẻ trắng.
 */
export const MENU_SURFACE =
  'absolute inset-x-0 bottom-full z-30 mb-2 flex max-h-[min(22rem,60vh)] flex-col overflow-hidden rounded-2xl border border-blue-200 bg-blue-50 text-xs shadow-xl shadow-blue-900/15';

export const MENU_BODY = 'min-h-0 flex-1 overflow-y-auto p-1.5';

export const MENU_FOOTER = 'shrink-0 border-t border-blue-200/80 bg-blue-100/60 p-1.5';

export const MENU_TITLE =
  'px-1.5 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wide text-blue-900/50';
