

# Add Delete Confirmation Dialog to Products Page

## Problem
Delete buttons on the Products page (`/app/products`) fire immediately on click — no confirmation. Easy to accidentally delete a product, especially on mobile where the trash icon is always visible.

## Solution
Add an `AlertDialog` confirmation step before deleting. When the user clicks the trash icon, store the product ID in state and open the dialog. Only proceed with deletion when they confirm.

### Changes — Single file: `src/pages/Products.tsx`

1. **Import `AlertDialog` components** from `@/components/ui/alert-dialog`
2. **Add state**: `const [deleteTarget, setDeleteTarget] = useState<string | null>(null)`
3. **Replace direct delete calls** (lines 289, 368): change `onClick={() => deleteMutation.mutate(product.id)}` to `onClick={() => setDeleteTarget(product.id)}`
4. **Add AlertDialog at bottom of JSX**:
   - Title: "Delete this product?"
   - Description: "This will permanently remove the product and cannot be undone."
   - Cancel button + destructive "Delete" confirm button
   - On confirm: call `deleteMutation.mutate(deleteTarget)` and reset state
   - Open state tied to `deleteTarget !== null`

