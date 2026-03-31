

## Fix Mirror Selfie Set Resolution — Add Missing `max_tokens`

### Problem
Mirror Selfie Set generates 1024×1024 images. Freestyle generates proper 2K images. Both use the same AI model and `image_size: '2K'`.

### Root Cause
The `generate-workflow` function is missing `max_tokens: 8192` in its API request body. Freestyle includes it:

**Freestyle** (2K output):
```js
modalities: ["image", "text"],
max_tokens: 8192,                          // ← present
image_config: { aspect_ratio, image_size: '2K' }
```

**Workflow** (1024 output):
```js
modalities: ["image", "text"],
                                            // ← max_tokens MISSING
image_config: { aspect_ratio, image_size: '2K' }
```

Without `max_tokens: 8192`, the gateway defaults to a lower token budget, which caps the image resolution at 1024×1024 regardless of the `image_size` setting.

### Fix

**File: `supabase/functions/generate-workflow/index.ts` (line 662)**

Add `max_tokens: 8192` to the request body:

```js
// Before (line 662-663)
modalities: ["image", "text"],
image_config: { ...(aspectRatio ? { aspect_ratio: aspectRatio } : {}), image_size: '2K' },

// After
modalities: ["image", "text"],
max_tokens: 8192,
image_config: { ...(aspectRatio ? { aspect_ratio: aspectRatio } : {}), image_size: '2K' },
```

One line added, one file changed.

