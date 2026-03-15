

## Fix Dialog Header Alignment in Expanded Scene Selector

**Problem**: Two issues in the expanded dialog:
1. The `DialogContent` component automatically renders an `X` close button at `absolute right-4 top-4`, which overlaps/misaligns with the custom `Minimize2` button in the header
2. The `Minimize2` icon visually resembles a maximize icon, confusing users

**Fix in `src/components/app/freestyle/SceneSelectorChip.tsx`**:

1. **Remove the custom Minimize2 button** from the dialog header — the built-in `X` close button from `DialogContent` already handles closing, so it's redundant
2. **Add right padding** to the header div so the title and "Clear selection" link don't overlap with the absolute-positioned `X` button

```tsx
// Line 176: add pr-8 to give space for the built-in X close button
<div className="flex items-center justify-between mb-3 pr-8">
  <DialogTitle ...>Scene / Environment</DialogTitle>
  <div className="flex items-center gap-1.5">
    {selectedScene && (
      <button onClick={() => handleSelect(null)} ...>Clear selection</button>
    )}
    {/* Remove the Minimize2 button entirely */}
  </div>
</div>
```

Single file, minimal change — removes the duplicate button and fixes the alignment.

