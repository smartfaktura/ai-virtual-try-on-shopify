

# Fix: Dynamic Image Format Detection Across Generation Functions

## Problem
All generation functions hardcode `.png` extension and `image/png` content type for storage uploads. However, Gemini often returns JPEG data (`0xFF 0xD8` magic bytes). This causes:
- JPEG data stored as `.png` files (3-5x larger than necessary)
- Incorrect MIME types served to browsers
- Wasted storage and bandwidth

## Solution
Create a shared utility function that detects the actual image format from the first bytes, then use it everywhere images are uploaded to storage.

### Helper function: `detectImageFormat`
```typescript
function detectImageFormat(bytes: Uint8Array): { ext: string; contentType: string } {
  // JPEG: starts with 0xFF 0xD8
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
    return { ext: 'jpg', contentType: 'image/jpeg' };
  }
  // WebP: starts with RIFF....WEBP
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[8] === 0x57 && bytes[9] === 0x45) {
    return { ext: 'webp', contentType: 'image/webp' };
  }
  // Default to PNG
  return { ext: 'png', contentType: 'image/png' };
}
```

### Files to update (8 files)

Each file gets the `detectImageFormat` helper added at the top, and all hardcoded `.png` / `image/png` references for Gemini-generated uploads are replaced with dynamic detection.

1. **`generate-freestyle/index.ts`** — Two upload paths (Seedream download + Gemini base64). Use detected format for filename and contentType.

2. **`generate-workflow/index.ts`** — Workflow image uploads. Replace hardcoded `image/png` contentType and use detected extension in storage path.

3. **`generate-tryon/index.ts`** — Try-on image upload. Same pattern.

4. **`generate-workflow-preview/index.ts`** — Already partially dynamic (reads mimeType from data URL). Enhance with byte-level detection as fallback.

5. **`generate-scene-previews/index.ts`** — Scene preview uploads. Same pattern.

6. **`generate-user-model/index.ts`** — Model generation upload. Same pattern.

7. **`generate-discover-images/index.ts`** — Discover image uploads. Same pattern.

8. **`upscale-worker/index.ts`** — Upscaled image uploads. Same pattern (Topaz may also return JPEG).

### What stays unchanged
- `try-website-shot/index.ts` — Screenshot API, always PNG by design
- Client-side download utilities (`dropDownload.ts`, `mobileImageSave.ts`) — already detect from response headers

### Impact
- Correct MIME types → browsers render/cache properly
- ~3-5x smaller file sizes when Gemini returns JPEG (most photographic content)
- No quality loss — we store exactly what Gemini produces

