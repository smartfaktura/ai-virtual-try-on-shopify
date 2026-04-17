

## Fix extra row height from layout toggle

### Issue
The new layout toggle row above the grid takes a full extra row of vertical space, pushing the grid down. User wants it to not consume extra height.

### Fix
**File: `src/pages/Workflows.tsx`**

Make the toggle visually float so it doesn't add a row:
- Wrap the toggle row + grid in a `relative` container.
- Position the toggle absolutely top-right, overlapping the top edge so it doesn't push the grid down.
- Alternative (cleaner): use negative margin `-mb-2` on the toggle row and reduce its height contribution, OR move the toggle to sit inline next to the section/header area.

**Chosen approach:** absolute-positioned toggle inside a `relative` wrapper so the grid's height is unaffected.

```tsx
<div className="relative">
  <div className="absolute -top-12 right-0 z-10 hidden sm:block">
    <ToggleGroup ... className="gap-1 rounded-lg border bg-card p-1 shadow-sm">
      {/* h-8 w-8 buttons, w-3.5 h-3.5 icons — slightly smaller to fit */}
    </ToggleGroup>
  </div>
  {/* On mobile, render inline above grid with no extra spacing */}
  <div className="sm:hidden flex justify-end mb-2">
    {/* same toggle */}
  </div>
  <div className={gridClasses}>...</div>
</div>
```

- Desktop: toggle floats up next to the page header area — no extra row height.
- Mobile: stays inline above grid with minimal `mb-2`.
- Buttons sized `h-8 w-8` (between original tiny and previous large) so they're tappable but compact.

### Acceptance
- No extra vertical row consumed on desktop — grid sits at original Y position.
- Toggle visible top-right, near the grid.
- Mobile keeps toggle inline with tight spacing.
- Behavior unchanged.

