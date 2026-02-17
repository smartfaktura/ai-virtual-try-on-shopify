
## Fix Style Chip Mismatch + Popover Click Bug on Mobile

### Problem 1: Style Chip Looks Different

The chips use inconsistent sizing:
- **Model, Scene, Product** chips: `px-3.5 py-2` (padding-based, no fixed height)
- **Output chips (Ratio, Quality, Camera), Style trigger, Image Count**: `h-8 px-3` (fixed height)
- **Framing chip**: `h-8 px-3` (fixed height)
- **Presets chip inside Style**: `h-7 px-2.5` (smaller)

This creates a visual mismatch where some chips are taller/shorter than others. All chips in the settings panel should use the same sizing convention.

### Problem 2: Popovers Not Opening on Mobile

The entire mobile layout (lines 340-421) is wrapped inside a single `<Collapsible>` component. When you tap a `PopoverTrigger` (Model, Scene, Product) inside the Collapsible, the click event can bubble up and get intercepted by the Collapsible's event handling, preventing the Popover from opening.

### Fix

**File: `src/components/app/freestyle/FreestyleSettingsChips.tsx`**

1. **Restructure mobile layout**: Move the `<Collapsible>` wrapper to only wrap Row 2 and the CollapsibleContent, not Row 1. Row 1 (Upload, Product, Model, Scene, Framing) should sit outside the Collapsible so their Popovers work without interference.

2. No chip sizing changes needed in this file since the Style trigger already uses `h-8 px-3` matching the output chips.

**File: `src/components/app/freestyle/ModelSelectorChip.tsx`**

Normalize the trigger button from `px-3.5 py-2` to `h-8 px-3` to match all other chips.

**File: `src/components/app/freestyle/SceneSelectorChip.tsx`**

Same fix: normalize trigger button from `px-3.5 py-2` to `h-8 px-3`.

**File: `src/components/app/freestyle/ProductSelectorChip.tsx`**

Same fix: normalize trigger button from `px-3.5 py-2` to `h-8 px-3`.

### Technical Details

**FreestyleSettingsChips.tsx mobile section (lines 337-422)** -- restructure to:

```tsx
if (isMobile) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-2">
        {/* Row 1: Assets + Creative — OUTSIDE Collapsible */}
        <div className="flex items-center gap-2 flex-wrap">
          {uploadButton}
          <ProductSelectorChip ... />
          <ModelSelectorChip ... />
          <SceneSelectorChip ... />
          <FramingSelectorChip ... />
        </div>

        {/* Row 2 + Style — wrapped in Collapsible */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <div className="flex items-center gap-2 flex-wrap">
            {aspectRatioChip}
            {qualityChip}
            {cameraStyleChip}
            {imageCountStepper}
            <CollapsibleTrigger asChild>
              <button className={cn(...)}>
                ...Style button...
              </button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="pt-2">
            ...style content...
          </CollapsibleContent>
        </Collapsible>
      </div>
    </TooltipProvider>
  );
}
```

**ModelSelectorChip.tsx line 49**, **SceneSelectorChip.tsx line 47**, **ProductSelectorChip.tsx line 33** -- change:

```diff
- className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border border-border bg-muted/50 text-foreground/70 hover:bg-muted transition-colors"
+ className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-border bg-muted/50 text-foreground/70 hover:bg-muted transition-colors"
```

### Summary

- All chips get unified `h-8 px-3` sizing for visual consistency
- Row 1 (with Popovers) moves outside the Collapsible to fix the click interception bug
- Row 2 + Style section stays inside Collapsible since that's where the trigger lives

### Files Modified
- `src/components/app/freestyle/FreestyleSettingsChips.tsx` -- restructure Collapsible scope
- `src/components/app/freestyle/ModelSelectorChip.tsx` -- normalize chip height
- `src/components/app/freestyle/SceneSelectorChip.tsx` -- normalize chip height
- `src/components/app/freestyle/ProductSelectorChip.tsx` -- normalize chip height
