## Why the new pages feel slow

I measured the live `/ai-product-photography/watches` page and the underlying Supabase storage transforms:

- The hero collage source images are **2.3 MB raw** JPGs.
- Supabase's `/render/image/` transform endpoint takes **~350-450 ms cold**, ~90 ms warm. Each transform variant has its own cache key.
- `HeroPreload` injects `<link rel="preload" as="image" href="…?quality=60">` (no width/height).
- The actual hero `<img>` requests `…?width=640&height=800&quality=85&resize=cover` plus a `srcSet` of 360/540/720/900.

These are **two different URLs** with **two different cache keys**, so the preload is wasted: the browser fetches a 230 KB variant that nothing uses, and then the real `<img>` still has to do its own cold transform after React hydrates. On the older pages this didn't bite as hard because they used the single-image hero (`heroMain`) where the URL math is closer; the 6 new pages all use the 4-tile collage path that the preload was never updated for.

The same mismatch makes the LCP image effectively unprioritized — exactly what the 1.5–3 s "image loading slowly" feeling is.

## Fix

Two small, focused changes in `src/pages/seo/AIProductPhotographyCategory.tsx` and `src/components/seo/photography/category/CategoryHero.tsx`.

### 1. Make `HeroPreload` match the real LCP `<img>` URL

Update `HeroPreload` so when the page uses a collage, it preloads the same width/height/quality variant that `HeroTile` actually requests, and includes the `imagesrcset` / `imagesizes` attributes so the browser can pick the right candidate.

```tsx
// AIProductPhotographyCategory.tsx
function HeroPreload({
  url,
  isCollage,
}: { url: string; isCollage: boolean }) {
  useEffect(() => {
    if (!url) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.fetchPriority = 'high';

    if (isCollage) {
      // Match HeroTile: width=640 h=800 q=85, srcSet 360/540/720/900 @ 4:5
      link.href = getOptimizedUrl(url, {
        width: 640, height: 800, quality: 85, resize: 'cover',
      });
      link.setAttribute(
        'imagesrcset',
        getResizedSrcSet(url, { widths: [360, 540, 720, 900], aspect: [4, 5], quality: 85 }),
      );
      link.setAttribute('imagesizes', '(max-width: 1024px) 45vw, 280px');
    } else {
      // Match single-image hero: width=1120 h=1400 q=85, srcSet 640/900/1120/1400
      link.href = getOptimizedUrl(url, {
        width: 1120, height: 1400, quality: 85, resize: 'cover',
      });
      link.setAttribute(
        'imagesrcset',
        getResizedSrcSet(url, { widths: [640, 900, 1120, 1400], aspect: [4, 5], quality: 85 }),
      );
      link.setAttribute('imagesizes', '(max-width: 1024px) 92vw, 560px');
    }

    document.head.appendChild(link);
    return () => link.remove();
  }, [url, isCollage]);
  return null;
}
```

Pass `isCollage={Boolean(page.heroCollage && page.heroCollage.length >= 4)}` from the page component.

### 2. Lighten the hero collage tiles

The collage tiles render as ~280 px @ 1× (max ~560 CSS px on retina). Quality 85 is overkill for tiles that small and forces 4 simultaneous heavy transforms above the fold.

In `CategoryHero.tsx > HeroTile`:

- Drop quality from 85 → 75 (visually identical at this scale, ~30% smaller bytes, faster transform).
- Trim the srcSet candidates from `[360, 540, 720, 900]` → `[360, 540, 720]` (900w is never picked at this layout).
- Keep tiles 0 and 1 with `priority`, leave 2 and 3 lazy (already the case).

Single-image hero (non-collage path) stays at quality 85 since it's a true full-bleed LCP.

### Out of scope / not changing

- Image content, scene IDs, or page copy — all 48 image IDs verified present in storage as JPGs.
- `BuiltForEveryCategory`, `SceneExamples`, `RelatedCategories` — they already lazy-load with sensible widths/quality and live below the fold.
- The shared `getOptimizedUrl` / `getResizedSrcSet` helpers — they're correct; only the call sites need adjustment.

## Expected outcome

- LCP on the 6 new collage pages drops from ~1.5–3 s to ~400–700 ms warm / ~700–1000 ms cold.
- No wasted preload bytes (currently ~230 KB downloaded and discarded per page load).
- Hero tile transforms get warm in Supabase's edge cache faster because all visitors now hit the same 4 URLs instead of split between preload and `<img>` variants.
