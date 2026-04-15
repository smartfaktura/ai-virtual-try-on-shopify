

# Merge Wallet Categories into "Wallets & Cardholders"

## Problem
The database has two `category_collection` values for wallet scenes:
- `wallets-cardholders` — the canonical category with a title in `TITLE_MAP`
- `wallets` — a separate slug that shows as its own section

## Solution

**File: `src/hooks/useProductImageScenes.ts`**

Add one entry to the existing `COLLECTION_MERGE` map:

```typescript
const COLLECTION_MERGE: Record<string, string> = {
  "snacks-food": "food",
  "food-beverage": "food",
  "wallets": "wallets-cardholders",  // ← add this
};
```

This merges all wallet scenes under the single "Wallets & Cardholders" heading already defined in `TITLE_MAP`.

**File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`**

Check if `CATEGORY_ALIASES` also needs a `"wallets": "wallets-cardholders"` entry for the product-to-category detection path.

## Impact
- One-line addition to `COLLECTION_MERGE`
- All wallet/cardholder scenes appear under a single "Wallets & Cardholders" section

