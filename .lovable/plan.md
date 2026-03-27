

# Show All Discover Categories in Admin Metadata Dropdown

## Problem
The "Discover Category" dropdown in the admin metadata editor only shows the 10 product-focused categories from `PRODUCT_CATEGORIES`. But `DISCOVER_CATEGORIES` in `categoryConstants.ts` includes 8 additional style categories (`editorial`, `commercial`, `lifestyle`, `campaign`, `cinematic`, `photography`, `styling`, `ads`) that items can be tagged with. Items with those categories show a blank/mismatched value in the dropdown.

## Fix

**File: `src/components/app/DiscoverDetailModal.tsx`** (~line 354-362)

Replace the `PRODUCT_CATEGORIES` source with a combined list that includes all categories from `DISCOVER_CATEGORIES`:

```typescript
// Import DISCOVER_CATEGORIES alongside PRODUCT_CATEGORIES
import { PRODUCT_CATEGORIES, DISCOVER_CATEGORIES } from '@/lib/categoryConstants';

// Build full dropdown options: product categories + style categories not already covered
const ALL_DISCOVER_OPTIONS = [
  ...PRODUCT_CATEGORIES.filter(c => c.id !== 'any'),
  ...DISCOVER_CATEGORIES
    .filter(c => !PRODUCT_CATEGORIES.some(p => p.id === c))
    .map(c => ({ id: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
];
```

Then use `ALL_DISCOVER_OPTIONS` in the Select dropdown instead of `PRODUCT_CATEGORIES.filter(...)`.

**1 file changed, ~5 lines modified.**

