'use client';

import { DesignCanvas } from '../canvas/DesignCanvas';
import { VersionStrip } from '../versions/VersionStrip';
import { RightDock } from '../dock/RightDock';
import { useStudio } from '../StudioContext';

export function PerspectiveWorkspace() {
  const { mobilePane } = useStudio();

  return (
    <>
      <div
        className={`${
          mobilePane === 'canvas' ? 'flex' : 'hidden md:flex'
        } flex-1 flex-col overflow-hidden bg-slate-100`}
      >
        {/* MAIN CENTERED CANVAS */}
        <DesignCanvas />

        {/* Dải phiên bản: 1 hàng gọn */}
        <VersionStrip />
      </div>

      {/* ================= RIGHT STUDIO DOCK: "TRỢ LÝ AI" & COMPACT "THÔNG SỐ" ================= */}
      <RightDock />
    </>
  );
}
