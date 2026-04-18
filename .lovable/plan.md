

## Polish Edit Product: image card, angles, footer

Three concrete fixes for the Edit Product / Upload tab to remove the inconsistencies visible in the screenshot.

### 1. Image card → clean, single, structured layout
Today the image section is one card containing: a transparent floating image with a `Main` badge overlay (looks like it's randomly stuck to the side), then the angles strip on the right with a tiny muted header. Result feels disjointed.

Fix in `src/components/app/ManualProductTab.tsx` (filled-image branch ~lines 861–1002):

- **Remove the floating "Main" badge overlay.** Replace with a small left-aligned label above the image: same uppercase tiny header style as `PRODUCT DETAILS` ("MAIN PHOTO"). One typography system across all sections.
- **Give the image a real frame.** Wrap the `<img>` in a square 1:1 (or 4:5) tile with a subtle muted backdrop only inside the tile (`bg-muted/30 rounded-xl`), so transparent PNGs sit on a defined surface — but the *outer* card stays clean. This stops the "image randomly added" feeling.
- **Constrain image tile to a fixed compact size** (e.g. `w-[180px] h-[220px]` desktop, `w-[140px] h-[170px]` mobile) so it doesn't dominate the card.
- **Layout**: `flex flex-col sm:flex-row gap-5 sm:gap-6 items-start` — image tile on left, angles block fills remaining space on right.

### 2. Reference angles → unified typography & spacing
Currently the "Extra angles improve AI accuracy" header is `text-[11px]` muted while the tiles are large 88px chunks with green check badges + dashed borders + filled borders mixed.

Fix:
- **Header**: change to the same `text-[11px] font-semibold uppercase tracking-wider text-muted-foreground` style as `PRODUCT DETAILS` → "EXTRA ANGLES" with the small "(improves AI accuracy)" caption underneath in `text-[11px] text-muted-foreground/70`. Unifies it with the rest of the page.
- **Tiles**: keep 88px size but unify all 5 to one style — `rounded-xl border border-dashed border-border/60 bg-muted/20`. Remove the bg-muted/10 vs bg-muted/20 inconsistency. Filled state: same `rounded-xl border border-border` (no green check disc — replace with subtle ring or just the filled image, since label already proves it's set).
- **Spacing**: `flex gap-2.5 flex-wrap` so on a narrow right column they wrap instead of overflowing.
- Keep the collapsible chevron, just align it to the right of the new header.

### 3. Footer → no extra grey container
Today the sticky footer uses `bg-background/80 backdrop-blur border-t border-border/60` *inside* the form area, which renders as the "random grey area" in the screenshot.

Fix:
- Remove `border-t`, `bg-background/80`, `backdrop-blur` from the sticky footer wrapper.
- Use a clean `flex justify-end gap-3 pt-2` row, not sticky on desktop. Keep sticky behavior **only on mobile** (`sm:static sticky bottom-0 bg-background sm:bg-transparent`) where it actually helps.
- Buttons keep current style (`rounded-xl`).

### Files touched
- `src/components/app/ManualProductTab.tsx` — image tile + Main label, angles header, tile styles, footer container (~30 lines, contained edits)

### Out of scope
- No changes to AI analysis flow, mutations, or fields
- No changes to the empty-state dropzone
- No changes to AddProduct.tsx or PageHeader.tsx

### Acceptance
- Image sits in a defined square/portrait tile with a clear "MAIN PHOTO" label above — no floating badge
- "EXTRA ANGLES" header matches PRODUCT DETAILS typography
- All 5 angle tiles share one consistent border/background style
- No extra grey strip behind Cancel / Save Changes on desktop
- Mobile: footer still sticks for thumb reach
- Save / Cancel and AI flow unchanged

