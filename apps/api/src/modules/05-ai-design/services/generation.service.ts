import {
  containsCustomerPiiInPrompt,
  type ChatDesignRequestDto,
  type CreateDesignRequestDto,
  type DesignChatMessageDto,
  type ProjectPhotoItemDto,
  type RegenerateDesignDraftDto,
  type SessionUserDto,
} from '@toantrung/contracts';
import { ConcurrencyConflictError, prisma, recordAiUsageAttempt } from '@toantrung/database';
import { AiDesignProviderFactory } from '../providers';
import { savePrivateBusinessFile } from '../../../core/storage/private-files.service';
import { DEFAULT_PLACEMENT_QUAD, DEFAULT_SHOWROOM_PHOTO } from '../domain/constants';
import { computeLedProductSpec } from '../domain/led-spec';
import { parseProjectMetadata, type StoredMetadata } from '../domain/metadata';

export async function createDesignRequestWithAiDraft(
  actor: SessionUserDto,
  input: CreateDesignRequestDto
) {
  const piiCheck = containsCustomerPiiInPrompt(input.aiPrompt);
  if (piiCheck.hasPii) {
    throw new Error(piiCheck.reason);
  }

  const designerUser = await prisma.user.findFirst({
    where: {
      isActive: true,
      role: { roleCode: 'DESIGNER' },
    },
    orderBy: { id: 'asc' },
  });
  const assignedDesignerId = designerUser?.id ?? actor.id;

  let ledCategory = 'Banner Truyền thông LED';
  let screenDimensions = '1920x1080px';
  let aspectRatio = '16:9';
  let sitePhotoUrl: string | null = null;
  let dimensionsData: { widthM: number; heightM: number } = { widthM: 4.8, heightM: 2.7 };

  if (input.designType === 'perspective_3d') {
    const product = await prisma.product.findUnique({ where: { id: input.productId } });
    ledCategory = product ? `${product.productName} (${input.ledModuleSpec})` : input.ledModuleSpec;
    screenDimensions = `${input.screenWidthM.toFixed(2).replace('.', ',')} x ${input.screenHeightM.toFixed(2).replace('.', ',')} m`;
    aspectRatio = `${input.screenWidthM}:${input.screenHeightM}`;
    sitePhotoUrl = input.sitePhotoObjectKey || DEFAULT_SHOWROOM_PHOTO;
    dimensionsData = { widthM: input.screenWidthM, heightM: input.screenHeightM };
  } else {
    if (input.productId) {
      const product = await prisma.product.findUnique({ where: { id: input.productId } });
      if (product) {
        ledCategory = `Banner ${product.productName}`;
      }
    }
    screenDimensions = `${input.bannerWidthPx}x${input.bannerHeightPx}px`;
    aspectRatio = input.aspectRatio;
  }

  const dbRequestType: 'banner' | '3d_perspective' =
    input.designType === 'banner' ? 'banner' : '3d_perspective';

  // Call provider adapter with Multi-AI selection & auto-fallback
  const providerResult =
    input.designType === 'perspective_3d'
      ? await AiDesignProviderFactory.executePerspectiveWithFallback(
          {
            workflow: 'perspective_3d',
            prompt: input.aiPrompt,
            referenceImageUrl: sitePhotoUrl || DEFAULT_SHOWROOM_PHOTO,
            placementQuad: input.placementQuad || DEFAULT_PLACEMENT_QUAD,
            dimensions: {
              widthM: input.screenWidthM,
              heightM: input.screenHeightM,
              aspectRatio,
            },
            quality: input.quality || 'draft',
            modelId: input.modelId,
            idempotencyKey: `design-create-${Date.now()}`,
            simulateTimeout: input.simulateAiTimeout,
          },
          input.providerId
        )
      : await AiDesignProviderFactory.executeBannerWithFallback(
          {
            workflow: 'banner',
            prompt: input.aiPrompt,
            dimensions: {
              widthPx: input.bannerWidthPx,
              heightPx: input.bannerHeightPx,
              aspectRatio,
            },
            quality: input.quality || 'draft',
            modelId: input.modelId,
            idempotencyKey: `design-create-banner-${Date.now()}`,
            simulateTimeout: input.simulateAiTimeout,
          },
          input.providerId
        );

  if (providerResult.status === 'timeout' || input.simulateAiTimeout) {
    const pendingReq = await prisma.designRequest.create({
      data: {
        leadId: input.leadId ?? null,
        requestedBySalesId:
          actor.roleCode === 'SALES' || actor.roleCode === 'SALES_LEAD' ? actor.id : null,
        assignedDesignerId,
        requestType: dbRequestType,
        ledCategory,
        screenDimensions,
        aspectRatio,
        installPositionJson: JSON.stringify({
          projectName: input.projectName || 'Dự án LED',
          contactName: input.contactName || null,
          installationInfo: input.installationInfo || null,
          placementQuad: input.placementQuad || DEFAULT_PLACEMENT_QUAD,
          chatMessages: [
            {
              id: `msg-user-${Date.now()}`,
              role: 'user',
              text: input.aiPrompt,
              timestamp: new Date().toISOString(),
            },
            {
              id: `msg-ai-${Date.now()}`,
              role: 'assistant',
              text: 'Hệ thống AI quá thời gian phản hồi (UC06 E1). Yêu cầu đã được lưu lại để Designer thử lại.',
              timestamp: new Date().toISOString(),
              status: 'timeout',
            },
          ],
        }),
        sitePhotoUrl,
        prompt: input.aiPrompt,
        designStatus: 'pending',
        notes:
          'AI quá thời gian phản hồi (UC06 E1). Đã lưu thông số để Designer thử lại hoặc tải file thủ công.',
      },
    });

    await recordAiUsageAttempt(prisma, {
      idempotencyKey: `design-ai-timeout-${pendingReq.id}-${Date.now()}`,
      attemptNumber: 1,
      moduleCode: '05-ai-design',
      taskType: dbRequestType,
      userId: actor.id,
      designRequestId: pendingReq.id,
      modelName: providerResult.modelUsed || 'imagen-3.0-generate-002',
      promptTokens: null,
      completionTokens: null,
      totalTokens: null,
      costMicros: null,
      durationMs: providerResult.durationMs,
      status: 'timeout',
      errorMessage: 'Hệ thống AI dựng ảnh quá thời gian phản hồi 60s (Simulated UC06 E1).',
    });

    return {
      id: pendingReq.id,
      status: 'pending',
      warning:
        'Kết nối AI quá thời gian phản hồi (UC06 E1). Hệ thống đã bảo toàn thông số yêu cầu để bạn thử lại.',
    };
  }

  // Save generated asset to private storage
  const savedFile = savePrivateBusinessFile({
    bucket: 'design',
    prefix: `ai-draft-${dbRequestType}-v1`,
    fileBuffer: providerResult.imageBuffer,
    declaredMimeType: providerResult.mimeType || 'image/png',
  });

  const productSpec = computeLedProductSpec({
    productName: ledCategory,
    widthM: dimensionsData.widthM,
    heightM: dimensionsData.heightM,
    pitch: 'P2.5',
  });

  // Gather any permitted site_photo attachments from the linked Lead
  const rawPhotoKey = 'sitePhotoObjectKey' in input ? input.sitePhotoObjectKey : undefined;
  const leadPhotos: ProjectPhotoItemDto[] = [];
  let leadContactFallback: string | null = null;
  if (input.leadId) {
    const linkedLead = await prisma.lead.findUnique({
      where: { id: input.leadId },
      include: {
        attachments: {
          where: { attachmentType: { not: 'quote_doc' } },
          orderBy: { uploadedAt: 'desc' },
          take: 10,
        },
      },
    });
    if (linkedLead) {
      leadContactFallback = linkedLead.contactName || linkedLead.companyName || null;
      for (const att of linkedLead.attachments) {
        const isImg =
          att.attachmentType === 'site_photo' ||
          /\.(png|jpe?g|webp)$/i.test(att.fileName || '') ||
          /\.(png|jpe?g|webp)$/i.test(att.fileUrl || '');
        if (isImg) {
          leadPhotos.push({
            id: `lead-att-${att.id}`,
            name: att.fileName || `Ảnh khảo sát Lead #${att.id}`,
            url: `/api/v1/leads/attachments/${att.id}`,
            storageObjectKey: att.fileUrl,
            selected: leadPhotos.length === 0 && !rawPhotoKey,
            uploadedAt: att.uploadedAt.toISOString(),
            sourceLeadAttachmentId: att.id,
          });
        }
      }
    }
  }

  const defaultPhotos: ProjectPhotoItemDto[] = [
    ...(rawPhotoKey
      ? [
          {
            id: `photo-input-${Date.now()}`,
            name: 'Ảnh hiện trạng tải lên',
            url:
              rawPhotoKey.startsWith('/') || rawPhotoKey.startsWith('http')
                ? rawPhotoKey
                : `/api/v1/design/asset-file?key=${encodeURIComponent(rawPhotoKey)}`,
            storageObjectKey: rawPhotoKey,
            selected: true,
            uploadedAt: new Date().toISOString(),
          },
        ]
      : []),
    ...leadPhotos,
    {
      id: `photo-1-${Date.now()}`,
      name: 'Ảnh chính diện showroom',
      url: DEFAULT_SHOWROOM_PHOTO,
      selected: !rawPhotoKey && leadPhotos.length === 0,
      uploadedAt: new Date().toISOString(),
    },
    {
      id: `photo-2-${Date.now()}`,
      name: 'Vách tủ module LED',
      url: DEFAULT_SHOWROOM_PHOTO,
      selected: false,
      uploadedAt: new Date().toISOString(),
    },
  ];

  const initialMetadata: StoredMetadata = {
    projectName:
      input.projectName ||
      (input.designType === 'banner' ? 'Banner Quảng cáo LED' : 'Showroom LED'),
    contactName: input.contactName || leadContactFallback,
    installationInfo: input.installationInfo || 'Tường bên phải showroom, cách sàn 1.2m',
    productId: input.productId ?? 1,
    pixelPitch: 'P2.5',
    screenStyle: 'flat',
    screenWidthM: dimensionsData.widthM,
    screenHeightM: dimensionsData.heightM,
    bannerWidthPx:
      input.designType === 'banner' ? input.bannerWidthPx : productSpec.resolutionWidthPx,
    bannerHeightPx:
      input.designType === 'banner' ? input.bannerHeightPx : productSpec.resolutionHeightPx,
    aspectLocked: true,
    isArchived: false,
    photos: defaultPhotos,
    placementQuad: input.placementQuad || DEFAULT_PLACEMENT_QUAD,
    chatMessages: [
      {
        id: `msg-user-1-${Date.now()}`,
        role: 'user',
        text: input.aiPrompt,
        timestamp: new Date().toISOString(),
      },
      {
        id: `msg-ai-1-${Date.now()}`,
        role: 'assistant',
        text: `Bản nháp mới (v1 · ${providerResult.modelUsed}) đã được thêm vào thư viện.`,
        timestamp: new Date().toISOString(),
        versionNumber: 1,
        providerId: providerResult.provider,
        modelUsed: providerResult.modelUsed,
        durationSec: Number((providerResult.durationMs / 1000).toFixed(2)),
        tokenUsed: providerResult.totalTokens,
        cost: `$${(Number(providerResult.costMicros) / 1_000_000).toFixed(3)}`,
        status: 'success',
      },
    ],
    productSpec,
  };

  const createdRequest = await prisma.designRequest.create({
    data: {
      leadId: input.leadId ?? null,
      requestedBySalesId:
        actor.roleCode === 'SALES' || actor.roleCode === 'SALES_LEAD' ? actor.id : null,
      assignedDesignerId,
      requestType: dbRequestType,
      ledCategory,
      screenDimensions,
      aspectRatio,
      installPositionJson: JSON.stringify(initialMetadata),
      sitePhotoUrl,
      prompt: input.aiPrompt,
      designStatus: 'ai_drafting',
      aiDraftImageUrl: savedFile.storageObjectKey,
      processingTimeMs: providerResult.durationMs,
      tokenCost: providerResult.totalTokens,
      totalCostMicros: providerResult.costMicros,
      costCurrency: providerResult.costCurrency,
      notes:
        input.leadId == null
          ? 'Ấn phẩm tạo độc lập không gắn Lead (UC06 Luồng phụ 2a).'
          : 'Đã khởi tạo bản nháp AI v1.',
    },
  });

  const aiLog = await recordAiUsageAttempt(prisma, {
    idempotencyKey: `design-ai-create-${createdRequest.id}-v1-${Date.now()}`,
    attemptNumber: 1,
    providerRequestId: `${providerResult.provider}-${createdRequest.id}-v1`,
    moduleCode: '05-ai-design',
    taskType: dbRequestType,
    userId: actor.id,
    designRequestId: createdRequest.id,
    modelName: providerResult.modelUsed,
    promptTokens: providerResult.promptTokens,
    completionTokens: providerResult.completionTokens,
    totalTokens: providerResult.totalTokens,
    costMicros: providerResult.costMicros,
    costCurrency: providerResult.costCurrency,
    durationMs: providerResult.durationMs,
    status: providerResult.status,
  });

  const v1 = await prisma.designAssetVersion.create({
    data: {
      designRequestId: createdRequest.id,
      versionNumber: 1,
      versionType: 'ai_draft',
      storageObjectKey: savedFile.storageObjectKey,
      mimeType: savedFile.mimeType,
      fileSizeBytes: savedFile.fileSizeBytes,
      promptUsed: input.aiPrompt,
      parametersJson: JSON.stringify({
        designType: input.designType,
        screenDimensions,
        aspectRatio,
        quality: input.quality || 'draft',
        providerId: providerResult.provider,
        modelUsed: providerResult.modelUsed,
      }),
      aiUsageLogId: aiLog.log.id,
      uploadedByUserId: actor.id,
      isApprovedFinal: false,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: actor.id,
      action: 'DESIGN_REQUEST_CREATED',
      targetType: 'DesignRequest',
      targetId: String(createdRequest.id),
      detailsJson: JSON.stringify({
        requestType: dbRequestType,
        leadId: createdRequest.leadId,
        versionId: v1.id,
        durationMs: providerResult.durationMs,
      }),
    },
  });

  return {
    id: createdRequest.id,
    status: 'ai_drafted',
    versionId: v1.id,
  };
}

export async function processChatDesignRequest(
  actor: SessionUserDto,
  requestId: number,
  input: ChatDesignRequestDto
) {
  const piiCheck = containsCustomerPiiInPrompt(input.prompt);
  if (piiCheck.hasPii) {
    throw new Error(piiCheck.reason);
  }

  const existing = await prisma.designRequest.findUnique({
    where: { id: requestId },
    include: {
      assetVersions: {
        orderBy: { versionNumber: 'desc' },
        take: 1,
      },
    },
  });

  if (!existing) {
    throw new Error('Không tìm thấy yêu cầu thiết kế.');
  }

  if (existing.version !== input.expectedVersion) {
    throw new ConcurrencyConflictError('DesignRequest', requestId, input.expectedVersion);
  }

  const nextVersionNumber = (existing.assetVersions[0]?.versionNumber ?? 0) + 1;
  const currentMeta = parseProjectMetadata(existing.installPositionJson);

  const dbType: 'banner' | '3d_perspective' =
    existing.requestType === 'banner' ? 'banner' : '3d_perspective';

  const providerResult =
    dbType === '3d_perspective'
      ? await AiDesignProviderFactory.executePerspectiveWithFallback(
          {
            workflow: 'perspective_3d',
            prompt: input.prompt,
            referenceImageUrl:
              input.selectedPhotoUrl || existing.sitePhotoUrl || DEFAULT_SHOWROOM_PHOTO,
            placementQuad:
              input.placementQuad || currentMeta.placementQuad || DEFAULT_PLACEMENT_QUAD,
            dimensions: {
              widthM: input.screenWidthM || 4.8,
              heightM: input.screenHeightM || 2.7,
              aspectRatio: input.aspectRatio || existing.aspectRatio || '16:9',
            },
            quality: input.quality || 'draft',
            modelId: input.modelId,
            idempotencyKey:
              input.idempotencyKey ||
              `chat-design-${requestId}-v${nextVersionNumber}-${Date.now()}`,
            simulateTimeout: input.simulateAiTimeout,
          },
          input.providerId
        )
      : await AiDesignProviderFactory.executeBannerWithFallback(
          {
            workflow: 'banner',
            prompt: input.prompt,
            dimensions: {
              widthPx: input.bannerWidthPx || 1920,
              heightPx: input.bannerHeightPx || 1080,
              aspectRatio: input.aspectRatio || existing.aspectRatio || '16:9',
            },
            quality: input.quality || 'draft',
            modelId: input.modelId,
            idempotencyKey:
              input.idempotencyKey ||
              `chat-banner-${requestId}-v${nextVersionNumber}-${Date.now()}`,
            simulateTimeout: input.simulateAiTimeout,
          },
          input.providerId
        );

  if (providerResult.status === 'timeout' || input.simulateAiTimeout) {
    await recordAiUsageAttempt(prisma, {
      idempotencyKey: `chat-design-timeout-${requestId}-v${nextVersionNumber}-${Date.now()}`,
      attemptNumber: nextVersionNumber,
      moduleCode: '05-ai-design',
      taskType: dbType,
      userId: actor.id,
      designRequestId: requestId,
      modelName: providerResult.modelUsed || 'imagen-3.0-generate-002',
      promptTokens: null,
      completionTokens: null,
      totalTokens: null,
      costMicros: null,
      durationMs: providerResult.durationMs,
      status: 'timeout',
      errorMessage: 'Hệ thống AI dựng ảnh quá thời gian phản hồi (UC06 E1).',
    });
    throw new Error(
      'Kết nối hệ thống AI quá thời gian phản hồi (UC06 E1). Phiên bản hiện tại vẫn được bảo toàn an toàn.'
    );
  }

  const savedFile = savePrivateBusinessFile({
    bucket: 'design',
    prefix: `ai-draft-req-${requestId}-v${nextVersionNumber}`,
    fileBuffer: providerResult.imageBuffer,
    declaredMimeType: providerResult.mimeType || 'image/png',
  });

  const aiLog = await recordAiUsageAttempt(prisma, {
    idempotencyKey: `chat-design-run-${requestId}-v${nextVersionNumber}-${Date.now()}`,
    attemptNumber: nextVersionNumber,
    providerRequestId: `${providerResult.provider}-${requestId}-v${nextVersionNumber}`,
    moduleCode: '05-ai-design',
    taskType: dbType,
    userId: actor.id,
    designRequestId: requestId,
    modelName: providerResult.modelUsed,
    promptTokens: providerResult.promptTokens,
    completionTokens: providerResult.completionTokens,
    totalTokens: providerResult.totalTokens,
    costMicros: providerResult.costMicros,
    costCurrency: providerResult.costCurrency,
    durationMs: providerResult.durationMs,
    status: 'success',
  });

  const createdVersion = await prisma.designAssetVersion.create({
    data: {
      designRequestId: requestId,
      versionNumber: nextVersionNumber,
      versionType: 'ai_draft',
      storageObjectKey: savedFile.storageObjectKey,
      mimeType: savedFile.mimeType,
      fileSizeBytes: savedFile.fileSizeBytes,
      promptUsed: input.prompt,
      parametersJson: JSON.stringify({
        regeneratedFromVersion: existing.version,
        placementQuad: input.placementQuad || currentMeta.placementQuad,
        quality: input.quality,
        providerId: providerResult.provider,
        modelUsed: providerResult.modelUsed,
      }),
      aiUsageLogId: aiLog.log.id,
      uploadedByUserId: actor.id,
      isApprovedFinal: false,
    },
  });

  // Append to chat messages
  const existingChat = currentMeta.chatMessages || [];
  const updatedChat: DesignChatMessageDto[] = [
    ...existingChat,
    {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      text: input.prompt,
      timestamp: new Date().toISOString(),
    },
    {
      id: `msg-ai-${Date.now()}`,
      role: 'assistant',
      text: `Bản nháp mới (v${nextVersionNumber} · ${providerResult.modelUsed}) đã được thêm vào thư viện.`,
      timestamp: new Date().toISOString(),
      versionNumber: nextVersionNumber,
      versionId: createdVersion.id,
      providerId: providerResult.provider,
      modelUsed: providerResult.modelUsed,
      durationSec: Number((providerResult.durationMs / 1000).toFixed(2)),
      tokenUsed: providerResult.totalTokens,
      cost: `$${(Number(providerResult.costMicros) / 1_000_000).toFixed(3)}`,
      status: 'success',
    },
  ];

  const updatedMetadata: StoredMetadata = {
    ...currentMeta,
    placementQuad: input.placementQuad || currentMeta.placementQuad,
    chatMessages: updatedChat,
  };

  const newTotalTokens = (existing.tokenCost ?? 0) + providerResult.totalTokens;
  const newTotalCostMicros = (existing.totalCostMicros ?? 0n) + providerResult.costMicros;

  await prisma.designRequest.update({
    where: { id: requestId },
    data: {
      prompt: input.prompt,
      aiDraftImageUrl: savedFile.storageObjectKey,
      installPositionJson: JSON.stringify(updatedMetadata),
      designStatus: 'ai_drafting',
      processingTimeMs: (existing.processingTimeMs ?? 0) + providerResult.durationMs,
      tokenCost: newTotalTokens,
      totalCostMicros: newTotalCostMicros,
      version: { increment: 1 },
    },
  });

  return {
    requestId,
    versionNumber: createdVersion.versionNumber,
    versionId: createdVersion.id,
    downloadUrl: `/api/v1/design/asset/${createdVersion.id}`,
    chatMessages: updatedChat,
  };
}

export async function regenerateDesignDraftByAi(
  actor: SessionUserDto,
  requestId: number,
  input: RegenerateDesignDraftDto
) {
  return processChatDesignRequest(actor, requestId, {
    expectedVersion: input.expectedVersion,
    prompt: input.aiPrompt,
    quality: input.quality || 'draft',
    providerId: input.providerId,
    modelId: input.modelId,
    screenWidthM: input.screenWidthM,
    screenHeightM: input.screenHeightM,
    bannerWidthPx: input.bannerWidthPx,
    bannerHeightPx: input.bannerHeightPx,
    aspectRatio: input.aspectRatio,
    simulateAiTimeout: input.simulateAiTimeout,
  });
}
