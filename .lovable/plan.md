

# Seedream Image Role Handling Audit

## Current State Analysis

I traced how each `imageRole` flows through the Seedream path:

### Working correctly for Seedream:
- **`product`** → source image labeled `[PRODUCT IMAGE]` → `convertContentToSeedreamInput` detects as `role: "product"` → correct IMAGE ROLES directive
- **`model`** → source image labeled `[MODEL REFERENCE]` → detected as `role: "model"` → correct directive ("preserve exact face...")
- **`scene`** → source image labeled `[SCENE REFERENCE]` → detected as `role: "scene"` → correct directive ("use for environment only")

### Broken: `edit` mode
- Source image labeled `[REFERENCE IMAGE]` → detected as `role: "other"` → gets generic "use for style/mood inspiration" directive
- The `polishUserPrompt` generates edit-specific text like "Edit the provided image. Replace the product while preserving everything else." — this is reasonable prompt text
- **Core problem**: Seedream is a generative model, not an editor. It cannot surgically edit an image (change background, swap product, enhance). It will use the image as loose reference and generate something new. Gemini (Nano Banana) actually supports true image editing via its multimodal capabilities.

## Plan

### Force Nano Banana for edit mode (regardless of provider override)

**File: `supabase/functions/generate-freestyle/index.ts`**

In the provider selection block (~line 1095), add a condition: when `imageRole === 'edit'`, override `useSeedream` to `false` and force Gemini's image editing path. This ensures:

1. Edit operations always use a model that can actually edit images
2. Product/model/scene roles continue working on Seedream as before
3. No UI changes needed — the user still sees all 4 role options

**Change (~line 1095):**
```typescript
const useSeedream = providerOverride === "seedream-4.5" && !!ARK_API_KEY && body.imageRole !== 'edit';
```

Add a log line so we can verify:
```typescript
if (body.imageRole === 'edit' && providerOverride === "seedream-4.5") {
  console.log("[generate-freestyle] Edit mode: forcing Nano Banana (Seedream cannot edit images)");
}
```

This is a single-line change. Edit mode gets routed to Gemini which supports true image manipulation. All other roles (product, model, scene, none) continue using whichever provider was selected.

## Files Modified
- `supabase/functions/generate-freestyle/index.ts` — force Nano Banana when `imageRole === 'edit'`

