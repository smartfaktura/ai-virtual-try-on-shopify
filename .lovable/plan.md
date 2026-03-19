

# Fix Hardcoded .png Upload + Request PNG from Gateway

## Problem
- **Freestyle** and **Try-On** upload functions hardcode `.png` extension and `image/png` content type, even when Gemini returns JPEG data
- **Workflow** already correctly parses the MIME from the data URL — Freestyle and Try-On should match
- To ensure consistently large, high-quality PNG output, we should also tell the gateway to return PNG via `output_format: 'png'`

## Changes

### 1. `supabase/functions/generate-tryon/index.ts` — Fix upload + request PNG

**Upload function** (lines 216-225): Parse MIME from data URL instead of hardcoding:
```typescript
const mimeMatch = base64Url.match(/^data:(image\/[^;]+);/);
const mimeType = mimeMatch?.[1] || "image/png";
const ext = mimeType === "image/jpeg" ? "jpg" : "png";
const fileName = `${userId}/${crypto.randomUUID()}.${ext}`;
// ...upload with contentType: mimeType
```

**Gateway call** (line 303): Add `output_format: 'png'`:
```typescript
image_config: { aspect_ratio: aspectRatio, image_size: '2K', output_format: 'png' },
```

### 2. `supabase/functions/generate-freestyle/index.ts` — Fix upload

**Upload function** (lines 336-346): Same MIME parsing fix:
```typescript
const mimeMatch = base64Url.match(/^data:(image\/[^;]+);/);
const mimeType = mimeMatch?.[1] || "image/png";
const ext = mimeType === "image/jpeg" ? "jpg" : "png";
const fileName = `${userId}/${crypto.randomUUID()}.${ext}`;
// ...upload with contentType: mimeType
```

Freestyle already produces large images so no `output_format` change needed there, but the upload metadata should still be correct.

### 3. `supabase/functions/generate-workflow/index.ts` — Request PNG

Upload already parses MIME correctly. Just add `output_format: 'png'` to the gateway call (line 586):
```typescript
image_config: { ...(aspectRatio ? { aspect_ratio: aspectRatio } : {}), image_size: '2K', output_format: 'png' },
```

## Summary

| File | Fix upload MIME? | Add `output_format: 'png'`? |
|---|---|---|
| generate-tryon | Yes | Yes |
| generate-freestyle | Yes | No (already gets PNG from Pro model) |
| generate-workflow | No (already correct) | Yes |

Three files, small targeted edits. This ensures the gateway returns PNG data and the upload correctly labels whatever it receives.

