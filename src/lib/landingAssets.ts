const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/landing-assets`;

/**
 * Converts a relative asset path to a Supabase Storage public URL.
 * Use with getOptimizedUrl() for quality/width optimization.
 *
 * @example
 * getLandingAssetUrl('models/model-female-slim-asian.jpg')
 * // → https://xxx.supabase.co/storage/v1/object/public/landing-assets/models/model-female-slim-asian.jpg
 */
export function getLandingAssetUrl(path: string): string {
  return `${STORAGE_BASE}/${path}`;
}
