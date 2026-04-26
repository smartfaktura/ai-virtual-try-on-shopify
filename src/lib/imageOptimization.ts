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
 *
 * ⚠️ WARNING: Supabase's `/render/image/` endpoint CROPS server-side when a
 * width is provided without a height — producing a zoomed-in result. Only use
 * this helper for true fixed-size thumbnails (avatars, product chips) whose
 * container dimensions exactly match one of the widths. For full-bleed,
 * editorial, card, hero, or aspect-ratio container images, use
 * `getOptimizedUrl(url, { quality: 60 })` instead.
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

/**
 * Build a responsive `srcSet` string at the given widths, with matching
 * height calculated from a fixed aspect ratio + `resize=cover`. This is
 * SAFE to use for any aspect-ratio card/tile because passing both width and
 * height (with resize=cover) makes Supabase RESIZE rather than crop-zoom.
 *
 * Use this for retina-grade card grids (home page tiles, hub pages, etc.).
 */
export function getResizedSrcSet(
  url: string | null | undefined,
  opts: {
    widths: number[];
    /** Aspect ratio as [w, h], e.g. [3, 4] for portrait product tiles. */
    aspect: [number, number];
    quality?: number;
  },
): string {
  if (!url) return '';
  const { widths, aspect, quality = 85 } = opts;
  const [aw, ah] = aspect;
  return widths
    .map((w) => {
      const h = Math.round((w * ah) / aw);
      return `${getOptimizedUrl(url, { width: w, height: h, quality, resize: 'cover' })} ${w}w`;
    })
    .join(', ');
}

