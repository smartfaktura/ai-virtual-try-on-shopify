
## Three new BrandLoader concepts for `/app/admin/loading-lab`

Replace the current "V monogram + orbiting arc" with **three premium alternatives** rendered side-by-side in the lab so you can pick the winner. The existing `BrandLoader` stays untouched (kept as "Current" for comparison) — we add three new variants and a small picker. Nothing ships outside the lab until you sign off.

### The three new concepts

**1. `BrandLoaderAperture` — Camera shutter**
Why it fits VOVV.AI: the product is photography. A slowly opening/closing aperture (6 blades, SVG) reads instantly as "creating an image."
- 6 triangular blades rotating + scaling between open/closed states (~2.4s loop).
- Hairline border ring, blades in `hsl(var(--primary))` at 0.7 opacity.
- Reduced-motion: blades freeze at 60% open, ring gets a soft opacity pulse.
- Size: 56px. Optional caption row reused from current loader.

**2. `BrandLoaderFrames` — Stacked editorial frames**
Why it fits: evokes a contact sheet / editorial layout. Three thin rectangles (4:5, 1:1, 5:4) fan out behind each other and gently re-stack.
- 3 SVG rects, each tilted -6° / 0° / +6°, translating Y by 2px on a staggered 1.6s ease-in-out loop.
- Top frame fills with a soft primary tint that fades 0→100→0.
- Reduced-motion: static fanned stack with opacity breathe on the top frame.
- Size: 64×52px. Reads as "assembling your shot."

**3. `BrandLoaderProgressGlyph` — Wordmark with sweep**
Why it fits: leans into the brand, not a generic abstract spinner. The "VOVV" wordmark in Inter 600, with a thin primary line sweeping left→right underneath — like a progress bar tied to the logotype.
- `VOVV` text, `text-base tracking-tight`, current foreground.
- 1px line, 30% width, animates `translateX(-50% → 250%)` over 1.4s, infinite, ease-in-out, primary color.
- Subtle 0.95→1 letter-spacing breathe (8s) for life.
- Reduced-motion: line stops at 50%, opacity pulse only.
- Most "premium / Linear-like" of the three.

All three accept the same props as today's `BrandLoader` (`fullScreen`, `label`, `hints`, `className`) so they're drop-in swappable.

### Lab page changes — `src/pages/admin/LoadingLab.tsx`

- Rename the existing "BrandLoader" section to **"BrandLoader concepts"**.
- Render a 2×2 grid of cards:
  1. **Current** (existing `BrandLoader`)
  2. **Aperture**
  3. **Frames**
  4. **Wordmark Sweep**
- Each card: 280px tall, centered loader, label + 1-line description below, and a small `Show full-screen (4s)` button that triggers the **same** rotating-hints overlay using that variant.
- Keep the existing `DotPulse` and `ShimmerBar` sections below — unchanged.
- Add a single "Reduced motion" callout (already present) — verify each new variant respects `prefers-reduced-motion` (handled in CSS).

### New files

- `src/components/ui/brand-loader-aperture.tsx`
- `src/components/ui/brand-loader-frames.tsx`
- `src/components/ui/brand-loader-progress-glyph.tsx`

### Edited

- `src/pages/admin/LoadingLab.tsx` — add the 4-card concept grid + per-variant full-screen trigger.
- `tailwind.config.ts` — add 3 small keyframes: `aperture-breathe`, `frame-fan`, `glyph-sweep` (each ~6 lines, all wrapped in the standard reduced-motion guard already used by `animate-orbit`).

### Untouched

- Existing `BrandLoader`, `DotPulse`, `ShimmerBar` — stay as-is so the lab keeps showing the current option for comparison.
- All call sites across the app — no rollout in this step.

### Validation

- `/app/admin/loading-lab` shows 4 cards in a 2-col grid (1-col on mobile), each with a working full-screen demo.
- Toggling "Reduce motion" in OS freezes animations on all three new variants but keeps a soft opacity pulse so they still read as "loading."
- No layout shift, no console warnings.

### Next step (after you pick a winner)

I'll wire the chosen variant as the canonical `<BrandLoader />` (replacing today's monogram+arc), then route-level loading screens (`Auth`, `ProtectedRoute`, full-screen suspense) automatically pick it up. Save a `mem://style/loading-system` rule recording the choice.
