import type { QuadCoordinatesDto } from '@toantrung/contracts';

/** Kích thước Cabinet LED chuẩn Toàn Trung (mm). */
export const CABINET_WIDTH_MM = 640;
export const CABINET_HEIGHT_MM = 480;

/** Ước tính số Cabinet & kích thước (m) từ 4 điểm chấm khi khách chưa đo thực tế. */
export function estimateQuadSpecs(quad: QuadCoordinatesDto) {
  const topW = Math.hypot(
    quad.topRight.x - quad.topLeft.x,
    (quad.topRight.y - quad.topLeft.y) * 0.56
  );
  const botW = Math.hypot(
    quad.bottomRight.x - quad.bottomLeft.x,
    (quad.bottomRight.y - quad.bottomLeft.y) * 0.56
  );
  const leftH = Math.hypot(
    (quad.bottomLeft.x - quad.topLeft.x) * 1.77,
    quad.bottomLeft.y - quad.topLeft.y
  );
  const rightH = Math.hypot(
    (quad.bottomRight.x - quad.topRight.x) * 1.77,
    quad.bottomRight.y - quad.topRight.y
  );

  const avgSpanW = Math.max(6, (topW + botW) / 2);
  const avgSpanH = Math.max(6, (leftH + rightH) / 2);

  // Map visual span % on a standard 16:9 room/hall photo to standard 640x480mm LED cabinets
  const cabinetCols = Math.max(2, Math.min(30, Math.round((avgSpanW / 100) * 18)));
  const cabinetRows = Math.max(2, Math.min(20, Math.round((avgSpanH / 100) * 12)));
  const estWidthM = Number((cabinetCols * 0.64).toFixed(2));
  const estHeightM = Number((cabinetRows * 0.48).toFixed(2));
  const visualRatio = Number((estWidthM / Math.max(0.48, estHeightM)).toFixed(2));

  let nearestStandardRatio = '16:9';
  if (Math.abs(visualRatio - 16 / 9) <= 0.25) nearestStandardRatio = '16:9';
  else if (Math.abs(visualRatio - 4 / 3) <= 0.22) nearestStandardRatio = '4:3';
  else if (Math.abs(visualRatio - 21 / 9) <= 0.35) nearestStandardRatio = '21:9';
  else if (Math.abs(visualRatio - 1) <= 0.2) nearestStandardRatio = '1:1';
  else if (visualRatio > 2.7) nearestStandardRatio = '32:9';

  return {
    cabinetCols,
    cabinetRows,
    totalCabinets: cabinetCols * cabinetRows,
    estWidthM,
    estHeightM,
    nearestStandardRatio,
  };
}

export interface ComputeLedSpecsInput {
  unmeasuredMode: boolean;
  estWidthM: number;
  estHeightM: number;
  screenWidthM: number;
  screenHeightM: number;
  pixelPitch: string;
}

/** Thông số kỹ thuật LED tính trực tiếp (diện tích, độ phân giải, cabinet, công suất). */
export function computeLedSpecs(input: ComputeLedSpecsInput) {
  const w = input.unmeasuredMode
    ? input.estWidthM
    : Math.max(0.2, Number(input.screenWidthM) || 4.8);
  const h = input.unmeasuredMode
    ? input.estHeightM
    : Math.max(0.2, Number(input.screenHeightM) || 2.7);
  const areaM2 = Number((w * h).toFixed(2));
  const pitchMm = Number(input.pixelPitch.replace(/[^0-9.]/g, '')) || 2.5;
  const resW = Math.round((w * 1000) / pitchMm);
  const resH = Math.round((h * 1000) / pitchMm);
  const cabinetCols = Math.max(1, Math.round((w * 1000) / CABINET_WIDTH_MM));
  const cabinetRows = Math.max(1, Math.round((h * 1000) / CABINET_HEIGHT_MM));
  const cabinetCount = cabinetCols * cabinetRows;
  const moduleCount = cabinetCount * 6;
  const avgKw = Number(((areaM2 * 250) / 1000).toFixed(2));
  const maxKw = Number(((areaM2 * 600) / 1000).toFixed(2));
  return {
    w,
    h,
    areaM2,
    pitchMm,
    resW,
    resH,
    cabinetCols,
    cabinetRows,
    cabinetCount,
    moduleCount,
    avgKw,
    maxKw,
  };
}
