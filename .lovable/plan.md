

## Tighten /app/workflows request banner spacing on mobile

### Issue
On mobile, the "Missing a Visual Type for your brand?" card has cramped spacing — the title sits too close to the full-width "Share Request" button and the card padding feels tight. Avatar row is hidden on mobile (good), but the gap between the heading block and the CTA is only `gap-3` and there's no subtitle/breathing room.

### Plan — `src/components/app/WorkflowRequestBanner.tsx`

1. **Increase mobile padding**: `p-4 sm:p-6` → `p-5 sm:p-6` for a touch more breathing room.
2. **Increase vertical gap on mobile** between title block and button: `gap-3 sm:gap-4` → `gap-4 sm:gap-4` (collapsed flex column needs more vertical air than row).
3. **Show a short subtitle on mobile** too, so the heading doesn't sit naked above the button. Currently `hidden sm:block`. Change to always visible but keep it tight (`text-xs text-muted-foreground mt-1`). This adds a natural visual buffer between title and CTA.
4. **Tighten title leading** and add a hair of bottom margin: keep `leading-snug`, ensure `mt-0.5` on subtitle becomes `mt-1` for cleaner rhythm.
5. **Button**: keep full-width on mobile but add `mt-1` on the button (only when stacked) via the existing `gap` increase — no extra class needed once gap is bumped.

### Acceptance
- On mobile, clear breathing room between title, subtitle, and "Share Request" button
- Subtitle now visible on mobile (helpful context)
- Desktop layout unchanged
- No trailing periods added to subtitle (it already ends with a period because it's two clauses joined by em-dash + has a period — keep as-is since it's body copy, not a header subtitle)

