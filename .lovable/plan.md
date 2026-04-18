

The Product Images sticky bar (`ProductImagesStickyBar.tsx`) has CTAs using `size="sm"` with hardcoded `h-8 text-xs` on mobile and default size on desktop — inconsistent with the unified `h-10 rounded-lg` / `size="pill"` standard.

Same pattern likely exists in other workflow sticky bars: Catalog (`CatalogStepShots.tsx` — already saw it uses default `<Button>` but Back/Next inline), Perspectives, Short Film, Text-to-Product, Brand Models wizards.

### Fix

**Standard for wizard sticky bars:**
- Primary CTA (Next / Generate / Continue): `size="pill"` → `h-10 rounded-full`
- Secondary (Back): default size → `h-10 rounded-lg`
- Strip `size="sm"`, `h-8`, `text-xs`, `text-[10px]` overrides on the buttons themselves (chip badges keep their tiny text — that's fine)

### Files to fix

1. **`src/components/app/product-images/ProductImagesStickyBar.tsx`** — both mobile + desktop Back/Next buttons → unify to `size="pill"` (primary) and default (Back). Remove `h-8 text-xs` mobile overrides on buttons.

2. **`src/components/app/catalog/CatalogStepShots.tsx`** — Back/Next inline footer (lines ~159-163): convert primary to `size="pill"`, Back stays default. Already clean but verify.

3. **`src/components/app/catalog/CatalogStepProducts.tsx`** + any other `CatalogStep*.tsx` footer buttons — same treatment.

4. **Sweep other workflow wizards** for sticky/footer Back/Next/Continue/Generate buttons:
   - `src/components/app/perspectives/**` 
   - `src/components/app/short-film/**` / `src/pages/video/ShortFilm*.tsx`
   - `src/components/app/text-to-product/**`
   - `src/components/app/brand-models/**` wizard
   - Any `*StickyBar*`, `*Footer*`, `*Wizard*` in `src/components/app/**`

   For each: strip `size="sm"`, `h-8`, `h-9`, `h-11`, `text-xs` from `<Button>`, use `size="pill"` for primary CTA.

### Process
- Grep `(<Button)[^>]*(size="sm"|h-8|h-9|h-11|text-xs)` in `src/components/app/{product-images,catalog,perspectives,short-film,text-to-product,brand-models,video,freestyle}/**` and `src/pages/video/**`
- For each match in a wizard footer / sticky bar context: convert primary to `size="pill"`, secondary (Back) to default, strip overrides
- Keep mobile compact dot indicators / step labels / credit chips untouched (those are not buttons)

### Acceptance
- All wizard Next/Back/Generate buttons render at `h-10` with `rounded-full` (primary pill) or `rounded-lg` (secondary), `text-sm` font
- Mobile and desktop visually identical button sizing
- Spot-check `/app/generate/product-images` (all 4 steps), `/app/generate/catalog`, `/app/perspectives`, `/app/video/short-film`, `/app/video/text-to-product`, `/app/models` wizard

