## Fix Hero Marquee Empty Space on SEO Pages

### Root Cause
On `/etsy-product-photography-ai` (and other SEO pages using `LandingHeroSEO`), the second hero row starts with empty space on the right.

The marquee in `src/components/seo/landing/LandingHeroSEO.tsx` only **doubles** the tiles array (`[...tiles, ...tiles]`) and animates by `translateX(-50%)`.

- Row 1 (left direction): starts at `translateX(0)` → first half always visible, no gap.
- Row 2 (right direction): starts at `translateX(-50%)` → only the **second half** of the doubled track is visible at frame 0.

Each tile is ~210px wide + 12px gap ≈ 222px. With ~10 tiles, doubled width ≈ 4,440px → half-width ≈ 2,220px. On a 1920px viewport that *just* covers it, but on any laptop where the hero is constrained (or 1366px screens with the row not centered exactly), the right side of row 2 shows a visible blank gap before the next loop iteration appears.

### Fix
In `src/components/seo/landing/LandingHeroSEO.tsx`, replace the doubling with a **4× repeat** so each "half" of the animated track is always wider than any realistic viewport (≥4,000px per half). The existing `-50%` keyframe animation continues to work seamlessly because the loop point is still aligned to a full set boundary.

```tsx
// before
const doubled = [...tiles, ...tiles];

// after
const REPEATS = 4;
const repeated = Array.from({ length: REPEATS }, () => tiles).flat();
```

Update the `.map()` to iterate over `repeated`. No keyframe changes needed.

### Why this works
- 4× repeat with `-50%` translation means the marquee scrolls through 2 full sets before resetting — the visual content on screen is always at least 2 full sets wide, eliminating any empty right-edge.
- Eager-load logic (`i < tiles.length`) is preserved — only the first set is eager.
- Negligible perf cost: extra `<img>` tags reuse the same cached URLs (browser dedupes), and lazy-loading keeps off-screen tiles cheap.

### Affected pages (auto-fixed by component change)
- `/etsy-product-photography-ai`
- `/shopify-product-photography-ai`
- `/ai-product-photo-generator`
- `/ai-photography-vs-studio`
- `/ai-photography-vs-photoshoot`

No page-level edits required.

### Files to change
- `src/components/seo/landing/LandingHeroSEO.tsx` (only the `MarqueeRow` component internals)
