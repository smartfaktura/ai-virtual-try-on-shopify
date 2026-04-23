

## Fix: Pre-selected from Explore card sizing & spacing

### Issues
1. **Card too large** — `DiscoverPreselectedCard` uses a 2-col / sm:3-col grid → on a 1328px viewport each card is ~530px wide. The "Select shots" grid below uses 4–6 cols (small thumbnails ~150–200px wide). The two surfaces look completely different.
2. **No spacing** between the card block and the "Select shots" heading underneath.
3. Aspect ratio mismatch: this card uses `aspect-[3/4]`, but the Step 2 catalog cards use `aspect-[4/5]` (see `SceneCatalogCard`).

### Fix — `src/components/app/product-images/DiscoverPreselectedCard.tsx`

1. **Match grid density to the Select shots grid** — switch the grid to `grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6` so the preselected tile renders at the same width as a regular shot card. The "Picked for you" companion tile drops out at this density (it crowds the layout) — replace it with a single-tile render and move the "Picked for you / From Explore" hint into the section header chip area, which keeps the meaning without eating a full grid cell.
2. **Aspect ratio** — change `aspect-[3/4]` → `aspect-[4/5]` to match `SceneCatalogCard`.
3. **Typography** — match `SceneCatalogCard`: `px-2.5 py-2`, `text-[12px] font-medium … truncate`, drop the `min-h-[44px]` two-line caption block.
4. **Bottom spacing** — wrap the whole block with `mb-6` (or change the outer `pt-3 pl-2` to `pt-3 pl-2 pb-4`) so there's clear breathing room before the "Select shots" heading. Also remove the stray `pl-2` so the card aligns flush with the grid below.
5. **Header row** — keep the "PRE-SELECTED FROM EXPLORE" label + divider, append a small inline pill "· Picked for you from Explore" so the avatar/info that lived in the second tile isn't lost.

### Result
- Preselected card renders at the exact same size as cards in the "Select shots" grid below.
- Same `aspect-[4/5]`, same caption style, same border treatment when selected.
- Clear vertical gap (`mb-6`) between the preselected block and the "Select shots" heading.
- "Picked for you / From Explore" context preserved in the section header, no oversized companion tile.

### Out of scope
- No change to the resolver / preload logic from previous fixes.
- No change to `SceneCatalogCard` itself.
- No change to the Step 2 grid layout.

### File touched
```text
EDIT  src/components/app/product-images/DiscoverPreselectedCard.tsx
        - Grid: 3/4/5/6 cols to match Select shots density
        - Tile: aspect-[4/5], px-2.5 py-2 caption, truncate single line
        - Drop the dashed "Picked for you" companion tile
        - Move "Picked for you · From Explore" into the header row
        - Add mb-6 outer spacing; remove stray pl-2 to align with grid
```

