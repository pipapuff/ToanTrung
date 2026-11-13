'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';

interface Options {
  /** Khóa localStorage lưu độ rộng người dùng đã kéo. */
  storageKey: string;
  /** Cột nằm bên nào của vùng làm việc (quyết định chiều kéo). */
  side: 'left' | 'right';
  min: number;
  max: number;
}

const KEY_STEP = 16;

/**
 * Độ rộng cột kéo được. `width === null` nghĩa là chưa kéo lần nào:
 * cột dùng độ rộng responsive mặc định bằng class Tailwind của nó.
 */
export function useResizableColumn({ storageKey, side, min, max }: Options) {
  const [width, setWidth] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const lastRef = useRef<number | null>(null);

  // Không cho cột chiếm quá 40% chiều ngang cửa sổ để vùng giữa luôn còn chỗ.
  const clamp = useCallback(
    (n: number) => {
      const limit = Math.min(max, Math.max(min, Math.floor(window.innerWidth * 0.4)));
      return Math.round(Math.min(limit, Math.max(min, n)));
    },
    [min, max]
  );

  const persist = useCallback(
    (n: number | null) => {
      try {
        if (n === null) window.localStorage.removeItem(storageKey);
        else window.localStorage.setItem(storageKey, String(n));
      } catch {
        /* bỏ qua */
      }
    },
    [storageKey]
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      const n = raw ? Number(raw) : NaN;
      if (Number.isFinite(n)) setWidth(clamp(n));
    } catch {
      /* bỏ qua */
    }
  }, [storageKey, clamp]);

  useEffect(() => {
    if (!dragging) return;
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
  }, [dragging]);

  const currentWidth = (el: HTMLElement | null) => width ?? el?.parentElement?.offsetWidth ?? min;

  const handleProps = {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      dragRef.current = { startX: e.clientX, startWidth: currentWidth(e.currentTarget) };
      lastRef.current = dragRef.current.startWidth;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const next = clamp(side === 'left' ? d.startWidth + dx : d.startWidth - dx);
      lastRef.current = next;
      setWidth(next);
    },
    onPointerUp: (e: PointerEvent<HTMLElement>) => {
      if (!dragRef.current) return;
      dragRef.current = null;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      setDragging(false);
      persist(lastRef.current);
    },
    onPointerCancel: () => {
      dragRef.current = null;
      setDragging(false);
    },
    // Bấm đúp: trả về độ rộng mặc định.
    onDoubleClick: () => {
      setWidth(null);
      persist(null);
    },
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const widen = side === 'left' ? e.key === 'ArrowRight' : e.key === 'ArrowLeft';
      const next = clamp(currentWidth(e.currentTarget) + (widen ? KEY_STEP : -KEY_STEP));
      setWidth(next);
      persist(next);
    },
  };

  const widthStyle: CSSProperties | undefined =
    width !== null ? ({ '--col-w': `${width}px` } as CSSProperties) : undefined;

  return { width, dragging, handleProps, widthStyle };
}

/** Thanh kéo mỏng nằm ở mép trong của cột (cha trực tiếp phải là `relative`). */
export function ColumnResizeHandle({
  side,
  dragging,
  label,
  handleProps,
  testId,
}: {
  side: 'left' | 'right';
  dragging: boolean;
  label: string;
  handleProps: ReturnType<typeof useResizableColumn>['handleProps'];
  testId?: string;
}) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      title="Kéo để đổi độ rộng · bấm đúp để đặt lại"
      tabIndex={0}
      data-testid={testId}
      {...handleProps}
      className={`group absolute top-0 z-30 hidden h-full w-2 cursor-col-resize touch-none focus-visible:outline-none md:block ${
        side === 'left' ? '-right-1' : '-left-1'
      }`}
    >
      <span
        className={`absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full transition-colors group-focus-visible:bg-blue-500 ${
          dragging ? 'bg-[#2563EB]' : 'bg-transparent group-hover:bg-blue-300'
        }`}
      />
    </div>
  );
}
