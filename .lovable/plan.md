

# Fix: Accessories & Styling hidden when model is selected

## Problem
Line 2046 in `ProductImagesStep3Refine.tsx` wraps `InlinePersonDetails` in a `{!details.selectedModelId ? ... : null}` conditional. When a user picks a specific model, the entire "Accessories & Styling" section (Hand Style, Nails, Jewelry, Accessories) vanishes. This is incorrect — those settings are still relevant regardless of which model is selected.

## Fix

### File: `src/components/app/product-images/ProductImagesStep3Refine.tsx` (~lines 2045-2056)

**Always render `InlinePersonDetails`**, removing the `selectedModelId` gate. Only the "Person details (auto-selected)" label should be conditional — when a model is selected, skip the label but still show the Accessories & Styling fields.

Change from:
```tsx
{!details.selectedModelId ? (
  <div className="space-y-2">
    <span className="text-xs ...">Person details (auto-selected)</span>
    <InlinePersonDetails ... />
  </div>
) : null}
```

To:
```tsx
{!details.selectedModelId && (
  <span className="text-xs font-semibold text-muted-foreground">Person details (auto-selected)</span>
)}
<InlinePersonDetails
  details={details}
  update={update}
  outfitAccessories={details.outfitConfig?.accessories}
  onAccessoriesChange={(v) => update({ outfitConfig: { ...details.outfitConfig, accessories: v } })}
/>
```

This ensures Hand Style, Nails, Jewelry, and Accessories are always visible in the On-Model section, whether or not a specific model is selected.

## Files

| File | Change |
|---|---|
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | Remove `selectedModelId` gate around `InlinePersonDetails` |

