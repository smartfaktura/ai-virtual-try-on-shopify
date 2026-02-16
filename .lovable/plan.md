

## Creative Drops Page -- Premium Redesign

### Problems from Screenshots

1. **Mobile: Stats grid is cramped** -- 2-column grid with shadow cards feels heavy on small screens; numbers and labels are squeezed
2. **Tabs bar looks generic** -- default shadcn TabsList with icons feels like a standard component, not a luxury app
3. **Schedule card info grid feels boxy** -- three equal `bg-accent/50` boxes with tiny text and uppercase labels look utilitarian, not premium
4. **Calendar looks dated** -- basic grid with tiny dots, no visual warmth or modern feel
5. **"Create Schedule" button alignment** -- on mobile it disappears since it only shows when `activeTab === 'schedules'`, creating layout jumps

---

### Design Changes

#### 1. `src/pages/CreativeDrops.tsx` -- Stats, Tabs, Calendar

**A. Stats: Replace grid cards with a compact inline ribbon**

Instead of 5 heavy shadow cards, use a single-row scrollable stat ribbon -- a clean horizontal strip inside one card. Each stat is separated by a subtle divider. On mobile it scrolls horizontally. This is much lighter and more editorial.

```tsx
<div className="rounded-2xl bg-card shadow-sm overflow-hidden mb-8">
  <div className="flex overflow-x-auto scrollbar-hide divide-x divide-border">
    {stats.map(stat => (
      <div className="flex-1 min-w-[120px] px-5 py-4 text-center">
        <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
      </div>
    ))}
  </div>
</div>
```

No icons, no absolute-positioned circles -- just clean numbers and labels in a single contained strip.

**B. Tabs: Segmented control style**

Replace the default TabsList with a pill-shaped segmented control -- no icons in the triggers (cleaner), just text labels with a slightly larger font. The active tab gets a subtle background fill. Remove the icons from tab triggers to reduce clutter.

```tsx
<TabsList className="bg-muted/50 rounded-xl p-1 h-auto">
  <TabsTrigger value="schedules" className="rounded-lg px-5 py-2 text-sm">
    Schedules
  </TabsTrigger>
  ...
</TabsList>
```

Move "Create Schedule" button to always be visible (not conditional on tab), placed at the top-right of the page header area.

**C. Calendar: Modern minimal calendar**

- Remove the card wrapper (let it breathe in the page)
- Style month navigation: use a centered month name with larger font (text-lg font-semibold) and rounded ghost buttons
- Day cells: increase to `rounded-2xl`, add subtle `bg-muted/30` on hover
- Event dots: replace circles with small colored bars underneath the number for a more modern look
- Legend: use inline colored bars instead of circles
- Day header row: use single-letter abbreviations (S, M, T, W, T, F, S) for a cleaner look

**D. Filter pills on Drops tab**

Replace outline buttons with ghost-style pills. Active pill uses `bg-foreground text-background` for strong contrast instead of the default primary color.

#### 2. `src/components/app/DropCard.tsx` -- Schedule Card Redesign

**A. Simplify the schedule card layout**

Remove the 3-column info grid entirely. Instead, show key info inline below the title in a cleaner format:

- Title row: schedule name + status badge + actions (unchanged)
- Subtitle: frequency, images, credits (unchanged)
- Below: A single row showing product thumbnails, workflow badges, and next run date all inline, separated by subtle dot dividers. No boxes, no uppercase labels, no background sections.

```tsx
<div className="flex items-center gap-3 flex-wrap mt-3">
  {/* Product thumbnails */}
  <div className="flex items-center gap-1">
    {thumbnails}
  </div>
  <span className="text-muted-foreground text-[10px]">·</span>
  {/* Workflow badges */}
  <div className="flex gap-1">
    {workflowBadges}
  </div>
  <span className="text-muted-foreground text-[10px]">·</span>
  {/* Next run */}
  <span className="text-xs text-muted-foreground">{nextRunText}</span>
</div>
```

This creates a much more compact, editorial card that doesn't waste vertical space with boxes.

**B. Drop card status badges -- monochromatic**

Replace the colored status badges (blue-100, amber-100, green-100, red-100) with a monochromatic approach:
- `scheduled`: `bg-muted text-muted-foreground`
- `generating`: `bg-foreground/10 text-foreground` with spinning icon
- `ready`: `bg-primary/10 text-primary`
- `failed`: `bg-destructive/10 text-destructive`

#### 3. `src/components/app/PageHeader.tsx` -- Subtitle placement

Move subtitle to sit with slightly more spacing (`mt-2` instead of `mt-1.5`) and use `max-w-lg` for tighter line length on desktop.

---

### Technical Summary

- 3 files modified: `CreativeDrops.tsx`, `DropCard.tsx`, `PageHeader.tsx`
- No new dependencies
- No database changes
- All visual/CSS changes -- no logic changes
- Stats go from 5 heavy cards to 1 clean ribbon
- Schedule card goes from 3-box grid to inline metadata row
- Calendar gets modern styling with bar indicators
- Tabs become a clean segmented control without icons

