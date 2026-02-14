

## Fix Mirror Selfie Set: Multi-Product Flow and Scene Preview Generation

### Problem 1: Multi-product selection goes to bulk instead of scenes

Currently at line 1047, when 2+ products are selected, the code navigates to `/app/generate/bulk`. For the Mirror Selfie Set, it should instead continue to the Scenes step with all selected products.

**Fix in `src/pages/Generate.tsx`**:
- In the product "Continue" button handler (~line 1013-1051), add a `isMirrorSelfie` check before the bulk redirect
- When Mirror Selfie + multiple products: store all selected products (not just one), set `mirrorSettingsPhase` to `'scenes'`, and navigate to `settings` step
- Add a new state `selectedProducts` (array) to hold multiple products for mirror selfie
- Update the product summary card in the scenes step to show all selected products (not just one)
- Update `handleWorkflowGenerate` to pass all product images to the payload

### Problem 2: Scene preview images not generated

The scenes show gradient fallbacks because no one has triggered the `generate-scene-previews` edge function for the Mirror Selfie Set workflow yet. The "Regenerate Previews" button exists but is admin-only and hasn't been clicked.

**Fix**: After making the code changes, we will invoke the `generate-scene-previews` edge function directly with the Mirror Selfie Set workflow ID to generate all 16 AI preview images. This is a one-time operation that populates the `preview_url` field for each variation in the database.

### Technical Changes

**`src/pages/Generate.tsx`**:

1. **Add multi-product state**: Add `const [mirrorSelectedProducts, setMirrorSelectedProducts] = useState<Product[]>([]);` to track multiple products for mirror selfie

2. **Fix product Continue handler** (around line 1013-1051): Before the `selected.length > 1 => bulk` redirect, add:
```typescript
if (isMirrorSelfie) {
  // Store all selected products, set first as primary
  setMirrorSelectedProducts(selected);
  setSelectedProduct(selected[0]);
  if (selected[0].images.length > 0) {
    setSelectedSourceImages(new Set([selected[0].images[0].id]));
  }
  setMirrorSettingsPhase('scenes');
  setCurrentStep('settings');
  return; // Don't go to bulk
}
```

3. **Update product summary in scenes step**: Show all mirror-selected products (thumbnails row) instead of just one, so the user sees "2 products selected for mirror selfie"

4. **Update workflow payload**: In `handleWorkflowGenerate`, when `isMirrorSelfie` and multiple products, include all product images in the payload

**Edge function invocation**: After deploying, call `generate-scene-previews` with the Mirror Selfie Set workflow ID to populate all 16 scene preview images.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` | Add `mirrorSelectedProducts` state; fix multi-product Continue to go to scenes instead of bulk; update product summary to show all selected products; update payload for multi-product |
| Edge function call | Invoke `generate-scene-previews` for Mirror Selfie Set to populate preview images |

