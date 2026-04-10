

# New "Brand Logo / Text" Trigger Block

## Concept
Add a new trigger block `brandLogoOverlay` that works like existing reference triggers (backView, atomizerDetail, etc.) but also includes a **text input** for specifying exact text to render. When a scene has this trigger, Step 3 shows:
- An image upload card for the brand logo (optional)
- A text input: "Text to appear on the shot" (optional)
- Both are optional — if neither provided, AI uses whatever branding is visible on the product

## Changes

### 1. `src/components/app/product-images/detailBlockConfig.ts`
- Add `brandLogoOverlay` to `REFERENCE_TRIGGERS` with label "Upload brand logo", description explaining the purpose, and a `promptLabel` for prompt injection
- This automatically makes it available as a trigger block checkbox in admin

### 2. `src/components/app/product-images/types.ts` → `DetailSettings`
- Add `brandLogoText?: string` field to store the user-typed text (e.g. "BOTTEGA VENETA")

### 3. `src/components/app/product-images/ProductImagesStep3Refine.tsx`
- In the reference trigger upload section (~line 1997), add special handling for `brandLogoOverlay`: render the standard image upload **plus** a text input below it (`"Text / brand name to display"`)
- Store the text value in `details.brandLogoText`

### 4. `src/lib/productImagePromptBuilder.ts`
- When building prompts, if the scene has `brandLogoOverlay` trigger and `brandLogoText` is set, inject a directive like: `"Display the following brand text prominently: {text}"`
- If a logo image was uploaded, it gets passed as `extra_reference_image_url` (already handled by existing reference trigger logic)

### 5. `src/pages/ProductImages.tsx`
- In the generation payload builder (~line 468), the existing reference trigger logic already handles image uploads via `sceneExtraRefs[trigger:brandLogoOverlay]` — just also pass `brandLogoText` in the payload when present

No database changes needed — admin can assign `brandLogoOverlay` to any scene via the existing trigger block checkboxes in the admin panel.

