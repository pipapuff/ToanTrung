import {
  type AddProjectPhotoDto,
  type ProjectPhotoItemDto,
  type SessionUserDto,
} from '@toantrung/contracts';
import { prisma } from '@toantrung/database';
import { savePrivateBusinessFile } from '../../../core/storage/private-files.service';
import { parseProjectMetadata } from '../domain/metadata';

export async function addProjectPhoto(
  actor: SessionUserDto,
  requestId: number,
  input: AddProjectPhotoDto
) {
  const existing = await prisma.designRequest.findUnique({ where: { id: requestId } });
  if (!existing) throw new Error('Không tìm thấy dự án thiết kế.');

  const buffer = Buffer.from(input.base64Data, 'base64');
  const saved = savePrivateBusinessFile({
    bucket: 'design',
    prefix: `site-photo-req-${requestId}`,
    fileBuffer: buffer,
    declaredMimeType: input.mimeType || 'image/jpeg',
    originalFileName: input.fileName,
  });

  const meta = parseProjectMetadata(existing.installPositionJson);
  const photos = meta.photos || [];

  const newPhoto: ProjectPhotoItemDto = {
    id: `photo-${Date.now()}-${photos.length + 1}`,
    name: input.photoName || input.fileName,
    url: `/api/v1/design/asset-file?key=${encodeURIComponent(saved.storageObjectKey)}`,
    storageObjectKey: saved.storageObjectKey,
    selected: true,
    uploadedAt: new Date().toISOString(),
  };

  // Set this newly added photo as selected, deselecting others
  photos.forEach((p) => {
    p.selected = false;
  });
  photos.push(newPhoto);
  meta.photos = photos;

  await prisma.designRequest.update({
    where: { id: requestId },
    data: {
      sitePhotoUrl: saved.storageObjectKey,
      installPositionJson: JSON.stringify(meta),
      version: { increment: 1 },
    },
  });

  return newPhoto;
}

export async function deleteProjectPhoto(
  actor: SessionUserDto,
  requestId: number,
  photoId: string
) {
  const existing = await prisma.designRequest.findUnique({ where: { id: requestId } });
  if (!existing) throw new Error('Không tìm thấy dự án thiết kế.');

  const meta = parseProjectMetadata(existing.installPositionJson);
  const photos = meta.photos || [];

  const target = photos.find((p) => p.id === photoId);
  if (!target) throw new Error('Không tìm thấy ảnh cần xóa.');

  // Check if this photo's storage key is referenced by an approved final version
  if (target.storageObjectKey && existing.finalRenderUrl === target.storageObjectKey) {
    throw new Error('Không thể xóa ảnh đang được phiên bản hoàn thiện chính thức tham chiếu.');
  }

  const updatedPhotos = photos.filter((p) => p.id !== photoId);
  if (updatedPhotos.length > 0 && target.selected) {
    updatedPhotos[0].selected = true;
  }
  meta.photos = updatedPhotos;

  await prisma.designRequest.update({
    where: { id: requestId },
    data: {
      installPositionJson: JSON.stringify(meta),
      version: { increment: 1 },
    },
  });

  return { ok: true, remainingCount: updatedPhotos.length };
}
