

## Creative Drops Page -- Luxury UI/UX Overhaul

### Problems Identified

1. **"Generating Now" stat uses amber color** -- breaks the monochromatic luxury aesthetic; should match other stats
2. **Stats grid is plain** -- simple bordered boxes with no visual hierarchy or icon accents
3. **Tabs look default/generic** -- standard shadcn TabsList without premium feel
4. **"Create Schedule" button floats awkwardly** -- right-aligned below tabs with no visual anchor
5. **Schedule cards lack refinement** -- the info grid (Products/Workflows/Generation) uses `bg-muted/40` which looks flat
6. **Calendar view is bare** -- no card wrapper, no visual polish, tiny dots for events
7. **Overall page lacks the "luxury restraint" aesthetic** used elsewhere in the app

---

### Design Direction

Elevate the page to match the Apple-inspired studio aesthetic already established in the design system: subtle shadows instead of hard borders, tonal depth, icon accents on stats, refined spacing, and a card-wrapped calendar.

---

### Changes by File

#### 1. `src/pages/CreativeDrops.tsx`

**A. Stats grid -- use MetricCard component or upgrade inline stats**

Replace the plain `div` stat boxes (lines 229-261) with properly styled metric cards that include:
- Icon accent (small colored icon circle in top-right)
- Larger typography hierarchy (3xl value, sm label)
- Subtle shadow (`shadow-sm`) instead of just border
- Remove the amber color from "Generating Now" -- use the same foreground color as other stats
- Add a subtle pulse animation dot next to "Generating Now" instead of coloring the number

```tsx
// Before: <p className="text-2xl font-semibold text-amber-500">{generatingCount}</p>
// After:  <p className="text-2xl font-semibold">{generatingCount}</p> with a small pulsing dot
```

**B. Tabs -- refined styling**

Wrap tabs in a cleaner layout. Move "Create Schedule" button to sit inline with the TabsList on desktop (right-aligned in the same row), creating a unified toolbar feel instead of a floating button.

```tsx
// Before: TabsList then a separate div with Create Schedule below
// After:
<div className="flex items-center justify-between">
  <TabsList className="...">...</TabsList>
  <Button>Create Schedule</Button>
</div>
```

Remove the separate `<div className="flex justify-end">` wrapper for the button inside the Schedules tab.

**C. Calendar view -- wrap in a card**

Wrap the CalendarView in a `Card` with proper padding for a contained, polished feel. Add a subtle header with month navigation styled as a proper toolbar.

```tsx
<Card className="rounded-2xl">
  <CardContent className="p-5">
    <CalendarView ... />
  </CardContent>
</Card>
```

Inside CalendarView:
- Style the month navigation bar with a centered month name and ghost icon buttons
- Give day cells a slightly larger size with `rounded-xl` instead of `rounded-lg`
- Make event dots slightly larger (w-1.5 h-1.5 to w-2 h-2) for better visibility
- Add a subtle hover state with `hover:bg-accent` transition
- Style the legend at the bottom with better spacing

**D. Empty states -- refine spacing**

Add `rounded-2xl` and shadow to the empty state cards for consistency.

#### 2. `src/components/app/DropCard.tsx`

**E. Schedule card info grid polish**

- Change `bg-muted/40` to `bg-accent/50` for the info sections (Products, Workflows, Generation) for slightly more warmth
- Add `shadow-sm` to the inner info boxes for subtle depth
- Product thumbnails: increase from `w-8 h-8` to `w-9 h-9` with `rounded-lg` and a ring (`ring-1 ring-border/30`)

**F. Status badge refinement**

- The Active badge uses `bg-green-500/10 text-green-600` which is fine but inconsistent with the muted palette. Change to use the design system's `--status-success` token for consistency.

**G. Drop card thumbnail strip**

- Increase thumbnail size from `w-14 h-14` to `w-16 h-16` for better visual impact
- Add `ring-1 ring-border/20` for subtle framing

#### 3. `src/components/app/PageHeader.tsx`

**H. Subtitle styling**

- Increase subtitle max-width and add slightly more top margin for breathing room

---

### Technical Summary

- 3 files modified: `CreativeDrops.tsx`, `DropCard.tsx`, `PageHeader.tsx`
- No new dependencies
- No database changes
- All changes are visual/CSS -- no logic changes
- Maintains existing responsive behavior while elevating the aesthetic
- Removes the amber "Generating Now" color in favor of a subtle pulsing dot indicator

