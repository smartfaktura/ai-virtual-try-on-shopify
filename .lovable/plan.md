# Simplify Public Website Footer

Single-file edit: `src/components/landing/LandingFooter.tsx`. Bump `public/version.json`.

## Structure

**Left brand block (1 column on desktop):**
- VOVV.AI wordmark
- Tagline: "AI product visuals for e-commerce brands, from one product photo."
- 4 social icons (Instagram, Facebook, TikTok, Discord) — kept as small chip-style buttons

**Right side (3 columns on desktop):**

PRODUCT
- AI Product Photography → `/ai-product-photography`
- AI Product Photo Generator → `/ai-product-photo-generator`
- Visual Studio → `/features/workflows`
- Virtual Try-On → `/features/virtual-try-on`
- Pricing → `/pricing`

SOLUTIONS
- Shopify Product Photos → `/shopify-product-photography-ai`
- Etsy Product Photos → `/etsy-product-photography-ai`
- Fashion Product Photography → `/ai-product-photography/fashion`
- Beauty & Skincare → `/ai-product-photography/beauty-skincare`
- Jewelry Product Photography → `/ai-product-photography/jewelry`
- AI vs Photoshoot → `/ai-product-photography-vs-photoshoot`

RESOURCES
- Help Center → `/help`
- FAQ → `/faq` (used in place of "Tutorials" since no public tutorials route exists)
- Blog → `/blog`
- Contact → `/contact`

**Removed entirely:** Careers, Press, Team, Status, Changelog, Bug Bounty, Image Upscaling, Brand Profiles, Perspectives, Food & Beverage, "All AI Photography Categories" directory link.

**Bottom bar (single inline row, no full Legal column):**
- Left: `© 2026 VOVV.AI. All rights reserved.` · Privacy Policy · Terms of Service · Cookie Policy
- Right: `A product by 123Presets`

## Layout & Behavior

- Desktop grid: brand `md:col-span-5 lg:col-span-4` + 3-column link grid `md:col-span-7 lg:col-span-8` with `gap-10`.
- Tablet (≥sm): 3 even columns side-by-side.
- Mobile (<sm): each column collapsed into a native `<details>` accordion with chevron, so the footer is short and scannable. Links remain in the DOM (crawlable).
- Bottom bar stacks on mobile, inline on desktop.
- All links use react-router `<Link>` which renders real `<a href>` (crawlable). External links use `<a href target="_blank" rel="noopener noreferrer">`.
- Spacing: `pt-16 pb-8`, list `space-y-2`, headings `mb-3.5` — matches recent refinement.
- Aesthetic unchanged: `border-t border-border bg-card`, semantic tokens only.

## Notes
- "Tutorials" requested but no public route exists — substituted with FAQ. Confirm if you'd prefer to omit the slot entirely instead.
- "Visual Studio" points to `/features/workflows` (the public marketing page); the in-app route `/app/workflows` requires auth and isn't appropriate for a public footer.
- Type-check (`tsc --noEmit`) passes locally for the prepared diff.
