'use client';

import React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, type LucideIcon } from 'lucide-react';

export type PanelSide = 'left' | 'right' | 'top' | 'bottom';

interface PanelToggleButtonProps {
  /** Panel nằm ở cạnh nào của vùng làm việc. */
  side: PanelSide;
  /** Panel đang mở (true) hay đang ẩn (false). */
  open: boolean;
  onToggle: () => void;
  /** Tên panel, vd. "thanh điều hướng", "thông số kỹ thuật". */
  label: string;
  /**
   * edge   : tay nắm ghim vào đường biên panel (luôn thấy, cả khi panel ẩn).
   *          Wrapper của panel PHẢI có `relative` và KHÔNG `overflow-hidden`
   *          (đặt overflow-hidden ở phần nội dung bên trong).
   * header : nút vuông trong thanh header (dùng cho portal #studio-header-slot).
   */
  variant?: 'edge' | 'header';
  /** Chỉ cho left/right: căn giữa dọc hay sát phía trên. */
  align?: 'center' | 'start';
  /**
   * Dùng khi panel ẩn hoàn toàn (độ dày 0) và nằm sát mép vùng cha:
   * tay nắm nằm hẳn bên trong vùng cha thay vì cưỡi lên đường biên (tránh bị cắt).
   */
  inset?: boolean;
  /** Chỉ cho variant header: icon tuỳ chọn (vd. PanelLeft) thay cho mũi tên. */
  icon?: LucideIcon;
  testId?: string;
  className?: string;
}

/** Mũi tên luôn chỉ về phía panel sẽ di chuyển tới. */
function pickIcon(side: PanelSide, open: boolean) {
  switch (side) {
    case 'left':
      return open ? ChevronLeft : ChevronRight;
    case 'right':
      return open ? ChevronRight : ChevronLeft;
    case 'top':
      return open ? ChevronUp : ChevronDown;
    case 'bottom':
      return open ? ChevronDown : ChevronUp;
  }
}

const STRADDLE: Record<PanelSide, string> = {
  left: '-right-3 w-6 h-10',
  right: '-left-3 w-6 h-10',
  top: '-bottom-3 left-1/2 -translate-x-1/2 w-10 h-6',
  bottom: '-top-3 left-1/2 -translate-x-1/2 w-10 h-6',
};

const INSET: Record<PanelSide, string> = {
  left: 'left-0 w-6 h-10',
  right: 'right-0 w-6 h-10',
  top: 'top-0 left-1/2 -translate-x-1/2 w-10 h-6',
  bottom: 'bottom-0 left-1/2 -translate-x-1/2 w-10 h-6',
};

const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

export function PanelToggleButton({
  side,
  open,
  onToggle,
  label,
  variant = 'edge',
  align = 'center',
  inset = false,
  icon,
  testId,
  className = '',
}: PanelToggleButtonProps) {
  const Icon = icon ?? pickIcon(side, open);
  const text = `${open ? 'Ẩn' : 'Hiện'} ${label}`;

  if (variant === 'header') {
    return (
      <button
        type="button"
        onClick={onToggle}
        title={text}
        aria-label={text}
        aria-expanded={open}
        data-testid={testId}
        className={`h-9 w-9 shrink-0 rounded-xl border grid place-items-center transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 ${FOCUS} ${
          open
            ? 'border-slate-200 bg-white text-slate-600'
            : 'border-blue-200 bg-blue-50 text-blue-700'
        } ${className}`}
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  }

  const vertical = side === 'left' || side === 'right';
  const alignClass = vertical
    ? align === 'start'
      ? 'top-5'
      : 'top-1/2 -translate-y-1/2'
    : '';

  return (
    <button
      type="button"
      onClick={onToggle}
      title={text}
      aria-label={text}
      aria-expanded={open}
      data-testid={testId}
      className={`absolute z-40 grid place-items-center rounded-full border border-slate-300 bg-white text-slate-500 shadow-md transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white active:scale-95 ${FOCUS} ${
        inset ? INSET[side] : STRADDLE[side]
      } ${alignClass} ${className}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}