import {
  type DesignChatMessageDto,
  type LedProductSpecDto,
  type ProjectPhotoItemDto,
  type QuadCoordinatesDto,
} from '@toantrung/contracts';

export interface StoredMetadata {
  projectName?: string;
  contactName?: string | null;
  installationInfo?: string | null;
  productId?: number | null;
  pixelPitch?: string;
  screenStyle?: 'flat' | 'curved' | 'corner_90';
  screenWidthM?: number;
  screenHeightM?: number;
  bannerWidthPx?: number;
  bannerHeightPx?: number;
  aspectLocked?: boolean;
  isArchived?: boolean;
  photos?: ProjectPhotoItemDto[];
  placementQuad?: QuadCoordinatesDto;
  chatMessages?: DesignChatMessageDto[];
  productSpec?: LedProductSpecDto;
}

export function parseProjectMetadata(jsonStr: string | null): StoredMetadata {
  if (!jsonStr) return {};
  try {
    return JSON.parse(jsonStr) as StoredMetadata;
  } catch {
    return {};
  }
}
