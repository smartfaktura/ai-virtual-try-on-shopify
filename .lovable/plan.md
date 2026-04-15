

# Hide Paste Hint & Empty-State Sticky Bar on Mobile

## Changes

### 1. Hide clipboard paste hint on mobile/tablet
**File: `src/pages/ProductImages.tsx` (lines 1058-1061)**

Wrap the paste hint `<p>` with `hidden sm:block`:
```tsx
<p className="text-xs text-muted-foreground hidden sm:block">
  You can also paste an image from your clipboard{' '}
  <kbd ...>{PASTE_SHORTCUT}</kbd>
</p>
```

### 2. Hide sticky bar on mobile when no products selected (step 1)
**File: `src/pages/ProductImages.tsx` (line 1338)**

Add condition to hide on mobile when step is 1 and no products are selected:
```tsx
{step >= 1 && step <= 4 && !(step === 1 && selectedProducts.length === 0) && (
  <ProductImagesStickyBar ... />
)}
```

This keeps the bar visible on all devices once products are added, and always visible for steps 2-4.

## Files changed
- `src/pages/ProductImages.tsx` — 2 small edits

