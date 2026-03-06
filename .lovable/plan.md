

## Improve Product Selection UX for Try-On Workflows

### Changes to `src/pages/Generate.tsx`

**1. Add search bar** — Add an `Input` with search icon above the product grid. Filter `userProducts` by title/product_type matching the search query. Import `Input` from `@/components/ui/input` and `Search` icon (already imported as it's not — need to check, but lucide icons are available).

**2. Add toolbar row** with:
- Search input (left, flex-1)
- Select All / Clear All buttons (right)
- Grid/List view toggle (two icon buttons: `LayoutGrid` + `List` icons from lucide)

**3. Add view mode state** — `const [productViewMode, setProductViewMode] = useState<'grid' | 'list'>('grid')`

**4. Improve checkbox styling** — Replace the floating `bg-white/90 rounded shadow-sm p-0.5` box with a cleaner overlay: semi-transparent dark overlay in the top-left corner with a white checkbox icon, only visible on hover or when selected. Use a gradient overlay approach:
- Always show a subtle top-left gradient overlay on the card
- Show a check circle icon (filled primary when selected, outline when hovered)
- Remove the boxy white container look

**5. List view** — When `productViewMode === 'list'`, render products as horizontal rows instead of grid cards:
- Each row: small thumbnail (48×48), title, product type, checkbox on the right
- Compact, scannable format for users with many products

**6. Select All / Clear All logic**:
- "Select All" selects all visible (filtered) products up to `MAX_PRODUCTS_PER_BATCH`
- "Clear" deselects all

### Scope
All changes in `src/pages/Generate.tsx` only — the try-on product section (lines ~1756-1815). No new components needed.

