import {
  type ApproveDesignVersionDto,
  type DesignChatMessageDto,
  type QuadCoordinatesDto,
  type SessionUserDto,
} from '@toantrung/contracts';
import { ConcurrencyConflictError, prisma } from '@toantrung/database';
import { notifyLeadSalesOnDesignCompleted } from '../../01-leads/service';
import { savePrivateBusinessFile } from '../../../core/storage/private-files.service';
import { parseProjectMetadata, type StoredMetadata } from '../domain/metadata';

export async function approveDesignAssetVersion(
  actor: SessionUserDto,
  requestId: number,
  input: ApproveDesignVersionDto
) {
  const existing = await prisma.designRequest.findUnique({
    where: { id: requestId },
    include: { assetVersions: true },
  });

  if (!existing) throw new Error('Không tìm thấy yêu cầu thiết kế.');
  if (existing.version !== input.expectedVersion) {
    throw new ConcurrencyConflictError('DesignRequest', requestId, input.expectedVersion);
  }

  const targetVer = existing.assetVersions.find((v) => v.id === input.versionId);
  if (!targetVer) {
    throw new Error('Phiên bản thiết kế cần phê duyệt không thuộc yêu cầu này.');
  }

  await prisma.$transaction([
    prisma.designAssetVersion.updateMany({
      where: { designRequestId: requestId },
      data: { isApprovedFinal: false },
    }),
    prisma.designAssetVersion.update({
      where: { id: targetVer.id },
      data: { isApprovedFinal: true },
    }),
    prisma.designRequest.update({
      where: { id: requestId },
      data: {
        approvedVersionId: targetVer.id,
        finalRenderUrl: targetVer.storageObjectKey,
        designStatus: 'completed',
        completedAt: new Date(),
        version: { increment: 1 },
      },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: actor.id,
        action: 'DESIGN_VERSION_APPROVED',
        targetType: 'DesignRequest',
        targetId: String(requestId),
        detailsJson: JSON.stringify({
          approvedVersionId: targetVer.id,
          versionNumber: targetVer.versionNumber,
          note: input.note,
        }),
      },
    }),
  ]);

  if (existing.leadId) {
    await notifyLeadSalesOnDesignCompleted({
      leadId: existing.leadId,
      designRequestId: requestId,
      versionNumber: targetVer.versionNumber,
      actor,
      note: input.note || undefined,
      storageObjectKey: targetVer.storageObjectKey,
      fileSizeBytes: targetVer.fileSizeBytes,
    });
  }

  return {
    requestId,
    approvedVersionId: targetVer.id,
    status: 'completed',
  };
}

export async function saveCompositedDraftVersion(
  actor: SessionUserDto,
  requestId: number,
  params: {
    fileName: string;
    mimeType: string;
    buffer: Buffer;
    note?: string;
    placementQuad?: QuadCoordinatesDto;
  }
) {
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

  const savedFile = savePrivateBusinessFile({
    bucket: 'design',
    prefix: `studio-composite-req-${requestId}`,
    fileBuffer: params.buffer,
    declaredMimeType: params.mimeType || 'image/png',
    originalFileName: params.fileName,
  });

  const nextVersionNumber = (existing.assetVersions[0]?.versionNumber ?? 0) + 1;
  const currentMeta = parseProjectMetadata(existing.installPositionJson);

  const createdVersion = await prisma.designAssetVersion.create({
    data: {
      designRequestId: requestId,
      versionNumber: nextVersionNumber,
      versionType: 'ai_draft',
      storageObjectKey: savedFile.storageObjectKey,
      mimeType: savedFile.mimeType,
      fileSizeBytes: savedFile.fileSizeBytes,
      promptUsed:
        params.note ||
        `Bản ghép phối cảnh 3D trực tiếp trên ảnh hiện trạng (v${nextVersionNumber})`,
      parametersJson: JSON.stringify({
        studioComposite: true,
        providerId: 'local_sandbox',
        modelUsed: 'Toàn Trung Live 3D Compositor',
        placementQuad: params.placementQuad || currentMeta.placementQuad,
      }),
      uploadedByUserId: actor.id,
      isApprovedFinal: false,
    },
  });

  const existingChat = currentMeta.chatMessages || [];
  const updatedChat: DesignChatMessageDto[] = [
    ...existingChat,
    {
      id: `msg-composite-${Date.now()}`,
      role: 'assistant',
      text: `Đã kết xuất & lưu bản ghép phối cảnh 3D thực tế (v${nextVersionNumber} · Toàn Trung Live 3D Compositor) vào thư viện Bản thiết kế.`,
      timestamp: new Date().toISOString(),
      versionNumber: nextVersionNumber,
      versionId: createdVersion.id,
      providerId: 'local_sandbox',
      modelUsed: 'Toàn Trung Live 3D Compositor',
      durationSec: 0.4,
      cost: '$0.000',
      status: 'success',
    },
  ];

  const updatedMetadata: StoredMetadata = {
    ...currentMeta,
    placementQuad: params.placementQuad || currentMeta.placementQuad,
    chatMessages: updatedChat,
  };

  await prisma.designRequest.update({
    where: { id: requestId },
    data: {
      aiDraftImageUrl: savedFile.storageObjectKey,
      installPositionJson: JSON.stringify(updatedMetadata),
      designStatus: 'ai_drafting',
      version: { increment: 1 },
    },
  });

  return {
    requestId,
    versionId: createdVersion.id,
    versionNumber: createdVersion.versionNumber,
  };
}

export async function uploadDesignerFinalRender(
  actor: SessionUserDto,
  requestId: number,
  params: {
    fileName: string;
    mimeType: string;
    buffer: Buffer;
    note?: string;
  }
) {
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

  const savedFile = savePrivateBusinessFile({
    bucket: 'design',
    prefix: `final-render-req-${requestId}`,
    fileBuffer: params.buffer,
    declaredMimeType: params.mimeType,
    originalFileName: params.fileName,
    allowPdfOrDoc: true,
  });

  const nextVersionNumber = (existing.assetVersions[0]?.versionNumber ?? 0) + 1;

  const finalVer = await prisma.designAssetVersion.create({
    data: {
      designRequestId: requestId,
      versionNumber: nextVersionNumber,
      versionType: 'final_render',
      storageObjectKey: savedFile.storageObjectKey,
      mimeType: savedFile.mimeType,
      fileSizeBytes: savedFile.fileSizeBytes,
      promptUsed: params.note || 'Bản thiết kế hoàn thiện tải lên bởi Designer (Photoshop/3DsMax)',
      parametersJson: JSON.stringify({ manualDesignerUpload: true }),
      uploadedByUserId: actor.id,
      isApprovedFinal: true,
    },
  });

  await prisma.designRequest.update({
    where: { id: requestId },
    data: {
      finalRenderUrl: savedFile.storageObjectKey,
      approvedVersionId: finalVer.id,
      designStatus: 'completed',
      completedAt: new Date(),
      notes: params.note || existing.notes,
      version: { increment: 1 },
    },
  });

  if (existing.leadId) {
    await notifyLeadSalesOnDesignCompleted({
      leadId: existing.leadId,
      designRequestId: requestId,
      versionNumber: finalVer.versionNumber,
      actor,
      note: params.note,
      storageObjectKey: savedFile.storageObjectKey,
      fileSizeBytes: savedFile.fileSizeBytes,
    });
  }

  return {
    requestId,
    versionId: finalVer.id,
    versionNumber: finalVer.versionNumber,
  };
}
