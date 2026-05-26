## Step 1 (Product) polish + stepper mobile fix

### 1. Hide search input when library is small — `src/pages/ProductImages.tsx` (~line 1434)

Wrap the search `<Input>` block in `userProducts.length >= 5`. Keep Select All / Clear visible. When search is hidden, the action buttons left-align instead of sitting on the right of the search field.

### 2. Move the Free-plan banner below the product grid — `src/pages/ProductImages.tsx`

- Remove the banner currently at lines 1418–1431 (above the toolbar).
- Re-render it AFTER the products grid block (after the `)()}` that closes the grid renderer, before Step 1 closes around line ~1700+, located right under the products list / "load more" sentinel).
- Round corners: change `rounded-lg` → `rounded-2xl`, and bump padding to `px-4 py-3` for a softer card feel.

### 3. Mobile stepper connector alignment — `src/components/app/catalog/CatalogStepper.tsx`

Mobile block (lines 64–110): each item is `flex items-center` containing a `flex-col` button (icon + label). The connector therefore aligns to the vertical center of icon+label, which falls between the circle and the label.

Fix: switch the row to `items-start` and add `mt-5` to the connector (`h-10` circle = 40px, center = 20px). Result: lines pass through the horizontal center of the circles like in the reference screenshot.

```tsx
<div className="flex items-start justify-between">
  ...
  <div className={cn('flex-1 h-px mx-0.5 mt-5 transition-colors', ...)} />
```

No logic changes. Only Step 1 layout + stepper presentation.