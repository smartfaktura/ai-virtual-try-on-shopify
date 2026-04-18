
Two small fixes in `src/components/app/ManualProductTab.tsx`.

### 1. Main photo: remove the grey frame
The 180×180 tile uses `bg-muted/30` which renders as a visible grey square behind the (already-white-bg) swimsuit image. With `object-contain` + a non-square image, the grey shows on the sides and looks like random borders.

Fix: drop the `bg-muted/30` on the main photo tile. Keep `rounded-xl overflow-hidden` and the size, but no background — image just sits cleanly in its slot like a thumbnail in `/app/products`. If we want a faint surface for transparent PNGs only, use `bg-transparent` and let the natural image bg show.

### 2. More Details: clean collapsed state + softer "(optional)"
Currently the collapsed "MORE DETAILS" header still shows the `border-b border-border/50` divider line — looks like an empty section divider when nothing is below. Also "(optional)" is in the same weight as the label, feels heavy.

Fix:
- Conditionally apply the bottom border only when the collapsible is **open** (`open && "border-b border-border/50"`).
- Restyle "(optional)" → lowercase, lighter: `text-[10px] font-normal normal-case tracking-normal text-muted-foreground/60 ml-1.5` so it reads as a soft caption next to the uppercase header instead of competing with it.

### Files
- `src/components/app/ManualProductTab.tsx` (~6 lines)

### Out of scope
Backend, AI flow, fields, other sections.

### Acceptance
- Main photo sits cleanly with no visible grey frame around the image
- Collapsed "MORE DETAILS" row has no divider line under it; divider appears only when expanded
- "(optional)" reads as a subtle lowercase caption, not a bold uppercase tag
