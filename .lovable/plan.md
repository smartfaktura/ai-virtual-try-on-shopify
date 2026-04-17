

## Move + enlarge layout toggle near the cards grid

### Issue
Layout toggle (rows / 2col / 3col icons) sits in the top-right corner of the page header — too small (`h-7 w-7`) and far from the grid it controls. User wants it bigger and positioned near the workflow cards grid.

### Change
**File: `src/pages/Workflows.tsx`**

1. Remove the `actions={...}` prop from `<PageHeader>` (lines 477–491) — drop the ToggleGroup from the header.

2. Inside the workflow catalog `<section className="space-y-4">` (line 506), add a small row above the grid (but after activity card) containing the toggle, right-aligned:
   ```tsx
   <div className="flex justify-end">
     <ToggleGroup
       type="single"
       value={effectiveLayout}
       onValueChange={handleLayoutChange}
       className="gap-1 rounded-lg border bg-card p-1"
     >
       <ToggleGroupItem value="rows" aria-label="Row layout" className="h-9 w-9 p-0">
         <LayoutList className="w-4 h-4" />
       </ToggleGroupItem>
       <ToggleGroupItem value="2col" aria-label="Two column layout" className="h-9 w-9 p-0">
         <Grid2X2 className="w-4 h-4" />
       </ToggleGroupItem>
       {!isMobile && (
         <ToggleGroupItem value="3col" aria-label="Three column layout" className="h-9 w-9 p-0">
           <Grid3X3 className="w-4 h-4" />
         </ToggleGroupItem>
       )}
     </ToggleGroup>
   </div>
   ```
   - Bigger buttons: `h-9 w-9` (was `h-7 w-7`), icons `w-4 h-4` (was `w-3.5`).
   - Wrapped in subtle bordered card container so it reads as a control group.
   - Right-aligned, sits directly above the grid.

### Acceptance
- Layout toggle no longer in page header — header shows only title + subtitle.
- Toggle appears as a bordered pill group right-aligned just above the workflow card grid.
- Buttons visibly larger and easier to tap.
- Behavior unchanged (still persists to localStorage, mobile still clamps to 2col).

