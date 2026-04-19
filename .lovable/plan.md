
## Simplify Step 3 outfit panel: AI auto-style per product, hide complexity

### What's wrong now
1. Auto-pick exists but the helper line / suggested presets don't visibly indicate a smart preselection happened
2. Full outfit editor (Top/Bottom/Shoes/Belt/Jewelry slots) renders open by default → crowded
3. "Wardrobe summary" block is verbose and redundant
4. Auto-pick applies one preset to ALL products → doesn't vary per product

### The new clean panel structure

```
Style & Outfit
Pick a direction — applies to all on-model shots.

┌─────────────────────────────────────────────────────────┐
│ ✨ Our AI stylist preselected the best match            │
│                                                          │
│ White Sneakers → Street Editorial Baggy                 │
│ Linen Dress    → Resort Eclectic                        │
│ Black Hoodie   → Quiet Luxury Hoodie                    │
│                                                          │
│ [ Re-style ]  [ Customize ▾ ]                           │
└─────────────────────────────────────────────────────────┘
```

That's it by default. No open slot grid. No wardrobe summary. No noisy preset bar.

### Changes

**1. Per-product auto-pick (new)**
- Extend `pickDefaultPreset` → `pickDefaultPresetPerProduct(products)` returning `Record<productId, preset>`
- Store result in `details.outfitConfigByProduct: Record<productId, OutfitConfig>` (already proposed earlier — now actually wired)
- Prompt builder reads `outfitConfigByProduct[productId]` first, falls back to global `outfitConfig`
- Picks vary: each product gets a *different* recommended preset suited to its category (deterministic shuffle by productId hash so re-mounts are stable)

**2. Replace panel default view with the AI Stylist card**
- Remove the always-visible Top/Bottom/Shoes editor from default state
- Show the per-product preselection list (product name → preset name) in a clean card
- `Re-style` → re-runs `pickDefaultPresetPerProduct` with a different deterministic seed (variety)
- `Customize ▾` → expands the existing slot editor + suggested presets bar (current UI moved into a collapsed accordion)

**3. Remove the "Wardrobe summary" block entirely**
- Delete the rendered summary section in `ProductImagesStep3Refine.tsx` (the "Top: white shirt / Bottom: denim…" list and "Outfit edits here apply across your selected model shots" line)

**4. Single-product case**
- Same card, just shows one row: *"Your Product → Quiet Luxury Knit"*
- Same `Re-style` / `Customize` controls

### Files to touch
- `src/hooks/useOutfitPresets.ts` — add `pickDefaultPerProduct(products)` returning per-product preset map; deterministic hash-based variety
- `src/components/app/product-images/types.ts` — add `outfitConfigByProduct?: Record<string, OutfitConfig>` to `ProductImageDetails`
- `src/lib/productImagePromptBuilder.ts` — resolve `outfitConfigByProduct[productId]` before global `outfitConfig`
- `src/components/app/product-images/ProductImagesStep3Refine.tsx`
  - Remove "Wardrobe summary" block
  - Replace default outfit area with new `AiStylistCard` (per-product preselection list + Re-style + Customize)
  - Move existing slot editor + `OutfitPresetBar` into a collapsed `Customize` accordion
- New: `src/components/app/product-images/AiStylistCard.tsx` — the clean card

### Behavior
- Step 3 mounts → if `outfitConfigByProduct` empty → run `pickDefaultPerProduct` silently → card shows preselections
- User clicks `Re-style` → reshuffles, card updates, toast "Re-styled 3 products"
- User clicks `Customize` → expands → user can override globally OR (later) per-product; for now, customize edits the global `outfitConfig` which still wins per `outfitConfigByProduct` resolution order? **Decision: Customize edits override per-product picks for ALL products** (simpler MVP — clears `outfitConfigByProduct` and writes to global `outfitConfig`)

### Risk
Low. Pure UI restructuring + per-product map + 1-line prompt builder change. Falls back to global outfit if map missing.

### Validation
1. Open Step 3 with 3 different products → AI Stylist card shows 3 different preset names matched to each product's category
2. No open slot editor visible by default — clean spacious card only
3. Click `Re-style` → preset names change, toast confirms
4. Click `Customize` → existing editor expands; editing it overrides per-product picks across all products
5. Generate → each product's shots reflect its own assigned preset
6. No "Wardrobe summary" block anywhere
