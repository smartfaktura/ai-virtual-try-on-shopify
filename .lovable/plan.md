

# Redesign Style Shots — Clean, Scannable Combo List

## Problems identified

1. **Two-line combo cards** — product×model on line 1, extras on line 2 with wasteful `pl-12` indent. Doubles vertical space for no reason.
2. **No numbering** — 40 combos with no index makes it impossible to track position.
3. **No grouping** — same product repeated 4× (once per model) with identical thumbnail. Should group by product.
4. **No search/filter** on the combo list itself — painful at 40 combos.
5. **"No extras" text on every card** — visual noise repeated 40 times.
6. **No collapse** — can't minimize combos you don't need extras on.
7. **Extras row always visible** even when empty — wastes space.

## Redesign approach

### Group by product, show models as sub-rows

Instead of 40 flat cards, group into **10 product sections** each containing 4 model rows. Each product section is a collapsible card with the product thumbnail and title as the header.

```text
┌─────────────────────────────────────────────┐
│ 1. Chocolate Brown Suede Shoulder Bag   [+] │
│    ├─ Freya          [+ Add extra]          │
│    ├─ Zara           [+ Add extra]          │
│    ├─ Anders         [+ Add extra]          │
│    └─ Sienna         [+ Add extra]          │
├─────────────────────────────────────────────┤
│ 2. Classic White Sneakers               [+] │
│    ├─ Freya          [+ Add extra]          │
│    ...                                      │
└─────────────────────────────────────────────┘
```

### Specific changes

1. **Numbered product groups** — each product gets `#1`, `#2`, etc. as a clear index.
2. **Single-line model rows** — model avatar + name + extras badges + Add button, all on one compact line. No second "extras row".
3. **Collapsible groups** — product groups start expanded but can be collapsed. Shows extras count in header when collapsed.
4. **Search bar** at the top of the combo list to filter products by name.
5. **Remove "No extras" text** — the Add button alone is sufficient. Only show extras badges when they exist.
6. **Compact density** — model rows use `py-1.5` instead of full card padding.
7. **Product-level "Add to all models"** button in each product header — adds an extra to all 4 model combos for that product at once.

## Files to modify

| Action | File |
|--------|------|
| Update | `src/components/app/catalog/CatalogStepStyleShots.tsx` — full layout redesign |

