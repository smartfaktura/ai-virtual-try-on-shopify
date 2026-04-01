

# Fix SEO Ecommerce Page — Images, Layout, and Section Order

## Problems Identified
1. **Email tab shows no image** — the `pickByCategory` fallback shows a camera icon placeholder when no preset matches the "campaign" category. Need a smarter fallback that picks any available featured image.
2. **White space on scroll** — the `useInView` animation starts elements as `opacity-0 translate-y-8`. When scrolling back up, already-revealed sections stay visible but sections above the fold that were never observed can flash. The hidden state also causes layout shifts. Fix by ensuring all sections default to visible after first paint or use CSS-only animation.
3. **"Explore Real Ecommerce Visual Styles" too far down** — currently section 7 (after Comparison and Shopify). Move it up to section 4, right after Proof Bar + Outcome Tabs.
4. **Showcase images should be different/featured** — currently uses `pickProductLed` which may grab non-featured items. Switch to prioritize `is_featured` presets and use a different selection pool (not just product-led).

## Changes to `src/pages/seo/AIProductPhotographyEcommerce.tsx`

### 1. Fix tab image fallback
In `tabImages` memo, when `pickByCategory` returns nothing for a tab, fall back to any featured preset not yet used. This eliminates the camera icon placeholder on Email and any other empty tab.

### 2. Fix white space / scroll-back issue
Replace the `useInView` + JS class toggle pattern with CSS `animation` triggered by a class. Once `inView` is set to `true` it never reverts, so sections that were revealed stay visible. The real issue is the initial `opacity-0 translate-y-8` — if sections above the fold never intersect (e.g. user scrolls down fast then back up), they stay hidden. Fix: add `once: true` behavior is already there, but also add a fallback — after 2s, force all sections visible. Simpler fix: just use the `animate-scale-in` keyframe approach already used in hero grid for all sections, removing the JS toggle entirely.

### 3. Move showcase section up
Reorder JSX: move the "Explore Real Ecommerce Visual Styles" section (currently section 7) to right after Outcome Tabs (new section 4). This puts visual proof higher in the page.

### 4. Use featured images in showcase
Change `showcaseImages` to prioritize `is_featured` presets, then fill remaining slots with product-led picks. Use 8 images instead of 12 to keep it tight.

## Files
| File | Change |
|------|--------|
| `src/pages/seo/AIProductPhotographyEcommerce.tsx` | Fix tab fallback, fix white-space scroll issue, reorder sections, improve showcase image selection |

