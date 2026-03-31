

## Fix Mirror Selfie Set Image Quality (Low Resolution / Small File Size)

### Root Cause

The `generate-workflow` edge function sends `output_format: 'png'` in `image_config`, but the Lovable AI gateway returns JPEG anyway (confirmed by storage logs: all files saved as `.jpg`). The `output_format` param is silently ignored.

The real issue is likely that the gateway is returning lower-resolution images. Comparing the two functions:

**Freestyle** (working well):
```js
image_config: {
  aspect_ratio: aspectRatio,
  image_size: '2K',       // no output_format
}
```

**Workflow** (low quality):
```js
image_config: {
  aspect_ratio: aspectRatio,
  image_size: '2K',
  output_format: 'png',   // ← unsupported param, may confuse gateway
}
```

The unsupported `output_format: 'png'` parameter may be causing the gateway to fall back to default/lower resolution settings. Freestyle doesn't send this parameter and produces better results.

### Fix

**File: `supabase/functions/generate-workflow/index.ts` (line 663)**

Remove `output_format: 'png'` from the `image_config` to match the freestyle function's working config:

```js
// Before
image_config: { ...(aspectRatio ? { aspect_ratio: aspectRatio } : {}), image_size: '2K', output_format: 'png' },

// After  
image_config: { ...(aspectRatio ? { aspect_ratio: aspectRatio } : {}), image_size: '2K' },
```

This aligns the workflow API call with the freestyle function that already produces good quality images with the same Pro model.

### Technical Details

- The `generate-workflow` function already correctly uses `google/gemini-3-pro-image-preview` for Mirror Selfie Set (forced at line 996 when model reference is present, also forced by `quality: 'high'` from the workflow config)
- Storage upload logic (lines 1143-1182) correctly handles both base64 and hosted URLs — no changes needed there
- One file changed: `supabase/functions/generate-workflow/index.ts`

