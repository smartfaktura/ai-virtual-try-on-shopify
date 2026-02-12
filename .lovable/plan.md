

## Fix: Premium Mobile Buttons for Results Page

### Problem
The three action buttons ("Download All", "Download Selected", "View in Library") look cramped and generic on mobile -- small `size="sm"` buttons stacked with minimal spacing, no visual hierarchy, and thin outline borders that feel flat.

### Changes

**File: `src/pages/Generate.tsx` (lines 1734-1744)**

Replace the current button group with a more premium, spacious layout:

1. **Full-width rounded buttons** -- Use `rounded-xl min-h-[44px]` (matching the premium button style used in `PlanChangeDialog`, `NoCreditsModal`, etc.) for better touch targets and visual consistency
2. **Remove `size="sm"`** -- Let buttons breathe at default size on mobile
3. **Visual hierarchy** -- Make "View in Library" the primary CTA (default variant), "Download All" secondary (outline), and "Download Selected" tertiary (ghost/outline)
4. **Spacing** -- Increase gap from `gap-2` to `gap-2.5` for breathing room
5. **On desktop** -- Keep horizontal layout with `sm:flex-row`

```
Before:
<div className="flex flex-col sm:flex-row gap-2">
  <Button variant="outline" size="sm" className="flex-1 sm:flex-none" ...>Download All</Button>
  <Button variant="outline" size="sm" className="flex-1 sm:flex-none" ...>Download Selected</Button>
  <Button size="sm" className="flex-1 sm:flex-none" ...>View in Library</Button>
</div>

After:
<div className="flex flex-col sm:flex-row gap-2.5">
  <Button variant="outline" className="rounded-xl min-h-[44px] flex-1 sm:flex-none" ...>Download All</Button>
  <Button variant="outline" className="rounded-xl min-h-[44px] flex-1 sm:flex-none" ...>Download Selected</Button>
  <Button className="rounded-xl min-h-[44px] flex-1 sm:flex-none" ...>View in Library</Button>
</div>
```

This matches the premium button styling used across all modals (`PlanChangeDialog`, `NoCreditsModal`, `BuyCreditsModal`) with `rounded-xl min-h-[44px]` for a consistent, branded feel.

