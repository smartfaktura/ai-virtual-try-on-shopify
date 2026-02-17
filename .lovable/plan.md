

## Add "Create New Product" Button to Product Selection Step

### What Changes

Add a "+ Add New Product" card at the end of the product grid in the workflow product selection step (step 1). When clicked, it opens the existing `AddProductModal`. After a product is added, the product list refreshes automatically.

### File to Change

**`src/pages/Generate.tsx`**

1. **Import** `AddProductModal` from `@/components/app/AddProductModal` and add `useQueryClient` from `@tanstack/react-query`
2. **Add state**: `const [showAddProduct, setShowAddProduct] = useState(false)` 
3. **Add query client**: `const queryClient = useQueryClient()` for invalidating the product list after adding
4. **In the try-on product grid** (line ~1067-1091): After the product cards loop, add a "+ Add New Product" button card styled as a dashed-border placeholder that opens the modal
5. **In the non-try-on product grid** (line ~1092-1099): Add the same button below or beside the `ProductMultiSelect`
6. **Render the modal** with `onProductAdded` callback that invalidates the `['user-products']` query so the list refreshes
7. **In the empty state** (lines 1048-1065): Also add an inline button to open the modal instead of navigating away to `/app/products`

### Visual Design

The "+ Add New Product" card will match the existing product card grid style:
- Same size as other product cards
- Dashed border with muted styling
- Plus icon centered with "Add New" label below
- On click, opens the Add Product modal inline (no page navigation needed)

### Technical Detail

- Reuses the existing `AddProductModal` component (already has Upload, Store URL, CSV, and Mobile tabs)
- Uses `queryClient.invalidateQueries({ queryKey: ['user-products'] })` to refresh the grid after a product is added
- No new components or database changes needed

