## Fix: Hat/Cap/Beanie category detection

The AI analysis edge function and client-side detection still use `hats-small` and lack proper hat/cap/beanie keyword splitting. A fedora hat gets misclassified because:

1. **Edge function** (`analyze-product-category/index.ts`) — `VALID_CATEGORIES` still lists `hats-small`, the AI prompt tells the model to use `hats-small`, and the title fallback regex maps all headwear to `hats-small`
2. **Client-side detection** (`categoryUtils.ts`) — No detection rules exist for caps, hats, or beanies at all
3. **Client-side scene matching** (`ProductImagesStep2Scenes.tsx`) — No alias for `hats-small` → new categories, no specificity overrides for bags-accessories → caps/hats/beanies

### Changes

**`supabase/functions/analyze-product-category/index.ts`**:
- Update `VALID_CATEGORIES`: replace `hats-small` with `caps`, `hats`, `beanies`
- Update AI prompt: replace `hats-small` with `caps, hats, beanies` in valid categories list, add guidance: "Use 'caps' for baseball caps, snapbacks, visors. Use 'hats' for fedoras, panamas, bucket hats, wide brim. Use 'beanies' for knit caps, beanies, toques."
- Split title fallback regex line 46: three separate patterns instead of one `hats-small` catch-all
- Add `hats-small` → `hats` alias in `applyCategoryFallback` for backward compat
- Add specificity overrides from `bags-accessories` → caps/hats/beanies

**`src/lib/categoryUtils.ts`**:
- Add three detection rules before the generic `bags-accessories` rule:
  - caps: cap, baseball cap, snapback, trucker cap, visor, dad hat
  - hats: hat, fedora, panama, bucket hat, wide brim, sun hat, cowboy hat, boater
  - beanies: beanie, knit cap, toque, skull cap, watch cap

**`src/components/app/product-images/ProductImagesStep2Scenes.tsx`**:
- Add `"hats-small": "hats"` to CATEGORY_ALIASES for backward compat
- Add specificity overrides: `bags-accessories` → caps/hats/beanies based on title keywords
