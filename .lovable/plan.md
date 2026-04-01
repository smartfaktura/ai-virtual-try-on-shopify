

# CatalogStepProducts — Complete Frontend Redesign

## Problems with Current UI
- Product cards are plain boxes with tiny text, no visual hierarchy
- Toolbar feels cramped — search, select all, view toggle all jammed together
- Selection state is weak — just a thin ring, no satisfying feedback
- Empty placeholder cards look broken (no shimmer fallback visible)
- Tab bar (My Products / Import URL / Upload CSV) is generic and flat
- No visual delight — no micro-animations, no branded touches
- "Add New" card blends in too much with product cards
- Selection counter is tiny and easy to miss

## Design Direction
Premium editorial product picker with:
- **Frosted glass toolbar** with rounded search, pill-style view toggle
- **Taller product cards** with soft shadow on hover, smooth scale-up, gradient overlay on selection
- **Prominent selection badge** — top-right numbered circle (not a generic checkmark)
- **Floating selection bar** at bottom when products are selected — shows count + "Next" CTA (like a cart bar)
- **Better empty state** with illustration and branded copy
- **Refined tabs** with underline style instead of filled pills
- **Skeleton loading cards** that match the final card dimensions

## File to Modify
`src/components/app/catalog/CatalogStepProducts.tsx` — full rewrite

## Detailed Changes

### 1. Loading State
Replace spinner with 8 skeleton cards matching the grid layout (4-col, aspect-square + text area).

### 2. Header
Remove the plain h3/p. Replace with a more refined section:
- "Choose your products" as text-lg font-medium
- Subtle product count badge: "12 products available"

### 3. Tabs
Switch from filled `TabsList` to an underline-style tab bar using border-bottom highlight. Cleaner, more editorial.

### 4. Toolbar
- Search input: taller (h-10), rounded-xl, with subtle bg-muted/50 background, no visible border until focus
- View toggle: pill-shaped with bg-muted background, smooth transition
- Select All / Clear: move into a row below search, with "X of Y selected" inline text
- Remove the cramped single-row layout

### 5. Grid Cards (the main redesign)
- **Aspect ratio**: Keep square but add 12px padding inside card for breathing room around the image
- **Image container**: rounded-lg with bg-muted/30 fallback color (so empty loads look intentional)
- **Hover**: `hover:shadow-lg hover:-translate-y-0.5` with `duration-200`
- **Selected state**: `ring-2 ring-primary` + a gradient overlay at bottom-left with a numbered badge showing selection order (1, 2, 3...)
- **Selection indicator**: Top-right corner, larger circle (w-6 h-6), shows check when selected, fades in on hover when not selected
- **Product info**: Below image, text-xs font-medium for title (2-line clamp), product_type as a tiny pill badge instead of plain text
- **Card background**: bg-card with subtle border

### 6. Add New Card
- Same height as product cards but with a more prominent dashed border
- Centered Plus icon with "Add Product" text
- Subtle gradient background on hover

### 7. Floating Selection Bar
When `selectedProductIds.size > 0`, render a sticky bottom bar:
- `fixed bottom-4 left-1/2 -translate-x-1/2` (or relative to container)
- Frosted glass: `bg-card/95 backdrop-blur-xl border shadow-2xl rounded-2xl`
- Shows: selected product thumbnails (mini avatar row), count text, "Next: Style →" button
- Smooth slide-up animation with `animate-in slide-in-from-bottom`

### 8. List View
- Taller rows (py-3), larger thumbnails (w-12 h-12), better spacing
- Selection indicator aligned right with smooth transition
- Alternating subtle row backgrounds

### 9. Import URL / CSV tabs
- Cleaner card styling with more padding
- Import URL: add a small preview area showing "detecting product..." state
- CSV: better drag-drop zone with animated border on hover

## What stays the same
- All props interface — no changes
- `toggleProduct`, `filtered`, `visible` logic — identical
- Tab structure (library / url / csv) — same tabs, better styling
- Pagination with "Load more" — preserved

