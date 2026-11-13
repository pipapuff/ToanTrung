'use client';

import { Edit2, Expand, Minus, Plus } from 'lucide-react';
import { useStudio } from '../StudioContext';

export function CanvasStage() {
  const {
    canvasContainerRef,
    canvasRatio,
    compareSplit,
    computedLiveSpecs,
    currentVersion,
    draggingCompare,
    draggingHandle,
    handleMouseDownHandle,
    handleMouseMoveCanvas,
    handleMouseUpCanvas,
    isBannerProject,
    live3dTheme,
    paramForm,
    quad,
    quadEstimatedSpecs,
    selectedPhoto,
    setDraggingCompare,
    setParamForm,
    setShowHandles,
    setUnmeasuredMode,
    setZoomLevel,
    showHandles,
    sitePhotoUrl,
    unmeasuredMode,
    versionImageUrl,
    viewMode,
    zoomLevel,
  } = useStudio();

  // Khung neo 4 góc đặt trên ảnh hiện trạng, nên chỉ hiện ở "Ảnh gốc" và "Ghép 3D".
  // Ở "Kết quả AI"/"So sánh" ảnh đã render nên 4 chấm sẽ lệch khỏi màn hình LED trong ảnh.
  const canPlaceQuad = !isBannerProject && (viewMode === 'original' || viewMode === 'live_3d');

  return (
    <div
      ref={canvasContainerRef}
      onMouseMove={handleMouseMoveCanvas}
      onMouseUp={handleMouseUpCanvas}
      onMouseLeave={handleMouseUpCanvas}
      style={{
        aspectRatio: String(canvasRatio),
        width: `min(100cqw, calc(100cqh * ${canvasRatio}))`,
        transform: `scale(${zoomLevel / 100})`,
        transformOrigin: 'center center',
        transition: draggingHandle || draggingCompare ? 'none' : 'transform 0.15s ease-out',
      }}
      className="relative select-none overflow-hidden rounded-xl bg-slate-900 shadow-lg"
    >
      {/* 1. MODE: ORIGINAL ("Ảnh gốc") -> Renders Input Photo from Ảnh kỹ thuật */}
      {viewMode === 'original' && (
        <img
          data-testid="canvas-original-image"
          src={sitePhotoUrl}
          alt={selectedPhoto?.name || 'Ảnh kỹ thuật gốc'}
          className="h-full w-full object-cover"
        />
      )}

      {/* 2. MODE: RESULT ("Kết quả AI") -> Renders Selected Output Version from Bản thiết kế */}
      {viewMode === 'result' && (
        <img
          data-testid="canvas-result-image"
          src={versionImageUrl}
          alt={currentVersion ? `Bản thiết kế v${currentVersion.versionNumber}` : 'Bản thiết kế AI'}
          className="h-full w-full object-cover"
        />
      )}

      {/* 2B. MODE: LIVE 3D COMPOSITOR ("Ghép 3D Thực tế") -> Renders Real Site Photo + 4-Corner Clipped LED Wall */}
      {viewMode === 'live_3d' && (
        <div className="relative h-full w-full">
          <img
            src={sitePhotoUrl}
            alt={selectedPhoto?.name || 'Ảnh công trình thực tế'}
            className="h-full w-full object-cover"
          />
          <div
            style={{
              clipPath: `polygon(${quad.topLeft.x}% ${quad.topLeft.y}%, ${quad.topRight.x}% ${quad.topRight.y}%, ${quad.bottomRight.x}% ${quad.bottomRight.y}%, ${quad.bottomLeft.x}% ${quad.bottomLeft.y}%)`,
            }}
            className="absolute inset-0 flex items-center justify-center overflow-hidden shadow-2xl"
          >
            {live3dTheme === 'ai_version' ? (
              <img
                src={versionImageUrl}
                alt="Nội dung màn hình LED"
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                style={{
                  left: `${Math.min(quad.topLeft.x, quad.bottomLeft.x)}%`,
                  top: `${Math.min(quad.topLeft.y, quad.topRight.y)}%`,
                  width: `${Math.max(8, Math.max(quad.topRight.x, quad.bottomRight.x) - Math.min(quad.topLeft.x, quad.bottomLeft.x))}%`,
                  height: `${Math.max(8, Math.max(quad.bottomLeft.y, quad.bottomRight.y) - Math.min(quad.topLeft.y, quad.topRight.y))}%`,
                }}
                className={`absolute flex flex-col items-center justify-center p-3 text-center text-white ${
                  live3dTheme === 'conference_navy'
                    ? 'bg-gradient-to-br from-slate-950 via-[#1E3A8A] to-blue-600'
                    : live3dTheme === 'ocean_4k'
                      ? 'bg-gradient-to-br from-cyan-950 via-sky-600 to-cyan-300'
                      : live3dTheme === 'gala_stage'
                        ? 'bg-gradient-to-br from-purple-950 via-amber-700 to-amber-400'
                        : 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-700'
                }`}
              >
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-blue-200/90 drop-shadow">
                  {live3dTheme === 'conference_navy'
                    ? 'TOÀN TRUNG LED · HỘI NGHỊ & SỰ KIỆN'
                    : live3dTheme === 'ocean_4k'
                      ? 'TOÀN TRUNG DISPLAY · ULTRA HD 4K'
                      : live3dTheme === 'gala_stage'
                        ? 'GALA STAGE LED · HIGH BRIGHTNESS'
                        : 'BẢNG ĐIỆN TỬ NĂNG SUẤT · ANDON SYSTEM'}
                </div>
                <div className="mt-1 rounded bg-black/40 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                  {paramForm.pixelPitch} · {paramForm.screenWidthM}m × {paramForm.screenHeightM}m (
                  {computedLiveSpecs.resW}×{computedLiveSpecs.resH}px)
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. MODE: COMPARE ("So sánh") -> Renders TWO ACTUAL DISTINCT IMAGES (Original left, Result right) */}
      {viewMode === 'compare' && (
        <div className="relative h-full w-full">
          {/* Left / Base Layer: Original Input Photo */}
          <img
            data-testid="compare-original-image"
            src={sitePhotoUrl}
            alt="Ảnh kỹ thuật gốc (Trước)"
            className="h-full w-full object-cover"
          />
          {/* Right / Clipped Layer: Selected Output Version Image */}
          <img
            data-testid="compare-result-image"
            src={versionImageUrl}
            alt={
              currentVersion
                ? `Bản thiết kế v${currentVersion.versionNumber} (Sau)`
                : 'Bản thiết kế (Sau)'
            }
            style={{
              clipPath: `inset(0 0 0 ${compareSplit}%)`,
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="absolute left-3 bottom-12 rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs font-bold text-white">
            Ảnh gốc: {selectedPhoto?.name || 'Hiện trạng'}
          </span>
          <span className="absolute right-3 bottom-12 rounded-lg bg-[#1E3A8A]/90 px-2.5 py-1 text-xs font-bold text-white">
            Kết quả: v{currentVersion?.versionNumber || 1}
          </span>
        </div>
      )}

      {/* Interactive 4-Corner Placement Quad Overlay for 3D Perspective */}
      {canPlaceQuad && showHandles && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute inset-0 h-full w-full pointer-events-none">
            <polygon
              points={`${quad.topLeft.x}%,${quad.topLeft.y}% ${quad.topRight.x}%,${quad.topRight.y}% ${quad.bottomRight.x}%,${quad.bottomRight.y}% ${quad.bottomLeft.x}%,${quad.bottomLeft.y}%`}
              fill="rgba(37, 99, 235, 0.14)"
              stroke="#60a5fa"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
          </svg>

          {/* Floating Dimension Badge with 1-Click Unmeasured Mode Toggle */}
          <div
            style={{
              left: `${(quad.topLeft.x + quad.topRight.x) / 2}%`,
              top: `${Math.max(6, Math.min(quad.topLeft.y, quad.topRight.y) - 5)}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="pointer-events-auto absolute flex items-center gap-2 rounded-full bg-slate-900/95 px-3 py-1 text-xs font-bold text-white shadow-lg border border-white/20 whitespace-nowrap"
          >
            {unmeasuredMode ? (
              <span>
                Chưa có số đo · Gợi ý ~{quadEstimatedSpecs.estWidthM.toFixed(2).replace('.', ',')} ×{' '}
                {quadEstimatedSpecs.estHeightM.toFixed(2).replace('.', ',')} m (
                {quadEstimatedSpecs.cabinetCols}×{quadEstimatedSpecs.cabinetRows} Cabin) ·{' '}
                {paramForm.pixelPitch}
              </span>
            ) : (
              <span>
                {paramForm.screenWidthM.toFixed(2).replace('.', ',')} ×{' '}
                {paramForm.screenHeightM.toFixed(2).replace('.', ',')} m · {paramForm.pixelPitch}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const next = !unmeasuredMode;
                setUnmeasuredMode(next);
                if (next) {
                  setParamForm((prev) => ({
                    ...prev,
                    screenWidthM: quadEstimatedSpecs.estWidthM,
                    screenHeightM: quadEstimatedSpecs.estHeightM,
                  }));
                }
              }}
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
                unmeasuredMode
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-white/20 text-blue-200 hover:bg-white/30'
              }`}
              title="Bật chế độ này khi khách hàng chưa đo kích thước tường: hệ thống sẽ tự động tính số lượng Cabin & kích thước gợi ý dựa theo 4 điểm chấm bạn kéo"
            >
              {unmeasuredMode ? 'Đang tự tính theo 4 điểm' : 'Chưa có số đo?'}
            </button>
          </div>

          {(['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] as const).map((corner) => (
            <div
              key={corner}
              onMouseDown={handleMouseDownHandle(corner)}
              style={{
                left: `${quad[corner].x}%`,
                top: `${quad[corner].y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`pointer-events-auto absolute h-4 w-4 cursor-crosshair rounded-full border-2 border-white bg-[#2563EB] shadow-lg transition-transform hover:scale-125 ${
                draggingHandle === corner ? 'ring-4 ring-blue-400' : ''
              }`}
              title={`Kéo góc neo ${corner}`}
            />
          ))}
        </div>
      )}

      {/* Compare Mode Draggable Split Handle */}
      {viewMode === 'compare' && (
        <div
          style={{ left: `${compareSplit}%` }}
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-2xl"
        >
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDraggingCompare(true);
            }}
            className="pointer-events-auto absolute top-1/2 -ml-4 -mt-4 flex h-8 w-8 cursor-ew-resize items-center justify-center rounded-full bg-white shadow-lg text-xs font-bold text-slate-800 hover:scale-110 transition-transform"
            title="Kéo để so sánh Ảnh gốc và Bản thiết kế"
          >
            ↔
          </div>
        </div>
      )}

      {/* Top-Right Canvas Controls (Placement Handles & Fullscreen) */}
      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-xl bg-slate-900/80 p-1 backdrop-blur-xs text-white text-xs">
        {canPlaceQuad && (
          <button
            type="button"
            onClick={() => setShowHandles(!showHandles)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition ${
              showHandles ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
            title="Hiện/Ẩn khung neo màn hình LED"
          >
            <Edit2 className="h-3 w-3" />
            <span>Khung neo LED</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (!document.fullscreenElement) {
              canvasContainerRef.current?.requestFullscreen?.();
            } else {
              document.exitFullscreen?.();
            }
          }}
          className="rounded-lg p-1.5 hover:bg-white/10"
          title="Toàn màn hình"
        >
          <Expand className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Bottom-Right Zoom & Fit Controls */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-slate-900/80 px-2.5 py-1 backdrop-blur-xs text-white text-xs font-semibold">
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
          className="p-1 hover:text-blue-300"
          title="Thu nhỏ"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-11 text-center">{zoomLevel}%</span>
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
          className="p-1 hover:text-blue-300"
          title="Phóng to"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel(100)}
          className="ml-1 px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-xs"
          title="Vừa khung hình"
        >
          Vừa khung
        </button>
      </div>
    </div>
  );
}
