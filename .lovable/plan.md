

# Fix Category Mismatch in Admin "Add to Discover" & User "Submit to Discover" Modals

## Problem
The Discover feed now uses product-based categories (Fashion, Beauty, Fragrances, Jewelry, etc.) but the two modals still use the old style-based categories:

- **AddToDiscoverModal**: `cinematic, commercial, photography, styling, ads, lifestyle`
- **SubmitToDiscoverModal**: `editorial, commercial, lifestyle, fashion, campaign`

These don't match the Discover page categories: `fashion, beauty, fragrances, jewelry, accessories, home, food, electronics, sports, supplements`

## Changes

### 1. `src/components/app/AddToDiscoverModal.tsx` (line 11-13)
Replace old categories with product-based ones:
```ts
const CATEGORIES = [
  'fashion', 'beauty', 'fragrances', 'jewelry', 'accessories',
  'home', 'food', 'electronics', 'sports', 'supplements',
] as const;
```

### 2. `src/components/app/SubmitToDiscoverModal.tsx` (line 10-12)
Same replacement:
```ts
const CATEGORIES = [
  'fashion', 'beauty', 'fragrances', 'jewelry', 'accessories',
  'home', 'food', 'electronics', 'sports', 'supplements',
] as const;
```

### 3. Update AI auto-fill function
Both modals call `describe-discover-metadata` edge function which returns a category. Need to check if that function also uses old categories — if so, update the edge function's category list too.

### 4. Update default category
Both modals default to `'lifestyle'` which no longer exists. Change default to `'fashion'`.

Two files changed, ~4 lines each.

