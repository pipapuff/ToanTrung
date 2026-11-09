import type { QuadCoordinatesDto } from '@toantrung/contracts';
import type { Live3dTheme } from '../types';

export interface LiveCompositeInput {
  sitePhotoUrl: string;
  versionImageUrl: string;
  quad: QuadCoordinatesDto;
  live3dTheme: Live3dTheme;
  pixelPitch: string;
  screenWidthM: number;
  screenHeightM: number;
  resW: number;
  resH: number;
}

/** Vẽ ảnh hiện trạng + màn hình LED 4 góc lên canvas 1280x720, trả về base64 PNG (không kèm tiền tố data:). */
export async function renderLiveCompositeBase64(input: LiveCompositeInput): Promise<string> {
  const { sitePhotoUrl, versionImageUrl, quad, live3dTheme } = input;
  const paramForm = {
    pixelPitch: input.pixelPitch,
    screenWidthM: input.screenWidthM,
    screenHeightM: input.screenHeightM,
  };
  const computedLiveSpecs = { resW: input.resW, resH: input.resH };

  const canvas = document.createElement('canvas');
  const W = 1280;
  const H = 720;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Trình duyệt không hỗ trợ HTML5 Canvas.');

  // 1. Load & draw base site photo
  const baseImg = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Không thể tải ảnh hiện trạng gốc để ghép.'));
    img.src = sitePhotoUrl;
  });
  ctx.drawImage(baseImg, 0, 0, W, H);

  // 2. Compute 4 corners in pixel coordinates
  const tl = { x: (quad.topLeft.x / 100) * W, y: (quad.topLeft.y / 100) * H };
  const tr = { x: (quad.topRight.x / 100) * W, y: (quad.topRight.y / 100) * H };
  const br = { x: (quad.bottomRight.x / 100) * W, y: (quad.bottomRight.y / 100) * H };
  const bl = { x: (quad.bottomLeft.x / 100) * W, y: (quad.bottomLeft.y / 100) * H };

  // Ambient wall backlight glow around the LED screen
  ctx.save();
  ctx.shadowColor =
    live3dTheme === 'gala_stage'
      ? 'rgba(245, 158, 11, 0.55)'
      : live3dTheme === 'factory_andon'
        ? 'rgba(16, 185, 129, 0.45)'
        : 'rgba(37, 99, 235, 0.55)';
  ctx.shadowBlur = 32;
  ctx.beginPath();
  ctx.moveTo(tl.x, tl.y);
  ctx.lineTo(tr.x, tr.y);
  ctx.lineTo(br.x, br.y);
  ctx.lineTo(bl.x, bl.y);
  ctx.closePath();
  ctx.fillStyle = '#090d16';
  ctx.fill();
  ctx.restore();

  // Clip to the 4-corner quadrilateral and render the LED screen graphic
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tl.x, tl.y);
  ctx.lineTo(tr.x, tr.y);
  ctx.lineTo(br.x, br.y);
  ctx.lineTo(bl.x, bl.y);
  ctx.closePath();
  ctx.clip();

  const minX = Math.min(tl.x, bl.x);
  const maxX = Math.max(tr.x, br.x);
  const minY = Math.min(tl.y, tr.y);
  const maxY = Math.max(bl.y, br.y);
  const boxW = Math.max(40, maxX - minX);
  const boxH = Math.max(30, maxY - minY);

  if (live3dTheme === 'ai_version' && versionImageUrl) {
    try {
      const aiImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Fallback'));
        img.src = versionImageUrl;
      });
      ctx.drawImage(aiImg, minX, minY, boxW, boxH);
    } catch {
      const grad = ctx.createLinearGradient(minX, minY, maxX, maxY);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1d4ed8');
      ctx.fillStyle = grad;
      ctx.fillRect(minX, minY, boxW, boxH);
    }
  } else {
    const grad = ctx.createLinearGradient(minX, minY, maxX, maxY);
    if (live3dTheme === 'conference_navy') {
      grad.addColorStop(0, '#0a192f');
      grad.addColorStop(0.5, '#1e3a8a');
      grad.addColorStop(1, '#1d4ed8');
    } else if (live3dTheme === 'ocean_4k') {
      grad.addColorStop(0, '#083344');
      grad.addColorStop(0.5, '#0284c7');
      grad.addColorStop(1, '#22d3ee');
    } else if (live3dTheme === 'gala_stage') {
      grad.addColorStop(0, '#31102f');
      grad.addColorStop(0.5, '#7c2d12');
      grad.addColorStop(1, '#f59e0b');
    } else {
      grad.addColorStop(0, '#064e3b');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#047857');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(minX, minY, boxW, boxH);

    // Render crisp presentation typography on the LED wall
    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.font = `bold ${Math.max(14, Math.round(boxH * 0.11))}px sans-serif`;
    ctx.textAlign = 'center';
    const titleText =
      live3dTheme === 'conference_navy'
        ? 'TOÀN TRUNG LED · HỘI NGHỊ & SỰ KIỆN'
        : live3dTheme === 'ocean_4k'
          ? 'TOÀN TRUNG DISPLAY · ULTRA HD 4K'
          : live3dTheme === 'gala_stage'
            ? 'GALA STAGE LED · HIGH BRIGHTNESS'
            : 'BẢNG ĐIỆN TỬ NĂNG SUẤT · ANDON SYSTEM';
    ctx.fillText(titleText, minX + boxW / 2, minY + boxH * 0.46);

    ctx.fillStyle = 'rgba(191, 219, 254, 0.92)';
    ctx.font = `600 ${Math.max(11, Math.round(boxH * 0.075))}px monospace`;
    ctx.fillText(
      `${paramForm.pixelPitch} · ${paramForm.screenWidthM}m × ${paramForm.screenHeightM}m (${computedLiveSpecs.resW}×${computedLiveSpecs.resH}px)`,
      minX + boxW / 2,
      minY + boxH * 0.64
    );
  }

  // Subtle LED cabinet grid lines inside the quadrilateral
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 6; i++) {
    const t = i / 6;
    ctx.beginPath();
    ctx.moveTo(tl.x + (tr.x - tl.x) * t, tl.y + (tr.y - tl.y) * t);
    ctx.lineTo(bl.x + (br.x - bl.x) * t, bl.y + (br.y - bl.y) * t);
    ctx.stroke();
  }
  for (let j = 1; j < 4; j++) {
    const t = j / 4;
    ctx.beginPath();
    ctx.moveTo(tl.x + (bl.x - tl.x) * t, tl.y + (bl.y - tl.y) * t);
    ctx.lineTo(tr.x + (br.x - tr.x) * t, tr.y + (br.y - tr.y) * t);
    ctx.stroke();
  }
  ctx.restore();

  // Anodized aluminum LED frame border
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tl.x, tl.y);
  ctx.lineTo(tr.x, tr.y);
  ctx.lineTo(br.x, br.y);
  ctx.lineTo(bl.x, bl.y);
  ctx.closePath();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#1e293b';
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(147, 197, 253, 0.75)';
  ctx.stroke();
  ctx.restore();

  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl.split(',')[1] || '';
}
