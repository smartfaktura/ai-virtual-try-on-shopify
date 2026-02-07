

## Fix Image Loading -- Lean, Performance-Safe Approach

### Problem

Images across the landing page load progressively (top-to-bottom "crop in"), because the browser fetches and paints them line-by-line. This is caused by two things:

1. **`loading="lazy"`** on images that are part of actively animating carousels/marquees -- the browser delays the fetch until they enter the viewport, but by then they're already visible while still downloading.
2. **No GPU compositing hints** on the Environment marquee, causing occasional micro-stutters and decode flicker.

### Why the lean approach is the right one

- **No custom `new Image()` preloader needed.** Vite already resolves all imported images at build time into hashed URLs. The `ProductCategoryShowcase` renders all 5 images per card in the DOM immediately (stacked absolutely), so the browser already starts fetching them on mount. Adding a JS preloader would be redundant work.
- **No extra state management.** Tracking "loaded" booleans per image adds complexity for zero visual gain since the crossfade transition already covers the decode time.
- **Minimal code changes.** Three small edits across three files -- nothing architectural.

---

### Changes (3 files)

**1. EnvironmentShowcaseSection.tsx**
- Remove `loading="lazy"` from the `<img>` tag (line 88) so all 36 images (18 doubled) start loading immediately when the component mounts
- Add `decoding="async"` to allow off-main-thread image decoding
- Add GPU compositing hints (`transform: translateZ(0)`, `backfaceVisibility: hidden`) to the scrolling container, matching the ModelShowcaseSection pattern
- Add gradient fade edges on left and right sides for visual consistency with the Model marquee

**2. HeroSection.tsx**
- Remove `loading="lazy"` from the output carousel images (line 322) since they are above-the-fold hero content
- Add `decoding="async"` for non-blocking decode

**3. ProductCategoryShowcase.tsx**
- Add `decoding="async"` to the stacked images (line 74-83) for smoother off-thread decode during crossfade transitions
- No other changes needed -- the existing absolute-stack approach already ensures all images load eagerly on mount

---

### What each attribute does

| Attribute | Effect |
|---|---|
| Remove `loading="lazy"` | Browser fetches image immediately instead of waiting for viewport intersection |
| `decoding="async"` | Browser decodes the image off the main thread, preventing frame drops during animation |
| `transform: translateZ(0)` | Forces GPU-accelerated compositing layer, eliminating paint jank |
| `backfaceVisibility: hidden` | Prevents unnecessary back-face rendering on the GPU layer |

### What is NOT included (and why)

- **No `new Image()` preloader** -- redundant since Vite imports + DOM rendering already trigger browser fetches
- **No "loaded" state tracking** -- adds complexity; the 1.2s crossfade transition naturally covers any remaining decode time
- **No changes to ModelShowcaseSection** -- already has eager loading and GPU hints in place

