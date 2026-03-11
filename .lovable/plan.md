

## Add Resolution Control: 2K Default for Pro, 1K/2K/4K Selector for Freestyle

### Gemini API Verification

The Gemini API uses `imageSize` inside `image_config` alongside `aspect_ratio`. Valid values: `"512"`, `"1K"`, `"2K"`, `"4K"`. This is the exact same config object we already use — just adding one property:

```text
image_config: { aspect_ratio: "4:5", imageSize: "2K" }
```

This is confirmed by Google's official docs. No prompt engineering needed for resolution — it's a config parameter, not a prompt instruction.

### Changes

**1. Frontend — Replace Quality chip with Resolution picker**

**`src/pages/Freestyle.tsx`**
- Replace `quality` state (`'standard' | 'high'`) with `resolution` state (`'1K' | '2K' | '4K'`, default `'1K'`)
- Update `creditCost`: base pricing = `1K → 4`, `2K → 8`, `4K → 12` (model/scene still floors at 8)
- When resolution is `2K` or `4K`, behave as if pro model is selected for pricing
- Pass `resolution` in queue payload (keep `quality` mapped for backward compat: `1K → standard`, `2K/4K → high`)

**`src/components/app/freestyle/FreestyleSettingsChips.tsx`**
- Replace the Standard/High quality popover with a Resolution selector: 1K, 2K, 4K
- When model is selected, lock chip showing "Pro · 2K" (auto-set to 2K minimum)
- Update prop types from `quality` to `resolution`

**`src/components/app/freestyle/FreestylePromptPanel.tsx`**
- Update prop types: `quality` → `resolution`, `onQualityChange` → `onResolutionChange`

**2. Backend — Pass `imageSize` to Gemini API**

**`supabase/functions/generate-freestyle/index.ts`**
- Read `resolution` from payload (default `"1K"`)
- Add `imageSize: resolution` to the `image_config` object:
  ```typescript
  image_config: { aspect_ratio: aspectRatio, imageSize: resolution }
  ```
- When resolution is `2K` or `4K`, force Pro model (`gemini-3-pro-image-preview`)

**`supabase/functions/generate-tryon/index.ts`**
- Add `imageSize: "2K"` to existing `image_config`:
  ```typescript
  image_config: { aspect_ratio: aspectRatio, imageSize: "2K" }
  ```

**`supabase/functions/generate-workflow/index.ts`**
- Add `imageSize: "2K"` to `image_config`:
  ```typescript
  image_config: { aspect_ratio: aspectRatio, imageSize: "2K" }
  ```

**`supabase/functions/enqueue-generation/index.ts`**
- Update `calculateCreditCost` to accept `resolution` parameter
- Freestyle without model/scene: `1K → 4`, `2K → 8`, `4K → 12` credits per image

### Credit Summary

| Context | Resolution | Credits/Image |
|---------|-----------|---------------|
| Freestyle (no model/scene) | 1K | 4 |
| Freestyle (no model/scene) | 2K | 8 |
| Freestyle (no model/scene) | 4K | 12 |
| Freestyle (with model/scene) | any | 8 (floor) |
| Workflow / Try-On | 2K (forced) | 8 |

### Files: 6 files changed, 0 database migrations

