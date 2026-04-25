The breadcrumb currently competes with the hero eyebrow (`FOOTWEAR · SNEAKERS · BOOTS`) and the footer microcopy (`NO PHOTOSHOOT NEEDED · BUILT FOR FOOTWEAR BRANDS`). Three label-like elements stacked above each other make it feel "worn together." Two changes:

## 1. Modernize the breadcrumb (`CategoryBreadcrumbs.tsx`)

- Drop the dark filled pill on the current page — replace with plain text in `text-foreground` weight 500. Pills belong to CTAs, not navigation.
- Use a thin slash divider (`/`) instead of `ChevronRight` icons — lighter visual rhythm, common on premium editorial sites (Aesop, SSENSE, Apple support).
- Slightly larger type (`text-[13.5px]`), refined letter-spacing (`tracking-[-0.005em]`), `text-muted-foreground/70` for inactive, `text-foreground` for active.
- Tighter vertical band: reduce the `py-4 lg:py-5` to `py-3 lg:py-4` and shrink hero `pt-6 lg:pt-10` accordingly so the crumb sits as a quiet line, not a band.
- Add a hairline bottom divider (`border-b border-border/40`) so it reads as a navigation strip rather than floating chrome.

Result example:  `Home  /  AI Product Photography  /  Footwear`

## 2. De-clutter the hero (`CategoryHero.tsx`)

- Remove the bottom microcopy line `NO PHOTOSHOOT NEEDED · BUILT FOR FOOTWEAR BRANDS` — it duplicates the eyebrow and the H1 promise. Keeping just the trust line under the CTA row creates space.
- Replace it with a single, lighter trust line in normal case: `Free to start · No credit card required` (sentence case, `text-xs text-muted-foreground/70`, no uppercase tracking).
- Keeps the top eyebrow (`FOOTWEAR · SNEAKERS · BOOTS`) as the only uppercase label in the hero, which restores hierarchy.

Files touched:
- `src/components/seo/photography/category/CategoryBreadcrumbs.tsx`
- `src/components/seo/photography/category/CategoryHero.tsx`

Applies to all 10 category pages automatically (shared components).
