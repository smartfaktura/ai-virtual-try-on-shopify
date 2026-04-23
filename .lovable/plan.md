

## Polish corner radii & sizing in `/app/generate/product-images`

### 1. Step 1 — Search bar + Select All / Clear (in `ProductMultiSelect.tsx`)

Both inputs and buttons should match the rest of the platform (e.g. freestyle scene search): pill-shaped, `h-10`, slightly larger and consistent.

- **Search Input**: add `className="pl-9 h-10 rounded-full text-sm"` (currently default `rounded-lg`, no explicit height).
- **Select All button**: change `size="sm"` → `size="default"` (default is `h-10 rounded-full`).
- **Clear button**: same change → `size="default"`.

Result: search bar and both buttons share the same `h-10` height and `rounded-full` corners — visually balanced row.

### 2. Step 2 — Category placeholders corner radius (in `ProductImagesStep2Scenes.tsx`)

The Recommended category headers, Explore More 2-column trigger rows, and uncategorized rows currently use `rounded-lg`. Other prominent placeholder cards across the app (WorkflowCard, ModelFilterBar, etc.) use `rounded-xl` for a softer, more premium feel.

Change `rounded-lg` → `rounded-xl` in three places:
- `UnifiedCategorySectionWithSelectAll` header trigger (around line 788–792).
- `CategoryRowTrigger` button (line 653).
- (Verify no other category row uses `rounded-lg` — fix any sibling that does for consistency.)

The `SceneCard` keeps its existing `rounded-xl` (already correct).

### 3. Files touched

```text
EDIT  src/components/app/ProductMultiSelect.tsx
        - Input: pl-9 → "pl-9 h-10 rounded-full text-sm"
        - Select All: size="sm" → size="default"
        - Clear:      size="sm" → size="default"

EDIT  src/components/app/product-images/ProductImagesStep2Scenes.tsx
        - UnifiedCategorySectionWithSelectAll header: rounded-lg → rounded-xl
        - CategoryRowTrigger:                         rounded-lg → rounded-xl
```

### 4. Safety & performance

- Pure className changes. Zero logic, state, queries, or DB changes.
- No new components, no new imports.
- Existing keyboard focus rings, hover states, selected states all preserved (Tailwind classes additive).
- No risk to wizard flow or scene selection.

### 5. Validation

1. Step 1: search bar, Select All, Clear all render at `h-10` with pill corners — visually identical row.
2. Step 2: category cards (Shoes, Hoodies, Clothing & Apparel, Dresses, etc.) show softer `rounded-xl` corners matching other platform cards.
3. Hover, selected, and expanded states still render correctly.
4. Mobile + desktop layouts unchanged.

