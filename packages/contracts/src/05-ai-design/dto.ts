import { type MonetaryAmountDto } from '../common';
import { type DesignStatus, type DesignType } from './constants';

export interface QuadCoordinatesDto {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
}

export interface ProjectPhotoItemDto {
  id: string;
  name: string;
  url: string;
  storageObjectKey?: string;
  selected: boolean;
  uploadedAt: string;
  sourceLeadAttachmentId?: number;
}

export interface DesignChatMessageDto {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  versionId?: number;
  versionNumber?: number;
  providerId?: string;
  modelUsed?: string;
  durationSec?: number;
  tokenUsed?: number;
  cost?: string;
  status?: 'success' | 'failed' | 'timeout' | 'pending';
}

export interface LedProductSpecDto {
  productId: number;
  productCode: string;
  productName: string;
  categoryGroup: string;
  screenStyle: 'flat' | 'curved' | 'corner_90';
  pixelPitch: string; // e.g. "P2.5", "P2.0", "P3", "P4"
  physicalWidthM: number;
  physicalHeightM: number;
  areaM2: number;
  resolutionWidthPx: number;
  resolutionHeightPx: number;
  moduleDimensionsMm: string; // e.g. "320 x 160 mm"
  cabinetDimensionsMm: string; // e.g. "640 x 480 mm"
  cabinetCount: number;
  moduleCount: number;
  controller: string; // e.g. "Novastar TB60 / VX600"
  receivingCard: string; // e.g. "Novastar MRV328"
  powerSupply: string; // e.g. "Meanwell / G-Energy 5V-40A"
  avgPowerWatts: number;
  maxPowerWatts: number;
  technicalNotes: string;
}

export interface DesignAssetVersionItemDto {
  id: number;
  designRequestId: number;
  versionNumber: number;
  sourceType: 'AI_DRAFT' | 'DESIGNER_FINAL_UPLOAD';
  providerId?: string | null;
  modelUsed?: string | null;
  storageObjectKey: string;
  downloadUrl: string;
  mimeType: string;
  fileSizeBytes: number | null;
  widthPx: number | null;
  heightPx: number | null;
  aspectRatio: string | null;
  promptUsed: string | null;
  processingDurationMs: number | null;
  tokenUsed: number | null;
  cost: MonetaryAmountDto | null;
  isApprovedFinal: boolean;
  uploadedByName: string;
  createdAt: string;
}

export interface DesignRequestItemDto {
  id: number;
  version: number;
  projectName: string;
  contactName: string | null;
  installationInfo: string | null;
  notes: string | null;
  leadId: number | null;
  leadCode: string | null;
  leadProjectLabel: string | null;
  productId: number | null;
  productName: string | null;
  requestedBySalesId: number | null;
  requestedBySalesName: string | null;
  assignedDesignerId: number;
  assignedDesignerName: string;
  designType: DesignType;
  ledModuleSpec: string | null;
  screenWidthM: number | null;
  screenHeightM: number | null;
  installZoneBboxJson: string | null;
  placementQuad: QuadCoordinatesDto | null;
  bannerWidthPx: number | null;
  bannerHeightPx: number | null;
  aspectRatio: string | null;
  aspectLocked?: boolean;
  isArchived?: boolean;
  sitePhotoDownloadUrl: string | null;
  photos: ProjectPhotoItemDto[];
  chatMessages: DesignChatMessageDto[];
  productSpec: LedProductSpecDto | null;
  aiPrompt: string;
  aiDraftDownloadUrl: string | null;
  finalRenderDownloadUrl: string | null;
  approvedVersionId: number | null;
  processingDurationSec: number | null;
  tokenCost: number | null;
  totalCost: MonetaryAmountDto | null;
  status: DesignStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  assetVersions: DesignAssetVersionItemDto[];
}
