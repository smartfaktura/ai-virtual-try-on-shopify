

## Restyle "From Explore" to match category sections

### Problem
The "From Explore" section in Wizard Step 2 currently renders as a giant single card stretched across the full grid (~5 columns wide), making it look broken next to the tight "Creative Shots" / "Beverages" category grids. The explainer text is a small caption below it.

### Fix

**File:** `src/components/app/product-images/ProductImagesStep2Scenes.tsx` (lines 496–513)

Match the visual rhythm of `SubGroupSection`:
1. **Header row** — same style as "CREATIVE SHOTS": `text-[11px] font-semibold uppercase tracking-wide`, with the colored "Pre-selected" tag inline + a thin divider line + a "1 selected" pill on the right (mirrors `Select All` placement).
2. **Grid** — keep the same `gridClass` the other sections use, but render two cards side-by-side at the same size as Creative Shots cards:
   - **Card A**: the actual scene card (`SceneCard`, normal size — no longer full-width).
   - **Card B**: a sibling **explainer card** with the same dimensions — light dashed border, `Sparkles` icon, title "Pre-selected from Explore", body "Add more shots below to get a richer set of visuals." This makes the row feel intentional instead of empty.
3. Remove the standalone `<p>` caption below (now lives inside the explainer card).

### Visual result

```text
PRE-SELECTED FROM EXPLORE ─────────────────────────────  1 selected
┌──────────┐ ┌──────────┐
│  Frozen  │ │ ✨        │
│   Aura   │ │ Picked   │
│  [scene] │ │ from     │
│          │ │ Explore  │
└──────────┘ └──────────┘

CREATIVE SHOTS ────────────────────────────────  Select All (1/14)
┌──┐┌──┐┌──┐┌──┐ …
```

Both cards now follow the same `aspect-[4/5]` proportions, same border radius, same gap — visually consistent with all other category rows.

### Out of scope
- No changes to data flow, scene resolution, selection logic, or routing.
- Other category sections (`UnifiedCategorySectionWithSelectAll`, `SubGroupSection`) are untouched.

