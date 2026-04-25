/**
 * Converts a Supabase Storage public URL into an optimized thumbnail URL
 * using Supabase's on-the-fly image transformation endpoint.
 *
 * Only transforms URLs that match the Supabase Storage `/object/` pattern.
 * Non-Supabase URLs (external images, data URIs, local assets) are returned unchanged.
 */

interface OptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
}

const SUPABASE_STORAGE_MARKER = '/storage/v1/object/';
const SUPABASE_RENDER_MARKER = '/storage/v1/render/image/';

export function getOptimizedUrl(
  url: string | undefined | null,
  options: OptimizationOptions = {},
): string {
  if (!url) return '';

  // Only transform Supabase Storage public URLs
  if (!url.includes(SUPABASE_STORAGE_MARKER)) return url;

  // Already transformed
  if (url.includes(SUPABASE_RENDER_MARKER)) return url;

  const { width, height, quality = 60, resize } = options;

  const transformed = url.replace(SUPABASE_STORAGE_MARKER, SUPABASE_RENDER_MARKER);

  const params: string[] = [];
  if (width) params.push(`width=${width}`);
  if (height) params.push(`height=${height}`);
  params.push(`quality=${quality}`);
  if (resize) params.push(`resize=${resize}`);

  const separator = transformed.includes('?') ? '&' : '?';
  return `${transformed}${separator}${params.join('&')}`;
}

/**
 * Build a responsive `srcSet` string at the given widths (in CSS pixels).
 * Pairs nicely with a `sizes` attribute on the <img> tag so the browser
 * downloads the smallest variant that still covers the rendered tile.
 */
export function getOptimizedSrcSet(
  url: string | null | undefined,
  widths: number[],
  quality = 55,
): string {
  if (!url) return '';
  return widths
    .map((w) => `${getOptimizedUrl(url, { width: w, quality })} ${w}w`)
    .join(', ');
}

