## Refine subgroup header row

Target: `SubGroupSection` header in `src/components/app/product-images/ProductImagesStep2Scenes.tsx` (lines ~869–899), the row that shows "EDITORIAL SHOTS … 2 SELECTED · Clear · Select All".

### Changes

1. **Remove "Select All / Deselect" button entirely.** Users typically don't want every shot; declutters the row and removes the longest text element so mobile fits one line.
2. **Soften the "N selected" pill.** Replace the primary-colored pill (`bg-primary text-primary-foreground`) with a muted neutral style matching the "SUGGESTED" eyebrow look: `bg-muted text-muted-foreground` (or `border border-border bg-background/50 text-muted-foreground`), same `text-[10px] uppercase tracking-wider` sizing as the section label so it visually belongs.
3. **Keep "Clear" link** but make it smaller and ghost-styled so it reads as a subtle action next to the count (e.g. `text-[10px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline`, no button chrome / padding).
4. **One-line mobile fit.** Remove `flex-wrap` from the header row so it stays single-line; with the Select All button gone and the count pill softened, the layout becomes: `LABEL · curator dot · ───divider─── · 2 selected · Clear`. The middle divider (`h-px flex-1`) absorbs remaining width and the right cluster (`shrink-0`) stays compact. Confirm at 390px viewport.
5. **Remove `onToggleAll` / `allSelected` props** from `SubGroupSection` signature and its call sites since the button is gone. Keep `selectedCount` only if still used (it isn't after removal — drop it too).

### Out of scope
No change to Recommended pill, category dropdown, grid toggle, or card visuals — only the subgroup header row.
