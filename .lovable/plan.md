

# Prevent Mixed Category Conflicts in Bulk Generation

## Problem Analysis

The current system allows selecting products from completely different categories in bulk mode (e.g., Leggings + Vitamins + Candles). While each product is processed individually (no actual mixing), they ALL share the same template settings - which causes issues:

- A "Clothing Studio" template applied to supplements looks wrong
- A "Food Rustic" template applied to cosmetics is inappropriate  
- Virtual Try-On mode selected for non-wearable items will fail

## Solution: Category Validation with Smart Warnings

### Approach 1: Same-Category Enforcement (Recommended)

Add validation to ensure all selected products belong to compatible categories:

```text
User selects: Leggings + Hoodie + Sports Bra → ALLOWED (all Clothing)
User selects: Leggings + Vitamin C Serum → BLOCKED with explanation
```

### Implementation

**File: `src/components/app/ProductMultiSelect.tsx`**

Add category validation logic:

1. Detect the category of first selected product
2. When selecting additional products, check if they match
3. Show warning banner if mismatched category is attempted
4. Disable selection of incompatible products (gray them out)

```tsx
// Add category detection helper
const getProductCategory = (product: Product): string => {
  const type = product.productType.toLowerCase();
  if (type.includes('legging') || type.includes('hoodie') || type.includes('bra') || ...) return 'clothing';
  if (type.includes('serum') || type.includes('cream') || type.includes('lipstick')) return 'cosmetics';
  // etc.
  return 'unknown';
};

// In ProductMultiSelect component:
// - Track dominant category from first selection
// - Show warning banner when mixing categories
// - Visually indicate which products are compatible
```

**File: `src/pages/Generate.tsx`**

Add category mismatch detection before navigating to bulk:

```tsx
// Before navigate('/generate/bulk', { state: { selectedProducts } }):
const categories = new Set(selectedProducts.map(p => detectProductCategory(p)));
if (categories.size > 1) {
  toast.warning('Selected products are from different categories. Using shared template may produce inconsistent results.');
}
```

**Visual Changes:**

1. Show category badge next to selection count: `3 selected (Clothing)`
2. Gray out products from other categories after first selection
3. Add "Mix categories" toggle for power users who understand the trade-off

### Alternative Approach: Warning Only

Instead of blocking, show a clear warning:

```text
+---------------------------------------------------+
| ⚠️ Mixed Categories Detected                       |
|                                                   |
| You've selected products from different           |
| categories: Clothing, Supplements                 |
|                                                   |
| The same template will be applied to all          |
| products. For best results, select products       |
| from the same category.                           |
|                                                   |
| [Continue Anyway] [Clear Selection]              |
+---------------------------------------------------+
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/app/ProductMultiSelect.tsx` | Add category validation, visual feedback |
| `src/pages/Generate.tsx` | Add warning before bulk navigation |
| `src/pages/BulkGenerate.tsx` | Show category info in settings step |

## Implementation Details

### ProductMultiSelect.tsx Changes

```tsx
interface ProductMultiSelectProps {
  products: Product[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  enforceSameCategory?: boolean; // NEW: Option to enforce matching
}

// Inside component:
const selectedProducts = products.filter(p => selectedIds.has(p.id));
const dominantCategory = selectedProducts.length > 0 
  ? detectProductCategory(selectedProducts[0]) 
  : null;

const isCategoryMismatch = selectedProducts.length > 1 && 
  new Set(selectedProducts.map(p => detectProductCategory(p))).size > 1;

// In render:
{isCategoryMismatch && (
  <Banner tone="warning">
    <Text as="p" variant="bodySm">
      Products from different categories selected. Templates may not suit all items.
    </Text>
  </Banner>
)}

// When rendering product cards:
const productCategory = detectProductCategory(product);
const isIncompatible = dominantCategory && productCategory !== dominantCategory && !selectedIds.has(product.id);

<div className={`... ${isIncompatible ? 'opacity-50' : ''}`}>
```

### Generate.tsx Changes

```tsx
// In the "Continue" button onClick (around line 750):
onClick={() => {
  const selectedProducts = mockProducts.filter(p => selectedProductIds.has(p.id));
  
  if (selectedProducts.length >= 2) {
    // Check category consistency
    const categories = new Set(selectedProducts.map(p => detectProductCategory(p)));
    if (categories.size > 1) {
      toast.warning(
        'Products from different categories selected. The same template will be applied to all.',
        { duration: 5000 }
      );
    }
    
    navigate('/generate/bulk', { state: { selectedProducts } });
  } else {
    // Single product flow...
  }
}}
```

## Result

After implementation:
- Clear visual feedback showing which products are compatible
- Warning when mixing categories (user can still proceed)
- Better user understanding of how bulk generation works
- Prevents confusion about "conflicting" products

