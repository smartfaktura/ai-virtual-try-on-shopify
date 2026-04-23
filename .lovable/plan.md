

## Rename "All" sub-category chip to "Featured"

### Why
On `/app/discover` the top bar already has an "All" family chip. The sub-category row underneath also starts with "All", which is redundant and reads as a duplicate filter. Renaming the sub-row's first chip to "Featured" removes the duplication and gives it a clearer meaning (the curated default view within the selected family).

### Change

**File:** `src/components/app/DiscoverSubCategoryBar.tsx`

- Line ~67: change the prepended item from `{ id: '__all__', label: 'All' }` to `{ id: '__all__', label: 'Featured' }`.
- No id/value change — `__all__` stays as the underlying sentinel so all filtering logic, URL state, and parent components continue to work unchanged.

### Out of scope
- No change to the top family bar (still shows "All").
- No change to the second-level sub-category chips inside `SceneBrowserModal` (different surface, unrelated).
- No copy/style changes elsewhere.

