## Reorder sub-pill to surface user's preference first

In `src/components/app/DashboardDiscoverSection.tsx`, update the `subcategoryItems` memo so when `activeCategory === defaultCategory` and `defaultSubtype !== '__all__'`, the matching sub-pill is moved to the front of the array.

The `DiscoverSubCategoryBar` always prepends "Featured", so the preferred sub (e.g. Swimwear) will render in slot 2 — immediately visible without horizontal scrolling.

### Behavior
- Default family (e.g. Fashion) → Featured · **Swimwear** · Dresses · Jeans · …
- User switches to another family → sub list keeps its natural taxonomy order (reorder only applies to preferred family).
- No taxonomy, filter, or selection logic changes.

### Scope
- One file, one memo.
- No changes to `DiscoverSubCategoryBar`, taxonomy, or filter logic.

### Risk
Minimal — pure array reorder.
