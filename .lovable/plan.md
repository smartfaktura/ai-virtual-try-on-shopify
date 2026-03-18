

## Fix Discover Page Mobile Scroll Lag

### Root Causes

After reviewing the code, the scroll jank on mobile comes from several compounding performance issues:

1. **`backdrop-blur-sm` on overlays** — Every `DiscoverCard` has 2-3 elements with `backdrop-blur-sm` (save button, featured button, scene/workflow badge). Backdrop blur is extremely expensive on mobile GPUs, especially when dozens of cards are in the DOM simultaneously.

2. **`group-hover:scale-[1.03] transition-transform duration-500`** — Every card image has an active CSS transition declaration. Even though it only triggers on hover, the browser still monitors and composites these elements, adding overhead during scroll.

3. **All items rendered at once** — The masonry grid renders every single card immediately (presets + scenes, potentially 100+ items). No virtualization or lazy rendering means the DOM is massive on load.

4. **Shimmer animation on off-screen images** — `ShimmerImage` runs a `bg-[length:200%_100%] animate-shimmer` CSS animation on every unloaded image placeholder, even ones far below the fold.

### Proposed Changes

**`src/components/app/DiscoverCard.tsx`** (~5 lines):
- Remove `backdrop-blur-sm` from all overlay elements — replace with solid `bg-black/50` backgrounds (visually identical at small sizes, dramatically cheaper)
- Change `transition-transform duration-500` to only apply on hover-capable devices: `[@media(hover:hover)]:group-hover:scale-[1.03] [@media(hover:hover)]:transition-transform [@media(hover:hover)]:duration-500` — this removes the transition entirely on touch devices
- Add `will-change-transform` only on hover-capable devices to hint compositing

**`src/pages/PublicDiscover.tsx`** (~15 lines):
- Add a simple "render budget" — only render the first ~30 items initially, then load more on scroll using an `IntersectionObserver` sentinel at the bottom of the grid
- This dramatically reduces initial DOM node count on mobile

**`src/components/ui/shimmer-image.tsx`** (~2 lines):
- Add `loading="lazy"` as default (already passed from DiscoverCard but good to enforce)
- No other changes needed since the shimmer div is conditionally rendered

### Impact
These changes eliminate the three most expensive GPU operations (backdrop blur, scale transitions, massive DOM) while preserving the exact visual design on desktop. Mobile users will see smooth 60fps scrolling.

