

# Fix Scene Picker: Responsive Width & Consistent Card Heights

## Problems
1. The popover is fixed at `w-[520px]` which overflows on smaller desktop/laptop screens
2. Scene card titles use `line-clamp-2` — cards with 1-line titles are shorter than cards with 2-line titles, creating a jagged grid

## Changes

**File: `src/components/app/freestyle/SceneSelectorChip.tsx`**

### 1. Responsive popover width (line 285)
Change `w-[520px]` to `w-[min(520px,calc(100vw-2rem))]` so it shrinks on smaller viewports while staying 520px on wide screens.

### 2. Fixed-height title area (line 197-199)
Give the title container a fixed height that accommodates 2 lines, so all cards are identical height regardless of title length:
- Change `<div className="px-2 py-2 bg-background">` to `<div className="px-2 py-2 bg-background min-h-[2.75rem] flex items-start">`
- This ensures the text area is always tall enough for 2 lines, keeping all cards the same height

