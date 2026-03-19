

# Workflow Image Quality Investigation

## Findings

After tracing the full generation pipeline for "Product Listing Set," here's what I found:

### What's working correctly
- Your "high" quality selection IS reaching the edge function (confirmed in logs: `using google/gemini-3-pro-image-preview`)
- The image config already requests `image_size: '2K'` and `output_format: 'png'`
- The raw image bytes are uploaded to storage without any re-compression

### Why the file size differs (500KB workflow vs 5MB try-on)
PNG compression is lossless and content-dependent. A product on a clean/simple background has large uniform color areas that PNG compresses extremely well (~500KB). A try-on image with a full person, clothing textures, and detailed background has far more visual data (~5MB). Both are 2K resolution — the file size difference is purely about image complexity, not quality reduction.

### One actual issue found
The "Product Listing Set" workflow has `fixed_settings.quality: "standard"` in its database config. When the workflow loads, this resets your quality selector to "standard" (line 533-536 in Generate.tsx). If you changed it back to "high" manually before generating, it worked correctly (as logs confirm). But this auto-reset could be confusing.

## Proposed Fix

### `src/pages/Generate.tsx` — Don't override quality to "standard" when workflow has it as default
Remove the auto-set of quality from workflow fixed_settings, or only apply it when quality hasn't been explicitly set by the user. This way the user's quality choice is always respected.

Alternatively, we can simply **remove the `quality: "standard"` from the Product Listing Set workflow's fixed_settings** in the database, so it stops resetting the selector.

### No backend changes needed
The generation pipeline correctly handles quality — the pro model is used for "high", and 2K + PNG output is already configured. The ~500KB file size for a product listing PNG at 2K is normal and expected.

