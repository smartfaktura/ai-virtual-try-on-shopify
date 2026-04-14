import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/** Buckets that are now private and need signed URLs */
const PRIVATE_BUCKETS = ['generated-videos', 'generation-inputs', 'generated-audio'];

/** In-memory cache for signed URLs — avoids re-signing the same file across navigations & refetches */
const CACHE_TTL_MS = 50 * 60 * 1000; // 50 min (safety margin under 1-hour expiry)
const urlCache = new Map<string, { url: string; expiresAt: number }>();

function getCached(publicUrl: string): string | null {
  const entry = urlCache.get(publicUrl);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    urlCache.delete(publicUrl);
    return null;
  }
  return entry.url;
}

function setCache(publicUrl: string, signedUrl: string) {
  urlCache.set(publicUrl, { url: signedUrl, expiresAt: Date.now() + CACHE_TTL_MS });
}

/**
 * Extracts the bucket name and file path from a Supabase Storage public URL.
 * Returns null if the URL doesn't match a known private bucket.
 */
function parseStorageUrl(url: string): { bucket: string; path: string } | null {
  if (!url || !SUPABASE_URL) return null;

  // Pattern: <SUPABASE_URL>/storage/v1/object/public/<bucket>/<path>
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/`;
  if (!url.startsWith(prefix)) return null;

  const rest = url.slice(prefix.length);
  const slashIdx = rest.indexOf('/');
  if (slashIdx === -1) return null;

  const bucket = rest.slice(0, slashIdx);
  const path = decodeURIComponent(rest.slice(slashIdx + 1));

  if (!PRIVATE_BUCKETS.includes(bucket)) return null;

  return { bucket, path };
}

/**
 * Converts a public storage URL to a signed URL (1 hour expiry).
 * If the URL isn't from a private bucket, returns it unchanged.
 */
export async function toSignedUrl(publicUrl: string): Promise<string> {
  const parsed = parseStorageUrl(publicUrl);
  if (!parsed) return publicUrl;

  const cached = getCached(publicUrl);
  if (cached) return cached;

  const { data, error } = await supabase.storage
    .from(parsed.bucket)
    .createSignedUrl(parsed.path, 3600);

  if (error || !data?.signedUrl) {
    console.warn('[signedUrl] Failed to sign:', parsed.bucket, parsed.path, error);
    return publicUrl;
  }

  setCache(publicUrl, data.signedUrl);
  return data.signedUrl;
}

/**
 * Batch-converts an array of public URLs to signed URLs.
 */
export async function toSignedUrls(urls: string[]): Promise<string[]> {
  const results = urls.slice();
  const bucketGroups: Record<string, { index: number; path: string; originalUrl: string }[]> = {};

  for (let i = 0; i < urls.length; i++) {
    // Check cache first
    const cached = getCached(urls[i]);
    if (cached) {
      results[i] = cached;
      continue;
    }

    const p = parseStorageUrl(urls[i]);
    if (!p) continue;
    if (!bucketGroups[p.bucket]) bucketGroups[p.bucket] = [];
    bucketGroups[p.bucket].push({ index: i, path: p.path, originalUrl: urls[i] });
  }

  if (Object.keys(bucketGroups).length === 0) return results;

  await Promise.all(
    Object.entries(bucketGroups).map(async ([bucket, entries]) => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrls(entries.map(e => e.path), 3600);

      if (error || !data) {
        console.warn('[signedUrl] Batch sign failed for bucket:', bucket, error);
        return;
      }
      for (let j = 0; j < data.length; j++) {
        if (data[j].signedUrl) {
          results[entries[j].index] = data[j].signedUrl;
          setCache(entries[j].originalUrl, data[j].signedUrl);
        }
      }
    })
  );

  return results;
}
