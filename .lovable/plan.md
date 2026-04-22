
## Fix: Desktop Model modal not opening

### Root cause

In `src/components/app/freestyle/ModelSelectorChip.tsx`, the trigger button only wires its `onClick` for mobile:

```tsx
onClick={isMobile ? () => onOpenChange(!open) : undefined}
```

When the desktop branch was switched from a `Popover` (which auto-handled triggering) to the new `ModelCatalogModal`, nothing was left to open the modal. Clicking the **Model** chip on desktop does nothing.

### Fix

Single one-line change in `ModelSelectorChip.tsx` (line 86):

- Make the trigger button toggle `onOpenChange` on **all** viewports, not just mobile:
  ```tsx
  onClick={() => onOpenChange(!open)}
  ```

Both `MobilePickerSheet` (mobile branch) and `ModelCatalogModal` (desktop branch) are controlled via the `open` / `onOpenChange` props already passed in, so this single handler drives both correctly.

### Validation

- Desktop ≥1024px: click "Model" chip → `ModelCatalogModal` slides in from the right.
- Mobile <768px: unchanged behavior — `MobilePickerSheet` still opens.
- Clear-selection X button inside the chip still calls `e.stopPropagation()` so it won't trigger the modal.

### Untouched

`ModelCatalogModal.tsx`, mobile sheet, Freestyle page, all selection logic, upgrade flows.
