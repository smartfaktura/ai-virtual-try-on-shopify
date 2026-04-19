
## Plan: Phase 2 — Wire ZARA outfit system into Step 3 (zero-risk surgical edit)

### What changes
Only the **outfit picker block** inside `ProductImagesStep3Refine.tsx` gets swapped. Model picker, person styling toggle, packaging refs, scene selection, and all sibling flows are untouched.

### Surgical scope
1. **Locate** the existing outfit UI block (current flat dropdowns for top/bottom/shoes). Read 30 lines above + below to map exact boundaries.
2. **Replace ONLY that block** with three new pieces:
   - `<OutfitPresetBar>` (top)
   - Conditional **scene-hint takeover banner** (when any selected scene has `outfit_hint` AND user hasn't clicked Override)
   - **Slot grid** rendering `<OutfitSlotCard>` per available slot, driven by `outfitConflictResolver.resolveConflicts(productAnalysis)`
3. **Wire state** — reuse the existing `outfitConfig` state setter that already lives in this file. The new components write into the same `OutfitConfig` shape (now extended), so downstream prompt-builder + Step 4 review keep working.
4. **Add 2 small local state hooks**: `overrideSceneHint: boolean` and `expandedAccessories: boolean`. Both default `false`.

### Why it won't crash
- `OutfitConfig` schema change is **additive** — existing fields (`top`, `bottom`, `shoes`, `accessories`) still exist. Old saved configs read fine.
- New components are already built + tested in isolation (Phase 1).
- Conflict resolver returns safe defaults (`{ availableSlots: ['top','bottom','shoes'], hiddenSlots: [], lockedSlot: null }`) when product category is unknown → behaves like today.
- Prompt builder already updated in Phase 1 to render new slots AND skip empty ones → no broken prompts.
- Zero edits to: model picker, person toggle, packaging, scene selection, multi-product loop, generation trigger, credits logic.

### Edge cases handled
- **No product analysis yet** → resolver returns default 3 slots, identical to current behavior.
- **Non-fashion product** (perfume, candle) → resolver returns `{ availableSlots: [] }` → outfit block hides itself with single line "Outfit not needed for this product."
- **Scene with `outfit_hint`** → block replaced by banner; clicking Override reveals full picker.
- **Multi-scene selection mixing hint + non-hint scenes** → banner shown only if ALL selected scenes have hints (safer default).
- **Loading a preset that conflicts with locked product slot** → resolver strips conflicting keys silently before merging.

### Files touched
- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — ONE block replaced (~80-120 lines swapped), no other section edited
- (No new files, no DB changes, no migrations — Phase 1 already shipped those)

### Validation steps after edit
1. Visual check Step 3 with: a tee product, a dress product, a jacket product, a fragrance product, a scene with `outfit_hint`.
2. Confirm prompt preview in Step 4 still renders correctly for each.
3. Save + load a preset.

### Risk
**Very low.** Single file, single block, additive schema, fallback defaults at every layer. Worst case = outfit block looks slightly off → revert via chat history (one click).
