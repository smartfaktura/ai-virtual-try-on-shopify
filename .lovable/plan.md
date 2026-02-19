

## Fix Upscale Function (Stack Overflow) + Improve Button

### Bug 1: Stack Overflow in Edge Function (Critical)

The crash `RangeError: Maximum call stack size exceeded` happens on line 75:

```text
btoa(String.fromCharCode(...new Uint8Array(imgBuffer)))
```

When an image is e.g. 2MB, this tries to spread 2 million arguments into `String.fromCharCode()`, which blows the call stack. Fix: use chunked base64 encoding.

### Bug 2: Wrong AI Response Parsing

The code looks for `content[].type === "image_url"` but the Lovable AI gateway returns generated images in `message.images[]` array. Need to handle both formats.

### Bug 3: Button Clarity and Color

Current button says "PRO HD" with "4 CR" badge — unclear what it does. Change to:
- Text: **"Enhance to PRO HD"** with a subtle "4 cr" note
- Color: Use an amber/gold gradient instead of primary (to distinguish from Download)
- Tooltip-style subtitle below explaining the feature

### Changes

**File: `supabase/functions/upscale-image/index.ts`**

1. Replace the broken base64 line with a chunked approach:
```typescript
// Chunked base64 encoding to avoid stack overflow
const uint8 = new Uint8Array(imgBuffer);
let binary = '';
const chunkSize = 8192;
for (let i = 0; i < uint8.length; i += chunkSize) {
  binary += String.fromCharCode(...uint8.slice(i, i + chunkSize));
}
const imgBase64 = btoa(binary);
```

2. Fix response parsing to handle `images[]` format:
```typescript
// Try images array first (Lovable AI gateway format)
const images = aiResult.choices?.[0]?.message?.images;
if (Array.isArray(images)) {
  for (const img of images) {
    if (img.type === "image_url" && img.image_url?.url) {
      // extract from data URL...
    }
  }
}
// Fallback to content array
if (!newImageBase64) { /* existing content[] parsing */ }
```

**File: `src/components/app/LibraryDetailModal.tsx`**

Update the upscale button:
- Change gradient to amber/gold tones (`from-amber-500 to-yellow-600`)
- Text: "Enhance to PRO HD" with small "4 cr" label
- Make it clearly an "extra/premium" optional action, visually distinct from the dark Download button

### Files to Edit

| File | Change |
|------|--------|
| `supabase/functions/upscale-image/index.ts` | Fix stack overflow + response parsing |
| `src/components/app/LibraryDetailModal.tsx` | Redesign button with amber color and clearer text |

