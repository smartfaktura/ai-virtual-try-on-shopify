

# Two-Column Category Layout for "Explore More"

## Problem
The "Explore More" section lists ~25+ category rows in a single column, creating excessive vertical scrolling. Each row is just a label + count + chevron — very narrow content wasting horizontal space.

## Solution
Render the collapsed category rows in a **2-column grid** (desktop/tablet), but when a category is expanded, its scene grid renders **full-width below the row pair**, spanning both columns. This is the same pattern used by product comparison grids — compact browsing, full-width detail.

```text
┌─────────────────────┐  ┌─────────────────────┐
│ Clothing & Apparel  │  │ Dresses             │
└─────────────────────┘  └─────────────────────┘
┌─────────────────────┐  ┌─────────────────────┐
│ Hoodies             │  │ Jeans          ▼    │
└─────────────────────┘  └─────────────────────┘
┌─────────────────────────────────────────────────┐
│  ▸ Essential Shots  [Select All]                │
│  [card] [card] [card] [card] [card] [card]      │
│  ▸ Lifestyle Shots  [Select All]                │
│  [card] [card] [card] [card] [card] [card]      │
└─────────────────────────────────────────────────┘
┌─────────────────────┐  ┌─────────────────────┐
│ Jackets             │  │ Activewear          │
└─────────────────────┘  └─────────────────────┘
```

## Approach
Within each super-group (e.g., "Fashion & Apparel"), instead of rendering categories as a flat `space-y-1.5` list:

1. **Chunk category rows into pairs** (groups of 2)
2. Render each pair in a `grid grid-cols-1 sm:grid-cols-2 gap-2` row
3. The `CollapsibleTrigger` (the row) stays inside the grid cell
4. The `CollapsibleContent` (the scene grid) renders **outside the 2-col grid**, full-width, directly below the pair
5. Only one category can be expanded at a time (already the case — clicking one closes others)

## Technical Details

### File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

**Change the "Explore More" rendering block** (~lines 336-364):
- Instead of mapping `items` directly, chunk them into pairs
- For each pair, render a 2-col grid of triggers
- After each pair, render the `CollapsibleContent` for whichever category in that pair is expanded
- Split `UnifiedCategorySectionWithSelectAll` so the trigger and content can be placed in different DOM locations (trigger in grid cell, content below grid row)

**Refactor `UnifiedCategorySectionWithSelectAll`**:
- Extract the trigger button into a standalone `CategoryRowTrigger` component
- Extract the content into a standalone `CategoryExpandedContent` component
- The parent orchestrates layout: triggers in 2-col grid, content full-width below

This is a layout-only change — no data logic, no new dependencies.

### Files
- `src/components/app/product-images/ProductImagesStep2Scenes.tsx` — refactor the Explore More section layout

