

## Fix Library Loading: Batch URL Signing

### Problem
The Library page fires **one HTTP POST per image** to sign URLs. With 20 generation jobs (some having multiple results) plus 20 freestyle items, that's 40-60+ individual signing requests. Even though they run in parallel via `Promise.all`, the browser's connection limit (~6 concurrent requests per domain) turns this into a waterfall of network calls, causing a long spinner.

### Solution
Replace individual `createSignedUrl()` calls with Supabase's batch `createSignedUrls()` API, which signs multiple files from the same bucket in a **single HTTP request**.

### Technical Changes

**File: `src/lib/signedUrl.ts`**

Rewrite `toSignedUrls()` to group URLs by bucket and use the batch API:

```typescript
export async function toSignedUrls(urls: string[]): Promise<string[]> {
  // Parse all URLs and group by bucket
  const parsed = urls.map(u => ({ original: u, parsed: parseStorageUrl(u) }));

  // Group private-bucket URLs by bucket name
  const bucketGroups: Record<string, { index: number; path: string }[]> = {};
  for (let i = 0; i < parsed.length; i++) {
    const p = parsed[i].parsed;
    if (!p) continue;
    if (!bucketGroups[p.bucket]) bucketGroups[p.bucket] = [];
    bucketGroups[p.bucket].push({ index: i, path: p.path });
  }

  // Start with original URLs as defaults
  const results = urls.slice();

  // Batch-sign each bucket in parallel (1 request per bucket)
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
        }
      }
    })
  );

  return results;
}
```

This turns ~40-60 HTTP requests into **2-3 requests** (one per private bucket that has URLs).

**File: `src/hooks/useLibraryItems.ts`**

Update the signing call to use the batch function instead of mapping individual calls:

```typescript
// Before (line 103):
const signedUrls = await Promise.all(rawItems.map(r => toSignedUrl(r.url)));

// After:
const signedUrls = await toSignedUrls(rawItems.map(r => r.url));
```

### Performance Impact
- Before: ~40-60 individual POST requests to sign URLs (waterfall due to browser connection limit)
- After: 2-3 POST requests total (one per private bucket)
- Expected improvement: Library loads in under 1 second instead of 5-10+ seconds

