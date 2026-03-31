

# Redesign Style Shots Step — Product-Based Extra Items with "Apply to All"

## Current Problem
The Style Shots step has a confusing matrix UI with cryptic edit icons. The "Extra Items" tab uses free-text input with placement selectors — not intuitive. Users want to add actual products from their catalog as extras (e.g. "add white trousers to all shots").

## New Design

Replace the current Tabs (Overrides / Extra Items) with a single clear list view:

**Layout**: Each product × model combo shown as a card/row with:
- Product thumbnail + name
- Model avatar + name  
- List of attached extra products (badges with remove button)
- "Add Product" button that opens a product picker (from the user's already-selected products list)

**"Apply to All" section** at the top:
- A prominent bar: "Add extra product to ALL combinations"
- Product picker dropdown (from user's full product list, not just selected ones)
- When selected, that product gets added as an extra to every combo

**ExtraItem type change**: Instead of `{ label: string, placement: string }`, change to `{ productId: string, productTitle: string, productImage?: string }` — referencing actual products.

## Technical Changes

### 1. Update `ExtraItem` interface
```typescript
export interface ExtraItem {
  productId: string;
  productTitle: string;
  productImage?: string;
}
```

### 2. Rewrite `CatalogStepStyleShots.tsx`
- Remove Tabs, Overrides matrix, and CatalogShotStyler integration
- Add "Apply to All" bar at top with product selector
- List all combos as simple rows showing: product × model + attached extras
- Each row has "+ Add Product" to pick from user's product catalog
- Product picker: simple popover/dropdown listing all user products with thumbnails

### 3. Keep `shotOverrides` and `CatalogShotStyler` for now
The per-combo override (pose/background/framing) is still useful — just make the button clearer. Move it to a small "⚙️ Customize" link per row instead of the matrix.

### 4. Remove placement concept
No more head/hand/shoulder/body/scene placement — just "this product is also in the shot."

## Files to modify

| Action | File |
|--------|------|
| Update | `src/components/app/catalog/CatalogStepStyleShots.tsx` — full rewrite |
| Update | `ExtraItem` type (in same file, exported) |

## UI Wireframe

```text
┌─────────────────────────────────────────────────┐
│ Style Shots                        12 combos    │
│                                                 │
│ ┌─── Apply to All ───────────────────────────┐  │
│ │ Add extra product to all shots:            │  │
│ │ [Select product ▾]  [+ Add to All]         │  │
│ │ Applied: [White Trousers ×] [Hat ×]        │  │
│ └────────────────────────────────────────────┘  │
│                                                 │
│ ┌── Combo 1 ─────────────────────────────────┐  │
│ │ 🖼 Black Dress  ×  👤 Natalie              │  │
│ │ Extras: [White Trousers] [Hat]  [+ Add]    │  │
│ │                            ⚙️ Customize     │  │
│ ├── Combo 2 ─────────────────────────────────┤  │
│ │ 🖼 Black Dress  ×  👤 Marcus               │  │
│ │ Extras: [White Trousers] [Hat]  [+ Add]    │  │
│ │                            ⚙️ Customize     │  │
│ └────────────────────────────────────────────┘  │
│                                                 │
│ [← Back]                      [Next: Review →] │
└─────────────────────────────────────────────────┘
```

