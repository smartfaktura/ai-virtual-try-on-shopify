

# Extra Reference Image Upload in Step 3 (Setup)

## What this does
When an admin marks a scene as "requires extra reference image" (e.g. Back View, Side Profile), users selecting that scene will see a small upload area in Step 3 (Setup) to provide an additional product photo for that angle. This image gets sent to the AI alongside the main product image during generation.

## Changes

### 1. Database: add column to `product_image_scenes`
```sql
ALTER TABLE product_image_scenes 
  ADD COLUMN requires_extra_reference boolean NOT NULL DEFAULT false;
```

### 2. Admin UI — checkbox in scene form
**File: `src/pages/AdminProductImageScenes.tsx`**
- Add a `Checkbox` row after the trigger blocks section labeled **"Requires extra reference image"** with helper text
- Wire to `draft.requires_extra_reference` / `set('requires_extra_reference', v)`
- Show a small `Camera` badge on scene rows where flag is true

### 3. Hook + types — expose new field
**File: `src/hooks/useProductImageScenes.ts`**
- Add `requires_extra_reference` to `DbScene` interface
- Map it in `dbToFrontend` → `requiresExtraReference`

**File: `src/components/app/product-images/types.ts`**
- Add `requiresExtraReference?: boolean` to `ProductImageScene`

### 4. Step 3 (Setup/Refine) — upload UI for flagged scenes
**File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`**
- In the "Selected shots" section where scenes are listed, for each scene with `requiresExtraReference === true`:
  - Show a small inline upload area with label like *"Upload back/side photo for better accuracy"*
  - Upload button + drag area (compact, matching existing design patterns)
  - After upload, show a thumbnail preview with remove button
- Upload uses `product-uploads` bucket under `{userId}/scene-refs/{timestamp}.{ext}`
- Store URLs in a new state map passed via props: `sceneExtraRefs: Record<string, string>`

### 5. Thread state through ProductImages.tsx
**File: `src/pages/ProductImages.tsx`**
- Add `sceneExtraRefs` state: `useState<Record<string, string>>({})`
- Pass `sceneExtraRefs` + `onSceneExtraRefsChange` to Step 3 Refine component
- In the generation loop (around line 383), if current scene has an extra ref URL, add it to payload as `extra_reference_image_url`

### 6. Edge function — inject extra reference into AI prompt
**File: `supabase/functions/generate-workflow/index.ts`**
- After the packaging reference check (line ~1211), add:
  ```typescript
  if ((body as any).extra_reference_image_url) {
    referenceImages.push({ 
      url: (body as any).extra_reference_image_url, 
      label: "product_extra_angle" 
    });
  }
  ```
- This injects the extra angle photo as an additional reference image the AI uses for accurate rendering

## Files to modify
- **Migration**: add `requires_extra_reference` column
- `src/hooks/useProductImageScenes.ts` — expose field
- `src/components/app/product-images/types.ts` — add to interface
- `src/pages/AdminProductImageScenes.tsx` — admin checkbox
- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — upload UI in setup step
- `src/pages/ProductImages.tsx` — state + payload threading
- `supabase/functions/generate-workflow/index.ts` — use extra reference

