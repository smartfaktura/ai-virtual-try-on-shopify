

## Fix: Sub-family pill should hide legacy untagged items once any item in that family is tagged

### Root cause

Two compounding bugs in the Activewear sub-pill view:

**1. Legacy fallback over-matches.** `itemMatchesDiscoverFilter` (in `src/lib/discoverTaxonomy.ts`, lines 103–106) currently says: *"if an item has no `subcategory`, surface it under any sub-pill within its family"*. This was added to avoid hiding old data, but it means clicking *Activewear* still shows all 92 fashion items that have `subcategory=NULL` — drowning the one item you actually tagged (`Pilates Studio Glow`).

**2. Featured pin amplifies it.** Featured items sort to the top regardless of the active filter. 9 of the currently-featured Fashion items have `subcategory=NULL`, so they pass the legacy fallback and pin above your single tagged Activewear item — pushing it off the first screen.

### Verified data state

```text
Fashion items total           : 93
  └─ subcategory='activewear' : 1   ← "Pilates Studio Glow" (featured)
  └─ subcategory=NULL         : 92  ← all surfacing under every sub-pill
Featured Fashion items        : ~30, all subcategory=NULL except Pilates
```

So clicking *Activewear* today renders ~30 NULL-subcategory featured items first, then ~62 NULL items, with Pilates somewhere in the middle.

### The fix — make the legacy fallback **family-scoped, not sub-pill-scoped**

Change the rule to: *"NULL-subcategory items are visible in the family's `All` view, but **not** under specific sub-pills once that sub-pill is selected."*

Once an admin starts tagging items (which you've now begun), users picking a specific sub-pill expect precise filtering. Untagged legacy items still appear under the family's *All* tab, so nothing is hidden globally.

**File:** `src/lib/discoverTaxonomy.ts` — replace lines 103–106:

```ts
// Before
if (sub) return sub === subFilter.toLowerCase();
return true;  // legacy fallback — TOO PERMISSIVE

// After
return sub === subFilter.toLowerCase();
// Items without a subcategory are only shown under the family's __all__ tab.
// Admins can backfill via the Auto-classify button to surface them under sub-pills.
```

That's the entire functional change. The `__all__` path (line 101) is unchanged, so the family-wide *All* sub-pill keeps showing every item including untagged ones.

### Behaviour after fix

| Tab | Before | After |
|---|---|---|
| Fashion → All | 93 items (correct) | 93 items (unchanged) |
| Fashion → Activewear | 93 items, Pilates buried | **1 item: Pilates Studio Glow** |
| Fashion → Clothing | 93 items | 0 items (until you tag some) |
| Fashion → Hoodies | 93 items | 0 items (until you tag some) |

Empty sub-pills are **the correct signal** — they tell you "this sub-family has no curated content yet, go tag some in admin or run Auto-classify."

### Optional polish (recommended, ~10 lines)

Add a friendly empty state when a sub-pill returns 0 results, so it doesn't look broken:

**File:** `src/pages/Discover.tsx` — after the grid, before the modal:

```tsx
{sorted.length === 0 && selectedCategory !== 'all' && selectedSubcategory !== '__all__' && (
  <div className="py-16 text-center text-muted-foreground text-sm">
    No items tagged for this sub-family yet.
    {isAdmin && ' Use Auto-classify or tag items individually in the admin drawer.'}
  </div>
)}
```

Apply the same block to `src/pages/PublicDiscover.tsx` (without the admin hint) for parity.

### What does **not** change

- DB schema, RLS, the new `subcategory` column, the backfill edge function — untouched.
- Featured-items pinning logic — featured items still sort first, but **only among items that pass the filter**, so Pilates (the only featured-Activewear item) becomes the #1 card under Activewear.
- The `__all__` family view (Fashion → All) keeps the existing inclusive behaviour — no regression for untagged content.
- Sub-pill row, family pill row, sort order, "For you" personalization — untouched.

### Validation

1. `/app/discover` → **Fashion** → **All** → still ~93 items, featured pinned (unchanged).
2. `/app/discover` → **Fashion** → **Activewear** → **only "Pilates Studio Glow" appears** (currently buried).
3. `/app/discover` → **Fashion** → **Clothing** → empty state: *"No items tagged for this sub-family yet…"*
4. Tag any Fashion item as Clothing in the admin drawer → it appears immediately under the Clothing pill.
5. `/discover` (public) → same behaviour, no admin hint in empty state.
6. Run **Auto-classify sub-family** → previously-empty sub-pills populate as items get tagged automatically.

### Files touched

```text
EDIT  src/lib/discoverTaxonomy.ts   (3 lines — remove legacy NULL fallback)
EDIT  src/pages/Discover.tsx        (~6 lines — empty state)
EDIT  src/pages/PublicDiscover.tsx  (~4 lines — empty state, no admin hint)
```

