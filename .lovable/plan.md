

## Interleaved "All scenes" arrangement + apply same logic to user Recommended rail

You want the admin "All scenes" grid to feel curated — not 1,200 fashion scenes followed by 200 beauty scenes. Mix them so the eye sees variety: 2 fashion → 2 beauty → 2 fragrance → repeat. And use the same interleaving for the user-facing **Recommended for you** rail when an admin hasn't curated specific picks.

### Part A — Admin "All scenes" grid: interleaved arrangement

File: `src/pages/AdminRecommendedScenes.tsx`

Add a **View** toggle above the grid:
- **Grouped** (today's behaviour) — `category_collection ASC, sort_order ASC`
- **Interleaved** (new default) — round-robin across families/sub-families, N scenes per chunk

Implementation:
- Group `filteredScenes` by `category_collection`. Within each group keep current `sort_order`.
- Build queues per family (Fashion, Beauty, Fragrance, …) using `CATEGORY_FAMILY_MAP`.
- Round-robin pull `chunkSize` (default **2**) from each family's queue, in `FAMILY_ORDER`, until all are drained.
- Add a small numeric stepper for chunk size: 1 / 2 / 3 / 4 (default 2).
- Persist toggle + chunk size in `localStorage` so admins keep their preference.
- The interleaving is **purely visual** — does not write anything to the DB.

The selection/add-remove logic stays exactly the same; only the render order of `filteredScenes` changes.

### Part B — User-facing "Recommended for you" rail: same interleaving fallback

File: `src/hooks/useRecommendedScenes.ts`

Today's resolution chain:
1. Per-category curated picks → 2. Global curated picks → 3. Top-12 by `sort_order` (last-resort dump)

Add a **smarter step 3 / interleaved fallback**:
- When per-category + Global picks together yield fewer than 12, instead of just sorting by `sort_order` (which clusters by category), pull the **top-N from each family** the user picked at onboarding and interleave 2-by-2.
- If user has no onboarding categories, do the same across all families using `FAMILY_ORDER`.
- Cap at 12. Dedupe with already-resolved curated picks.

Result: every user sees a visually varied rail even when admins haven't fully curated their category.

### Part C — Optional: also interleave the admin **Featured** preview

In the Featured section header, add a small "Preview as user sees it" toggle that re-renders the featured cards in the same interleaved order the user's rail will use. Pure preview — does not change `sort_order` in the DB. This lets admins see what mixing looks like before deciding to curate manually.

### Files touched

- `src/pages/AdminRecommendedScenes.tsx` — view toggle, chunk size stepper, interleave helper, optional Featured preview toggle.
- `src/hooks/useRecommendedScenes.ts` — interleaved fallback when curated picks < 12.
- `src/lib/sceneTaxonomy.ts` — export a small `interleaveByFamily(scenes, chunkSize)` helper (single source of truth used by both).

### Untouched

DB schema, RLS, `recommended_scenes` table, generation pipeline, scene catalog modal grid, admin curation actions (add/remove/reorder).

### Validation

- `/app/admin/recommended-scenes` → toggle **Interleaved (2)** → grid shows 2 Fashion, 2 Beauty, 2 Fragrance, 2 Eyewear, … repeating until all visible scenes render. Switching to **Grouped** restores today's order.
- Chunk size stepper: setting 1 produces strict round-robin (1 fashion, 1 beauty, 1 fragrance…); setting 4 makes wider chunks.
- Search and family/sub-family filters compose correctly with both views.
- Featured "Preview as user sees it" toggle shows the rail the way the user will see it (interleaved across the curated picks' families).
- A user with `product_categories = ['fashion','beauty']` and only 4 curated picks across both → opens Scenes modal → Recommended rail shows the 4 picks first, then interleaved top scenes from Fashion + Beauty families to fill to 12.
- A user with no onboarding categories and no curated picks → rail shows interleaved variety across all families instead of 12 of the same category.

