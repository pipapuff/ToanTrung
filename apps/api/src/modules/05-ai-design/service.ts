/**
 * Cổng vào công khai của module 05-ai-design (giữ nguyên đường dẫn import cũ).
 * Logic đã được tách vào domain/ và services/.
 */
export { computeLedProductSpec } from './domain/led-spec';
export { getAiDesignStatus, configureAiProviders } from './services/provider-config.service';
export { listDesignRequestsForUser } from './services/project-query.service';
export {
  createDesignRequestWithAiDraft,
  processChatDesignRequest,
  regenerateDesignDraftByAi,
} from './services/generation.service';
export { updateDesignProject, deleteDesignProject } from './services/project-command.service';
export { addProjectPhoto, deleteProjectPhoto } from './services/photo.service';
export {
  approveDesignAssetVersion,
  saveCompositedDraftVersion,
  uploadDesignerFinalRender,
} from './services/version.service';
