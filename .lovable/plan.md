

## Fix: Products not refreshing after import

**Root cause**: `AddProduct.tsx` calls `navigate('/app/products')` on product added, but never invalidates the `['user-products']` query cache. The Products page then shows stale cached data.

**Fix**: Add `useQueryClient` in `AddProduct.tsx` and invalidate `['user-products']` and `['product-image-counts']` queries in `handleDone` before navigating.

### Change: `src/pages/AddProduct.tsx`

- Import `useQueryClient` from `@tanstack/react-query`
- In `handleDone`, call `queryClient.invalidateQueries({ queryKey: ['user-products'] })` and `queryClient.invalidateQueries({ queryKey: ['product-image-counts'] })` before navigating

```tsx
const queryClient = useQueryClient();

const handleDone = () => {
  queryClient.invalidateQueries({ queryKey: ['user-products'] });
  queryClient.invalidateQueries({ queryKey: ['product-image-counts'] });
  navigate('/app/products');
};
```

Single file change, minimal and targeted.

