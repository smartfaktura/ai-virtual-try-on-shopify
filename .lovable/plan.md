# Fix Necklaces pill on /ai-product-photography/jewelry

## Root cause
The data file `src/data/aiProductPhotographyBuiltForGrids.ts` already lists the 8 imageIds you provided. But `CategoryBuiltForEveryCategory` resolves each card via `resolveSlotImageUrl`, which checks `seo_page_visuals` (admin overrides) FIRST. There are 6 stale override rows for this page pinning slots 1, 2, 3, 4, 6, 8 to the old necklace images — so those keep showing regardless of the data file.

Existing override rows on `page_route = /ai-product-photography/jewelry`:
- `builtFor_necklaces_1` → 1776243895901-oddcm2
- `builtFor_necklaces_2` → 1776243907007-f0mhvm
- `builtFor_necklaces_3` → 1776243905045-8aw72b
- `builtFor_necklaces_4` → 1776243927613-381b7c
- `builtFor_necklaces_6` → 1776243897922-iqre1y
- `builtFor_necklaces_8` → 1776243920507-0krxkp

## Change
Run a single migration that deletes those 6 override rows so the cards fall back to the data file's imageIds (the 8 you specified, in the same order as before):

```sql
DELETE FROM public.seo_page_visuals
WHERE page_route = '/ai-product-photography/jewelry'
  AND slot_key IN (
    'builtFor_necklaces_1',
    'builtFor_necklaces_2',
    'builtFor_necklaces_3',
    'builtFor_necklaces_4',
    'builtFor_necklaces_6',
    'builtFor_necklaces_8'
  );
```

No code changes — the data file already contains the correct 8 visuals.

## Out of scope
- Other pills (Rings, Earrings, Bracelets) and other pages are not touched.
- No changes to `src/data/aiProductPhotographyCategoryPages.ts` Scene Examples tile.
