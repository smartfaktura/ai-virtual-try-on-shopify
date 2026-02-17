

## Optimize Mobile Prompt Bar: Compact Layout + Visible Style Toggle

### Problem

1. The prompt bar with all labeled sections (Assets, Creative, Output, Style) takes up too much vertical space on mobile, leaving little room for the image gallery
2. The "Style" collapsible trigger is barely visible -- just tiny text that doesn't look tappable or like it contains more settings

### Changes

**File: `src/components/app/freestyle/FreestyleSettingsChips.tsx`** (mobile section, lines 337-436)

#### 1. Remove section labels

The uppercase "CREATIVE", "OUTPUT" labels add visual noise and vertical height. Remove all three section labels. The chips are self-explanatory (they say "Model", "Scene", "1:1", etc.). This saves ~36px of vertical space.

#### 2. Merge Assets + Creative into one row

Combine Upload Image, Add Product, Model, Scene, and Framing into a single scrollable row. This eliminates one entire section gap (~12px saved).

#### 3. Keep Output as a compact single row

Aspect ratio, quality, camera style, and image count stay together but without the "OUTPUT" label above them.

#### 4. Restyle the Style trigger as a proper chip button

Instead of tiny uppercase text, make it look like the other chips -- a rounded-full button with an icon, border, and background. When active settings exist, highlight it. This makes it instantly recognizable as tappable.

### New compact layout

```text
+--------------------------------------------------+
|  Describe what you want to create...              |
+--------------------------------------------------+
|  [Upload] [Product] [Model] [Scene] [Framing]    |
|  [1:1] [Standard] [Pro] [- 1 +]  [Style ▾]      |
+--------------------------------------------------+
|              [ Generate (4) ]                     |
+--------------------------------------------------+
```

### Technical Details

**Replace mobile return (lines 337-436) with:**

- **Row 1**: `flex-wrap gap-2` containing `uploadButton`, `ProductSelectorChip`, `ModelSelectorChip`, `SceneSelectorChip`, `FramingSelectorChip` -- all in one flow
- **Row 2**: `flex-wrap gap-2` containing `aspectRatioChip`, `qualityChip`, `cameraStyleChip`, `imageCountStepper`, and the **Style trigger chip**
- **Style trigger**: Rendered as a proper chip button (`h-8 px-3 rounded-full border`) with `SlidersHorizontal` icon, showing badge count when settings are active. Opens the same `Collapsible` content below.
- Vertical spacing between the two rows: `space-y-2` (8px instead of current 12px between sections)
- Collapsible Style content renders below row 2 with `pt-2`

**Style chip button styling:**

```tsx
<CollapsibleTrigger asChild>
  <button className={cn(
    'inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-colors',
    advancedActiveCount > 0
      ? 'border-primary/30 bg-primary/10 text-primary'
      : 'border-border bg-muted/50 text-foreground/70 hover:bg-muted'
  )}>
    <SlidersHorizontal className="w-3.5 h-3.5" />
    Style
    {advancedActiveCount > 0 && (
      <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
        {advancedActiveCount}
      </span>
    )}
    <ChevronDown className={cn('w-3 h-3 opacity-40 transition-transform', advancedOpen && 'rotate-180')} />
  </button>
</CollapsibleTrigger>
```

### Files Modified
- `src/components/app/freestyle/FreestyleSettingsChips.tsx` -- compact 2-row mobile layout, style chip button

