
## Add (non-autofocus) search to "Select a product" modal

Add a search input to the product picker modal so users can filter products by name, but **don't autofocus** it on open — it stays passive until the user clicks/taps it. This avoids keyboards popping up on mobile and keeps the modal feeling calm.

### Edit — `src/components/app/freestyle/ProductCatalogModal.tsx`

(The modal that backs "Select a product" in `/app/freestyle`.)

1. **Add search state** at the top of the component:
   - `const [search, setSearch] = useState('')`
   - Reset to `''` inside the existing `onOpenChange` close handler so it doesn't persist between opens.

2. **Render a search `Input`** directly under the modal header (above the product grid / sidebar split), styled like the Library picker pattern already used elsewhere:
   - Left-aligned `Search` icon (lucide), `pl-9 h-9 text-sm`, placeholder `Search your products…`.
   - **No `autoFocus`** prop — explicitly omitted so the field stays inert until clicked.
   - Wrapped in the same horizontal padding as the rest of the modal body for alignment.

3. **Filter the product list** before it's rendered:
   - Derive `filteredProducts = products.filter(p => p.title?.toLowerCase().includes(search.trim().toLowerCase()))` (also match against `productType` / category label if present, so "shoe" surfaces shoes).
   - Pass `filteredProducts` to the existing grid renderer instead of `products`.

4. **Empty state** when search yields nothing:
   - Reuse the existing empty-state visual block (icon + muted text), with copy: `No products match "{search}"` and a small ghost button `Clear search` that resets `setSearch('')`.

5. **Keep mobile behaviour identical**: same drawer, same sidebar, same footer — only the new input row is added. Because there's no autofocus, the mobile keyboard won't open until the user taps the field.

### Validation

- Open "Select a product" → search field is visible and **not focused** (cursor stays on the modal, no keyboard on mobile).
- Type "shoe" → grid filters live; clearing the field restores full list.
- Close + reopen → search resets to empty.
- Sidebar filters (categories) and search compose naturally (filter applies on top of the current category view).

### Untouched

- Product card rendering, selection logic, footer "Use product" bar, sidebar categories, mobile drawer chrome, all upstream callers.

### Note
Your message was cut off after "Also" — once you share the second request I'll fold it into the same change (or a separate plan if it's unrelated).
