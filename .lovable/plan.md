
The user is right to push back. Let me check what's actually happening on `/app/generate/product-images`.

Looking at `useProductImageScenes.ts` (provided in context):

The hook supports a `priorityCategories` mode that fetches only scenes for selected categories first, then loads the rest in the background. **But it ALWAYS fetches the rest too** (`fetchScenesExcludingCategories`) — just deferred. So total payload is still the entire ~3000-row catalog.

Also, even the priority/all fetches use `select('*')` which pulls the heavy `prompt_template` field (2–4KB per row × 3000 rows = ~10MB+).

Let me verify by checking how it's called on the product-images flow and if there's truly category filtering happening.
<lov-tool-use id="toolu_vrtx_013Arzo9TBgPn8Up2qQDqqnt" name="code--search_files" integration-id="code" data="{\"query\": \"useProductImageScenes\\\\(\", \"include_patterns\": \"src/**/*.tsx,src/**/*.ts\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01TQTGWrJbjJFfqug6c6vjFJ" name="code--search_files" integration-id="code" data="{\"query\": \"useProductImageScenes\\\\(\", \"include_patterns\": \"src/**/*.tsx,src/**/*.ts\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01Wua1dXsrDdZKV8nSBwEZ9f" name="code--search_files" integration-id="code" data="{\"query\": \"priorityCategories\", \"include_patterns\": \"src/**/*.tsx,src/**/*.ts\"}">
</lov-tool-use>
Found the issue. While Step 2 uses priority categories, **`ProductImages.tsx` (line 65), `Step3Refine`, `Step4Review`, `Step6Results`** all call `useProductImageScenes()` with NO options → triggers the full `fetchAllScenes` (~3000 rows, all columns including heavy `prompt_template`). So even on the wizard, the full fetch fires in parallel because the parent page mounts these.

<lov-plan>
## Why it's still slow despite category-aware loading

You're right that **Step 2 (Shots)** correctly uses `priorityCategories` — only relevant scenes load there. But four other places call the same hook **without options**, which triggers the full `fetchAllScenes()` path (paginated `select=*` over ~3000 rows, including the multi-KB `prompt_template` field).

**Callers doing the heavy full fetch:**

| File | Line | Why it's called |
|---|---|---|
| `src/pages/ProductImages.tsx` | 65 | Parent page — runs on mount, *before* Step 2 even renders |
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | 402, 1616 | Setup step + SceneThumbnail lookup |
| `src/components/app/product-images/ProductImagesStep4Review.tsx` | 78 | Review step needs scene metadata |
| `src/components/app/product-images/ProductImagesStep6Results.tsx` | 33 | Results sort map |
| `src/pages/AdminProductImageScenes.tsx` | 111 | Admin (acceptable) |
| `src/pages/AdminBulkPreviewUpload.tsx` | 146 | Admin (acceptable) |

Because `ProductImages.tsx` calls the bare hook on **every** wizard mount, the ~10–20 MB full payload starts downloading immediately — racing (and starving) the lighter Step 2 priority fetch. So the user sees a slow first paint even though Step 2 itself is "smart".

On top of that, `select=*` returns `prompt_template` which is only used server-side during generation — it's pure dead weight on the client.

## Plan (two surgical fixes — no behavior change)

### Fix 1 — Slim the column list in `useProductImageScenes.ts`
Drop `prompt_template` from every fetch. The client never reads it. This alone cuts payload by ~80%.

Replace `select('*')` in all three fetch helpers (`fetchAllScenes`, `fetchScenesByCategories`, `fetchScenesExcludingCategories`) with an explicit list:
```
id, scene_id, title, description, trigger_blocks, category_collection,
scene_type, preview_image_url, is_active, sort_order, sub_category,
category_sort_order, requires_extra_reference, sub_category_sort_order,
suggested_colors, outfit_hint, use_scene_reference
```
Also add `.eq('is_active', true)` to skip hidden rows for non-admin paths.

Keep `prompt_template` available **only** for the admin hook path (admin needs it for editing). Add an internal `includePromptTemplate` option that admin pages set to true.

### Fix 2 — Stop the parent page from triggering a separate full fetch
In `ProductImages.tsx` line 65, the page only uses `allScenes` for sort-map and lookup helpers passed down. The same data is already fetched by Step 2's priority hook → React Query caches it.

Two options:
- **A (preferred):** Remove the bare `useProductImageScenes()` call from `ProductImages.tsx` and instead pass scene lookup helpers down from Step 2's already-loaded data. Steps 3/4/6 then read from the same cached query (since query keys match) — no extra fetch.
- **B (smaller change):** Keep the call but make Steps 3/4/6 use the **same priority/rest cache** by sharing `priorityCats` via context, so React Query dedupes.

I'll go with **A**: remove parent's bare call, lift scene lookup helpers to a small `useScenesLookup()` consumer that reads from the priority-cached results (or falls back to Mode B if priority isn't set yet).

### Result

- Initial scenes payload: from ~10–20 MB → ~1–2 MB.
- No duplicate parallel `select=*` racing the priority fetch.
- Step navigation reads cached data — no refetch.
- `/app/generate/product-images` first paint becomes much faster, especially on mobile.

### Files to edit

- `src/hooks/useProductImageScenes.ts` — slim column list + `is_active=true` filter + admin-only `includePromptTemplate` flag.
- `src/pages/ProductImages.tsx` — remove bare `useProductImageScenes()` call; share scene helpers via props/context already wired.
- `src/components/app/product-images/ProductImagesStep3Refine.tsx`, `ProductImagesStep4Review.tsx`, `ProductImagesStep6Results.tsx` — keep their hook calls (now slim + cached, no extra network).
- `src/pages/AdminProductImageScenes.tsx`, `AdminBulkPreviewUpload.tsx` — pass `includePromptTemplate: true` to keep admin editing functional.
