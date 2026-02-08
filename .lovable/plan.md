

## Freestyle Studio -- Full Audit and Improvement Plan

### Current State: What Works

| Feature | Status | Notes |
|---------|--------|-------|
| Text prompt input | Working | Cmd/Ctrl+Enter shortcut supported |
| Upload Image | Working | File upload, preview, removal all functional |
| Add Product | Working | Fetches from `user_products`, sets as source image |
| Model chip | Working | Sends model photo as base64 visual reference to AI |
| Scene chip | Working | Sends both text description AND scene image as visual reference |
| Aspect Ratio | Working | 1:1, 3:4, 4:5, 16:9 -- passed as text instruction to AI |
| Standard/High quality | Working | Standard = `gemini-2.5-flash-image`, High = `gemini-3-pro-image-preview` |
| Polish toggle | Working | Prepends professional photography guidelines to prompt |
| Image count (1-4) | Working | Sequential generation with variation prompts |
| Gallery (masonry) | Working | Saved to `freestyle-images` storage bucket + `freestyle_generations` DB |
| Delete/Download/Expand | Working | Lightbox with keyboard nav, storage + DB cleanup on delete |
| Copy prompt | Working | Copies used prompt back into editor |
| Credit deduction | Working | Deducts from `profiles.credits_balance` in DB |
| RLS policies | Correct | SELECT, INSERT, DELETE all scoped to `auth.uid() = user_id` |

---

### Issues Found

**1. Prompt Polish is too generic**
The current polish prepend is a simple 4-line block:
```
Professional photography: {prompt}
IMPORTANT PHOTOGRAPHY GUIDELINES:
- Ultra high resolution, sharp focus...
```
This is the same regardless of whether the user is generating a product shot, a model photo, food photography, or abstract art. It doesn't leverage the context available (selected model, scene, product type).

**2. No negative prompt / exclusion instructions**
The AI receives no "don't do this" guidance. Common AI artifacts (text overlays, watermarks, distorted hands) are not explicitly excluded.

**3. Model + Scene context not described in the prompt**
When a model is selected, only the image is sent -- no text description (gender, body type, ethnicity). When a scene is selected, its text description IS appended, but model context is missing from the text prompt.

**4. No seed/style consistency between multi-image batches**
When generating 2-4 images, each gets a generic "Variation N" suffix. There's no guidance to maintain color palette, lighting, or style consistency across the batch.

**5. Download doesn't work for base64 images in some browsers**
The download handler creates an `<a>` tag with the raw URL, but for Supabase storage URLs, this opens in a new tab instead of downloading because they lack a `Content-Disposition: attachment` header.

**6. No "generating" skeleton/placeholder in gallery**
When generation is running, the user only sees a thin progress bar at the top of the prompt panel. There's no visual placeholder in the gallery showing where the new image(s) will appear.

**7. `freestyle_generations` table missing useful metadata**
The table only stores: image_url, prompt, aspect_ratio, quality. It doesn't track which model, scene, or product was used -- making it impossible to filter or re-create a generation later.

---

### Improvement Plan

#### Fix 1: Smarter Prompt Polish (edge function)

Update the `polishUserPrompt` function to be context-aware. Instead of a static block, build dynamic polish instructions based on what the user attached:

- If a **product/source image** is attached: add product photography constraints (preserve product accuracy, no alterations to the product)
- If a **model** is attached: add fashion/portrait photography guidance (natural skin, accurate proportions)
- If a **scene** is attached: add environment lighting instructions
- Always include: negative prompt block (no text overlays, no watermarks, no distorted anatomy, no logos)

**File**: `supabase/functions/generate-freestyle/index.ts`
- Change `polishUserPrompt(rawPrompt: string)` to `polishUserPrompt(rawPrompt: string, context: { hasSource: boolean, hasModel: boolean, hasScene: boolean })`
- Build a layered prompt with relevant professional constraints

#### Fix 2: Add model text context to prompt

When a model is selected, append the model's metadata (gender, body type, ethnicity) to the prompt text so the AI has both visual AND textual reference.

**File**: `src/pages/Freestyle.tsx`
- In `handleGenerate`, if `selectedModel` is set, append: `"Model reference: {gender}, {bodyType} build, {ethnicity}"`

#### Fix 3: Fix download for storage URLs

Replace the simple `<a>` click approach with a proper fetch-and-save that works across all browsers.

**File**: `src/pages/Freestyle.tsx`
- Update `handleDownload` to fetch the image as a blob, create an object URL, and trigger download from that

#### Fix 4: Add generation placeholders in gallery

Show skeleton cards in the gallery while generation is in progress, so the user knows where images will appear.

**File**: `src/components/app/freestyle/FreestyleGallery.tsx`
- Add an optional `generatingCount` prop
- Render pulsing skeleton cards at the top of the gallery when > 0

**File**: `src/pages/Freestyle.tsx`
- Pass `isLoading` and `imageCount` to the gallery

#### Fix 5: Store generation metadata in DB

Add columns to `freestyle_generations` for model_id, scene_id, and product_id so users can later filter or reproduce generations.

**Database migration**:
```sql
ALTER TABLE freestyle_generations
  ADD COLUMN model_id text,
  ADD COLUMN scene_id text,
  ADD COLUMN product_id uuid REFERENCES user_products(id) ON DELETE SET NULL;
```

**Files**: `src/hooks/useFreestyleImages.ts`, `src/pages/Freestyle.tsx`
- Pass and save model_id, scene_id, product_id when saving images

#### Fix 6: Add Style Preset Chips

Add a row of quick-select style presets (Cinematic, Editorial, Minimal, Moody, Bright, Vintage) that auto-append mood/lighting keywords to the prompt.

**New file**: `src/components/app/freestyle/StylePresetChips.tsx`
- A horizontal scrollable row of small chips
- Each chip has a label and an associated prompt suffix (e.g., "Cinematic" adds "cinematic lighting, shallow depth of field, warm tones, dramatic shadows")
- Multiple can be selected (toggle on/off)

**Files**: `src/components/app/freestyle/FreestyleSettingsChips.tsx`, `src/pages/Freestyle.tsx`
- Add state for selected style presets
- Append selected preset keywords to prompt before sending to edge function

#### Fix 7: Batch style consistency prompt

Update the variation prompt in the edge function so multiple images in the same batch share consistent style guidance.

**File**: `supabase/functions/generate-freestyle/index.ts`
- For batches > 1, add a consistency instruction: "Maintain the same color palette, lighting direction, and overall mood as the first image. Only vary composition and angle."

---

### Summary of files to change

| File | Type |
|------|------|
| `supabase/functions/generate-freestyle/index.ts` | Edit (smarter polish, consistency prompt, negative prompt) |
| `src/pages/Freestyle.tsx` | Edit (model text context, download fix, metadata passing, style presets state) |
| `src/hooks/useFreestyleImages.ts` | Edit (save metadata columns) |
| `src/components/app/freestyle/FreestyleGallery.tsx` | Edit (generating skeleton placeholders) |
| `src/components/app/freestyle/StylePresetChips.tsx` | **New** (style preset chip row) |
| `src/components/app/freestyle/FreestyleSettingsChips.tsx` | Edit (add style presets row) |
| `src/components/app/freestyle/FreestylePromptPanel.tsx` | Edit (thread style preset props) |
| Database migration | New columns on `freestyle_generations` |

