

## Fix Freestyle Pills Layout — Use Wrap with Consistent Chip Sizing

The horizontal scroll approach doesn't feel right. A better solution: keep `flex-wrap` but prevent the layout jumps by giving chips a consistent minimum width and truncating long text.

### Root Cause
When "Product" becomes "Elevate You..." or "Model" becomes "Ashley K.", the chip grows, pushing siblings to new rows. The fix is to **cap chip widths** so they don't grow unboundedly.

### Approach
Revert to `flex-wrap` but add `max-w-[120px]` (or similar) with `truncate` on the label text inside each chip. This way:
- Chips wrap naturally to a second line when needed
- But the **wrapping pattern stays stable** because chip widths don't vary wildly between "Product" and "Elevate You Athleisure..."
- Selected state shows truncated name with ellipsis — users can still tap to see full name

### Changes — `src/components/app/freestyle/FreestyleSettingsChips.tsx`

1. **Revert rows back to `flex-wrap`**: Change `overflow-x-auto flex-nowrap scrollbar-none` back to `flex-wrap` on all three mobile rows. Remove `shrink-0` wrappers.

2. **Add `max-w` + `truncate` to chip buttons**: Each chip component (ProductSelectorChip, ModelSelectorChip, SceneSelectorChip, etc.) renders a button with a label. Add `max-w-[130px] truncate` to the label `<span>` inside each chip so text gets ellipsized consistently.

### Files

| File | Change |
|---|---|
| `src/components/app/freestyle/FreestyleSettingsChips.tsx` | Revert to `flex-wrap`, remove `shrink-0` wrappers |
| `src/components/app/freestyle/ProductSelectorChip.tsx` | Add `max-w-[100px] truncate` to selected product name span |
| `src/components/app/freestyle/ModelSelectorChip.tsx` | Add `max-w-[100px] truncate` to selected model name span |
| `src/components/app/freestyle/SceneSelectorChip.tsx` | Add `max-w-[100px] truncate` to selected scene name span |

