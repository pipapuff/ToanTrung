import { type SessionUserDto, type UpdateDesignProjectDto } from '@toantrung/contracts';
import { ConcurrencyConflictError, prisma } from '@toantrung/database';
import { parseDimensions } from '../domain/request-mapper';
import { parseProjectMetadata } from '../domain/metadata';
import { computeLedProductSpec } from '../domain/led-spec';

export async function updateDesignProject(
  actor: SessionUserDto,
  requestId: number,
  input: UpdateDesignProjectDto
) {
  const existing = await prisma.designRequest.findUnique({ where: { id: requestId } });
  if (!existing) throw new Error('Không tìm thấy dự án thiết kế.');
  if (input.expectedVersion !== undefined && existing.version !== input.expectedVersion) {
    throw new ConcurrencyConflictError('DesignRequest', requestId, input.expectedVersion);
  }

  const dims = parseDimensions(existing.screenDimensions);
  const meta = parseProjectMetadata(existing.installPositionJson);

  if (input.projectName) meta.projectName = input.projectName;
  if (input.contactName !== undefined) meta.contactName = input.contactName;
  if (input.installationInfo !== undefined) meta.installationInfo = input.installationInfo;
  if (input.productId !== undefined) meta.productId = input.productId;
  if (input.pixelPitch !== undefined && input.pixelPitch !== null)
    meta.pixelPitch = input.pixelPitch;
  if (input.screenStyle !== undefined) meta.screenStyle = input.screenStyle;
  if (input.screenWidthM !== undefined && input.screenWidthM !== null)
    meta.screenWidthM = input.screenWidthM;
  if (input.screenHeightM !== undefined && input.screenHeightM !== null)
    meta.screenHeightM = input.screenHeightM;
  if (input.bannerWidthPx !== undefined && input.bannerWidthPx !== null)
    meta.bannerWidthPx = input.bannerWidthPx;
  if (input.bannerHeightPx !== undefined && input.bannerHeightPx !== null)
    meta.bannerHeightPx = input.bannerHeightPx;
  if (input.aspectLocked !== undefined) meta.aspectLocked = input.aspectLocked;
  if (input.isArchived !== undefined) meta.isArchived = input.isArchived;
  if (input.placementQuad) meta.placementQuad = input.placementQuad;

  let nextSitePhotoUrl = existing.sitePhotoUrl;
  const photos = meta.photos && meta.photos.length > 0 ? [...meta.photos] : [];

  if (input.selectedPhotoId && photos.length > 0) {
    for (const p of photos) {
      p.selected = p.id === input.selectedPhotoId;
      if (p.selected) {
        nextSitePhotoUrl = p.url;
      }
    }
    meta.photos = photos;
  }

  if (input.renamePhotoId && input.renamePhotoName && photos.length > 0) {
    for (const p of photos) {
      if (p.id === input.renamePhotoId) {
        p.name = input.renamePhotoName;
      }
    }
    meta.photos = photos;
  }

  // Import Lead attachments into Ảnh kỹ thuật when requested
  const targetLeadId = input.leadId !== undefined ? input.leadId : existing.leadId;
  if (input.importLeadAttachments && targetLeadId) {
    const linkedLead = await prisma.lead.findUnique({
      where: { id: targetLeadId },
      include: {
        attachments: {
          where: { attachmentType: { not: 'quote_doc' } },
          orderBy: { uploadedAt: 'desc' },
          take: 15,
        },
      },
    });
    if (linkedLead) {
      for (const att of linkedLead.attachments) {
        const alreadyExists = photos.some(
          (p) => p.sourceLeadAttachmentId === att.id || p.id === `lead-att-${att.id}`
        );
        if (!alreadyExists) {
          photos.push({
            id: `lead-att-${att.id}`,
            name: att.fileName || `Ảnh khảo sát Lead #${att.id}`,
            url: `/api/v1/leads/attachments/${att.id}`,
            storageObjectKey: att.fileUrl,
            selected: photos.length === 0,
            uploadedAt: att.uploadedAt.toISOString(),
            sourceLeadAttachmentId: att.id,
          });
        }
      }
      meta.photos = photos;
    }
  }

  if (input.renameVersionId && input.renameVersionLabel) {
    await prisma.designAssetVersion.updateMany({
      where: { id: input.renameVersionId, designRequestId: requestId },
      data: { promptUsed: input.renameVersionLabel },
    });
  }

  let nextLedCategory = input.ledModuleSpec || existing.ledCategory;
  let productObj: {
    id: number;
    productCode: string;
    productName: string;
    categoryGroup: string;
  } | null = null;
  if (meta.productId) {
    productObj = await prisma.product.findUnique({ where: { id: meta.productId } });
    if (productObj && !input.ledModuleSpec) {
      const pitchTag = meta.pixelPitch || meta.productSpec?.pixelPitch || 'P2.5';
      nextLedCategory = `${productObj.productName} (${pitchTag})`;
    }
  }

  const nextDesignType = input.designType
    ? input.designType === 'banner'
      ? 'banner'
      : '3d_perspective'
    : existing.requestType;

  const wM = meta.screenWidthM ?? dims.screenWidthM ?? 4.8;
  const hM = meta.screenHeightM ?? dims.screenHeightM ?? 2.7;
  const bW = meta.bannerWidthPx ?? dims.bannerWidthPx ?? 1920;
  const bH = meta.bannerHeightPx ?? dims.bannerHeightPx ?? 1080;

  meta.productSpec = computeLedProductSpec({
    productCode: productObj?.productCode || meta.productSpec?.productCode,
    productName: productObj?.productName || nextLedCategory || 'Màn hình LED Indoor',
    categoryGroup: productObj?.categoryGroup || meta.productSpec?.categoryGroup,
    widthM: wM,
    heightM: hM,
    pitch: meta.pixelPitch || meta.productSpec?.pixelPitch || 'P2.5',
    screenStyle: meta.screenStyle || meta.productSpec?.screenStyle || 'flat',
  });
  if (meta.productId) {
    meta.productSpec.productId = meta.productId;
  }

  const nextScreenDimensions =
    nextDesignType === 'banner'
      ? `${bW}x${bH}px`
      : `${wM.toFixed(2).replace('.', ',')} x ${hM.toFixed(2).replace('.', ',')} m`;

  const nextAspectRatio = input.aspectRatio || existing.aspectRatio || '16:9';

  await prisma.designRequest.update({
    where: { id: requestId },
    data: {
      requestType: nextDesignType,
      ledCategory: nextLedCategory,
      screenDimensions: nextScreenDimensions,
      aspectRatio: nextAspectRatio,
      sitePhotoUrl: nextSitePhotoUrl,
      notes: input.notes !== undefined ? input.notes : existing.notes,
      leadId: targetLeadId,
      installPositionJson: JSON.stringify(meta),
      version: { increment: 1 },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: actor.id,
      action: 'DESIGN_PROJECT_PARAMETERS_UPDATED',
      targetType: 'DesignRequest',
      targetId: String(requestId),
      detailsJson: JSON.stringify({
        projectName: meta.projectName,
        designType: nextDesignType,
        screenDimensions: nextScreenDimensions,
        aspectRatio: nextAspectRatio,
        leadId: targetLeadId,
      }),
    },
  });

  return { id: requestId, ok: true };
}

export async function deleteDesignProject(actor: SessionUserDto, requestId: number) {
  const existing = await prisma.designRequest.findUnique({ where: { id: requestId } });
  if (!existing) throw new Error('Không tìm thấy dự án thiết kế cần xóa.');

  await prisma.$transaction([
    prisma.designAssetVersion.deleteMany({ where: { designRequestId: requestId } }),
    prisma.designRequest.delete({ where: { id: requestId } }),
    prisma.auditLog.create({
      data: {
        actorUserId: actor.id,
        action: 'DESIGN_PROJECT_DELETED',
        targetType: 'DesignRequest',
        targetId: String(requestId),
        detailsJson: JSON.stringify({ deletedRequestId: requestId }),
      },
    }),
  ]);

  return { ok: true, deletedId: requestId };
}
