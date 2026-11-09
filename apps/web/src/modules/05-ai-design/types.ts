import {
  type AiProviderCatalogItemDto,
  type AiProviderId,
  type DesignType,
} from '@toantrung/contracts';

export interface LeadOpt {
  id: number;
  leadCode: string;
  label: string;
}

export interface ProductOpt {
  id: number;
  code: string;
  name: string;
  categoryGroup: string;
}

export interface ProviderStatusInfo {
  provider: AiProviderId;
  providerName: string;
  isConfigured: boolean;
  statusLabel: string;
  activeModel: string;
  costPerImageUsd: number;
  supportsInpainting: boolean;
  notes: string;
  defaultProviderId?: AiProviderId;
  defaultModelId?: string;
  autoFallbackToLocal?: boolean;
  availableProviders?: AiProviderCatalogItemDto[];
}

export interface ProjectParameterFormState {
  projectName: string;
  designType: DesignType;
  leadId: string;
  contactName: string;
  installationInfo: string;
  notes: string;
  productId: number;
  pixelPitch: string;
  screenStyle: 'flat' | 'curved' | 'corner_90';
  screenWidthM: number;
  screenHeightM: number;
  aspectRatio: string;
  aspectLocked: boolean;
  bannerWidthPx: number;
  bannerHeightPx: number;
}

export type Live3dTheme =
  | 'ai_version'
  | 'conference_navy'
  | 'ocean_4k'
  | 'gala_stage'
  | 'factory_andon';
