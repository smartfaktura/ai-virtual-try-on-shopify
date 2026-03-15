

## Fix Mobile Scene Popup Layout

### Issues
1. **Popover width** (`w-96` = 384px) nearly fills the 390px mobile screen with no breathing room
2. **Expanded dialog**: Filter tabs and column selector wrap to separate lines on mobile instead of sharing one row
3. Column selector row looks disconnected from filter tabs on small screens

### Changes

**`src/components/app/freestyle/SceneSelectorChip.tsx`**

1. **Popover width**: Change `w-96` to `w-[calc(100vw-2rem)] sm:w-96` so it fits within mobile viewport with padding
2. **Filter tabs row**: On mobile in expanded view, stack the column selector below filters more cleanly — use `gap-2` and keep both rows compact. On mobile the filter+column row should wrap gracefully with proper spacing
3. **Expanded dialog**: Add responsive padding — `p-4 sm:p-5`, and use `max-w-[95vw] sm:max-w-3xl` so the dialog doesn't overflow on mobile
4. **Column selector**: Make buttons slightly smaller on mobile (`w-6 h-6 text-[10px]` vs `w-7 h-7 text-xs`)

### Files
| File | Change |
|---|---|
| `src/components/app/freestyle/SceneSelectorChip.tsx` | Responsive popover width, dialog sizing, filter/column layout |

