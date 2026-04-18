

## Match Recent Creations heading size to other dashboard sections

### Issue
On `/app`, the "Recent Creations" heading + "Your latest generated visuals" subtitle render smaller than sibling section headings on the dashboard. Same issue on "Recent Activity".

### Root cause
- `RecentCreationsGallery.tsx` uses `text-xl sm:text-2xl` for h2, `text-base` for subtitle
- `ActivityFeed.tsx` uses `text-xl sm:text-2xl` for h2
- Other dashboard sections use larger `text-2xl sm:text-3xl font-bold tracking-tight` headings

### Plan

1. **`src/components/app/RecentCreationsGallery.tsx`** — bump heading from `text-xl sm:text-2xl` → `text-2xl sm:text-3xl`. Subtitle stays `text-base text-muted-foreground` (already no period ✓).
2. **`src/components/app/ActivityFeed.tsx`** — bump heading `text-xl sm:text-2xl` → `text-2xl sm:text-3xl` for parity.

### Acceptance
- "Recent Creations" and "Recent Activity" headings on `/app` match other dashboard section headings
- Subtitle remains quiet `text-base` muted body
- No trailing periods

