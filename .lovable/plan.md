

## Force PNG Output Across All Generation Functions

### Problem
The AI gateway (Gemini Pro) now returns `image/jpeg` base64 data. Our upload code dynamically detects the MIME type and saves accordingly — so images are being stored as `.jpg` instead of `.png`, losing quality.

### Fix
Force all image uploads to use `.png` extension and `image/png` content type, regardless of what the gateway returns. The raw pixel data is the same — we just store it as PNG (lossless) instead of JPEG (lossy).

### Files to Change (4 locations across 3 files)

**1. `supabase/functions/generate-freestyle/index.ts`**
- **Line ~602-604** (blob upload path): Replace dynamic ext detection with hardcoded `.png` and `image/png`
- **Line ~652-655** (base64 upload path): Same fix — force `.png`

**2. `supabase/functions/generate-workflow/index.ts`**
- **Line ~1150-1152**: Force `.png` instead of detecting JPEG

**3. `supabase/functions/generate-tryon/index.ts`**
- **Line ~268-271**: Force `.png` instead of detecting JPEG

Each location changes from:
```js
const ext = mimeType === "image/jpeg" ? "jpg" : "png";
const fileName = `${userId}/${crypto.randomUUID()}.${ext}`;
```
To:
```js
const fileName = `${userId}/${crypto.randomUUID()}.png`;
```
And forces `contentType: "image/png"` in the upload call.

