'use client';

import { CanvasViewToolbar } from './CanvasViewToolbar';
import { CanvasStage } from './CanvasStage';
import { useStudio } from '../StudioContext';

export function DesignCanvas() {
  return (
    <div className="relative flex-1 min-h-0 overflow-hidden p-2 flex items-center justify-center [container-type:size]">
      {/* Lớp nổi: chế độ xem + thông báo ngắn (không chiếm chiều cao riêng) */}
      <CanvasViewToolbar />
      <CanvasStage />
    </div>
  );
}
