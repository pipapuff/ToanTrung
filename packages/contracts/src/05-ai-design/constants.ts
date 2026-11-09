export const DESIGN_TYPES = ['perspective_3d', 'banner'] as const;

export type DesignType = (typeof DESIGN_TYPES)[number];

export const DESIGN_TYPE_LABELS: Record<DesignType, string> = {
  perspective_3d: 'Dựng nháp phối cảnh 3D màn hình LED',
  banner: 'Tạo hình ảnh & Banner theo tỷ lệ khung LED',
};

export const DESIGN_STATUSES = ['pending', 'ai_drafted', 'in_review', 'completed'] as const;

export type DesignStatus = (typeof DESIGN_STATUSES)[number];

export const DESIGN_STATUS_LABELS: Record<DesignStatus, string> = {
  pending: 'Chờ xử lý AI',
  ai_drafted: 'Đã có bản nháp AI',
  in_review: 'Designer đang hoàn thiện',
  completed: 'Đã phê duyệt & bàn giao',
};

export const AI_PROVIDER_IDS = [
  'google_imagen',
  'openai_dalle',
  'flux_bfl',
  'stability_ai',
  'custom_endpoint',
  'local_sandbox',
] as const;

export type AiProviderId = (typeof AI_PROVIDER_IDS)[number];
