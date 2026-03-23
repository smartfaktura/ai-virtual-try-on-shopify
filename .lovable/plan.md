

# Fix: Product Pre-selection from StartWorkflowModal

## Problem
The `StartWorkflowModal` navigates to `/app/generate/{slug}?product={id}`, but `Generate.tsx` never reads the `product` query parameter. The page always starts at step `'source'`, so the user lands on "How do you want to start?" instead of having their product pre-selected and being on the model/settings step.

## Solution

### `src/pages/Generate.tsx` (~20 lines added)

**1. Read the `product` query param** (alongside existing `template`, `model`, `scene` params):
```tsx
const prefillProductId = searchParams.get('product');
```

**2. Add a `useEffect` that auto-selects the product** once `userProducts` have loaded and the workflow is resolved:

- If `prefillProductId` starts with `sample_` → match against `SAMPLE_TRYON_PRODUCT`, `SAMPLE_LISTING_PRODUCT`, `SAMPLE_UGC_PRODUCT`, `SAMPLE_MIRROR_PRODUCT`
- Otherwise → find the matching `userProducts` entry and call `mapUserProductToProduct()`
- Set `selectedProduct`, `selectedSourceImages`, `sourceType('products')`
- Then advance the step using the same logic as `handleSelectProduct`:
  - Skip brand profile (for modal-initiated flows)
  - For try-on/UGC workflows → go to `'model'` step
  - For workflows with config that skips template → go to `'settings'`
  - Otherwise → go to `'template'` or `'mode'`
- Use a ref to ensure this only fires once

**3. Handle the `selectedProductIds` Set** for try-on workflows - pre-add the product ID so multi-select state is consistent.

### Files
- `src/pages/Generate.tsx` - read `product` param, add auto-select effect (~20 lines)

