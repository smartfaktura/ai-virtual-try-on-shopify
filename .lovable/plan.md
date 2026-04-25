Keep it as a real, SEO-correct breadcrumb (`Home / AI Product Photography / Footwear` + JSON-LD already in the page). Only the visual treatment changes so it stops looking like a stranded band.

## What's wrong

The crumb sits in a tall empty strip:
- `pt-24` nav offset + `py-3 lg:py-4` band padding + `border-b` divider + the hero's own `py-14 lg:py-24` on top → the crumb floats in dead space, disconnected from the H1.

## Fix — quiet, anchored, still a real breadcrumb

1. **Remove the `border-b border-border/40`** — the hairline is what makes it read as a stranded band.
2. **Collapse the band's internal padding** to just `pb-2 lg:pb-3` (top padding stays as the nav offset). Crumb now sits ~12 px above the hero, not ~32 px.
3. **Drop the duplicate `bg-[#FAFAF8]`** on the nav — it inherits from the page wrapper.
4. **Trim the hero's top padding** to compensate: hero `pt-4 lg:pt-6` instead of `py-14 lg:py-24` at the top. Bottom padding unchanged.
5. **Smaller, lighter crumb type**:
   - `text-[12.5px]` (was 13.5)
   - inactive links: `text-muted-foreground/60`
   - current page: `text-foreground/80` (no bold)
   - dividers: `text-muted-foreground/30`
6. **Keep the slash separator** — semantic, recognized, no schema impact.

## SEO preserved

- `<nav aria-label="Breadcrumb"><ol>` + `<a>` links + `aria-current="page"` on last item — unchanged.
- `BreadcrumbList` JSON-LD in `AIProductPhotographyCategory.tsx` — unchanged.
- All three crumb labels remain as visible text — fully crawlable.

## Files touched

- `src/components/seo/photography/category/CategoryBreadcrumbs.tsx` — remove border, collapse padding, lighten type.
- `src/components/seo/photography/category/CategoryHero.tsx` — reduce top padding so the crumb visually attaches to the hero block.
