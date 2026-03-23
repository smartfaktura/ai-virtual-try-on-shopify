

# Move Tips Below Form on Mobile

## Changes

### `src/pages/AddProduct.tsx`

On mobile, hide `ProductUploadTips` from its current position (above tabs) and show it after the tabs content instead. On desktop, keep it where it is.

**Line 69**: Wrap in `hidden sm:block`:
```tsx
<div className="hidden sm:block">
  <ProductUploadTips />
</div>
```

**After line 141** (after the closing `</div>` of tabs content, before `</Tabs>`): Add mobile-only tips:
```tsx
<div className="sm:hidden mt-6">
  <ProductUploadTips />
</div>
```

This places tips after the form/upload area + Add Product button on mobile, while keeping them at the top on desktop.

### File
- `src/pages/AddProduct.tsx` — lines 69 and after 141

