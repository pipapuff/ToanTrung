import { type DesignStatus, type DesignType } from '@toantrung/contracts';

export function mapDbRequestTypeToDto(dbType: string): DesignType {
  return dbType === 'banner' ? 'banner' : 'perspective_3d';
}

export function mapDbStatusToDto(dbStatus: string): DesignStatus {
  if (dbStatus === 'completed') return 'completed';
  if (dbStatus === 'in_review') return 'in_review';
  if (dbStatus === 'ai_drafting' || dbStatus === 'ai_drafted') return 'ai_drafted';
  return 'pending';
}

export function parseDimensions(dimStr: string | null): {
  screenWidthM: number | null;
  screenHeightM: number | null;
  bannerWidthPx: number | null;
  bannerHeightPx: number | null;
} {
  if (!dimStr) {
    return {
      screenWidthM: null,
      screenHeightM: null,
      bannerWidthPx: null,
      bannerHeightPx: null,
    };
  }
  const pxMatch = dimStr.match(/(\d+)\s*x\s*(\d+)\s*px/i);
  if (pxMatch) {
    return {
      screenWidthM: null,
      screenHeightM: null,
      bannerWidthPx: Number(pxMatch[1]),
      bannerHeightPx: Number(pxMatch[2]),
    };
  }
  const mMatch = dimStr.match(/([\d.,]+)\s*m?\s*x\s*(?:Cao\s*)?([\d.,]+)\s*m/i);
  if (mMatch) {
    return {
      screenWidthM: Number(mMatch[1].replace(',', '.')),
      screenHeightM: Number(mMatch[2].replace(',', '.')),
      bannerWidthPx: null,
      bannerHeightPx: null,
    };
  }
  return {
    screenWidthM: 4.8,
    screenHeightM: 2.7,
    bannerWidthPx: 1920,
    bannerHeightPx: 1080,
  };
}
