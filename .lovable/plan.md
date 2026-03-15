

## Revert Mobile Pills to Inline Flow Layout

The user wants pills arranged pill-by-pill in a flowing line (like the desktop layout), not in a rigid 2-column or 4-column grid. The grid creates too much whitespace and looks unnatural.

### Approach
Revert the mobile layout back to `flex-wrap` flow — but keep the `fullWidth` removal and truncation fixes so chips don't jump too much. The key difference from the grid: chips will be inline, content-sized, and wrap naturally to the next line like tags/badges do.

### Changes

**`src/components/app/freestyle/FreestyleSettingsChips.tsx`** — Mobile section (lines 314-420):
- Replace `grid grid-cols-2 gap-2` and `grid grid-cols-4 gap-2` with `flex items-center gap-2 flex-wrap`
- Remove `min-w-0` wrapper divs — just render chips directly (or keep highlight wrappers only)
- Remove `fullWidth` prop from all chip usages in mobile
- Keep the Style collapsible and advanced section structure
- Style trigger: remove `w-full`, keep as inline chip

**Chip components** (`ProductSelectorChip`, `ModelSelectorChip`, `SceneSelectorChip`, `FramingSelectorChip`, `BrandProfileChip`, `NegativesChip`):
- Keep the `fullWidth` prop support but don't pass it on mobile anymore
- Keep truncation (`max-w-[80px] truncate` or similar) on selected labels to prevent excessive width changes

This gives the original pill-by-pill flow where chips sit next to each other and naturally wrap, without the rigid grid whitespace.

| File | Change |
|---|---|
| `FreestyleSettingsChips.tsx` | Revert mobile from grid to `flex flex-wrap`, remove `fullWidth` from chip usage |

