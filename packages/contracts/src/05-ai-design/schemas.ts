import { z } from 'zod';
import { AI_PROVIDER_IDS, DESIGN_TYPES } from './constants';

export const QuadCoordinatesSchema = z.object({
  topLeft: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }),
  topRight: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }),
  bottomRight: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }),
  bottomLeft: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }),
});

export const CreatePerspective3dRequestSchema = z.object({
  designType: z.literal('perspective_3d'),
  projectName: z
    .string()
    .trim()
    .min(2, 'Tên dự án tối thiểu 2 ký tự.')
    .max(150)
    .default('Showroom LED'),
  contactName: z.string().trim().max(120).optional().nullable(),
  installationInfo: z.string().trim().max(500).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  leadId: z.number().int().positive().optional().nullable(),
  productId: z.number().int().positive().default(1),
  ledModuleSpec: z
    .string()
    .trim()
    .min(2, 'Vui lòng chọn cấu hình module LED (P2, P2.5, P3, P4...).')
    .max(120)
    .default('P2.5 Indoor'),
  screenWidthM: z
    .number()
    .positive('Chiều ngang màn hình (m) phải lớn hơn 0.')
    .max(200)
    .default(4.8),
  screenHeightM: z
    .number()
    .positive('Chiều cao màn hình (m) phải lớn hơn 0.')
    .max(100)
    .default(2.7),
  installZoneBboxJson: z.string().trim().min(2).max(500).optional().nullable(),
  placementQuad: QuadCoordinatesSchema.optional().nullable(),
  sitePhotoObjectKey: z.string().trim().max(260).optional().nullable(),
  aiPrompt: z.string().trim().min(5, 'Prompt mô tả phối cảnh cần tối thiểu 5 ký tự.').max(1500),
  quality: z.enum(['draft', 'high_quality']).default('draft'),
  providerId: z.enum(AI_PROVIDER_IDS).optional(),
  modelId: z.string().trim().max(120).optional(),
  simulateAiTimeout: z.boolean().optional(),
});

export const CreateBannerRequestSchema = z.object({
  designType: z.literal('banner'),
  projectName: z.string().trim().min(2).max(150).default('Banner LED'),
  contactName: z.string().trim().max(120).optional().nullable(),
  installationInfo: z.string().trim().max(500).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  /** Banner có thể tạo độc lập không cần gắn Lead theo UC06 Luồng phụ 2a */
  leadId: z.number().int().positive().optional().nullable(),
  productId: z.number().int().positive().optional().nullable(),
  bannerWidthPx: z
    .number()
    .int()
    .min(128, 'Chiều rộng pixel tối thiểu 128px.')
    .max(15360)
    .default(1920),
  bannerHeightPx: z
    .number()
    .int()
    .min(64, 'Chiều cao pixel tối thiểu 64px.')
    .max(8640)
    .default(1080),
  aspectRatio: z.string().trim().min(2).max(30).default('16:9'),
  placementQuad: QuadCoordinatesSchema.optional().nullable(),
  aiPrompt: z
    .string()
    .trim()
    .min(5, 'Prompt mô tả nội dung Banner cần tối thiểu 5 ký tự.')
    .max(1500),
  quality: z.enum(['draft', 'high_quality']).default('draft'),
  providerId: z.enum(AI_PROVIDER_IDS).optional(),
  modelId: z.string().trim().max(120).optional(),
  simulateAiTimeout: z.boolean().optional(),
});

export const CreateDesignRequestSchema = z.discriminatedUnion('designType', [
  CreatePerspective3dRequestSchema,
  CreateBannerRequestSchema,
]);

export type CreateDesignRequestDto = z.infer<typeof CreateDesignRequestSchema>;

export const UpdateDesignProjectSchema = z.object({
  projectName: z.string().trim().min(2).max(150).optional(),
  designType: z.enum(DESIGN_TYPES).optional(),
  contactName: z.string().trim().max(120).optional().nullable(),
  installationInfo: z.string().trim().max(500).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  leadId: z.number().int().positive().optional().nullable(),
  productId: z.number().int().positive().optional().nullable(),
  ledModuleSpec: z.string().trim().max(120).optional().nullable(),
  pixelPitch: z.string().trim().max(30).optional().nullable(),
  screenStyle: z.enum(['flat', 'curved', 'corner_90']).optional(),
  screenWidthM: z.number().positive().max(200).optional().nullable(),
  screenHeightM: z.number().positive().max(100).optional().nullable(),
  bannerWidthPx: z.number().int().min(128).max(15360).optional().nullable(),
  bannerHeightPx: z.number().int().min(64).max(8640).optional().nullable(),
  aspectRatio: z.string().trim().max(30).optional().nullable(),
  aspectLocked: z.boolean().optional(),
  placementQuad: QuadCoordinatesSchema.optional().nullable(),
  selectedPhotoId: z.string().trim().optional(),
  renamePhotoId: z.string().trim().optional(),
  renamePhotoName: z.string().trim().min(1).max(120).optional(),
  renameVersionId: z.number().int().positive().optional(),
  renameVersionLabel: z.string().trim().min(1).max(200).optional(),
  isArchived: z.boolean().optional(),
  importLeadAttachments: z.boolean().optional(),
  expectedVersion: z.number().int().positive().optional(),
});

export type UpdateDesignProjectDto = z.infer<typeof UpdateDesignProjectSchema>;

export const ChatDesignRequestSchema = z.object({
  expectedVersion: z.number().int().positive(),
  prompt: z.string().trim().min(5, 'Yêu cầu chỉnh sửa cần tối thiểu 5 ký tự.').max(1500),
  quality: z.enum(['draft', 'high_quality']).default('draft'),
  providerId: z.enum(AI_PROVIDER_IDS).optional(),
  modelId: z.string().trim().max(120).optional(),
  placementQuad: QuadCoordinatesSchema.optional().nullable(),
  selectedPhotoUrl: z.string().trim().optional().nullable(),
  productId: z.number().int().positive().optional().nullable(),
  screenWidthM: z.number().positive().max(200).optional().nullable(),
  screenHeightM: z.number().positive().max(100).optional().nullable(),
  bannerWidthPx: z.number().int().min(128).max(15360).optional().nullable(),
  bannerHeightPx: z.number().int().min(64).max(8640).optional().nullable(),
  aspectRatio: z.string().trim().max(30).optional().nullable(),
  simulateAiTimeout: z.boolean().optional(),
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
});

export type ChatDesignRequestDto = z.infer<typeof ChatDesignRequestSchema>;

export const RegenerateDesignDraftSchema = z.object({
  expectedVersion: z.number().int().positive(),
  aiPrompt: z.string().trim().min(5).max(1500),
  providerId: z.enum(AI_PROVIDER_IDS).optional(),
  modelId: z.string().trim().max(120).optional(),
  ledModuleSpec: z.string().trim().max(120).optional().nullable(),
  screenWidthM: z.number().positive().max(200).optional().nullable(),
  screenHeightM: z.number().positive().max(100).optional().nullable(),
  bannerWidthPx: z.number().int().min(128).max(15360).optional().nullable(),
  bannerHeightPx: z.number().int().min(64).max(8640).optional().nullable(),
  aspectRatio: z.string().trim().max(30).optional().nullable(),
  quality: z.enum(['draft', 'high_quality']).optional(),
  simulateAiTimeout: z.boolean().optional(),
});

export type RegenerateDesignDraftDto = z.infer<typeof RegenerateDesignDraftSchema>;

export const ConfigureAiProvidersSchema = z.object({
  defaultProviderId: z.enum(AI_PROVIDER_IDS),
  defaultModelId: z.string().trim().min(1).max(120).optional(),
  autoFallbackToLocal: z.boolean().default(true),
  providerConfig: z
    .object({
      providerId: z.enum(AI_PROVIDER_IDS),
      apiKey: z.string().trim().max(300).optional().nullable(),
      apiEndpoint: z.string().trim().max(400).optional().nullable(),
      activeModel: z.string().trim().max(120).optional().nullable(),
    })
    .optional(),
});

export type ConfigureAiProvidersDto = z.infer<typeof ConfigureAiProvidersSchema>;

export const ApproveDesignVersionSchema = z.object({
  expectedVersion: z.number().int().positive(),
  versionId: z.number().int().positive(),
  note: z.string().trim().max(500).optional(),
});

export type ApproveDesignVersionDto = z.infer<typeof ApproveDesignVersionSchema>;

export const AddProjectPhotoSchema = z.object({
  photoName: z.string().trim().min(1).max(120).default('Ảnh hiện trạng'),
  fileName: z.string().trim().min(1).max(200),
  mimeType: z.string().trim().default('image/jpeg'),
  base64Data: z.string().min(1),
});

export type AddProjectPhotoDto = z.infer<typeof AddProjectPhotoSchema>;
