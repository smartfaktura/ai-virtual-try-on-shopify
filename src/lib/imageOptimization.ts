/**
 * Converts a Supabase Storage public URL into an optimized thumbnail URL
 * using Supabase's on-the-fly image transformation endpoint.
 *
 * Only transforms URLs that match the Supabase Storage `/object/` pattern.
 * Non-Supabase URLs (external images, data URIs, local assets) are returned unchanged.
 */

interface OptimizationOptions {
  width?: number;
  quality?: number;
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

  const { width = 400, quality = 60 } = options;

  const transformed = url.replace(SUPABASE_STORAGE_MARKER, SUPABASE_RENDER_MARKER);

  const separator = transformed.includes('?') ? '&' : '?';
  return `${transformed}${separator}width=${width}&quality=${quality}`;
}
