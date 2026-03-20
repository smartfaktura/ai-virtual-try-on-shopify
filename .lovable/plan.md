

# Fix: Winter Theme Not Applied + Calendar Overlapping Feedback Banner

## Two Issues

### Issue 1: Theme field still saved as "custom" for existing schedules

**Root cause confirmed in DB**: Both schedules show `theme: "custom"` despite having winter-themed `theme_notes`. Our wizard fix (`setTheme(presetId)`) only applies to NEW drops created going forward — the already-existing schedules were created before the fix.

**Backend fallback fix**: Both `generate-tryon` (line 132) and `generate-workflow` (line 459) skip the `SEASONAL DIRECTION` block when `theme === "custom"`. The `theme_notes` field IS injected (line 147) but as weaker `CREATIVE DIRECTION` text. The model doesn't treat it as a strong seasonal constraint.

**Fix in `trigger-creative-drop/index.ts`**: Add a fallback: if `theme === "custom"` but `theme_notes` contains seasonal keywords (winter, spring, summer, autumn, holiday), infer the theme from the notes. This handles legacy schedules.

**Fix in `generate-tryon/index.ts` and `generate-workflow/index.ts`**: When `theme === "custom"` AND `theme_notes` exists, still inject the theme notes as `SEASONAL DIRECTION` (not just `CREATIVE DIRECTION`), with stronger language: "You MUST follow this seasonal aesthetic."

### Issue 2: Calendar overlaps "Help us improve VOVV.AI" feedback banner

The `FeedbackBanner` is rendered INSIDE the `CalendarView` component at line 706. It sits directly below the legend with no spacing, causing visual overlap at the bottom of the page.

**Fix in `CalendarView`**: Move `<FeedbackBanner />` outside the calendar `max-w-lg` container, or add proper spacing (`mt-8`) and ensure it doesn't overlap. Better yet, remove it from CalendarView entirely — it should be at the page level, not inside a tab's sub-component.

## Changes

### File 1: `supabase/functions/trigger-creative-drop/index.ts` (~line 249)
Add theme inference from `theme_notes` when `theme === "custom"`:
```ts
let resolvedTheme = schedule.theme;
if (resolvedTheme === 'custom' && schedule.theme_notes) {
  const notes = schedule.theme_notes.toLowerCase();
  const seasonMap = { winter: 'winter', spring: 'spring', summer: 'summer', autumn: 'autumn', holiday: 'holiday' };
  for (const [keyword, value] of Object.entries(seasonMap)) {
    if (notes.includes(keyword)) { resolvedTheme = value; break; }
  }
}
```
Then use `resolvedTheme` instead of `schedule.theme` in the payload (~lines 249, 296).

### File 2: `supabase/functions/generate-tryon/index.ts` (line 147-149)
Strengthen theme_notes injection when theme is "custom":
```ts
if (ctx.themeNotes) {
  blocks.push(`SEASONAL DIRECTION: ${ctx.themeNotes}. You MUST incorporate this seasonal mood into the scene, lighting, and atmosphere.`);
}
```

### File 3: `supabase/functions/generate-workflow/index.ts`
Same strengthening of theme_notes injection for non-tryon workflows.

### File 4: `src/pages/CreativeDrops.tsx` (line 706)
Move `<FeedbackBanner />` out of `CalendarView` — place it at the page level after the `TabsContent` blocks with proper `mt-6` spacing so it doesn't overlap the calendar legend.

## Summary
- 4 files, ~20 lines changed
- Winter/seasonal theme will now be correctly applied even for legacy schedules with `theme: "custom"`
- Calendar no longer overlaps with the feedback banner

