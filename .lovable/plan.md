

## Admin curation upgrades + Freestyle modal fixes

Five small, surgical changes — UI/query only. No DB schema or generation pipeline changes.

### 1. Admin Recommended Scenes — load full catalog, add filters, show sub-categories, fix arrangement

File: `src/pages/AdminRecommendedScenes.tsx`

**Bypass the 1,000-row PostgREST cap.** Today the "All scenes" fetch returns ≤1,000 rows so admins literally can't see most of the catalog. Switch to the same paged-loop pattern used in `useSceneCounts`: page through in 1,000-row windows up to a 5,000 hard cap, with the slim columns already selected.

**Add a Family + Sub-family filter row** above the search input:

- **Family pills**: derived from `category_collection` on the loaded scenes, mapped through `CATEGORY_FAMILY_MAP` (already used by the user-side sidebar). Single-select, with an "All" pill.
- **Sub-family pills** (appear once a family is picked): the unique `sub_category` values within that family, single-select, with "All" + an "Essentials last" sort applied so essential rows sink to the bottom.
- Filters compose with the existing search box.
- Counts in pill labels: "Fashion (412)", "Editorial Studio (24)", etc.

**Show sub-category on each card** in the All-scenes grid (under the title) so admins can see at a glance which bucket a scene belongs to. Same for the Featured grid.

**Arrangement controls.** Today admins reorder within the *featured* grid only (arrows up/down). The DB stores ordering for **featured** rows via `recommended_scenes.sort_order`. Make this clearer:

- Featured grid header gets a short helper: "Drag arrows on a card to move it up/down. The first card appears first in the user's rail."
- Add a numeric position badge ("1", "2", …) on each featured card so admins can see the live order.
- Drag-and-drop is out of scope — keep arrows (they already work and reorder via paired `sort_order` swap).
- The order shown in the user-facing **"Recommended for you"** rail = exactly this `sort_order ASC`.

Note: the *all-scenes* grid has no sort to control — its order is `category_collection ASC, sort_order ASC` (an indexed admin browse order). It is not what users see; the user-facing catalog uses its own `sort_order`. We'll make this explicit with a small caption: "All scenes shown grouped by Product Family for browsing — does not affect what users see."

### 2. Newest sort: stop pinning Freestyle Originals at the top

File: `src/components/app/freestyle/SceneCatalogModal.tsx`

Today we always prepend `originalScenes` (admin custom_scenes) to the first page of the grid in the rails view. That ignores the user's sort choice — when they pick **Newest**, the hardcoded originals still appear at the top.

Fix: only prepend originals when `sort === 'recommended'` **and** `showRails` is true. When `sort === 'new'`:

- Hide originals from the merged grid (they wouldn't slot meaningfully into a `created_at DESC` order without a unified DB-level sort).
- Show only `useSceneCatalog` results sorted by `created_at DESC` — the existing query already handles this correctly.

### 3. Product Only / With Model chips: mutual exclusion + correct results

File: `src/components/app/freestyle/SceneCatalogModal.tsx`

`subject` is a single value per scene (`product-only` or `with-model`) — selecting both is meaningless and confuses users. Make them mutually exclusive:

- `handleChipToggle('product-only')` → if already active, clear; else set `subjects = ['product-only']` (replacing any prior subject).
- Same for `with-model` — toggling one off-replaces the other.
- Keep the visual "active" state as today.

Also fix the "shows nothing" symptom: when a chip is on, we currently still merge `originalScenes` into the grid pages even though we don't render the rails branch. That's already correct (we only merge in `showRails`). But we *do* leave `family`/`categoryCollection` untouched — if a user had selected a family, then clicks a chip, both filters apply. Behaviour is correct, but for clarity we'll **not** auto-clear the family — UX matches the sidebar today.

The actual "no results" bug is that `originalScenes` (which have `subject: null`) get filtered out by `.in('subject', [...])` on the server — that's correct, they shouldn't show in a chip-filtered view. So the fix is simply ensuring the chip state and the rendered grid path are consistent (no rails, no originals merge), which is already the case once the mutual-exclusion fix above lands. The real failure mode reported is likely the originals leaking in at the top via the prepend when `showRails` toggles — confirmed by inspection that the merge is `showRails`-gated, but we'll **add an extra guard**: only merge originals when neither chip is active, regardless.

### 4. Loading order ordering is not guaranteed in featured rail

Confirm `useRecommendedScenes` orders by `sort_order ASC` (it does today) — no change. Featured admin order = user-facing rail order.

### Files touched

- `src/pages/AdminRecommendedScenes.tsx` — paged catalog fetch (≤5k rows), Family + Sub-family filter pills, sub-category on cards, position badges on featured cards, helper captions.
- `src/components/app/freestyle/SceneCatalogModal.tsx` — gate originals merge behind `sort === 'recommended'` and no active chip; mutually-exclusive chip toggle.

### Untouched

DB schema, RLS, generation pipeline, sidebar, `useSceneCatalog`, `useSceneCounts`, `useRecommendedScenes`, `useCustomScenes`, the user-facing rail, card components.

### Validation

- `/app/admin/recommended-scenes` → "All scenes" badge shows ~1,613 (not capped at 1,000).
- Family pill row works: "Fashion" filters to fashion sub-collections; "All" resets.
- Sub-family pills appear after picking a family; "Essentials" sit at the bottom.
- Each scene card shows its sub-category beneath the title.
- Featured cards display position numbers (1, 2, 3…); arrow up/down updates the number live.
- Switching the Category tab (Global / Fashion / Beauty / …) keeps the Family+Sub-family filters working independently per tab.
- `/app/freestyle` Scenes modal → sort = **Newest** shows pure `created_at DESC` — no Freestyle Originals pinned.
- Click "Product Only" → grid shows only product-only scenes (no originals leaking in). Click "With Model" → switches to with-model only and deselects "Product Only". Clicking the active chip again clears it.

