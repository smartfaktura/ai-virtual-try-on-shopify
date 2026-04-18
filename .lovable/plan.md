

## Goal
On `/app/catalog/new` Step 1 (Products), remove the "My Products", "Import URL", and "Upload CSV" tabs entirely. Keep only the empty-state placeholder ("No products yet" + Add button) — and when products exist, just render the library view directly (no tab bar).

## Change
File: `src/components/app/catalog/CatalogStepProducts.tsx`

1. **Remove the tab bar** (lines 168-173) — no more `UnderlineTab` row.
2. **Remove the `activeTab === 'url'` block** (lines 427-449) — Import URL panel.
3. **Remove the `activeTab === 'csv'` block** (lines ~451-465) — Upload CSV panel.
4. **Unwrap the `activeTab === 'library'` conditional** (line 176) — render its contents directly so the placeholder + library grid are always shown.
5. Remove now-unused imports / state: `activeTab`, `setActiveTab`, `UnderlineTab` component, and unused icons (`Globe`, `Upload`) if no longer referenced after cleanup.

## Out of scope
- The "Add Your First Product" button + empty-state copy stay exactly as-is.
- No changes to header, badge, search bar, grid, or selection toolbar.

