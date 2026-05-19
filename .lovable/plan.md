## Fix: library search returns no results for product / model / scene names

### Root cause (confirmed in `src/hooks/useLibraryItems.ts`)

1. **Narrow client-side filter.**
   - Jobs (lines 71–73) match only `label`, `prompt_final`, `productTitle`. Miss `scene_name`, `model_name`, `workflow_slug`, `product_name`.
   - Freestyle (line 126) matches only `displayLabel` + `prompt`. Misses `user_prompt`, resolved model/scene name, `workflow_label`.
2. **Client filter runs after pagination** (60 jobs + 20 freestyle per page). If the match lives further back, the user sees an empty page.

### Fix — push search to the server, broaden matched fields

Edit only `src/hooks/useLibraryItems.ts`. No DB migration, no schema change, no UI change, no other call sites.

**1. Sanitize the query (strip chars that break Supabase `.or()` syntax):**
```ts
const esc = q.replace(/[%,()]/g, ' ').trim();
```

**2. When `esc` is non-empty, add a server-side `.or()` on `generation_jobs`:**
```ts
jobsQuery = jobsQuery.or([
  `product_name.ilike.%${esc}%`,
  `scene_name.ilike.%${esc}%`,
  `model_name.ilike.%${esc}%`,
  `workflow_slug.ilike.%${esc}%`,
  `prompt_final.ilike.%${esc}%`,
].join(','));
```
All five columns verified to exist on the table.

**3. When `esc` is non-empty, add a server-side `.or()` on `freestyle_generations`:**
```ts
const clauses = [
  `prompt.ilike.%${esc}%`,
  `user_prompt.ilike.%${esc}%`,
  `workflow_label.ilike.%${esc}%`,
];
// Resolve model/scene names → IDs, OR them in
const matchedModelIds = mockModels.filter(m => m.name.toLowerCase().includes(q)).map(m => m.modelId);
const matchedPoseIds  = mockTryOnPoses.filter(p => p.name.toLowerCase().includes(q)).map(p => p.poseId);
if (matchedModelIds.length) clauses.push(`model_id.in.(${matchedModelIds.join(',')})`);
if (matchedPoseIds.length)  clauses.push(`scene_id.in.(${matchedPoseIds.join(',')})`);
fsQuery = fsQuery.or(clauses.join(','));
```
(Custom model/scene name lookup against `custom_models` / `get_public_custom_scenes` only runs when `q` is set; if no matches found, we just skip those clauses.)

**4. Broaden the post-fetch client-side filter to mirror the new fields** (so overflow/carry-over rows stay consistent).

### Why this is safe

- **Zero behaviour change when search is empty.** `esc` is empty → no `.or()` is added → identical query to today.
- **`.or()` is additive within a single table** (OR semantics across listed columns). No joins, no recursion, no RLS interaction (RLS still applies on top normally).
- **Pagination cursors unaffected.** `.gt/lt('created_at', cursor)` + `.limit()` keep working; `.or()` is just another WHERE clause.
- **React Query key already includes `searchQuery`** → no stale cache.
- **All referenced columns exist** on the actual tables (verified in schema): `generation_jobs.{scene_name, model_name, product_name, workflow_slug, prompt_final}`, `freestyle_generations.{prompt, user_prompt, workflow_label, model_id, scene_id}`.
- **Special chars stripped** (`%,()`) so `.or()` syntax can't break on user input like `john (red)` or `50%`.
- **Same RLS policies** — we're not querying anything new, only filtering rows the user already had SELECT access to.
- **Failure mode is graceful**: if the server-side filter returns 0 rows, the existing "No results match your search" empty state already handles it.
- **No edge function changes, no migrations, no new packages.**

### What this won't change

- Default library view (no search) — identical.
- Filter chips (source / status / favorites) — untouched, still client-side.
- Empty state and "Clear search" CTA — unchanged.
- Server-side filter on joined `user_products.title` — kept as client-side fallback (today's behaviour).

### Verification after deploy

On `/app/library`:
1. Search a product name from an older batch → matches surface (proves server-side push works).
2. Search a model name like "Sienna" → both freestyle + workflow rows appear.
3. Search a scene name → matches surface.
4. Clear search → full unfiltered library returns.
5. Type weird chars (`50%`, `john (a,b)`) → no crash, sensible matches.
