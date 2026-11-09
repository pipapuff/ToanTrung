/**
 * Cổng vào công khai của contracts 05-ai-design.
 * DTO, Zod schema và hằng số đã tách theo từng file cùng thư mục.
 */
export {
  DESIGN_TYPES,
  DESIGN_TYPE_LABELS,
  DESIGN_STATUSES,
  DESIGN_STATUS_LABELS,
  AI_PROVIDER_IDS,
} from './constants';
export type { DesignType, DesignStatus, AiProviderId } from './constants';
export type { AiModelOptionDto, AiProviderCatalogItemDto } from './providers.dto';
export type {
  QuadCoordinatesDto,
  ProjectPhotoItemDto,
  DesignChatMessageDto,
  LedProductSpecDto,
  DesignAssetVersionItemDto,
  DesignRequestItemDto,
} from './dto';
export { containsCustomerPiiInPrompt } from './pii-guard';
export {
  QuadCoordinatesSchema,
  CreatePerspective3dRequestSchema,
  CreateBannerRequestSchema,
  CreateDesignRequestSchema,
  UpdateDesignProjectSchema,
  ChatDesignRequestSchema,
  RegenerateDesignDraftSchema,
  ConfigureAiProvidersSchema,
  ApproveDesignVersionSchema,
  AddProjectPhotoSchema,
} from './schemas';
export type {
  CreateDesignRequestDto,
  UpdateDesignProjectDto,
  ChatDesignRequestDto,
  RegenerateDesignDraftDto,
  ConfigureAiProvidersDto,
  ApproveDesignVersionDto,
  AddProjectPhotoDto,
} from './schemas';
