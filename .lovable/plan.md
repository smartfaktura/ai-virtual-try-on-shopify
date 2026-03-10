

## Fix Recent Jobs: Generated Result Thumbnails + Product Name + Hover Preview

### Problems Identified

1. **Thumbnail shows source product image, not generated result** — Line 440: `thumbUrl` prioritizes `job.user_products?.image_url` (the uploaded product) over the actual generated result. Should show the first generated image instead.

2. **Source name falls back to workflow name** — Line 454: When `job.user_products?.title` is null (e.g. freestyle or scratch uploads), it falls back to `job.workflows?.name` (e.g. "Flat Lay Set"). Should show product name from the job context, not workflow name.

3. **No hover preview** — The 40px thumbnail is tiny with no way to see the image larger.

4. **Thumbnail is not cropped to fill** — Uses `object-contain` which leaves whitespace; should use `object-cover` for a clean 1:1 fill.

### Changes — 1 file: `src/pages/Dashboard.tsx`

**A. Show generated result as thumbnail (line 440)**
```tsx
// Before: prioritizes source product image
const thumbUrl = job.user_products?.image_url || firstResult;

// After: prioritizes generated result
const thumbUrl = firstResult || job.user_products?.image_url;
```

**B. Fix object-fit (line 451)**
Change `object-contain` → `object-cover` so images fill the 1:1 square.

**C. Fix source name fallback (line 454)**
Keep product title as primary, but when missing, show "Generation" instead of the workflow name (workflow name already has its own column).
```tsx
{job.user_products?.title || 'Generation'}
```

**D. Add hover preview with larger image**
Wrap the thumbnail in a `HoverCard` (already available via Radix) that shows a ~200px preview of the generated image on hover. On mobile, tapping the thumbnail could open a small popover.

```tsx
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

// Wrap the thumbnail div:
<HoverCard openDelay={200}>
  <HoverCardTrigger asChild>
    <div className="w-10 h-10 rounded-md overflow-hidden ...">
      <img ... className="w-full h-full object-cover" />
    </div>
  </HoverCardTrigger>
  <HoverCardContent side="right" className="w-52 p-1">
    <img src={getOptimizedUrl(thumbUrl, { quality: 70 })} className="w-full rounded-md" />
  </HoverCardContent>
</HoverCard>
```

