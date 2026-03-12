

## Fix Freestyle Showcase Section

### Issues
1. **Decorative circle visible on mobile** (line 108) — large 500px blurred circle background element clutters the mobile view
2. **Page jumps up/down** — the results grid cycles between `opacity-0` and `opacity-100` every 8 seconds; while items stay in DOM, the shimmer/image load cycle causes layout shifts on each reset

### Changes — `src/components/landing/FreestyleShowcaseSection.tsx`

#### 1. Hide circle on mobile
- Line 108: Add `hidden md:block` to the decorative circle div

#### 2. Fix layout stability
- Give the results grid container a **fixed minimum height** based on the known aspect ratio (4/5 cards in 3-col grid) so it never collapses
- Change from `opacity-0 pointer-events-none` to `invisible` when hidden, keeping the exact same reserved space
- Alternatively, wrap the results area in a container with `min-h-[XXpx]` calculated from the card aspect ratio to prevent any reflow

