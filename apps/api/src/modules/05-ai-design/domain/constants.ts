import { type QuadCoordinatesDto } from '@toantrung/contracts';

// Default showroom photo for demo & reference alignment
export const DEFAULT_SHOWROOM_PHOTO = '/brand/showroom-toan-trung.webp';

// Default 4-corner placement quadrilateral matching reference screenshot (right wall of showroom)
export const DEFAULT_PLACEMENT_QUAD: QuadCoordinatesDto = {
  topLeft: { x: 64.2, y: 44.5 },
  topRight: { x: 93.8, y: 45.2 },
  bottomRight: { x: 94.5, y: 72.8 },
  bottomLeft: { x: 64.5, y: 70.1 },
};
