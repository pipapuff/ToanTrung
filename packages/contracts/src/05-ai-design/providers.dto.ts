import { type AiProviderId } from './constants';

export interface AiModelOptionDto {
  id: string;
  name: string;
  badge: string;
  costPerImageUsd: number;
  supportsInpainting: boolean;
  description: string;
}

export interface AiProviderCatalogItemDto {
  providerId: AiProviderId;
  providerName: string;
  shortName: string;
  isConfigured: boolean;
  isDefault: boolean;
  activeModel: string;
  apiEndpoint?: string;
  hasApiKey: boolean;
  maskedApiKey?: string | null;
  statusLabel: string;
  notes: string;
  models: AiModelOptionDto[];
}
