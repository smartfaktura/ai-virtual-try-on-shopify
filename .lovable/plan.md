

## Fix Sample Products in Workflows (Generate.tsx)

### Problem
In `Generate.tsx`, workflows already handle the `product_id` correctly (nulling it for samples via `userProducts.some()`). However, `product_image_url` in the payload still passes the raw local path (e.g. `/images/samples/sample-ring.png`). This URL is unreachable by the edge function and gets saved to `generation_jobs`, meaning:
- The backend can't use it as a reference
- Library thumbnails will be broken

The actual product image used for AI generation (`product.imageUrl`) goes through `convertImageToBase64()`, so the AI provider receives valid data. The issue is only with `product_image_url` (metadata field).

### Fix

**File: `src/pages/Generate.tsx`**

1. **Create a helper function** (near the top of the component) to upload local sample images to storage, similar to what was done in Freestyle:

```typescript
async function resolveProductImageUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('/')) {
    // Local sample image — upload to storage for a public URL
    const resp = await fetch(url);
    const blob = await resp.blob();
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    return uploadImageToStorage(base64, 'product');
  }
  return url;
}
```

2. **Replace raw `product.images[0]?.url` references** in payload `product_image_url` fields with `await resolveProductImageUrl(...)` at approximately 3 locations:
   - Line ~1170: workflow generation path
   - Line ~1474: try-on path
   - Line ~1624: selfie/UGC path

This ensures all workflow types upload sample images to storage before sending the URL to the backend.

### Files to edit
- `src/pages/Generate.tsx` — Add `resolveProductImageUrl` helper; update 3 payload locations to use it

