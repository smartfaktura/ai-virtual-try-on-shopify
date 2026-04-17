

## Fix layout toggle spacing + mobile row height

### Issues
1. Desktop: floating toggle (`-top-12`) is too close to the grid — needs same gap as between grid cards (typically `gap-6` ≈ 24px).
2. Mobile: toggle still consumes a full row of height above the grid.

### Fix
**File: `src/pages/Workflows.tsx`**

1. **Desktop**: Change toggle position from `-top-12` to `-top-14` (or align it vertically into the page header row, ~56px above the grid) so spacing between toggle bottom and grid top matches grid card gap (~24px).

2. **Mobile**: Hide the toggle entirely on mobile (`<sm`). Mobile only has 2 layout options (it clamps to 2col) — the toggle adds clutter without value. Remove the inline mobile toggle block.
   - Alternative: keep mobile toggle but float it absolutely too with `top-0 right-0` overlapping into the page header area.

**Chosen approach:** Hide on mobile entirely (cleanest — mobile is forced 2col anyway, no choice to make), keep desktop floating with corrected offset.

```tsx
<section className="relative space-y-4">
  {/* Desktop only — floats up into page header area */}
  <div className="hidden sm:block absolute -top-14 right-0 z-10">
    <ToggleGroup ...>...</ToggleGroup>
  </div>
  {/* No mobile toggle — mobile is locked to 2col */}
  <div className={gridClasses}>...</div>
</section>
```

### Acceptance
- Desktop: visible spacing between toggle and first row of grid cards matches the gap between cards themselves.
- Mobile: no toggle row — grid starts directly under page header with original spacing.
- Behavior unchanged otherwise.

