## Performance + UX audit: `/ai-product-photography/{slug}` pages

### What I checked

Walked through every section rendered by `AIProductPhotographyCategory.tsx`: Breadcrumbs, Hero (4-tile collage), BuiltForEveryCategory (8-tile chip grid), VisualOutputs, PainPoints, SceneExamples (8 tiles), HowItWorks, UseCases, RelatedCategories (3 cards × 3 thumbs = 9 imgs), FAQ, FinalCTA. Checked `imageOptimization.ts` and existing `Skeleton` UI primitive.

### Issues detected

**Image performance**
1. **No width hint** — every `getOptimizedUrl(...)` call is `{ quality: 60/70 }` only. Supabase render serves the source's full pixel dimensions, so a 200px-wide thumbnail downloads a 2000px asset. Biggest single cause of slow load.
2. **Quality 60/70 is high for thumbs** — 50 is visually identical for small tiles.
3. **No `srcSet` / responsive sizes** — mobile gets the same size as desktop.
4. **No `<link rel="preload">`** for the LCP hero image.
5. **No format negotiation** — Supabase render auto-serves AVIF/WebP via `Accept` header, so this is fine, but we should pass `format=origin` only when needed (we don't need to change this).
6. **Hero collage uses 4 `priority` tiles** — only the 2 above-the-fold should be eager; bottom 2 should lazy-load.

**Loading UX**
7. **No skeletons** — tiles show as bare gray `bg-muted/30` rectangles with a sudden image pop-in. Modern best practice: shimmer skeleton + opacity fade-in on load.
8. **No CLS protection on the hero** — collage tiles use `aspect-[4/5]` which is good; but the missing skeleton + 700ms transform transition creates perceived jank.
9. **RelatedCategories collage** loads 9 images eagerly inside the viewport — should be lazy + skeleton.

**Other section issues found**
10. **`CategorySubcategoryChips`** is defined but **never imported** in the page — dead code.
11. **`PhotographyHowItWorks` uses `contents` wrapper** — works, but renders an arrow between cards on mobile too where the `flex-col` doesn't align it well; arrows visible only in vertical flow look fine, just confirm.
12. **SceneExamples + BuiltForEveryCategory both use `id="scenes"`** — duplicate DOM id. The "See examples" anchor in the hero scrolls to the first one (Built For…) which is *correct* by document order, but the duplicate is invalid HTML and should be renamed.
13. **`heroEyebrow` line repeats info** that's already in the breadcrumb + H1 ("FOOTWEAR · SNEAKERS · BOOTS") — cosmetic, not a bug. Skipping unless you ask.

---

## Plan

### A. Upgrade the image helper (`src/lib/imageOptimization.ts`)
Add a `srcSet` generator and a small "blurhash-free" placeholder helper:

```ts
export function getOptimizedSrcSet(
  url: string | null | undefined,
  widths: number[],
  quality = 55,
): string {
  if (!url) return '';
  return widths
    .map((w) => `${getOptimizedUrl(url, { width: w, quality })} ${w}w`)
    .join(', ');
}
```

### B. Add a reusable `<SmartImage>` component (`src/components/seo/photography/category/SmartImage.tsx`)
- Wraps `<img>` in a positioned container with the `Skeleton` shimmer behind it.
- On `onLoad`, fades the image in (`opacity-0 → opacity-100` over 400ms) and removes the skeleton.
- Props: `src`, `srcSet?`, `sizes?`, `alt`, `priority?`, `className?`, `imgClassName?`.
- Uses `loading={priority ? 'eager' : 'lazy'}`, `decoding="async"`, `fetchpriority` for priority tiles.

### C. Refactor every image-heavy section to use `SmartImage` + width-aware URLs

| Component | Tile width | sizes | Quality | Priority |
|---|---|---|---|---|
| `CategoryHero` (4 tiles) | ~440px | `(min-width:1024px) 22vw, 50vw` | 55 | first 2 eager |
| `CategoryBuiltForEveryCategory` (8 tiles) | ~340px | `(min-width:1024px) 18vw, 33vw` | 50 | none |
| `CategorySceneExamples` (8 tiles) | ~340px | `(min-width:1024px) 25vw, 50vw` | 50 | none |
| `CategoryRelatedCategories` (9 thumbs) | ~140px | `(min-width:768px) 12vw, 33vw` | 45 | none |

srcSet widths array: `[240, 360, 480, 720]` for normal tiles, `[480, 720, 960, 1280]` for hero.

### D. Add LCP hero preload (`AIProductPhotographyCategory.tsx`)
Inject a `<link rel="preload" as="image" imageSrcSet="..." imageSizes="...">` in the SEO head for the first hero collage tile (or fallback hero image when no collage). Speeds up first paint of the most prominent image dramatically.

### E. Hero priority fix
Mark only the **first** collage tile as `priority` (not first two). The rest lazy.

### F. Clean up duplicate `id="scenes"`
Rename `CategorySceneExamples`'s id to `id="scene-library"` and update the hero "See examples" anchor to point there (since it's the gallery section, more accurate).

### G. Remove dead import surface
Leave `CategorySubcategoryChips.tsx` file in place but note it's unused — no action unless you want it deleted.

---

## Expected impact

- **~70-85% fewer bytes** on category page images (e.g. a 1.2 MB hero tile → ~120 KB at 480w q55).
- **LCP**: hero preload + width-correct asset typically shaves 800–1500ms on slow networks.
- **Perceived load**: skeleton + fade-in eliminates the "blank gray then pop" feel.
- **Valid HTML**: no duplicate ids.
- Zero design changes — visuals look identical, just load smoother.

Files touched: `src/lib/imageOptimization.ts`, new `src/components/seo/photography/category/SmartImage.tsx`, `CategoryHero.tsx`, `CategoryBuiltForEveryCategory.tsx`, `CategorySceneExamples.tsx`, `CategoryRelatedCategories.tsx`, `AIProductPhotographyCategory.tsx`.
