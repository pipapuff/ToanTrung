import { type LedProductSpecDto } from '@toantrung/contracts';

export function computeLedProductSpec(params: {
  productCode?: string;
  productName?: string;
  categoryGroup?: string;
  widthM?: number;
  heightM?: number;
  pitch?: string;
  screenStyle?: 'flat' | 'curved' | 'corner_90';
}): LedProductSpecDto {
  const w = params.widthM && params.widthM > 0 ? params.widthM : 4.8;
  const h = params.heightM && params.heightM > 0 ? params.heightM : 2.7;
  const areaM2 = Number((w * h).toFixed(2));
  const pitch = params.pitch || 'P2.5';
  const pitchMm = Number(pitch.replace(/[^0-9.]/g, '')) || 2.5;

  const resW = Math.round((w * 1000) / pitchMm);
  const resH = Math.round((h * 1000) / pitchMm);

  // Module standard: 320 x 160 mm
  // Cabinet standard: 640 x 480 mm
  const cabinetCols = Math.max(1, Math.round((w * 1000) / 640));
  const cabinetRows = Math.max(1, Math.round((h * 1000) / 480));
  const cabinetCount = cabinetCols * cabinetRows;
  const moduleCount = cabinetCount * 6; // 6 modules per 640x480 cabinet

  return {
    productId: 1,
    productCode: params.productCode || 'LED_INDOOR',
    productName: params.productName || 'Màn hình LED Indoor',
    categoryGroup: params.categoryGroup || 'led_screen',
    screenStyle: params.screenStyle || 'flat',
    pixelPitch: pitch,
    physicalWidthM: w,
    physicalHeightM: h,
    areaM2,
    resolutionWidthPx: resW,
    resolutionHeightPx: resH,
    moduleDimensionsMm: '320 x 160 mm',
    cabinetDimensionsMm: '640 x 480 mm (Nhôm đúc định hình)',
    cabinetCount,
    moduleCount,
    controller: 'Novastar TB60 / VX600 chuyên dụng',
    receivingCard: 'Novastar MRV328',
    powerSupply: 'Meanwell / G-Energy 5V-40A công nghiệp',
    avgPowerWatts: Math.round(areaM2 * 250),
    maxPowerWatts: Math.round(areaM2 * 600),
    technicalNotes:
      'Lắp âm vách tường showroom, khung xương sắt hộp mạ kẽm 40x40cm, viền nhôm anot đen chống lóa, tiếp địa an toàn < 4Ω.',
  };
}
