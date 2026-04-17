

## Goal
Smooth, natural slide animation for the sticky bar on `/app/pricing` (slides up from bottom on scroll-down, slides down off-screen on scroll-up — no side animation, no abrupt mount/unmount). Also enlarge the credits number text in the sticky bar so it's easy to read.

## File
- `src/pages/AppPricing.tsx` (sticky bar block, lines 637–708)

## Changes

### 1. Replace mount/unmount with always-mounted transform
Currently the bar mounts via `{showStickyBar && ...}` with Tailwind `animate-in slide-in-from-bottom-2` — feels like a pop, not a glide, and unmount is instant.

Replace with always-rendered container that translates:
- Wrapper always in DOM, `pointer-events-none` when hidden so it doesn't block clicks.
- Use transform + opacity transition:
  - Hidden: `translate-y-[calc(100%+2rem)] opacity-0`
  - Visible: `translate-y-0 opacity-100`
- Transition: `transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]` (smooth eased glide, slightly longer for natural feel).
- Inner card keeps `pointer-events-auto`.

Result: scrolling down → bar glides up from below the viewport. Scrolling back up past the comparison table → bar glides back down out of view. Fully reversible, seamless.

### 2. Bigger credits/price text in the sticky bar
Improve readability of the price + credits meta:

- **Mobile** (line 659): change `text-[11px] text-muted-foreground` → `text-[13px] text-foreground/80 font-medium`. Bump price to slightly stronger weight by wrapping `${stickyPrice}/mo` in a `font-semibold text-foreground` span; credits in `text-foreground/70`.
- **Desktop** (lines 693–696): increase from `text-xs` → `text-sm`. Price line: `text-base font-semibold text-foreground` (was `text-xs` semibold). Credits line: `text-[13px] text-muted-foreground`.

### 3. Keep
- Visibility logic (`showStickyBar`, `pastCompare`, `atFinalCta`) — unchanged, just drives the transform class instead of conditional render.
- StudioChat hide behavior — unchanged (still keyed off `showStickyBar`).
- Width, layout, dropdown, CTA logic — unchanged.

## Result
- Sticky bar slides up naturally from below when user scrolls past the comparison table, and slides back down smoothly when scrolling up — no side swipe, no pop.
- Price + credit count are visibly larger and easier to read on both mobile and desktop.

