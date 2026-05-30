## `/app/perspectives` — search + selection polish

Frontend only — `src/pages/Perspectives.tsx`.

### 1. Multi-factor search (Library + Products)

Currently both pickers filter only on `title.includes(query)`. Match the upgraded `/app/product-swap` behavior so users find images/products by more than the title.

- **Library query** (around lines 180–224): extend `freestyle_generations` select with `user_prompt, workflow_label, aspect_ratio`; extend `generation_jobs` select with `scene_name, model_name, workflow_slug, prompt_final, product_name, ratio`. Build a lowercase `searchHaystack` per item joining title + all those fields. Add `searchHaystack: string` to `LibraryPickerItem`.
- **Filter** (lines 238–244): replace `includes` with a small `matchesTokens(haystack, query)` helper — split query on whitespace, every token must appear in haystack. Apply to both library and products.
- **Products haystack**: `title, description, product_type, color, materials, sku, dimensions, weight, (tags||[]).join(' ')`.

### 2. Rounded search bar

Replace the current `<Input className="pl-9" />` styling on **both** pickers with the same pill style used elsewhere: `pl-11 pr-4 h-11 rounded-full text-sm`. Move the search icon to `left-4` to match.

Also update placeholders:
- Library: `"Search by name, prompt, scene, model…"`
- Products: `"Search by name, type, color, SKU, tag…"`

### 3. Drop "(max 10)" caption and add Clear button

Both pickers currently show:

```
[N selected]  (max 10)
```

- Remove the `(max 10)` span entirely.
- Show the count badge; when count > 0, render a small `Button variant="ghost" size="sm" className="text-xs h-7 px-2"` labeled **Clear** that empties the selection set (`setSelectedLibraryIds(new Set())` / `setSelectedProductIds(new Set())`).

Layout: keep them inline with `flex gap-2 items-center`.

### Out of scope

- No changes to source-tab cards, ratios, variations, or generation pipeline.
- No new selection cap behavior — internal max (used by selection guards) stays as-is, we just hide the noisy "(max 10)" label.
- No DB changes.
