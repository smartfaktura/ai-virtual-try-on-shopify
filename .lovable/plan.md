

# Add Reference Image Upload with Cmd+V Paste to Text-to-Product

## What
Each product entry in the "Describe" step gets an optional reference image area. Users can paste (⌘V / Ctrl+V), drag-drop, or click to upload. The image is sent as base64 to the edge function, which uses it as visual inspiration with anti-copyright prompting.

## Frontend — `src/pages/TextToProduct.tsx`

### 1. Extend ProductEntry interface
```typescript
interface ProductEntry {
  id: string;
  title: string;
  specification: string;
  referenceImageFile?: File;
  referenceImagePreview?: string;
}
```

### 2. Add per-product paste listener + compact upload zone
Inside each product's `CollapsibleContent` (after the specification textarea), add:
- A compact drop zone: "Paste, drag, or click to add reference image (optional)"
- Show thumbnail with remove button when image is present
- Per-product `onPaste` handler attached to the product card (not global document) so each card independently captures paste events for the focused product
- Validate file type (JPG/PNG/WEBP) and size (<10MB)

### 3. Convert to base64 and include in payload
When generating, convert `referenceImageFile` to base64 via `FileReader` and pass as `referenceImageUrl` in the enqueue payload:
```typescript
payload: {
  title: product.title,
  specification: product.specification,
  referenceImageUrl: base64OrNull,
  scenes, aspectRatio,
}
```

## Backend — `supabase/functions/generate-text-product/index.ts`

### 4. Accept referenceImageUrl in payload
Extract `referenceImageUrl` from the body. When present, convert via existing `urlToInlineDataPart()` helper.

### 5. Modify generateImageGemini to accept optional reference parts
Add optional `referenceParts` parameter:
```typescript
async function generateImageGemini(
  prompt: string, model: string, apiKey: string,
  aspectRatio?: string, referenceParts?: Record<string, unknown>[]
)
```
When provided, prepend them to `nativeParts` alongside the text.

### 6. Anti-copyright prompt injection
When a reference image is present, prepend to each scene prompt:
```
REFERENCE IMAGE RULES: The attached image is visual inspiration ONLY. Use it for shape, silhouette, color palette, and style direction. Do NOT copy any brand logos, labels, text, trademarks, or brand-specific patterns. Create a generic unbranded version. Remove or replace all visible branding.
```

### 7. Pass reference parts through the scene loop
In the main handler's scene loop, pass `referenceParts` to `generateImageGemini` when available. Seedream fallback remains text-only (no image input support).

## Files Changed
| File | Change |
|------|--------|
| `src/pages/TextToProduct.tsx` | Add reference image state, per-product paste/drop/click upload, base64 conversion, include in payload |
| `supabase/functions/generate-text-product/index.ts` | Accept `referenceImageUrl`, build inlineData, pass to Gemini with anti-copyright prompt |

