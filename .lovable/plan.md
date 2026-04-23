

## Add sub-family selector to Discover admin (and a smart backfill)

### Problem

`discover_presets.subcategory` already exists in the DB and the filter logic (`itemMatchesDiscoverFilter`) already reads it — but **none of the 366 existing items have it set**, and the admin edit drawer (`DiscoverDetailModal`) has no UI to assign one. Result: when a user picks a sub-family pill (e.g. *Hoodies*), the grid only matches via legacy fallback rather than precise sub-family targeting.

### The fix — three small, surgical changes

#### 1. Add a "Sub-family" picker to the admin edit drawer

**File:** `src/components/app/DiscoverDetailModal.tsx`

Insert a new field directly under the existing **Explore Categories** pill row (around line 385). It dynamically reflects the **first selected family** in `editCategories`:

```text
Explore Categories
[Fashion] [Beauty] [Fragrances] …                    ← existing

Sub-family (Fashion)                                 ← NEW
[None] [Clothing] [Hoodies] [Dresses] [Jeans] [Jackets]
[Activewear] [Swimwear] [Lingerie] [Streetwear]
```

Behavior:
- Pulled live from `getDiscoverSubtypes(firstFamilyId)` — same source as the user-facing sub-row, so they always stay in sync.
- Single-select pill row (matching the new sub-category pill style we just shipped: `rounded-full px-4 py-1.5 text-[12px] border`, solid black active).
- Hidden when the family has 0 or 1 sub-types (e.g. Watches, Eyewear) — nothing to choose.
- Shows **"None"** as the first pill so admins can leave it family-wide.
- Resets to `null` whenever the admin changes the primary family (so a Fashion-tagged item can't keep a Footwear sub-family).

State: add `editSubcategory: string | null` next to `editCategories`. Initialize from `d?.subcategory ?? null` in the existing reset effect.

#### 2. Persist it on save

**Same file**, in the save handler (~line 657):

```ts
const presetData: Record<string, any> = {
  category: editCategories[0] || 'fashion',
  discover_categories: editCategories,
  subcategory: editSubcategory,           // NEW
  …
};
```

And mirror to `custom_scenes` (which doesn't have the column yet — we'll add it in the migration below) so promoted scenes also get it.

The existing "unsaved changes" detection on the Save button (line 631) gets one more comparison: `editSubcategory !== (item.data as any).subcategory`.

#### 3. Surface the value on the read-only metadata panel

In the small key/value grid above the editors (~line 323), add one row right after **DB Category**:

```text
DB Category     fashion
DB Sub-family   hoodies   ← NEW (or "—" when null)
DB Workflow     virtual-try-on-set
```

So admins can see at a glance whether an item has a sub-family without opening the picker.

### DB migration

Two tiny additions:

```sql
-- 1. custom_scenes: mirror the column so promoted scenes carry sub-family
ALTER TABLE public.custom_scenes
  ADD COLUMN IF NOT EXISTS subcategory text;

-- 2. Index for fast filtering on the user-facing grid
CREATE INDEX IF NOT EXISTS idx_discover_presets_subcategory
  ON public.discover_presets (subcategory)
  WHERE subcategory IS NOT NULL;
```

No RLS changes — `subcategory` falls under existing policies.

### Optional: lightweight backfill (one-shot, admin-only)

Most items can be auto-classified by inspecting their existing `tags`, `prompt`, and `scene_name` against the sub-family slugs. We add a **"Auto-classify sub-family"** button to `/app/admin/discover` (top-right toolbar) that runs once:

```text
For each row WHERE subcategory IS NULL:
  1. Take its `category` (family).
  2. Look up its family's sub-type slugs.
  3. If any slug appears in tags[] or prompt or title (case-insensitive
     word-boundary match) → set subcategory to that slug.
  4. Otherwise leave NULL (admin handles manually).
```

Implemented as a new edge function `backfill-discover-subcategories` (admin JWT check, dry-run mode returns counts before committing). Safe, idempotent, free to re-run.

### What does **not** change

- `itemMatchesDiscoverFilter` — already correct, already supports sub-family.
- User-facing `Discover.tsx` / `PublicDiscover.tsx` — already pass `subFilter` through.
- Sub-category pill row — just shipped, untouched.
- Onboarding sub-type taxonomy — single source of truth, both UIs read from it.

### Validation

1. `/app/admin/discover` → click any Fashion item → drawer opens.
2. Below the existing "Explore Categories" row, the new **Sub-family (Fashion)** pill row shows: `[None] [Clothing] [Hoodies] …`.
3. Click *Hoodies* → Save → toast confirms; drawer reflects `DB Sub-family: hoodies`.
4. Open `/app/discover` → select **Fashion → Hoodies** → that item appears in the grid (precise match, not legacy fallback).
5. Switch the same item's family from Fashion to Beauty → Sub-family row instantly re-renders with `[None] [Skincare] [Makeup] [Fragrance]`; previous *Hoodies* selection auto-clears.
6. Open a Watches item → Sub-family row is hidden (only one sub-type).
7. Click **Auto-classify sub-family** in the toolbar → dry-run shows e.g. *"148 / 366 will be classified"* → confirm → counts persisted, drawer reflects new values.
8. Custom scenes promoted via the drawer also write `subcategory` to both `discover_presets` and `custom_scenes`.

