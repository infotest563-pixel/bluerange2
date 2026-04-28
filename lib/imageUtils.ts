/**
 * imageUtils.ts
 * =============
 * Re-exports all image helpers from localImage.ts.
 * Import from here OR from localImage.ts — both work.
 *
 * Main functions:
 *   wpImgUrl(url)        — convert WP URL → local /images/ path
 *   wpAcfImg(field)      — resolve ACF image field (any shape)
 *   replaceWpImagesInHtml(html) — replace all WP URLs in HTML string
 *   isLocalImage(url)    — check if image is synced locally
 */

export {
  wpImgUrl,
  wpAcfImg,
  isLocalImage,
  replaceWpImagesInHtml,
  // Legacy names kept for backward compatibility
  getLocalImagePath,
  resolveAcfImageUrl,
} from './localImage';

/**
 * Checks if a URL is a valid image URL (not empty, not a data URI)
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:')) return false;
  if (url.trim() === '') return false;
  return true;
}
