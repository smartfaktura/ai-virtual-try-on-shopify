## Goal

Tighten the home hero (`src/components/home/HomeHero.tsx`) on mobile.

## Changes

**1. Remove the "Trusted by DTC brands…" line**
Delete the italic `<p>` at line 207–209 entirely.

**2. Fix mobile headline "jumping" (typewriter line starts misaligned)**
The cause: the typewriter span uses `min-h-[2.3em]` on mobile reserving 2 lines of vertical space, while the actual text often fits on 1 line — so it visually appears the second line starts in a strange spot, and as phrases of different length swap in, the layout jumps.

Fix without changing font size:
- Change typewriter span to `min-h-[1.15em]` on all sizes (single-line reserve).
- Keep it on its own line on mobile by reverting the inline-flow hack: show the `<br />` on all sizes, and remove the `<span className="sm:hidden"> </span>` spacer.
- Also remove `px-2` on the typewriter span (it offsets centering on its own line). Keep `whitespace-nowrap` on all sizes so the phrase never wraps to a third line — combined with shorter mobile phrases (next change), the longest phrase fits on one mobile line.

Result: headline is always exactly 2 lines on mobile, no vertical jump, no awkward stacking.

**3. Shorter typewriter phrases on mobile**
The two long phrases ("Every Scene. Every Angle." and "No Photoshoot Needed.") overflow / wrap on a 390px viewport. Provide a mobile-specific shorter set.

Implementation:
- Define two arrays:
  ```ts
  const TYPED_PHRASES_DESKTOP = [/* current 6 */];
  const TYPED_PHRASES_MOBILE = [
    'For E-commerce.',
    'From One Photo.',
    'Page Ready.',
    'Ads That Convert.',
    'Every Angle.',
    'No Photoshoot.',
  ];
  ```
- In `HeroTypewriter`, pick the array via a `matchMedia('(max-width: 639px)')` check on mount (with a resize listener), so the right set is used at the active breakpoint.

## Files

- `src/components/home/HomeHero.tsx` — only file touched.

## Out of scope

- Font sizes, spacing, colors, marquee rows, copy paragraphs, CTA buttons — all unchanged.
