

## Fix Missing Chip Thumbnails + Optimize

**Problem**: The product and scene chip thumbnails (`/images/source-crop-top.jpg` and `/images/try-showcase/cafe-lifestyle.png`) aren't displaying in the chips. They're served from local `/public` but should use Supabase Storage like the model avatars for consistency and optimization.

**File**: `src/components/landing/FreestyleShowcaseSection.tsx`

### Changes

1. **Move chip thumbnail URLs to Supabase Storage** — use `getLandingAssetUrl()` + `getOptimizedUrl()` with `width: 40, quality: 50` (tiny 20px chips at 2x DPR = 40px is plenty):

```ts
import { getOptimizedUrl } from '@/lib/imageOptimization';

// In CHIPS array:
thumb: getOptimizedUrl(getLandingAssetUrl('showcase/source-crop-top.jpg'), { width: 40, quality: 50 }),
// and for scene:
thumb: getOptimizedUrl(getLandingAssetUrl('showcase/cafe-lifestyle.png'), { width: 40, quality: 50 }),
```

> Note: If these assets aren't yet in the `landing-assets` bucket, we'll keep the local paths but still add `getOptimizedUrl` handling and visual fixes.

2. **Add visible border + background to chip thumbnails** so they're never invisible even while loading (line ~206-210):

```tsx
<img
  src={chip.thumb}
  alt={chip.label}
  width={20}
  height={20}
  className="w-4 h-4 sm:w-5 sm:h-5 object-cover rounded ring-1 ring-border/40 bg-muted shrink-0"
/>
```

3. **Also optimize model avatar images** with `getOptimizedUrl()` at `width: 40, quality: 50` since they're equally tiny.

4. **Also optimize RESULT_CARDS** — these are larger but still use local paths. Apply `getOptimizedUrl` with `width: 400, quality: 60`.

