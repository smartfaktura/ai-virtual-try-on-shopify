# Convert Transform Strip to Static Grid (Swimwear)

Replace the moving marquee in the "From one product photo to every asset you need" section (`HomeTransformStrip.tsx`) with a static grid, starting with **Swimwear** as the only/first category.

## Layout

- **Desktop (≥sm)**: 2 rows × 6 columns = 10 cards
- **Mobile (<sm)**: 3 rows × ~3 columns
- **Card 1**: Original (Swimwear "Ghost Mannequin Shot") with top-right "Original" badge — same style as hero banner
- **Cards 2–10**: 9 swimwear scenes, each with bottom gradient label
- All cards share aspect ratio `3/4`, no zoom/crop (quality-only optimization, matching memory `style/image-optimization-no-crop`)

```text
[ Original ] [ Architectural ] [ Sunbathing ] [ Golden Horizon ] [ Bikini Back ] [ Coastal Camera ]
[ Yacht Bow ] [ Rocky Coast ]   [ Minimal Horizon ] [ Cliffside Walk ] [ ... fills 12 slots if needed ]
```

10 cards total → desktop grid uses `grid-cols-6` with 2 rows (last row has 4 cards). If you'd prefer a perfectly filled 6×2 = 12, we'd need 11 scenes. Going with 10 + natural left-aligned wrap.

## Image mapping (Swimwear)

| Slot | Label | Source |
|---|---|---|
| 1 | Original | `1776523219756-c5vnc7.jpg` (ghost-mannequin-swimwear) |
| 2 | Architectural Stair | `1776522769405-3v1gs0.jpg` |
| 3 | Sunbathing Editorial | `1776524131703-gvh4bb.jpg` |
| 4 | Golden Horizon | `1776574228066-oyklfz.jpg` |
| 5 | Textured Bikini Back | `1776574265735-cvu5sc.jpg` |
| 6 | Coastal Camera | `1776524128011-dcnlpo.jpg` |
| 7 | Yacht Bow | `1776524132929-q8upyp.jpg` |
| 8 | Rocky Coast | `1776524128888-371hoo.jpg` |
| 9 | Minimal Horizon | `1776574730668-ltg55f.jpg` |
| 10 | Cliffside Beach Walk | `1776574208384-fmg2u3.jpg` |

All from `…/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/`.

## Technical changes

**Edit only**: `src/components/home/HomeTransformStrip.tsx`

1. Remove `CATEGORIES` array, segmented control, marquee rows, fade logic, original-on-side layout, refs, and `useState/useEffect/useCallback/useRef` machinery.
2. Add a single `SWIMWEAR_CARDS` array (10 entries) using a `PREVIEW(id)` helper pointing to the public scene-previews URL.
3. New `<GridCard>` component:
   - `aspect-[3/4] rounded-2xl overflow-hidden shadow-md`
   - `<img>` with `getOptimizedUrl(src, { quality: 60 })` — **no `width` param**, so no server-side crop
   - `object-cover w-full h-full`
   - Bottom gradient label (same style as hero)
   - If `isOriginal`: top-right "Original" pill badge (reuse hero banner styling: `bg-primary/90 text-primary-foreground`)
4. Grid container: `grid grid-cols-3 sm:grid-cols-6 gap-3 lg:gap-4`
5. Keep heading, subheading, and bottom CTA. Subheading copy updated to reflect Swimwear focus (e.g. "See what your swimwear can become.").
6. Keep `useScrollReveal` for entrance animation.
7. Drop unused imports: `useState`, `useEffect`, `useCallback`, `useRef`, `getLandingAssetUrl`.

## Out of scope (future categories)

User said: "Do this category and we will see if okay will do others then." So we ship Swimwear-only. Once approved, we can extend to a category switcher again or add more grids.

## Files

- Edit: `src/components/home/HomeTransformStrip.tsx`
