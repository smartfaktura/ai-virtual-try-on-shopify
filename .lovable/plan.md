
## What changes

### 1. Outerwear "None" option
Add a "None" chip as the first option in the `OUTERWEAR_TYPES` array in `src/lib/outfitVocabulary.ts` (id: `none`, label: `None`). When selected, it explicitly signals no outerwear. The `OutfitSlotCard` already supports clearing via the X button, but "None" makes it more discoverable. The prompt builder will treat `garment: 'none'` as "no outerwear layer".

### 2. Fix "Apply one outfit to all shots" — keep open, add Save button
Currently in `ProductImagesStep3Refine.tsx`, the apply-to-all `ZaraOutfitPanel` calls `handleApplyToAll` on every single slot change, which immediately applies to all scenes AND closes the section. 

Changes:
- Add a local `applyToAllDraft` state (`OutfitConfig`) that the ZaraOutfitPanel writes to instead of immediately applying
- The ZaraOutfitPanel stays open while the user configures details
- Add a "Save & apply to all N shots" button at the bottom of the apply-to-all section
- Clicking that button calls `handleApplyToAll(applyToAllDraft)` which applies + closes
- Also add a "Save as preset" button next to it (reuses existing save popover logic)

### 3. Show presets above the apply-to-all editor
Move/duplicate the `OutfitPresetBar` to appear at the top of the apply-to-all section (before the slot cards). Currently presets are only inside the ZaraOutfitPanel. Add the 5 new default presets as quick-select chips that load into the draft. User and saved presets also appear here.

### 4. Add 5 default style presets
Add these to `BUILT_IN_PRESETS` in `src/lib/outfitVocabulary.ts` as universal category presets (available for all product types):

- **Minimal Premium** — Clean basics, neutral tones (white tee, tailored black trousers, white sneakers)
- **Editorial Fashion** — Campaign-ready, polished (silk blouse, wide-leg trousers, pointed heels)
- **Casual Everyday** — Relaxed lifestyle (grey knit sweater, light-wash jeans, white sneakers)
- **Streetwear / Urban** — Oversized layers (oversized hoodie, cargo pants, chunky sneakers, cap)
- **Sport / Active** — Athleisure (fitted sport top, leggings, running shoes)

Each preset maps to the existing `OutfitConfig` slots (top, bottom, shoes, outerwear, hat, etc.).

---

## Files to edit

| File | Change |
|---|---|
| `src/lib/outfitVocabulary.ts` | Add `{ id: 'none', label: 'None' }` to `OUTERWEAR_TYPES`. Add 5 new universal presets to `BUILT_IN_PRESETS`. |
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | Refactor apply-to-all section: add `applyToAllDraft` state, stop auto-closing, add Save button. Show presets at top of apply-to-all section. |
| `src/components/app/product-images/OutfitPresetBar.tsx` | No changes needed (already supports built-in + user presets). |
| Prompt builder (`productImagePromptBuilder.ts`) | Handle outerwear `garment: 'none'` — skip outerwear from prompt when garment is `none`. |
