
## Category-aware curated preset library + smart auto-pick

### What you're asking for
1. **Big curated library** of looks per garment category — sourced from Zara/COS/Aritzia/Massimo Dutti current trend codes
2. **Auto-pick a sensible default** the moment Step 3 opens, so the user never lands on "nothing styled"
3. Keep manual editing + user-saved presets exactly as they are today

### The library (authored in `src/lib/outfitVocabulary.ts`)

Replace the current 4 starter `BUILT_IN_PRESETS` with ~60 looks tagged by category. Each preset is a real `OutfitConfig` using existing vocabulary (so prompt builder needs zero changes). Color values reference neutrals where possible so `{{aestheticColor}}` cohesion still works.

**Coverage (≈60 looks total):**

| Category tag | Count | Example look names (Zara/Cos trend-coded) |
|---|---|---|
| `tops` (tee, blouse, shirt, tank) | 6 | Clean Minimal Denim, Tucked Trouser Polish, Quiet Luxury Knit, Office Siren, Coastal Linen, Y2K Baby-Tee |
| `hoodies / sweatshirts` | 6 | Off-Duty Layered, Athleisure Clean, Streetwear Baggy, Quiet Luxury Hoodie, Tech-wear Mono, Y2K Layered |
| `knits / cardigans` | 5 | Sandstone Layering, Heritage Cable, Long-line Cardi & Slip, Polo-Knit Prep, Open-Knit Beach |
| `dresses` | 7 | Slip-Dress Minimal, Garden Party Midi, Resort Eclectic, Black-Tie Slip, Sweater-over-Slip, Tea-Dress Boots, Y2K Mini |
| `jeans / denim` | 6 | Western Modern, Café Casual Loafer, Quiet Luxury Denim, Street Editorial Baggy, Coastal Light-Wash, Y2K Low-Rise |
| `trousers / tailoring` | 5 | Office Siren, Tonal Tailoring, Wide-Leg & Tank, Pleated Heritage, Cargo Tech |
| `skirts` | 4 | Pencil & Knit, Pleated Midi Prep, Mini & Boot, Maxi Resort |
| `shorts` | 3 | Bermuda Tailored, Denim Café, Cargo Tech |
| `jackets / blazers / coats` | 6 | Biker Edge, Equestrian Heritage, Tailored Weekend, Workwear Chore, Trench Quiet Luxury, Puffer Sport |
| `swimwear` | 4 | Beach Walk Linen, Resort Pool Kaftan, Sunset Cover-Up, Bare Hero |
| `activewear` | 4 | Studio Pilates, Run Club, Yoga Flow, Sport Editorial |
| `lingerie` | 3 | Editorial Bare, Robe Layered, Minimal Boudoir |
| `shoes / sneakers / boots / heels` | 4 | Shoe-led looks where shoe is locked + curated rest |
| Universal fallback | 6 | Coastal Minimal, Quiet Luxury, Street Editorial, Resort Eclectic, Sport Editorial, Y2K Pop |

Each entry shape:
```ts
{
  id: 'preset-quiet-luxury-knit',
  name: 'Quiet Luxury Knit',
  category: ['tops', 'knits'],          // matches multiple product categories
  recommended: true,                     // candidate for auto-pick
  config: {
    top: { garment: 'knit', subtype: 'crewneck', color: 'cream', material: 'cashmere' },
    bottom: { garment: 'trousers', subtype: 'tailored', color: 'beige', material: 'wool' },
    shoes: { garment: 'loafer', subtype: 'penny', color: 'brown', material: 'leather' },
    jewelry: { earrings: 'Small hoops', metal: 'Gold' },
  },
}
```

### Auto-pick logic (the "always have a sensible default" part)

In `ProductImagesStep3Refine.tsx`, on first mount of Step 3:

1. If `details.outfitConfig` already has any slot filled → do nothing (user picked or coming back)
2. Otherwise, run `pickDefaultPreset(selectedProducts)`:
   - Filter `BUILT_IN_PRESETS` by union of selected products' categories
   - Prefer entries flagged `recommended: true`
   - Prefer neutral palette (cream/beige/black/white) so `{{aestheticColor}}` blends well
   - Pick the first match → silently apply to `details.outfitConfig`
3. Show a tiny non-intrusive line under the panel header:
   > *Auto-styled with **Quiet Luxury Knit** — change anytime below.*
   
   With a small "Clear" link to reset to nothing.

User overrides win immediately — picking another preset, opening Customize, or clearing all replaces the auto-pick and the helper line disappears.

### UI changes (minimal, no new section)

In the existing presets bar inside the outfit editor:
- Section label: *"Suggested looks for your products"*
- Filter visible built-ins by current product categories (union)
- Append universal fallbacks at the end
- Sub-group user-saved looks under: *"Your saved looks"* (existing `useOutfitPresets.userPresets` flow stays untouched)

Add the auto-pick helper line near the top of the Style & Outfit panel.

### Files touched
- `src/lib/outfitVocabulary.ts` — expand `BUILT_IN_PRESETS` to ~60 category-tagged looks with `category[]` + `recommended` flag
- `src/hooks/useOutfitPresets.ts` — add optional `categoryFilter: string[]` param; filter `builtIn` array accordingly; expose `pickDefault(productCategories)` helper
- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — wire auto-pick on mount, helper line + Clear link, pass current product categories to the hook, update presets bar label/grouping

### Risk
Very low. Pure data + small filter/auto-pick logic. No prompt-builder, schema, or edge-function changes. Falls back to today's behavior if filter yields zero matches (universal fallbacks always present).

### Validation
1. Open Step 3 with a hoodie selected → outfit silently filled with a hoodie-appropriate look + helper line shown
2. Presets bar shows hoodie/sweatshirt looks first, universal fallbacks below
3. Click another preset → auto-pick line disappears, new look applied
4. Click "Clear" on the helper line → outfit emptied, behaves like before
5. Mixed cart (dress + jeans + sneakers) → presets bar shows union; auto-pick chooses a recommended look matching at least one category
6. Generate → produced shots use the auto-picked outfit cohesively with aesthetic color
