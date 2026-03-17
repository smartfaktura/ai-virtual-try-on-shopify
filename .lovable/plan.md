

## Fix: Product Listing Set Workflow Routing for Clothing Products

### Problem
In `handleProductSelect`, the `isClothingProduct()` check (line 626) runs before the workflow's `skip_template` config check (line 628). This means selecting any clothing/fashion product in the "Product Listing Set" workflow incorrectly routes to the Virtual Try-On mode selection instead of the scenes/settings step.

The `handleBrandProfileContinue` function (line 636) already has the correct order — workflow config first, then clothing check.

### Fix — `src/pages/Generate.tsx`

**Swap lines 626-631** so `skip_template` is checked before `isClothingProduct`:

```
// Before (wrong order):
} else if (isClothingProduct(product)) {
  setCurrentStep('mode');
} else if (uiConfig?.skip_template && hasWorkflowConfig) {
  setCurrentStep('settings');
}

// After (correct order — matches handleBrandProfileContinue):
} else if (uiConfig?.skip_template && hasWorkflowConfig) {
  setCurrentStep('settings');
} else if (isClothingProduct(product)) {
  setCurrentStep('mode');
}
```

Single file, two-line swap. No other changes needed.

