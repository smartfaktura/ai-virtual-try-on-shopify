
## Unify section headers + tile aesthetics

All four sections (MAIN PHOTO, EXTRA ANGLES, PRODUCT DETAILS, MORE DETAILS) use the same `text-[11px] uppercase` header but inconsistent surrounding styling. Plus the main photo tile uses 4:5 while extra-angle tiles are square 88px → mismatched aesthetic.

### 1. Standardize all four section headers
Wrap MAIN PHOTO + EXTRA ANGLES headers in the same pattern as Product Details:
```
<div className="flex items-center gap-2 pt-1 pb-1 border-b border-border/50">
  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">…</span>
</div>
```
- MAIN PHOTO: just the header (no caption)
- EXTRA ANGLES: header + small "Improves AI accuracy" caption to the right (inline, `text-[11px] text-muted-foreground/70`) — no longer stacked, so the divider line stays clean and matches Product Details.
- MORE DETAILS: convert the Collapsible trigger header to the same divider-style header (still clickable / chevron on right), so it visually matches the others instead of feeling like a different control.

### 2. Match tile sizes — make MAIN PHOTO a square that aligns with EXTRA ANGLES tiles
Change main photo tile from `w-[160px] sm:w-[200px] aspect-[4/5]` → `w-[180px] h-[180px] aspect-square`. Same rounded-xl, same bg-muted/30, `object-contain` (so the swimsuit shows fully — no crop). Now main + 5 extra tiles all read as one consistent grid of squares, just main is bigger.

### 3. Tighten extra-angle placeholders so labels fit cleanly in 88px
Current placeholder stacks: Plus icon + category icon + label text in 88px → cramped, "Packaging" / "Back view" wrap awkwardly. Fix:
- Remove the `+` icon (redundant — the dashed border + empty tile already signals "add").
- Keep only the category Icon (centered, `w-5 h-5 text-muted-foreground/50`) + label below in `text-[10px]`.
- Use `gap-1.5`, `px-1` on label, `truncate` on long labels OR shorten labels to one word: `Back`, `Side`, `Inside`, `Packaging`, `Texture` (drop "view" since icons disambiguate).
- Add `pt-3` spacing inside tile so icon+label sit centered.

### 4. Vertical alignment in the image card
Add `items-start` already exists. Add a top label divider above the whole row so the section reads "MAIN PHOTO + EXTRA ANGLES" as one unified card with two sub-headers each above their own group, matching Product Details rhythm.

### Files
- `src/components/app/ManualProductTab.tsx` (~25 lines, lines 861–995 + 1109–1117)

### Out of scope
Backend, AI flow, AddProduct.tsx, PageHeader.tsx, fields.

### Acceptance
- All 4 section headers share identical typography + bottom-border divider style
- Main photo is a square tile matching extra-angle tile aesthetic (just bigger)
- Image fully visible (object-contain) — no crop, no grey bars
- Extra angle tile labels fit cleanly without wrapping
- More Details header matches the visual language of the other three
- Mobile + desktop layout still responsive
