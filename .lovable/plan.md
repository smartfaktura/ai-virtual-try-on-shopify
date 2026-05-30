Four refinements to `src/components/app/product-images/ProductImagesStep2Scenes.tsx`:

**1. Remove the top "X selected / Clear" bar**
Delete the `{selectedSceneIds.size > 0 && (...)}` block (lines 416–421) above the category sections.

**2. Relocate "X selected / Clear" to the eyebrow row**
Render it on the right side of the first sub-group's eyebrow row (the same line as `EDITORIAL SHOTS` and `Select All`).
- Add an optional `globalSelectionInfo?: { count: number; onClear: () => void }` prop to `SubGroupSection`.
- Add a `showGlobalSelection` flag to `UnifiedCategorySectionWithSelectAll` that forwards `{ count, onClear }` only to its first rendered sub-group.
- In `ProductImagesStep2Scenes`, set `showGlobalSelection` on the first recommended (or first all-categories) section only.
- Render as a compact `{count} selected · Clear` chip in the eyebrow row, between the divider and `Select All`.

**3. Separate Category pill and Grid changer into one row (side-by-side, not nested)**
Currently `GridSizeToggle` is rendered inside the category pill via `headerRight`. Change to:
- Remove the `headerRight={<GridSizeToggle …/>}` usage on both first-category call sites.
- Wrap each first-category `<UnifiedCategorySectionWithSelectAll />` and a standalone `<GridSizeToggle />` in a `flex items-center gap-2` row, with the section taking `flex-1 min-w-0`.
- The grid toggle becomes its own bare element next to the pill, only on desktop (`hidden sm:inline-flex`), only above the first category section.

**4. Redesign the "Recommended Shots" marker (lines 772–776)**
Match the visual treatment of the `Suggested` badge used in `CategoryPickerModal.tsx` (lines 87–92) — same shape, same color tokens, no icons:
```tsx
<span className="text-[9px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
  Recommended
</span>
```
Solid `bg-primary` pill with `text-primary-foreground`, tiny uppercase tracked label, no icons. Shortens label from "Recommended Shots" → "Recommended" to match the `Suggested` style.

No other files change. Pure UI/layout refinement, no business logic touched.