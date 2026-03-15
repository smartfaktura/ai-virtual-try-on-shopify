

## Redesign Column Selector in Expanded Scene Dialog

Move the column selector from the header row down to sit inline with the filter tabs (All / On-Model / Product), right-aligned on the same row. Restyle it to match the pill/chip aesthetic of the filter tabs.

### Changes

**`src/components/app/freestyle/SceneSelectorChip.tsx`**

1. Remove the column selector from the header `div` (lines 243-259)
2. Update `renderFilterTabs(expanded)` to include the column selector on the right side when `expanded === true` — use `justify-between` on the filter row wrapper
3. Style column buttons as small rounded pills matching the filter tab style (rounded-full, same font size/weight)

Layout:
```text
SCENE / ENVIRONMENT                              [Clear selection]  ✕
[All] [On-Model] [Product]              [⊞] [4] [3] [2]
```

The column buttons will use the same `rounded-full` styling as the filter tabs but smaller, keeping visual consistency.

### Files modified
| File | Change |
|---|---|
| `src/components/app/freestyle/SceneSelectorChip.tsx` | Move column selector inline with filter tabs, restyle as pills |

