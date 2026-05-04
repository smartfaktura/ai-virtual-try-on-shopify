## Changes

### 1. Remove bags from built-in presets

Remove `bag` entries from the 5 universal presets in `outfitVocabulary.ts`. Only the "Editorial Fashion" preset currently has one.

### 2. Replace customize popup with inline editor

Remove the Dialog-based customize modal. Instead, add an inline collapsible "Customize & apply to all" section that expands in-place (below the presets row) with the ZaraOutfitPanel + "Apply to all N shots" button. Uses the existing `applyToAllOpen` state.

### 3. Group outfit section by product

This is the main structural change. Instead of showing a flat list of model shots, group them by product:

```text
Model Styling
6 on-model shots across 3 products

[Presets row: Minimal Premium | Editorial Fashion | ... | Customize | Save custom]

▼ White Tank Top (product thumbnail + title)
  Locked slot: TOP — filled by this product
  Configure: outerwear, bottom, shoes, accessories
  Scenes using this product:
    1. Side Profile Street Study — Built-in look
    2. Old Money Outdoor Portrait — Built-in look

▼ Beige Wool Blazer (product thumbnail + title)
  Locked slot: OUTERWEAR — filled by this product
  Configure: top, bottom, shoes, accessories
  Scenes using this product:
    3. On-Model Front — Scene settings
    4. Movement Shot — Scene settings
```

Each product group has:
- A header showing the product thumbnail, title, and which slot it fills
- Its own ZaraOutfitPanel (resolving conflicts for just that product)
- A list of scenes that use this product, each showing its status badge
- Per-scene override capability (expand a scene to customize just that one)

**Implementation approach**: Since `selectedScenes` is a flat array without product association, and all scenes currently apply to all products, group by deriving which product locks which slot. When there's only 1 product, the UI stays essentially the same (just with a product header). When multiple products are selected, each product gets its own outfit section. The outfit config is stored per-product in `outfitConfigByScene` keyed by scene ID (existing mechanism).

**Key data flow**: For each product, resolve its conflict to find its locked slot, then show the ZaraOutfitPanel scoped to that product. Scenes are shown under each product group (all scenes appear under each product since they apply to all). The per-scene config overrides remain per-scene.

Actually, since scenes apply to ALL products equally (each scene generates images for every selected product), the grouping should be by product for the outfit editor (since different products lock different slots), with all scenes listed once per product. The outfit configured for a product group applies to all its scenes.

### Files to change

- `src/lib/outfitVocabulary.ts` — Remove `bag` from Editorial Fashion preset
- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — Replace Dialog with inline collapsible; restructure outfit section to group by product with product headers, per-product ZaraOutfitPanel, and scene list under each
