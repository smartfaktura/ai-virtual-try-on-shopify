
Three targeted fixes in `src/components/app/ManualProductTab.tsx`.

### 1. Remove Extra Angles dropdown
Drop the `Collapsible` wrapper around the angles strip — show the header + 5 tiles always expanded. No chevron, no toggle. Keeps "EXTRA ANGLES" header + "Improves AI accuracy" caption + tiles in a static block.

### 2. Main photo fills its tile (no grey bars)
Current tile is `w-[180px] h-[220px]` with `object-contain` → portrait swimsuit on a slightly different ratio shows grey bars top/bottom from the `bg-muted/30` backdrop.

Fix: change tile to a 4:5 aspect ratio container that adapts (`w-[200px] aspect-[4/5]`) and use `object-cover` so the image fills the frame edge-to-edge. Removes visible grey bars while keeping a clean defined surface.

### 3. More details fields match Product Details sizing
Product Details inputs use the standard `<Input>` (h-10). The More details section currently renders Weight / Color / Materials inputs with smaller/different classes (likely `h-9` or compact size from older code).

Fix: remove any size overrides on those three inputs so they inherit the same default `<Input>` height + padding + label style (`text-sm font-medium text-foreground`) used in Product Details. Two-column grid layout matches.

### Files
- `src/components/app/ManualProductTab.tsx` (~15 lines)

### Out of scope
Backend, AI flow, fields, AddProduct.tsx, PageHeader.tsx.

### Acceptance
- Extra Angles header + 5 tiles always visible, no collapsible chevron
- Main photo fills the tile cleanly (no grey letterbox bars)
- Weight, Color, Materials inputs are visually identical to Product Name / Type / Dimensions
