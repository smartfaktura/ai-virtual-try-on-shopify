

# Hide Scene Category Pills Behind Filter Button on Mobile

## Problem
On mobile, the scene category tabs (All, Studio Essentials, Surface & Texture, Lifestyle Context, etc.) take up too much space and don't fit well on the screen. They should be hidden behind a filter button that opens a dropdown/popover.

## Changes

### `src/components/app/generate/WorkflowSettingsPanel.tsx` (lines 303-331)

Replace the inline scrollable category pills with a responsive approach:

**Desktop (`sm:` and up):** Keep the current inline wrapped pills — they fit fine on larger screens.

**Mobile:** Show a single "Filter" button (with a `SlidersHorizontal` icon) that opens a `Popover` with the category options listed vertically. When a non-"all" filter is active, show the active filter name as a badge on the button.

```tsx
// Mobile: Filter button with popover
<div className="sm:hidden">
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Filter
        {sceneFilterCategory !== 'all' && (
          <Badge variant="secondary" className="text-[10px] ml-1">{sceneFilterCategory}</Badge>
        )}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-48 p-2" align="start">
      {/* All + category buttons stacked vertically */}
    </PopoverContent>
  </Popover>
</div>

// Desktop: existing inline pills with "hidden sm:flex"
<div className="hidden sm:flex gap-1.5 flex-wrap">
  {/* existing pill buttons */}
</div>
```

- Import `SlidersHorizontal` from lucide-react
- Import `Popover, PopoverTrigger, PopoverContent` from ui/popover
- Category items in popover styled as full-width buttons with active state highlight
- Popover closes on selection

### File
- `src/components/app/generate/WorkflowSettingsPanel.tsx` — lines 303-331, wrap category tabs in responsive mobile filter button

