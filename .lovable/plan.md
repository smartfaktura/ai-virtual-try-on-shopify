## Goal
When the user's onboarding sub-type maps inside a family (e.g. Swimwear → Fashion), keep showing the family chip ("Fashion") but **pre-filter the grid to that sub-type** so Steal the Look reflects what they actually sell.

## Scope
Single file: `src/components/app/DashboardDiscoverSection.tsx`. No taxonomy, onboarding writer, or DB changes.

## Changes

1. **Track preferred sub-type** alongside `defaultCategory`:
   - From `profile.product_subcategories[0]`, remember the slug itself (e.g. `swimwear`) as `defaultSubtype` when its mapped family exists in `CATEGORIES`.
   - Otherwise `defaultSubtype = '__all__'`.

2. **Active sub-filter**:
   - Add `selectedSub` state, default `null`.
   - `activeSub = selectedSub ?? (activeCategory === defaultCategory ? defaultSubtype : '__all__')`.
   - When the user switches family chip, reset `selectedSub` to `null` so the new family opens on `__all__`.

3. **Apply sub-filter to the grid**:
   - Replace `itemMatchesDiscoverFilter(item.data, activeCategory, '__all__')` with `itemMatchesDiscoverFilter(item.data, activeCategory, activeSub)`.

4. **Render `DiscoverSubCategoryBar`** under the family chips, only when `isMultiSubFamily(activeCategory)` is true (already imported). Wire `selected={activeSub}` and `onSelect={setSelectedSub}`. Sub-types come from `getDiscoverSubtypes(activeCategory)`.

5. **Graceful fallback**: if the sub-filtered grid is empty (e.g. no Swimwear presets yet), automatically fall back to `__all__` within the same family rather than showing the empty state — so the user still sees Fashion looks instead of an empty section. (Computed in the `filtered` memo.)

6. **Keep**: 12-item cap, skeleton count, dashboard order, all data fetches.

## Result for the user
- Selected Swimwear in onboarding → chip stays on **Fashion** (correct, Swimwear isn't a top-level family), but the grid is narrowed to **Swimwear** looks. A sub-row appears with `All / Swimwear / Dresses / Hoodies / ...` so they can broaden.
- If no Swimwear items exist yet, the grid silently falls back to all Fashion items (no empty state).

## Out of scope
Promoting Swimwear to its own Discover family, onboarding writers, Fresh Scenes, layout changes, RLS, DB.

## Risk
Low. Pure presentation logic in one component. Empty-state fallback prevents regressions when a sub-type has no tagged items yet.