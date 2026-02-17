
## Fix: Library Page Slow Loading

### Root Causes Found

1. **Huge base64 data in database response**: One `generation_jobs` row stores a full base64-encoded PNG image (~50KB+ of text) directly in the `results` JSONB column. This massively bloats the database response payload.

2. **URL signing bottleneck**: Every page load signs 20+ URLs across multiple storage buckets (freestyle-images, tryon-images). Each signing request takes network round-trip time, adding 5-20 seconds of latency before any images can display.

3. **No query caching**: The query has `refetchOnWindowFocus: true` but no `staleTime`, so it re-runs the entire fetch + sign cycle every time the user switches back to the tab.

### Solution

**File: `src/hooks/useLibraryItems.ts`**

1. **Skip base64 data URIs from signing**: Base64 URLs don't need signing -- they're already self-contained. The `toSignedUrls` function already handles this (returns them as-is), but the real fix is to filter them out from generation results entirely since they indicate a failed upload-to-storage step and shouldn't appear in the library.

2. **Add staleTime and reduce refetch frequency**: Set `staleTime: 60_000` (1 minute) so the library doesn't re-fetch and re-sign URLs on every tab switch or component remount. This alone eliminates the most common case of perceived slowness.

3. **Filter out data URI results**: Skip any result URL that starts with `data:` since these are raw base64 images that shouldn't be in the library (they indicate the image wasn't properly uploaded to storage).

```typescript
// Add staleTime to prevent constant re-fetching
staleTime: 60_000, // 1 minute

// Filter out base64 data URIs in the job results loop
const url = typeof r === 'string' ? r : r?.url || r?.image_url;
if (!url || url.startsWith('data:')) continue; // Skip data URIs
```

**File: `src/lib/signedUrl.ts`** (minor optimization)

4. **Early return for empty arrays**: Skip the signing network call entirely when there are no private-bucket URLs to sign (e.g., all URLs are from public buckets like `workflow-previews`).

### Technical Details

Changes to `src/hooks/useLibraryItems.ts`:
- Line 48: Add `|| url.startsWith('data:')` to the continue condition to skip base64 data URIs
- Line 119: Add `staleTime: 60_000` to the query options

Changes to `src/lib/signedUrl.ts`:
- Line 65: Add early return when `bucketGroups` is empty (no private URLs to sign)

### Result
- Base64 blobs no longer bloat the library or trigger unnecessary signing
- Library loads from cache on tab switches instead of re-fetching every time
- Signing only happens for URLs that actually need it
- First load stays the same speed but subsequent loads are instant
