

## Fix: Recent Creations Gallery Not Showing Images

### Root Cause

The `generation_jobs.results` column contains **base64-encoded images** (~9MB each). The gallery query fetches 5 rows including this column, attempting to download ~45MB of text data. This causes the query to fail/timeout, the entire `queryFn` throws, and the gallery falls back to empty placeholders.

### Solution

Restructure the gallery to avoid fetching the massive `results` column entirely, and run both queries in parallel so one failure doesn't block the other.

### Changes to `src/components/app/RecentCreationsGallery.tsx`

**1. Remove `results` from the generation_jobs select** -- instead, only show generation_jobs that have a linked product image (via `user_products.image_url`). This keeps the query lightweight.

**2. Run both queries in parallel** with `Promise.all` and handle errors individually (so freestyle items still show even if generation_jobs fails).

**3. Fix date sorting** -- store raw ISO `created_at` for accurate sorting instead of converting to `toLocaleDateString()` and parsing back.

**4. Add auto-refresh** -- `refetchInterval: 15_000` so the gallery stays current without page refresh.

### Technical Details

Updated `CreationItem` interface:
```
interface CreationItem {
  id: string;
  imageUrl: string;
  label: string;
  date: string;       // display string
  rawDate: string;     // ISO string for sorting
}
```

Updated query function:
```typescript
const [jobsResult, freestyleResult] = await Promise.all([
  supabase
    .from('generation_jobs')
    .select('id, created_at, workflows(name), user_products(title, image_url)')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(5),
  supabase
    .from('freestyle_generations')
    .select('id, image_url, prompt, created_at')
    .order('created_at', { ascending: false })
    .limit(5),
]);

// Process generation_jobs -- only add items that have a product image
// (skip results column entirely to avoid fetching massive base64 data)
if (!jobsResult.error) {
  for (const job of jobsResult.data ?? []) {
    const productImg = (job.user_products as any)?.image_url;
    if (productImg) {
      items.push({
        id: job.id,
        imageUrl: productImg,
        label: (job.workflows as any)?.name || 'Generated',
        date: new Date(job.created_at).toLocaleDateString(),
        rawDate: job.created_at,
      });
    }
  }
}

// Process freestyle -- these always have proper URLs
if (!freestyleResult.error) {
  for (const f of freestyleResult.data ?? []) {
    items.push({
      id: f.id,
      imageUrl: f.image_url,
      label: 'Freestyle',
      date: new Date(f.created_at).toLocaleDateString(),
      rawDate: f.created_at,
    });
  }
}

// Sort by raw ISO date for accuracy
items.sort((a, b) => b.rawDate.localeCompare(a.rawDate));
return items.slice(0, 10);
```

Add query options:
```typescript
enabled: !!user,
refetchInterval: 15_000,
staleTime: 10_000,
```

### Result
- No more fetching ~45MB of base64 data
- Freestyle images show immediately (they have proper URLs)
- Parallel queries so one failure doesn't block the other
- Auto-refresh every 15 seconds
- Accurate time-based sorting

| File | Change |
|------|--------|
| `src/components/app/RecentCreationsGallery.tsx` | Remove `results` from select, parallel queries, error isolation, fix sorting, add auto-refresh |

