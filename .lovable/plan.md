# Fix per-card image loading skeletons on `/product-visual-library`

## The actual problem (from the screenshot)

The library data fetch **already** shows skeletons (top-level `isLoading` block in `ProductVisualLibrary.tsx`). What is missing — and what the screenshot is showing — is **per-image skeletons after the data has loaded**. Once the scene list arrives, every card renders an empty grey tile with a tiny `ImageIcon` placeholder while each `<img>` slowly downloads. That is why the cards look "empty / broken" with just a small icon.

In `/app` (Freestyle scene catalog), every card uses `<ShimmerImage>` (`src/components/ui/shimmer-image.tsx`), which renders an animated shimmer gradient over the whole card until its specific image fires `onLoad`, then crossfades the image in. The library page is the only place still using a plain `<img>` with a static `ImageIcon`, which is why it looks worse.

## Fix

Make `SceneCard` use the same `ShimmerImage` primitive as `/app/freestyle`, so each card shimmers until its image loads — exactly like the in-app catalog.

### `src/components/library/SceneCard.tsx`

Replace the `<img>` + `ImageIcon` placeholder with `ShimmerImage`:

```tsx
import { ImageIcon } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Skeleton } from '@/components/ui/skeleton';
import type { PublicScene } from '@/hooks/usePublicSceneLibrary';

export function SceneCard({ scene, onClick, eager = false }) {
  const previewUrl = scene.preview_image_url
    ? getOptimizedUrl(scene.preview_image_url, { quality: 65 })
    : null;

  return (
    <button
      type="button"
      onClick={() => onClick(scene)}
      className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted/40 ..."
    >
      {previewUrl ? (
        <ShimmerImage
          src={previewUrl}
          alt={scene.title}
          aspectRatio="3/4"
          loading={eager ? 'eager' : 'lazy'}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          wrapperClassName="absolute inset-0"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-foreground/15">
          <ImageIcon className="h-8 w-8" />
        </div>
      )}

      {/* Bottom gradient + title */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-black/55 via-black/15 to-transparent p-3 pt-10">
        <span className="line-clamp-1 text-sm font-semibold text-white">
          {scene.title}
        </span>
      </div>
    </button>
  );
}

export function SceneCardSkeleton() {
  return <Skeleton className="aspect-[3/4] w-full rounded-2xl" />;
}
```

Net effect:
- Initial data fetch → existing `SceneCardSkeleton` grid (unchanged).
- After data loads → each card now shimmers (same animation as `/app`) until its own image arrives, then crossfades in over 300ms.
- Cached images skip the shimmer instantly (handled inside `ShimmerImage`).
- Modal already uses the proper Skeleton overlay (no change needed).

## Files to edit

- `src/components/library/SceneCard.tsx` — swap plain `<img>` for `ShimmerImage`.

No other files need changes.
