

# Fix Aspect Ratio Icon in Freestyle Chip

## Problem
Line 106 in `FreestyleSettingsChips.tsx` hardcodes the `Square` icon for the aspect ratio trigger button. When user selects 9:16, the chip still shows a square icon instead of the narrow rectangle (`AspectIcon916`).

## Fix
**File: `src/components/app/freestyle/FreestyleSettingsChips.tsx` (line ~102-108)**

Replace the hardcoded `<Square>` with a dynamic lookup from the `ASPECT_RATIOS` array:

```tsx
const aspectRatioChip = (() => {
  const currentAr = ASPECT_RATIOS.find(ar => ar.value === aspectRatio) ?? ASPECT_RATIOS[0];
  const ArIcon = currentAr.icon;
  return (
    <Popover open={aspectPopoverOpen} onOpenChange={setAspectPopoverOpen}>
      <PopoverTrigger asChild>
        <button className="...">
          <ArIcon className="w-3.5 h-3.5" />
          {aspectRatio}
          <ChevronDown className="w-3 h-3 opacity-40" />
        </button>
      </PopoverTrigger>
      ...
    </Popover>
  );
})();
```

Single line change: swap `<Square className="w-3.5 h-3.5" />` → dynamically resolved icon from the selected ratio. One file, one line.

