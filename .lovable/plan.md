## What changes

### 1. Mobile chip rails — clearer "scrollable" affordance

Today the chip rail in `CategoryBuiltForEveryCategory` already scrolls horizontally on mobile, but the only hint is a soft edge fade. On screenshots like yours the next chip is half-cut, which most users do read as scrollable — but we can make the affordance unmistakable by adding three reinforcing cues:

- **Stronger right-edge gradient fade** (wider + slightly darker) so the cut-off chip clearly fades out instead of looking clipped.
- **Snap scrolling** (`snap-x snap-mandatory` + `snap-start` on chips) so swipes feel deliberate and chips align nicely.
- **Auto-scroll the active chip into view** when state changes (so tapping the last visible chip pulls the next ones into frame).
- **Scroll hint micro-animation on first mount**: a subtle 180ms nudge (translate the rail 12px right then back) the first time the section enters the viewport on mobile. This is the standard "peek" pattern users instantly recognize.

Apply the same treatment to `CategorySubcategoryChips` on mobile (today it uses `flex-wrap` which works on desktop but on narrow screens with many subcategories it stacks awkwardly — switch to a horizontal snap-scroll rail on mobile, keep wrap on `sm:` and up).

No layout changes on desktop. No new dependencies.

### 2. "Fashion scenes built for e-commerce" — drop the scene names

In `CategorySceneExamples.tsx`, each tile currently shows a category eyebrow ("EDITORIAL STUDIO LOOKS") **and** a title ("Sunlit Tailoring Studio"). Per your request, only keep the eyebrow label (the collection/category name) — remove the per-scene title and remove the gradient title bar (or keep a minimal one just for the eyebrow). Result: cleaner, calmer grid that matches the homepage aesthetic.

### 3. Admin image swaps & SEO — confirmed safe

Short answer: **No, swapping images via the admin does not hurt SEO**, provided we keep doing what the system already does. Quick audit of how images render today:

- `<SmartImage>` always renders a real `<img>` with a meaningful `alt` — and the override system pipes `resolveSlotAlt()` through, so admin overrides keep alt text.
- URLs come from a stable CDN (your image host), so when an admin replaces a slot the new URL is just another CDN asset — no broken links, no 404s, no redirect chains.
- The page HTML structure, headings, internal links, and copy are unchanged — Google's understanding of the page is driven by those, not by which exact JPG sits in slot 3.
- Lazy loading and width hints are already applied by `getOptimizedUrl`.

Two small SEO hygiene improvements I'll add while we're in here:
- Make sure the **admin override flow always carries forward an `alt_text`** (fallback to the slot's default alt if the admin leaves it blank — already the case in `resolveSlotAlt`, just double-checking and documenting).
- Keep the `width` / `height` (or aspect-ratio container) so swapped images don't cause layout shift (CLS). Already in place via the `aspect-[3/4]` wrapper.

So: **safe to keep editing images in admin. SEO is unaffected.** No code change needed for #3 beyond the audit.

## Files touched

- `src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx` — stronger fade, snap, auto-scroll active chip, first-mount peek nudge.
- `src/components/seo/photography/category/CategorySubcategoryChips.tsx` — mobile horizontal snap rail with the same affordances; wrap on `sm:` and up.
- `src/components/seo/photography/category/CategorySceneExamples.tsx` — remove per-tile scene title, keep only the eyebrow.

## Out of scope

- No data/registry changes — slot keys, fallbacks, and override behavior stay identical.
- No DB/edge-function changes.
- After publish, scene name removal and chip affordance show up on `vovv.ai` only after **Publish → Update**.
