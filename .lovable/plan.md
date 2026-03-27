

# Fix: Remaining Category Label Mismatches

## Problem
When a category gets saved using its full display label (e.g. "Fashion & Apparel" instead of "fashion"), the Discover filter can't match it. We fixed "Beauty & Skincare" already, but 5 other full-label variants are still missing from `PRODUCT_CATEGORY_MAP`.

Missing aliases:
- `"Fashion & Apparel"` → should map to `['fashion']`
- `"Home & Decor"` → should map to `['home']`
- `"Food & Beverage"` → should map to `['food']`
- `"Sports & Fitness"` → should map to `['sports']`
- `"Health & Supplements"` → should map to `['supplements']`

## Fix

Add these 5 entries to `PRODUCT_CATEGORY_MAP` in all 3 files:
- `src/pages/Discover.tsx`
- `src/pages/PublicDiscover.tsx`
- `src/components/app/DashboardDiscoverSection.tsx`

```typescript
'Fashion & Apparel': ['fashion'],
'Home & Decor': ['home'],
'Food & Beverage': ['food'],
'Sports & Fitness': ['sports'],
'Health & Supplements': ['supplements'],
```

5 lines added per file, 3 files changed.

## Bonus: DRY improvement (optional)
All three files have identical `PRODUCT_CATEGORY_MAP` definitions. Could extract to a shared constant in `src/lib/categoryConstants.ts` alongside the existing `PRODUCT_CATEGORIES`. This would prevent future drift. Can do this as a follow-up if desired.

