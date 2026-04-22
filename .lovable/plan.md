

## Real fix — batch the metadata lookup on `/app/admin/scene-performance`

### What's actually broken (corrected diagnosis)

The previous theory (RLS policy missing) was wrong. Confirmed:
- `product_image_scenes` already has policy `Authenticated can read active scenes USING (true)` — admin already has read access.
- The data exists: `closeup-detail-hats-watches` → `Close-Up Detail`, has preview ✓
- `generation_jobs.scene_id` values match `product_image_scenes.scene_id` exactly ✓

**Real root cause:** The 90-day window has **1,062 distinct scene IDs**. The frontend does:
```ts
supabase.from('product_image_scenes').select(...).in('scene_id', pisQueryIds)
```
With ~1,000+ IDs, this builds a URL with `?scene_id=in.(id1,id2,...id1062)` that:
1. Hits Supabase's default 1,000-row return cap → silently truncates
2. May exceed PostgREST URL length → request fails or returns nothing

Result: metadata map is mostly empty → rows fall back to raw IDs and no thumbnail.

### Safe fix (frontend only, no DB changes)

In `src/pages/admin/SceneUsage.tsx`, replace the single `.in()` call with **chunked batches of 200 IDs** and merge results. Same for `custom_scenes` (smaller but same pattern for safety).

```ts
async function fetchScenesInChunks(ids: string[], chunkSize = 200) {
  const out: any[] = [];
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const { data, error } = await supabase
      .from('product_image_scenes')
      .select('scene_id,title,sub_category,category_collection,preview_image_url')
      .in('scene_id', chunk);
    if (error) throw error;
    if (data) out.push(...data);
  }
  return out;
}
```

### Why it's safe

- **Frontend-only change** in one admin page
- No DB migration, no RLS change, no edge function change
- No impact on generation, credits, queues, or any other page
- Pure read operation
- Easy rollback: revert the file

### What stays untouched

- Database schema and RLS — untouched
- `get_scene_popularity` RPC — untouched
- Generation pipeline — untouched
- All other admin pages — untouched

### Validation

1. Reload `/app/admin/scene-performance`
2. Rows show real names (`Frozen Aura`, `Close-Up Detail`, …) + thumbnails
3. Category column shows real values
4. Top risers rail also gets names + thumbnails
5. No console errors

