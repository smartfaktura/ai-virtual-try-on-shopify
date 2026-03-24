

# Unify Freestyle Empty State Header + Align Presets to Prompt Bar

## Problem
1. The empty state uses a centered icon + title style that doesn't match other app pages (which use `PageHeader` with left-aligned title/subtitle)
2. The presets carousel width doesn't precisely match the prompt bar container

## Changes

### 1. `src/pages/Freestyle.tsx` (lines 951-967)

**Replace centered empty state** with a consistent left-aligned title using the same typography as `PageHeader` (`text-2xl sm:text-3xl font-bold tracking-tight` for title, `text-sm sm:text-base text-muted-foreground` for subtitle). Remove the Sparkles icon box entirely.

Place the title/subtitle at the top of the content area (not centered vertically), then position the presets carousel **anchored just above the prompt bar** using flexbox spacing (`flex-1` pushes presets down toward the prompt).

**Structure:**
```
<div className="flex flex-col h-full">
  {/* Top: page title */}
  <div className="px-4 sm:px-8 pt-2">
    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Freestyle Studio</h1>
    <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-lg">
      Pick a quick-start preset or describe what you want to create.
    </p>
  </div>
  
  {/* Spacer pushes presets to bottom */}
  <div className="flex-1" />
  
  {/* Presets aligned with prompt bar width */}
  <div className="px-0 sm:px-8 sm:pr-16 lg:pr-20 pb-2">
    <div className="lg:max-w-2xl lg:mx-auto">
      <FreestyleQuickPresets ... />
    </div>
  </div>
</div>
```

This uses the **same padding** (`px-0 sm:px-8 sm:pr-16 lg:pr-20`) and **same max-width** (`lg:max-w-2xl lg:mx-auto`) as the prompt bar wrapper on line 975-976, ensuring pixel-perfect alignment.

### Files
- `src/pages/Freestyle.tsx` — replace centered empty state with PageHeader-style title, anchor presets above prompt bar using matching container widths

