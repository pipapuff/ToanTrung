export const STORAGE_SELECTED_PROJECT_KEY = 'tt_studio_selected_project_id';

export function parseAspectRatioValue(ratioStr: string): number | null {
  const m = ratioStr.match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const w = Number(m[1]);
  const h = Number(m[2]);
  if (!w || !h || h <= 0) return null;
  return w / h;
}

export function resolveAssetUrl(urlOrKey: string | null | undefined): string {
  if (!urlOrKey) return '/brand/showroom-toan-trung.webp';
  if (
    urlOrKey.startsWith('/') ||
    urlOrKey.startsWith('http://') ||
    urlOrKey.startsWith('https://')
  ) {
    return urlOrKey;
  }
  return `/api/v1/design/asset-file?key=${encodeURIComponent(urlOrKey)}`;
}
