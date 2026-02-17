

## Fix: Presets Chip Mismatched Design and Duplicate Icon

### Problem

1. **Different sizing**: The Presets chip on mobile uses `h-7 px-2.5 text-[11px]` while every other chip uses `h-8 px-3 text-xs` -- making it visually smaller and inconsistent.
2. **Different border/bg**: Uses `border-border/60 bg-muted/30 text-muted-foreground/60` instead of the standard `border-border bg-muted/50 text-foreground/70`.
3. **Duplicate icon**: Both Brand and Presets use the `Palette` icon from Lucide, making them look identical.

### Fix

**File: `src/components/app/freestyle/FreestyleSettingsChips.tsx`**

1. **Match chip sizing and colors** (lines 300-305): Change the Presets popover trigger to use the same `h-8 px-3 text-xs` sizing and `border-border bg-muted/50 text-foreground/70` default colors as all other chips.

2. **Change Presets icon** (line 306): Replace `Palette` with `Sparkles` from Lucide -- this better represents style presets and is visually distinct from the Brand chip's `Palette` icon.

### Technical Details

Line 2 -- add `Sparkles` to imports (replace or add alongside existing icons):
```tsx
import { ..., Sparkles, ... } from 'lucide-react';
```

Lines 300-308 -- update the Presets trigger button:
```tsx
// Before:
<button className={cn(
  'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-medium border transition-colors',
  stylePresets.length > 0
    ? 'border-primary/40 bg-primary/10 text-primary'
    : 'border-border/60 bg-muted/30 text-muted-foreground/60'
)}>
  <Palette className="w-3 h-3" />

// After:
<button className={cn(
  'inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-colors',
  stylePresets.length > 0
    ? 'border-primary/30 bg-primary/10 text-primary'
    : 'border-border bg-muted/50 text-foreground/70 hover:bg-muted'
)}>
  <Sparkles className="w-3.5 h-3.5" />
```

### Result
- Presets chip matches the exact size, colors, and hover behavior of Model, Scene, Brand, etc.
- Unique `Sparkles` icon distinguishes Presets from Brand at a glance
- No other files affected

