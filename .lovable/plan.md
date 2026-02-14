

## Fix Three Dashboard Issues

### Issue 1: Workflow images missing from Recent Creations (root cause)

The `generate-workflow` edge function returns base64 data URIs from the AI gateway and saves them directly to the `generation_jobs.results` column. The `RecentCreationsGallery` component explicitly filters out base64 URLs (line 62: `!url.startsWith('data:')`), so **zero workflow images ever appear**.

**Fix: Upload base64 results to storage in the edge function before saving**

In `supabase/functions/generate-workflow/index.ts`, after each image is generated:
1. Decode the base64 data URI
2. Upload to the `workflow-previews` storage bucket (already exists)
3. Get the public URL
4. Use the public URL instead of the base64 string

This means every workflow result will have a proper storage URL, making it visible in Recent Creations, Library, and everywhere else.

### Issue 2: Slow loading of Recent Creations

The query fetches `results` column from `generation_jobs` -- which currently contains massive base64 strings (18MB+ per row as seen in the database). Even though the gallery filters them out, it still downloads all that data.

**Fix: Select only needed columns, not the full results blob**

Change the query to avoid fetching the entire `results` column upfront. Instead, use a more targeted approach -- or once Issue 1 is fixed (results become short URLs), the performance problem resolves itself naturally since URLs are tiny strings vs multi-MB base64 blobs.

Additionally, the `RecentCreationsGallery` also removes the `data:` filter so base64 results from older jobs can still appear (as a fallback).

### Issue 3: Sienna avatar appears zoomed/distorted

In `DashboardTipCard.tsx` line 8, the avatar uses:
```typescript
const teamAvatar = (file: string) => getOptimizedUrl(getLandingAssetUrl(`team/${file}`), { width: 80, quality: 50 });
```

The `width: 80` server-side resize on a portrait-ratio source image causes distortion when rendered in a small `w-9 h-9` circle with `object-cover`. Per the project's avatar rendering conventions, tiny avatars should use quality-only optimization without width resizing.

**Fix: Remove `width: 80` from the avatar helper**

Change to `{ quality: 50 }` only, letting the browser handle cropping via CSS `object-cover`.

---

### Technical Summary

| File | Change |
|------|--------|
| `supabase/functions/generate-workflow/index.ts` | After `generateImage()`, decode base64, upload to `workflow-previews` bucket, use public URL |
| `src/components/app/RecentCreationsGallery.tsx` | Remove `!url.startsWith('data:')` filter (fallback for old jobs); results will be URLs going forward |
| `src/components/app/DashboardTipCard.tsx` | Remove `width: 80` from `teamAvatar()` helper -- use quality-only |

### Storage Upload Logic (edge function)

After each successful `generateImage()` call, add:
1. Strip the `data:image/png;base64,` prefix
2. Decode to `Uint8Array`
3. Upload to `workflow-previews/{userId}/{jobId}/{index}.png`
4. Get the public URL
5. Replace the base64 string with the public URL in the results array

This follows the same storage-first pattern already used by `generate-product` and other edge functions.

