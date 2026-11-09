import {
  toMonetaryAmountDto,
  type DesignAssetVersionItemDto,
  type DesignChatMessageDto,
  type DesignRequestItemDto,
  type ProjectPhotoItemDto,
  type SessionUserDto,
} from '@toantrung/contracts';
import { AiDesignProviderFactory, type ProviderStatusInfo } from '../providers';
import { prisma } from '@toantrung/database';
import { mapDbRequestTypeToDto, mapDbStatusToDto, parseDimensions } from '../domain/request-mapper';
import { parseProjectMetadata } from '../domain/metadata';
import { DEFAULT_PLACEMENT_QUAD, DEFAULT_SHOWROOM_PHOTO } from '../domain/constants';
import { computeLedProductSpec } from '../domain/led-spec';

export async function listDesignRequestsForUser(user: SessionUserDto): Promise<{
  requests: DesignRequestItemDto[];
  leadOptions: Array<{ id: number; leadCode: string; label: string }>;
  productOptions: Array<{ id: number; code: string; name: string; categoryGroup: string }>;
  providerStatus: ProviderStatusInfo;
}> {
  const isAnonymizedLead = ['MKT_STAFF', 'MKT_LEAD', 'ADS'].includes(user.roleCode);
  const requestScopeWhere =
    user.roleCode === 'SALES'
      ? {
          OR: [{ requestedBySalesId: user.id }, { lead: { assignedSalesId: user.id } }],
        }
      : user.roleCode === 'DESIGNER'
        ? { assignedDesignerId: user.id }
        : undefined;

  const [rows, leads, products] = await Promise.all([
    prisma.designRequest.findMany({
      where: requestScopeWhere,
      take: 100,
      include: {
        lead: true,
        requestedBySales: true,
        assignedDesigner: true,
        assetVersions: {
          include: {
            uploadedBy: true,
            aiUsageLog: true,
          },
          orderBy: { versionNumber: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.lead.findMany({
      where: {
        isSpam: false,
        ...(user.roleCode === 'SALES'
          ? { OR: [{ assignedSalesId: user.id }, { createdByUserId: user.id }] }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    }),
  ]);

  const providerStatus = AiDesignProviderFactory.getActiveProviderInfo();

  const requests: DesignRequestItemDto[] = rows.map((r) => {
    const dims = parseDimensions(r.screenDimensions);
    const meta = parseProjectMetadata(r.installPositionJson);

    const assetVersions: DesignAssetVersionItemDto[] = r.assetVersions.map((v) => {
      let parsedVerParams: { providerId?: string; modelUsed?: string } = {};
      if (v.parametersJson) {
        try {
          parsedVerParams = JSON.parse(v.parametersJson);
        } catch {
          parsedVerParams = {};
        }
      }
      return {
        id: v.id,
        designRequestId: v.designRequestId,
        versionNumber: v.versionNumber,
        sourceType: v.versionType === 'final_render' ? 'DESIGNER_FINAL_UPLOAD' : 'AI_DRAFT',
        providerId: parsedVerParams.providerId ?? null,
        modelUsed: parsedVerParams.modelUsed ?? v.aiUsageLog?.modelName ?? null,
        storageObjectKey: v.storageObjectKey,
        downloadUrl: `/api/v1/design/asset/${v.id}`,
        mimeType: v.mimeType,
        fileSizeBytes: v.fileSizeBytes,
        widthPx: dims.bannerWidthPx ?? 1920,
        heightPx: dims.bannerHeightPx ?? 1080,
        aspectRatio: r.aspectRatio,
        promptUsed: v.promptUsed,
        processingDurationMs: v.aiUsageLog?.durationMs ?? r.processingTimeMs,
        tokenUsed: v.aiUsageLog?.totalTokens ?? r.tokenCost,
        cost:
          v.aiUsageLog?.costMicros != null
            ? toMonetaryAmountDto(v.aiUsageLog.costMicros, 'USD', 'micros')
            : null,
        isApprovedFinal: v.isApprovedFinal,
        uploadedByName: v.uploadedBy?.fullName || r.assignedDesigner?.fullName || 'Hệ thống AI',
        createdAt: v.createdAt.toISOString(),
      };
    });

    const latestAiDraft = [...assetVersions].reverse().find((v) => v.sourceType === 'AI_DRAFT');
    const latestFinal = [...assetVersions]
      .reverse()
      .find((v) => v.sourceType === 'DESIGNER_FINAL_UPLOAD' || v.isApprovedFinal);

    const currency: 'VND' | 'USD' = r.costCurrency === 'VND' ? 'VND' : 'USD';

    // Photos list: fallback to showroom default
    const photos: ProjectPhotoItemDto[] =
      meta.photos && meta.photos.length > 0
        ? meta.photos
        : [
            {
              id: 'photo-default-1',
              name: 'Ảnh chính diện showroom',
              url: DEFAULT_SHOWROOM_PHOTO,
              selected: true,
              uploadedAt: r.createdAt.toISOString(),
            },
            {
              id: 'photo-default-2',
              name: 'Vách tủ module LED',
              url: DEFAULT_SHOWROOM_PHOTO,
              selected: false,
              uploadedAt: r.createdAt.toISOString(),
            },
          ];

    // Initial chat messages: align with reference UI
    const chatMessages: DesignChatMessageDto[] =
      meta.chatMessages && meta.chatMessages.length > 0
        ? meta.chatMessages
        : [
            {
              id: `msg-user-init-${r.id}`,
              role: 'user',
              text:
                r.prompt ||
                'Đặt màn hình ở tường bên phải, hiển thị sóng biển xanh và giữ nguyên nội thất.',
              timestamp: r.createdAt.toISOString(),
            },
            {
              id: `msg-ai-init-${r.id}`,
              role: 'assistant',
              text: 'Bản nháp mới đã được thêm vào thư viện.',
              timestamp: r.createdAt.toISOString(),
              versionNumber: 1,
              status: 'success',
            },
          ];

    const effectiveWidthM = meta.screenWidthM ?? dims.screenWidthM ?? 4.8;
    const effectiveHeightM = meta.screenHeightM ?? dims.screenHeightM ?? 2.7;
    const effectiveBannerW = meta.bannerWidthPx ?? dims.bannerWidthPx ?? 1920;
    const effectiveBannerH = meta.bannerHeightPx ?? dims.bannerHeightPx ?? 1080;
    const effectivePitch = meta.pixelPitch || meta.productSpec?.pixelPitch || 'P2.5';
    const effectiveStyle = meta.screenStyle || meta.productSpec?.screenStyle || 'flat';

    const productSpec = computeLedProductSpec({
      productCode: meta.productSpec?.productCode,
      productName: r.ledCategory || 'Màn hình LED Indoor',
      categoryGroup: meta.productSpec?.categoryGroup,
      widthM: effectiveWidthM,
      heightM: effectiveHeightM,
      pitch: effectivePitch,
      screenStyle: effectiveStyle,
    });
    if (meta.productId) {
      productSpec.productId = meta.productId;
    }

    const projectName =
      meta.projectName ||
      (r.lead
        ? r.lead.projectName || r.lead.companyName || 'Dự án LED'
        : r.requestType === 'banner'
          ? 'Banner Quảng cáo LED'
          : 'Showroom LED');
    const selectedPhoto = photos.find((p) => p.selected) || photos[0];

    return {
      id: r.id,
      version: r.version,
      projectName,
      contactName: isAnonymizedLead
        ? 'Khách hàng ẩn danh (UC01)'
        : (meta.contactName ?? (r.lead?.contactName || 'Chưa cập nhật')),
      installationInfo: meta.installationInfo || 'Tường bên phải showroom, cách sàn 1.2m',
      notes: r.notes,
      leadId: r.leadId,
      leadCode: r.lead?.leadCode ?? null,
      leadProjectLabel: r.lead
        ? `${r.lead.leadCode} — ${
            isAnonymizedLead
              ? r.lead.projectName || 'Dự án LED (Ẩn danh)'
              : r.lead.companyName || r.lead.contactName || 'Dự án LED'
          }`
        : null,
      productId: meta.productId ?? 1,
      productName: r.ledCategory,
      requestedBySalesId: r.requestedBySalesId,
      requestedBySalesName: r.requestedBySales?.fullName ?? null,
      assignedDesignerId: r.assignedDesignerId ?? user.id,
      assignedDesignerName: r.assignedDesigner?.fullName ?? 'Designer Toàn Trung',
      designType: mapDbRequestTypeToDto(r.requestType),
      ledModuleSpec: r.ledCategory,
      screenWidthM: effectiveWidthM,
      screenHeightM: effectiveHeightM,
      installZoneBboxJson: r.installPositionJson,
      placementQuad: meta.placementQuad || DEFAULT_PLACEMENT_QUAD,
      bannerWidthPx: effectiveBannerW,
      bannerHeightPx: effectiveBannerH,
      aspectRatio: r.aspectRatio || '16:9',
      aspectLocked: meta.aspectLocked ?? true,
      isArchived: meta.isArchived ?? false,
      sitePhotoDownloadUrl: selectedPhoto?.url || r.sitePhotoUrl || DEFAULT_SHOWROOM_PHOTO,
      photos,
      chatMessages,
      productSpec,
      aiPrompt: r.prompt ?? '',
      aiDraftDownloadUrl: latestAiDraft?.downloadUrl ?? null,
      finalRenderDownloadUrl: latestFinal?.downloadUrl ?? null,
      approvedVersionId: r.approvedVersionId,
      processingDurationSec:
        r.processingTimeMs != null ? Number((r.processingTimeMs / 1000).toFixed(2)) : null,
      tokenCost: r.tokenCost,
      totalCost:
        r.totalCostMicros != null
          ? toMonetaryAmountDto(r.totalCostMicros, currency, 'micros')
          : null,
      status: mapDbStatusToDto(r.designStatus),
      createdAt: r.createdAt.toISOString(),
      updatedAt: (r.completedAt ?? r.createdAt).toISOString(),
      completedAt: r.completedAt ? r.completedAt.toISOString() : null,
      assetVersions,
    };
  });

  return {
    requests,
    leadOptions: leads.map((l) => ({
      id: l.id,
      leadCode: l.leadCode,
      label: isAnonymizedLead
        ? `${l.leadCode} · Khách hàng ẩn danh (${l.projectName || 'Dự án LED'})`
        : `${l.leadCode} · ${l.companyName || l.contactName || 'Khách hàng'} (${l.projectName || 'Dự án LED'})`,
    })),
    productOptions: products.map((p) => ({
      id: p.id,
      code: p.productCode,
      name: p.productName,
      categoryGroup: p.categoryGroup,
    })),
    providerStatus,
  };
}
