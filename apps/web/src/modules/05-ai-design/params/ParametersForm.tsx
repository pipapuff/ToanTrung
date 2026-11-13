'use client';

import { parseAspectRatioValue } from '../lib/design-utils';
import { Lock, Unlock } from 'lucide-react';
import { useStudio } from '../StudioContext';

export function ParametersForm({ compact = false }: { compact?: boolean }) {
  const {
    computedLiveSpecs,
    currentProject,
    handleAspectRatioChange,
    handleSaveParameters,
    leadOptions,
    paramForm,
    paramValidationError,
    productOptions,
    quad,
    quadEstimatedSpecs,
    setParamForm,
    setQuad,
    setUnmeasuredMode,
    unmeasuredMode,
  } = useStudio();

  return (
    <form
      onSubmit={handleSaveParameters}
      className={compact ? 'space-y-4 text-sm' : 'grid grid-cols-1 lg:grid-cols-3 gap-5 text-sm'}
    >
      {/* SECTION 1: THÔNG TIN DỰ ÁN */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="text-base font-bold text-slate-900">1. Thông tin dự án</h3>
            <p className="text-xs text-slate-500">
              Định danh dự án, loại thiết kế & liên kết hồ sơ Lead
            </p>
          </div>
          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#1E3A8A] border border-blue-200">
            DA-{String(currentProject?.id || 1).padStart(4, '0')}
          </span>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Tên dự án <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            data-testid="param-project-name"
            value={paramForm.projectName}
            onChange={(e) => setParamForm((p) => ({ ...p, projectName: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Loại dự án thiết kế
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setParamForm((p) => ({ ...p, designType: 'perspective_3d' }))}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                paramForm.designType === 'perspective_3d'
                  ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Phối cảnh 3D LED
            </button>
            <button
              type="button"
              onClick={() => setParamForm((p) => ({ ...p, designType: 'banner' }))}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                paramForm.designType === 'banner'
                  ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Banner khung LED
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Hồ sơ Lead / Khách hàng liên kết
          </label>
          <select
            data-testid="param-lead-select"
            value={paramForm.leadId}
            onChange={(e) => setParamForm((p) => ({ ...p, leadId: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none"
          >
            <option value="">-- Thiết kế độc lập (Không gắn Lead) --</option>
            {leadOptions.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Người liên hệ / Đại diện
          </label>
          <input
            type="text"
            value={paramForm.contactName}
            onChange={(e) => setParamForm((p) => ({ ...p, contactName: e.target.value }))}
            placeholder="VD: Anh Minh — Ban Quản lý Tòa nhà"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Vị trí & bối cảnh lắp đặt
          </label>
          <input
            type="text"
            data-testid="param-installation-info"
            value={paramForm.installationInfo}
            onChange={(e) => setParamForm((p) => ({ ...p, installationInfo: e.target.value }))}
            placeholder="VD: Vách sảnh chính tầng trệt, cách sàn 1.2m"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Ghi chú kỹ thuật
          </label>
          <textarea
            rows={2}
            value={paramForm.notes}
            onChange={(e) => setParamForm((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Ghi chú kết cấu khung, nguồn điện, yêu cầu thẩm mỹ..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none"
          />
        </div>
      </div>

      {/* SECTION 2: THÔNG SỐ KỸ THUẬT LED */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="text-base font-bold text-slate-900">2. Thông số kỹ thuật LED</h3>
            <p className="text-xs text-slate-500">
              Sản phẩm phê duyệt, bước điểm ảnh (mm) & kích thước (m)
            </p>
          </div>
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono font-bold text-slate-700">
            {paramForm.pixelPitch} · {computedLiveSpecs.areaM2} m²
          </span>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Dòng sản phẩm Toàn Trung phê duyệt
          </label>
          <select
            data-testid="param-product-select"
            value={paramForm.productId}
            onChange={(e) =>
              setParamForm((p) => ({ ...p, productId: Number(e.target.value) || 1 }))
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none"
          >
            {productOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Bước điểm ảnh (mm)
            </label>
            <select
              data-testid="param-pixel-pitch"
              value={paramForm.pixelPitch}
              onChange={(e) => setParamForm((p) => ({ ...p, pixelPitch: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-[#2563EB] focus:outline-none"
            >
              <option value="P1.25">P1.25 (1.25 mm)</option>
              <option value="P1.53">P1.53 (1.53 mm)</option>
              <option value="P1.86">P1.86 (1.86 mm)</option>
              <option value="P2.0">P2.0 (2.00 mm)</option>
              <option value="P2.5">P2.5 (2.50 mm)</option>
              <option value="P3.0">P3.0 (3.00 mm)</option>
              <option value="P4.0">P4.0 (4.00 mm)</option>
              <option value="P5.0">P5.0 (5.00 mm)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Kiểu màn hình</label>
            <select
              value={paramForm.screenStyle}
              onChange={(e) =>
                setParamForm((p) => ({
                  ...p,
                  screenStyle: e.target.value as 'flat' | 'curved' | 'corner_90',
                }))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none"
            >
              <option value="flat">Màn hình phẳng</option>
              <option value="curved">Màn hình cong</option>
              <option value="corner_90">Vuông góc 90° (3D)</option>
            </select>
          </div>
        </div>

        {/* Toggle for Unmeasured Projects (Chưa có số liệu đo đạc thực tế -> Ước tính theo 4 điểm chấm) */}
        <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <label className="flex cursor-pointer items-center gap-2 font-bold text-[#1E3A8A]">
              <input
                type="checkbox"
                checked={unmeasuredMode}
                onChange={(e) => {
                  const next = e.target.checked;
                  setUnmeasuredMode(next);
                  if (next) {
                    setParamForm((prev) => ({
                      ...prev,
                      screenWidthM: quadEstimatedSpecs.estWidthM,
                      screenHeightM: quadEstimatedSpecs.estHeightM,
                    }));
                  }
                }}
                className="h-4 w-4 rounded border-slate-300 text-[#1E3A8A]"
              />
              <span>Chưa có số liệu đo đạc (Tự tính theo 4 điểm chấm)</span>
            </label>
            <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-blue-200">
              {quadEstimatedSpecs.cabinetCols}×{quadEstimatedSpecs.cabinetRows} Cabin
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
            Khi khách chưa đo kích thước tường thực tế, bạn chỉ cần kéo 4 điểm chấm xanh trên ảnh.
            Hệ thống tự động quy đổi vùng kéo sang bội số chuẩn Cabin LED Toàn Trung (640×480mm):{' '}
            <strong className="text-slate-900">
              ~{quadEstimatedSpecs.estWidthM}m × {quadEstimatedSpecs.estHeightM}m
            </strong>
            .
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {unmeasuredMode ? 'Ngang ước tính (m)' : 'Chiều ngang LED (m)'}
            </label>
            <input
              type="number"
              step="0.1"
              min="0.3"
              max="200"
              data-testid="param-screen-width-m"
              value={unmeasuredMode ? quadEstimatedSpecs.estWidthM : paramForm.screenWidthM}
              onChange={(e) => {
                setUnmeasuredMode(false);
                const nextW = Number(e.target.value) || 0.5;
                const ratioNum = parseAspectRatioValue(paramForm.aspectRatio);
                setParamForm((prev) => ({
                  ...prev,
                  screenWidthM: nextW,
                  screenHeightM:
                    prev.aspectLocked && ratioNum
                      ? Number((nextW / ratioNum).toFixed(2))
                      : prev.screenHeightM,
                }));
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono font-semibold text-slate-900 focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {unmeasuredMode ? 'Cao ước tính (m)' : 'Chiều cao LED (m)'}
            </label>
            <input
              type="number"
              step="0.1"
              min="0.3"
              max="100"
              data-testid="param-screen-height-m"
              value={unmeasuredMode ? quadEstimatedSpecs.estHeightM : paramForm.screenHeightM}
              onChange={(e) => {
                setUnmeasuredMode(false);
                const nextH = Number(e.target.value) || 0.5;
                const ratioNum = parseAspectRatioValue(paramForm.aspectRatio);
                setParamForm((prev) => ({
                  ...prev,
                  screenHeightM: nextH,
                  screenWidthM:
                    prev.aspectLocked && ratioNum
                      ? Number((nextH * ratioNum).toFixed(2))
                      : prev.screenWidthM,
                }));
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono font-semibold text-slate-900 focus:border-[#2563EB] focus:outline-none"
            />
          </div>
        </div>

        {/* Computed LED Engineering Summary */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Diện tích hiển thị thực tế:</span>
            <span className="font-bold text-slate-900">{computedLiveSpecs.areaM2} m²</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Độ phân giải điểm ảnh thực:</span>
            <span className="font-mono font-bold text-[#1E3A8A]">
              {computedLiveSpecs.resW} × {computedLiveSpecs.resH} px
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Cấu hình Cabinet (640×480mm):</span>
            <span className="font-semibold text-slate-800">
              {computedLiveSpecs.cabinetCount} Cabinet ({computedLiveSpecs.moduleCount} Module
              320×160mm)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Bộ xử lý & Nguồn cấp:</span>
            <span className="font-semibold text-slate-800">Novastar VX600 · Meanwell 5V-40A</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Công suất tiêu thụ (TB / Cực đại):</span>
            <span className="font-semibold text-slate-800">
              {computedLiveSpecs.avgKw} kW / {computedLiveSpecs.maxKw} kW
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: CÀI ĐẶT ĐẦU RA */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col justify-between space-y-3.5">
        <div className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-base font-bold text-slate-900">3. Cài đặt đầu ra</h3>
              <p className="text-xs text-slate-500">
                Tỷ lệ khung hình, khóa tỷ lệ & độ phân giải xuất file (px)
              </p>
            </div>
            <button
              type="button"
              data-testid="param-aspect-lock-btn"
              onClick={() => setParamForm((p) => ({ ...p, aspectLocked: !p.aspectLocked }))}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                paramForm.aspectLocked
                  ? 'border-blue-200 bg-blue-50 text-[#1E3A8A]'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
              title="Khóa hoặc mở khóa tỷ lệ khung hình khi nhập kích thước"
            >
              {paramForm.aspectLocked ? (
                <Lock className="h-3.5 w-3.5" />
              ) : (
                <Unlock className="h-3.5 w-3.5" />
              )}
              <span>{paramForm.aspectLocked ? 'Đã khóa tỷ lệ' : 'Tỷ lệ tự do'}</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Tỷ lệ khung hình chuẩn
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['16:9', '9:16', '4:3', '21:9', '1:1', '32:9'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleAspectRatioChange(r)}
                  className={`rounded-xl border py-1.5 text-xs font-bold transition ${
                    paramForm.aspectRatio === r
                      ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Chiều rộng ảnh xuất (px)
              </label>
              <input
                type="number"
                min="128"
                max="15360"
                data-testid="param-banner-width-px"
                value={paramForm.bannerWidthPx}
                onChange={(e) => {
                  const nextPxW = Number(e.target.value) || 1920;
                  const ratioNum = parseAspectRatioValue(paramForm.aspectRatio);
                  setParamForm((prev) => ({
                    ...prev,
                    bannerWidthPx: nextPxW,
                    bannerHeightPx:
                      prev.aspectLocked && ratioNum
                        ? Math.max(64, Math.round(nextPxW / ratioNum))
                        : prev.bannerHeightPx,
                  }));
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono font-semibold text-slate-900 focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Chiều cao ảnh xuất (px)
              </label>
              <input
                type="number"
                min="64"
                max="8640"
                data-testid="param-banner-height-px"
                value={paramForm.bannerHeightPx}
                onChange={(e) => {
                  const nextPxH = Number(e.target.value) || 1080;
                  const ratioNum = parseAspectRatioValue(paramForm.aspectRatio);
                  setParamForm((prev) => ({
                    ...prev,
                    bannerHeightPx: nextPxH,
                    bannerWidthPx:
                      prev.aspectLocked && ratioNum
                        ? Math.max(128, Math.round(nextPxH * ratioNum))
                        : prev.bannerWidthPx,
                  }));
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono font-semibold text-slate-900 focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          {paramForm.designType === 'perspective_3d' ? (
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-[#1E3A8A]">Tọa độ khung neo phối cảnh 4 góc (%)</div>
              <div className="font-mono text-[11px] text-slate-600">
                TL({quad.topLeft.x}%, {quad.topLeft.y}%) · TR({quad.topRight.x}%, {quad.topRight.y}
                %) · BR(
                {quad.bottomRight.x}%, {quad.bottomRight.y}%) · BL({quad.bottomLeft.x}%,{' '}
                {quad.bottomLeft.y}%)
              </div>
              <button
                type="button"
                onClick={() =>
                  setQuad({
                    topLeft: { x: 64.2, y: 44.5 },
                    topRight: { x: 93.8, y: 45.2 },
                    bottomRight: { x: 94.5, y: 72.8 },
                    bottomLeft: { x: 64.5, y: 70.1 },
                  })
                }
                className="text-xs font-semibold text-[#2563EB] hover:underline pt-0.5"
              >
                Đặt lại vị trí neo mặc định
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-slate-700">
              <div className="font-bold text-[#1E3A8A]">
                Chế độ thiết kế Banner truyền thông LED
              </div>
              <p className="mt-0.5 text-slate-600">
                Xuất file đồ họa chuẩn pixel theo đúng tỷ lệ module cabin LED để nạp trực tiếp vào
                bộ xử lý Novastar.
              </p>
            </div>
          )}

          {paramValidationError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-700">
              {paramValidationError}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
