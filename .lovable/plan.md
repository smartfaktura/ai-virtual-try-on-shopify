

# Catalog Studio Debug Report — Round 3

## What's Working Correctly
- **Queue routing**: `process-queue` maps `catalog` → `generate-catalog` ✓
- **Credit pricing**: `enqueue-generation` charges 4 credits per catalog image ✓
- **Prompt flow**: `generate-catalog` uses `prompt_final` when present ✓
- **Product-only mode**: `generate-catalog` accepts missing `model` field ✓
- **Retry logic**: Seedream transient errors retry once with 3s delay ✓
- **Polling**: 10-minute hard timeout with force-completion ✓
- **Base64 error handling**: `safeConvertBase64` wraps each conversion ✓
- **Fail-fast on credits**: Stops enqueue loop on `insufficient_credits` ✓
- **Timer effect**: Uses ref + `allDone`/`hasBatch` dependencies ✓
- **Navigation**: Uses `useNavigate()` ✓
- **Swimwear wardrobe**: Returns all-null support wardrobe ✓
- **Ghost mannequin**: Shadowless prompt ✓
- **Review step (Step 6)**: Shows credit breakdown, summary cards ✓
- **Workflow slug**: `"catalog-studio"` ✓
- **`product_id` and `product_image_url`**: Passed in payload ✓

## Bugs Found

### Bug 1: `product_image_url` still stored as base64 in `generation_jobs` (Severity: Medium)
In `generate-catalog/index.ts` line 277, `product_image_url` reads from `payload.product_image_url`. But in `useCatalogGenerate.ts` line 182, the `product_image_url` field is set to `productOriginalUrl` — which is correct. However, the `completeQueueJob` function at line 261-278 also stores `model_image_url` from `payload.model.originalImageUrl` (line 274), but the client never sets `model.originalImageUrl` — it only sends `model.imageUrl` which is the base64 string. This means `model_image_url` in `generation_jobs` is always `null` (no `originalImageUrl` key), which is actually fine since we don't want base64 there. **No fix needed** — `model_image_url` being null is acceptable for catalog jobs.

### Bug 2: Polling fetches wrong jobs when `jobsRef` is stale (Severity: Medium)
In `pollJobs` (line 41-140), the `jobs` variable is captured from `jobsRef.current` at the time `pollJobs` is called (line 43). But `pollJobs` is wrapped in `useCallback` with only `[stopPolling]` as dependency. The `poll` closure at line 47 correctly reads `jobsRef.current` for updates (line 111), but the `jobIds` on line 78 uses the captured `jobs` variable which is fine since job IDs don't change. **No bug** — the polling logic is correct.

### Bug 3: `workflow_name` in response still says "Catalog Shot Set" (Severity: Low)
In `generate-catalog/index.ts` line 417, the response body still says `workflow_name: "Catalog Shot Set"`. This should match the slug rename. Not critical since the response isn't stored anywhere visible, but inconsistent.

**Fix**: Change to `"Catalog Studio"`.

### Bug 4: `completeQueueJob` email uses "Catalog Shot Set" (Severity: Low)
In `generate-catalog/index.ts` line 244, the failure email uses `workflowName: "Catalog Shot Set"`. Should be `"Catalog Studio"`.

**Fix**: Change to `"Catalog Studio"`.

### Bug 5: Storage upload uses `workflow-previews` bucket (Severity: Low)
In `generate-catalog/index.ts` line 384, catalog images are uploaded to the `workflow-previews` bucket. There's a dedicated `catalog-previews` bucket already created. Using the wrong bucket clutters storage and makes cleanup harder.

**Fix**: Change to `catalog-previews`.

### Bug 6: No `product_name` in enqueue payload (Severity: Low)
In `useCatalogGenerate.ts` the enqueue payload (line 175-188) doesn't include `product_name`. The `completeQueueJob` at line 276 falls back to `payload.product.title` which works, but is fragile — depends on the nested product object surviving the queue serialization.

**Fix**: Add `product_name: productTitle` to the enqueue payload for explicit metadata.

### Bug 7: Download action opens image in new tab instead of downloading (Severity: Low)
In `CatalogGenerate.tsx` line 437, the download handler does `window.open(url, '_blank')` which just opens the image. Should trigger an actual download.

**Fix**: Use proper download logic with `fetch` + blob + anchor click.

## Plan

### Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/generate-catalog/index.ts` | Fix workflow_name to "Catalog Studio", email text, use `catalog-previews` bucket, add `product_name` from payload |
| `src/hooks/useCatalogGenerate.ts` | Add `product_name` to enqueue payload |
| `src/pages/CatalogGenerate.tsx` | Fix download handler to use proper blob download |

### Detailed Changes

**1. `generate-catalog/index.ts`**
- Line 244: `workflowName: "Catalog Shot Set"` → `"Catalog Studio"`
- Line 384: `"workflow-previews"` → `"catalog-previews"`
- Line 391-392: `"workflow-previews"` → `"catalog-previews"`
- Line 417: `workflow_name: "Catalog Shot Set"` → `"Catalog Studio"`

**2. `useCatalogGenerate.ts`**
- Add `product_name: productTitle` to the enqueue payload object (after `product_image_url`)

**3. `CatalogGenerate.tsx`**
- Replace the `onDownload` handler (line 436-439) with a proper blob download:
  ```typescript
  onDownload={(i) => {
    const url = batchState.aggregatedImages[i];
    if (!url) return;
    fetch(url).then(r => r.blob()).then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `catalog-${i + 1}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
    }).catch(() => window.open(url, '_blank'));
  }}
  ```

