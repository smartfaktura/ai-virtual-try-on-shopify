

## Fix: Mirror Selfie Not Initializing Product Queue on Multi-Select

### Root Cause
In `src/pages/Generate.tsx` lines 1859-1864, the Mirror Selfie "Continue" handler skips multi-product queue initialization. It sets `selectedProduct` to the first product but never calls `setProductQueue(selected)`, `setCurrentProductIndex(0)`, or `setMultiProductResults(new Map())`. Since `isMultiProductMode` depends on `productQueue.length > 1` (line 228), the Scenes step only shows 1 product.

### Fix — 1 file

**`src/pages/Generate.tsx` (lines 1859-1864)**

Add product queue initialization before navigating to scenes when multiple products are selected:

```typescript
if (isMirrorSelfie) {
  setSelectedProduct(selected[0]);
  if (selected[0].images.length > 0) setSelectedSourceImages(new Set([selected[0].images[0].id]));
  // Initialize multi-product queue if multiple selected
  if (selected.length > 1) {
    setProductQueue(selected);
    setCurrentProductIndex(0);
    setMultiProductResults(new Map());
  } else {
    setProductQueue([]);
  }
  setMirrorSettingsPhase('scenes');
  setCurrentStep('settings');
  return;
}
```

This ensures `productQueue` is populated, making `isMultiProductMode` true, which activates the multi-product summary banner on the Scenes and Model steps and the correct credit multiplier display.

