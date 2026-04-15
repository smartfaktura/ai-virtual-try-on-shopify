

# Fix: Paginate Scene Fetch + Future-Proof for 1000+ Rows

## Problem
The `product_image_scenes` table now has **1,056 rows** but the Supabase API returns max 1,000 per request. The query in `useProductImageScenes.ts` does a single `.select('*')` call, so rows beyond 1,000 (including 24 activewear scenes) are silently dropped.

## Solution
Update `src/hooks/useProductImageScenes.ts` to fetch all rows using a paginated loop with `.range()`.

### Changes (single file)

**`src/hooks/useProductImageScenes.ts`** — Replace the `queryFn` with a loop:

```ts
queryFn: async () => {
  const PAGE = 1000;
  let all: DbScene[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('product_image_scenes' as any)
      .select('*')
      .order('sort_order', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const batch = (data || []) as unknown as DbScene[];
    all = all.concat(batch);
    if (batch.length < PAGE) break;
    from += PAGE;
  }
  return all;
},
```

This is a single-file, ~10-line change. No other files need modification — all consumers already read from the hook's returned data. The activewear scenes (and any future growth) will immediately appear.

