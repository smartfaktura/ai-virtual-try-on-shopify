

# Fix Mobile Scene Selection Layout in Workflow Settings

## Problem
On mobile (390px), the scene selection header is cluttered:
- Title "Select Your Scenes" + "31 Scenes" badge + "Select 1" button all compete for horizontal space
- Filter button sits awkwardly on its own line
- The layout feels cramped and hard to parse

## Solution
Restructure the header for mobile into a cleaner stacked layout:

### `src/components/app/generate/WorkflowSettingsPanel.tsx`

**Lines 237-301** — Restructure the header section:

1. **Stack title and action on mobile**: Change the outer `flex items-center justify-between` to wrap properly on mobile. On mobile, stack: title row (with scene count badge inline) on top, then subtitle, then a row with Filter + Select button side by side.

2. **Move the scene count badge next to title on its own line** (mobile): Instead of cramming "Select Your Scenes", "31 Scenes" badge, and "Select 1" button on one line, make the title + badge wrap naturally:
   - Title: "Select Your Scenes" (full width on mobile)
   - Below title: subtitle text
   - Below subtitle: a flex row with Filter button on left and Select All/Select 1 button on right

3. **Restructure mobile layout**:
```tsx
// Outer container: stack on mobile, row on desktop
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
  <div>
    <div className="flex items-center gap-2 flex-wrap">
      <h3>Select Your Scenes</h3>
      <Badge>31 Scenes</Badge>
    </div>
    <p className="text-sm text-muted-foreground mt-1">Pick at least 1 scene</p>
  </div>
  <Button>Select 1 / Select All</Button>
</div>
```

4. **Move filter inline on mobile** — Instead of the Filter popover button, use a horizontally scrollable pill row on mobile too (same as desktop), saving a tap. Replace the `sm:hidden` popover + `hidden sm:flex` inline split with a single scrollable row:
```tsx
<div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
  {filterButtons()}
</div>
```

### Files
- `src/components/app/generate/WorkflowSettingsPanel.tsx` — lines 237-365

