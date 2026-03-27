

# Admin Product Picker: Select from Library

Replace the manual product name + URL inputs with a dropdown that fetches the admin's own `user_products`, matching the pattern already used for model and scene selectors.

## Changes

### File: `src/components/app/DiscoverDetailModal.tsx`

1. **Fetch admin's products** — Add a `useQuery` for `user_products` (same pattern as workflows query, lines 90-96):
   ```ts
   const { data: myProducts } = useQuery({
     queryKey: ['my-products'],
     queryFn: async () => {
       const { data } = await supabase.from('user_products').select('id, title, image_url').order('created_at', { ascending: false });
       return data ?? [];
     },
     enabled: !!isAdmin,
   });
   ```

2. **Replace the two text inputs** (lines 340-353) with a single `<Select>` dropdown that lists the admin's products with thumbnail + name (same visual pattern as model/scene selectors). Include a "None" and "Custom" option.

3. **State changes** — Keep `editProductName` and `editProductImageUrl` but auto-populate them when a product is selected from the dropdown. Add `editProductSource` state (`'none' | 'custom' | productId`).

4. **When "Custom" is selected** — Show the existing manual text inputs as a fallback.

5. **On save** — The existing `generate-discover-preview` call already handles creating a safe public preview from the selected product's `image_url`. No backend changes needed.

