

## Redesign Mobile Settings Layout — Clean, Organized, Premium

### Current Problem

The mobile settings area is a jumble of mixed-purpose chips all thrown into one `flex-wrap` row. Upload Image, Add Product, Model, Scene, Aspect Ratio, and Image Count all compete for space on the same line, wrapping unpredictably. Then a separate "More settings" collapsible adds another layer of visual noise. There's no grouping, no visual hierarchy — it reads as a wall of small buttons.

### Design Approach

Reorganize the settings into **clearly labeled sections** with a grid-based layout instead of a single `flex-wrap` soup. Group related controls together so users can scan and find what they need instantly.

### New Mobile Layout

```text
+--------------------------------------------------+
|  Describe what you want to create...              |
|                                                   |
+--------------------------------------------------+
|  [Upload Image]  [Add Product]                    |
+--------------------------------------------------+
|  CREATIVE                                         |
|  [Model v]   [Scene v]   [Framing v]             |
+--------------------------------------------------+
|  OUTPUT                                           |
|  [1:1 v]  [Standard v]  [Pro v]  [- 1 + img]    |
+--------------------------------------------------+
|  STYLE  (collapsible, hidden by default)          |
|  [Brand v]  [Negatives v]  [Polish ○]  [Presets] |
+--------------------------------------------------+
|              [ Generate (4) ]                     |
+--------------------------------------------------+
```

### Changes

**File: `src/components/app/freestyle/FreestyleSettingsChips.tsx`** (mobile section, lines 340-422)

Replace the current mobile layout with organized sections:

1. **Assets row** — Upload Image + Add Product side by side (these are the primary inputs)
2. **Creative section** — labeled "Creative" in tiny muted text, contains Model, Scene, and Framing chips in a row
3. **Output section** — labeled "Output", contains Aspect Ratio, Quality, Camera Style, and Image Count stepper in a row
4. **Style section** — collapsible (replaces "More settings"), labeled "Style", contains Brand Profile, Negatives, Polish toggle, and Style Presets

Each section gets:
- A tiny uppercase label (`text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium`) above the chips
- Consistent `gap-2` between chips within each section
- `gap-3` vertical spacing between sections
- Clean visual separation without heavy dividers

**File: `src/components/app/freestyle/FreestylePromptPanel.tsx`** (lines 234-266)

Move the upload button OUT of `FreestyleSettingsChips` and into its own row directly in the prompt panel, between the textarea and the settings. This separates "inputs" (prompt text + reference image + product) from "settings" (model, scene, output options).

The upload button and product selector become a dedicated row:
- Sits right below the prompt textarea
- Uses the full width with a subtle divider above/below
- Feels like a natural "attach" area (similar to chat apps)

### Technical Details

**FreestyleSettingsChips mobile return (replacing lines 340-422):**

```tsx
if (isMobile) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-3">
        {/* Assets row */}
        <div className="flex items-center gap-2">
          {uploadButton}
          <ProductSelectorChip ... />
        </div>

        {/* Creative section */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium px-0.5">
            Creative
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <ModelSelectorChip ... />
            <SceneSelectorChip ... />
            <FramingSelectorChip ... />
          </div>
        </div>

        {/* Output section */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium px-0.5">
            Output
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {aspectRatioChip}
            {qualityChip}
            {cameraStyleChip}
            <div className="flex-1" />
            {imageCountStepper}
          </div>
        </div>

        {/* Style section — collapsible */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <button className={cn(
              'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[10px] uppercase tracking-wider font-medium transition-colors',
              advancedActiveCount > 0
                ? 'text-primary'
                : 'text-muted-foreground/50 hover:text-muted-foreground/70'
            )}>
              Style
              {advancedActiveCount > 0 && <badge />}
              <ChevronDown />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <BrandProfileChip ... />
              <NegativesChip ... />
              {polishChip}
              {presetsSection}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </TooltipProvider>
  );
}
```

### Summary

- **3 clear sections**: Creative (who/where), Output (format), Style (fine-tuning) — each with a tiny label
- **Assets at top**: Upload + Product get their own row, visually separated from settings
- **Framing promoted**: Moved from "More settings" into the Creative section since it's commonly used
- **No more "More settings" label**: Renamed to "Style" which is more descriptive
- **Consistent spacing**: `gap-2` within rows, `gap-3` between sections
- **Same chips, better organization**: No functionality changes, just layout

### Files Modified
- `src/components/app/freestyle/FreestyleSettingsChips.tsx` — reorganized mobile layout into labeled sections
