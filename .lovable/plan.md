

## Phase 0: Cleanup — Simplify Freestyle Before Architecture Changes

### Summary
Remove UI clutter (Polish toggle, Style Presets from main row), fix dangerous `sourceImage` labeling, and shorten the prompt builder. No new architecture — just reduce confusion.

---

### 1. Remove Polish toggle from UI

**Files:** `FreestyleSettingsChips.tsx`, `FreestylePromptPanel.tsx`, `Freestyle.tsx`

- Remove `polishChip` from both mobile and desktop chip layouts
- Remove `polishPrompt` / `onPolishChange` props from `FreestyleSettingsChips` and `FreestylePromptPanel`
- In `Freestyle.tsx`: remove `polishPrompt` state, hardcode `polishPrompt: true` in the enqueue payload
- Remove from `isDirty` check and `handleReset`

### 2. Remove Style Presets chip from main row

**Files:** `FreestyleSettingsChips.tsx`, `FreestylePromptPanel.tsx`, `Freestyle.tsx`

- Remove `presetsChip` from both mobile and desktop layouts
- Remove `stylePresets` / `onStylePresetsChange` props from settings chips and prompt panel
- In `Freestyle.tsx`: remove `stylePresets` state, stop sending `stylePresets` in payload
- Remove `StylePresetChips` import (file itself can stay for now)

### 3. Fix `buildContentArray()` — stop treating sourceImage as `[PRODUCT IMAGE]`

**File:** `generate-freestyle/index.ts`, lines 682-691

Current dangerous fallback:
```
if (productImage) { label = "[REFERENCE IMAGE]" }
else { label = "[PRODUCT IMAGE]" }  // ← wrong
```

Replace with:
- If `productImage` exists and `sourceImage` exists → source = `[REFERENCE IMAGE]`
- If `productImage` exists, no source → just product
- If no `productImage`, source exists → `[REFERENCE IMAGE]` (not product)
- Never label an uploaded image as `[PRODUCT IMAGE]` unless it came from the product selector

### 4. Shorten `polishUserPrompt()` — reduce prompt bloat

**File:** `generate-freestyle/index.ts`

Changes within the existing function (no new architecture):

a. **Remove "Create a NEW photograph" wording** from product identity layers (lines 202, 209, 346). Replace with neutral: "Generate a photograph of this exact product with professional lighting and fresh composition."

b. **Soften model identity wording** (line 376). Current is 5 lines of aggressive caps-lock matching. Replace with: "The person must match the individual in [MODEL IMAGE] — same face, features, skin tone, hair, and body. This is a specific person, not a generic model."

c. **Shorten negative prompt** (`buildNegativePrompt`). Current is 8+ rules. Reduce to 4 essentials:
   - Anatomy rule (keep concise)
   - No AI smoothing
   - No collage/split-screen
   - No black borders

d. **Shorten iPhone/natural camera block** (lines 431-438). Current is a massive 10-line block. Replace with 3 concise lines:
   - "Shot on iPhone. Deep depth of field, everything sharp. True-to-life colors, no grading. Natural ambient light, no studio lighting. Ultra-sharp detail."

e. **Shorten selfie composition** (lines 296-298). Current is a wall of text. Reduce to 3 key instructions.

f. **Shorten portrait quality** (line 404). Reduce from dense paragraph to 2 lines.

g. **Update prompt references** — change `[PRODUCT IMAGE]` to `[PRODUCT REFERENCE]` in polishUserPrompt to match new content array labeling. Similarly `[MODEL IMAGE]` → `[MODEL REFERENCE]`, `[SCENE IMAGE]` → `[SCENE REFERENCE]`.

### 5. Update `buildContentArray()` labels

Change labels to be clearer:
- `[PRODUCT IMAGE]` → `[PRODUCT REFERENCE]` (for product from selector)
- `[MODEL IMAGE]` → `[MODEL REFERENCE]`
- `[SCENE IMAGE]` → `[SCENE REFERENCE]`
- `[REFERENCE IMAGE]` stays (for uploaded source when product also exists)

### 6. Deduplicate `freestyle_generations` insert

Extract the duplicated DB insert (lines 1102-1128 and 1162-1189) into a `saveFreestyleRecord()` helper. Called from both normal and 429-fallback paths.

### 7. Deduplicate Supabase client creation in loop

Create the service-role client once before the generation loop instead of creating new clients at lines 1079, 1103, 1164.

---

### Files changed
- `supabase/functions/generate-freestyle/index.ts` — prompt shortening, label fixes, deduplication
- `src/components/app/freestyle/FreestyleSettingsChips.tsx` — remove Polish + Presets chips
- `src/components/app/freestyle/FreestylePromptPanel.tsx` — remove Polish + Presets props
- `src/pages/Freestyle.tsx` — remove Polish + Presets state, hardcode polish=true
- `public/generate-freestyle-logic.txt` — update with new logic

### Risk
Low — no queue/credit/storage changes. Polish was already defaulting to `true`. Presets were rarely used. Prompt shortening is the main behavioral change but keeps the same intent with less noise.

