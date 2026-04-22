

## Freestyle Scene Catalog — refinement pass

Tightens the modal based on your feedback. All changes are UI/state/query — **zero DB schema changes, zero generation pipeline changes**. Fully reversible behind the existing `VITE_SCENE_CATALOG_V2` flag.

---

### 1. Sidebar — simplified to 3 sections

```
QUICK
  All scenes        (count)
  Recommended       (count)
  New               (count, last 14 days)

PRODUCT FAMILIES        ← single-select (radio, not multi)
  Fashion           (count)
  Footwear          (count)
  Bags              (count)
  Beauty            (count)
  Fragrance         (count)
  Eyewear           (count)
  Activewear        (count)
  Home & Living     (count)
  Tech              (count)
  Food & Beverage   (count)
  Other             (count)

SHOT TYPES              ← Product Only + With Model only
  Product Only      (count)
  With Model        (count)
```

- **Product Families** becomes single-select. Clicking Lingerie when Jackets is active **replaces** the selection (not adds). Click the active family again to clear.
- **Shot Types** keeps only `Product Only` and `With Model`. Removes Hands Only, Packshot, Editorial, Lifestyle, Flat Lay, Close-up, Portrait, Still Life, Campaign from the sidebar. (Underlying DB columns remain — just hidden from the UI.)
- **All scenes** = clears every filter.
- **Recommended** = same hybrid logic as today (admin-featured + onboarding personalisation).
- **New** = `ORDER BY created_at DESC LIMIT 24`, scenes <14 days show a small "New" pill on card.

### 2. Top bar — compact

Replace the wide search + chip strip with a single compact row:

```
┌─────────────────────────────────────────────────────────────┐
│ [🔍 small input 280px]   [Product Only ✓] [With Model]      │  Sort ▾
└─────────────────────────────────────────────────────────────┘
```

- Search input shrinks to ~280px max, left-aligned, icon inside.
- Two horizontal pill chips on the right of search: **Product Only**, **With Model** — multi-select (both on = OR within axis). These mirror sidebar Shot Types so either control updates the same state.
- Removes: Editorial / Lifestyle / Outdoor / Seasonal / Popular / New chips from the top bar (Recommended/New live in sidebar; the rest aren't needed now).
- Sort dropdown stays (Recommended / Popular / New).

### 3. Default view (no filter active) — Freestyle scenes first

Rails order on open:

1. **Recommended for you** (existing logic)
2. **Freestyle Originals** — `mockTryOnPoses` from `src/data/mockData.ts` (the original Freestyle scenes), shown as a horizontal rail, max 12. These are the scenes Freestyle users already know. Selecting one preserves today's behaviour (no `pis-` prefix).
3. **Product Only** — `subject = 'product-only' AND sub_category NOT ILIKE '%essential%' ORDER BY sort_order LIMIT 12`
4. **With Model** — `subject = 'with-model' ORDER BY sort_order LIMIT 12`

(Drops the "Editorial" rail since Editorial is no longer a top-level UI concept.)

### 4. Essential shots pushed to the bottom within each family

When a Product Family is selected, the grid order changes from raw `sort_order` to:

```sql
ORDER BY
  CASE WHEN sub_category ILIKE '%essential%' THEN 1 ELSE 0 END,
  sort_order ASC
```

Result: editorial/lifestyle/with-model scenes appear first; the white-background "Essential / Studio Pack" shots move to the end of the list. Same rule applied in the infinite grid query and inside any rail that scopes to a family.

### 5. Card — minimal

Remove the two tag chips (subject + shot_style). Card becomes:

```
┌──────────────┐
│              │
│   [image]    │   ← preview, lazy
│              │
├──────────────┤
│ Title        │   ← single line, truncate
└──────────────┘
```

- No subject/shot_style chips.
- "New" pill (top-left, 10px) only when scene was created in the last 14 days.
- Selected = thin primary border + checkmark in top-right corner.
- Hover = subtle elevation, no overlay text.

### 6. State logic

| Action | Effect |
|---|---|
| Click family in sidebar | Replaces previous family (single-select). Grid shows that family with essentials pushed last. |
| Click same family again | Clears family filter → returns to default rails. |
| Click Product Only / With Model (sidebar OR top chip) | Toggles in `subjects[]` array (still multi-select within Shot Types axis). |
| Click All scenes | Clears every filter, returns to default rails. |
| Click Recommended | Sets sort to `recommended` and shows only the recommended set as a single grid. |
| Click New | Sets sort to `new`, no other filters. |

URL hash mirrors `family`, `subjects`, `q`, `sort` so back-button works inside the modal.

### 7. Files touched

**Edited only — no new files, no migration:**
- `src/components/app/freestyle/SceneCatalogSidebar.tsx` — reduce to 3 sections; family becomes single-select; Shot Types limited to two values.
- `src/components/app/freestyle/SceneCatalogFilters.tsx` — compact search; only Product Only / With Model chips; remove others.
- `src/components/app/freestyle/SceneCatalogModal.tsx` — wire single-select family handler; reorder default rails (Recommended → Freestyle Originals → Product Only → With Model); merge `mockTryOnPoses` into the Originals rail.
- `src/components/app/freestyle/SceneCatalogCard.tsx` — strip tag chips; keep only title + optional New pill.
- `src/hooks/useSceneCatalog.ts` — append the "essentials last" CASE ordering when a family is active; exclude `%essential%` from the Product Only default rail.
- `src/hooks/useSceneCounts.ts` — add count for `mockTryOnPoses.length` ("All scenes" total includes Freestyle originals).

**Untouched:**
- DB schema, RLS, indexes, edge functions, generation pipeline, Product Visuals wizard, admin pages.

### 8. Validation

- Open `/app/freestyle` Scene chip → modal shows Recommended → Freestyle Originals → Product Only → With Model rails.
- Sidebar shows 3 sections; Shot Types contains only Product Only + With Model.
- Click Jackets → grid loads jackets; click Lingerie → grid switches to lingerie (not multi-select).
- Within Jackets, "Essential" / "Studio Pack" sub-categories appear at the bottom, not the top.
- Top bar shows compact search + 2 chips; chips multi-select with sidebar Shot Types in sync.
- Card shows only title (no subject/shot_style chips); selected state has checkmark.
- Picking a Freestyle Originals scene generates exactly as today (no regression).
- Picking a Product Visuals scene still uses `pis-` prefix + sanitised template.

### Out of scope (explicit)
- DB column drops (Hands Only / Packshot / Editorial / etc. stay in DB; just hidden in UI — leaves room to re-enable later).
- Touching admin scene editor (Subject/Shot Style fields stay editable in admin).
- Workflow scene pickers reusing the modal.

