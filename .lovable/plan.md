Two scoped fixes in `/mnt/documents/brand-scenes-newsletter.html`.

### 1. Brand Models — 4 faces in one row on mobile
In the `@media (max-width:620px)` block, remove the override that turns `.grid4 td` into a 2-up grid (`display:inline-block; width:48%`). Replace with a tight 4-up layout that simply reduces the td padding so all four 25% cells fit comfortably:
- `.grid4 td{ padding:0 2px !important; }`
- `.grid4 td:first-child{ padding-left:0 !important; }`
- `.grid4 td:last-child{ padding-right:0 !important; }`

Keep the desktop `width="25%"` structure intact.

### 2. Brand Scenes — equal-height images
Root cause: the three Supabase-rendered JPGs have different native aspect ratios, so `height:auto` produces different heights. Force a uniform 3:4 crop via render params on each URL by appending `&resize=cover&width=480&height=640` (keeps `quality=65`). Once all three sources are 480×640, the existing `width:100%;height:auto` renders identical tiles in every client (including Outlook).

Update the three Brand Scenes `<img>` `src` URLs only. No CSS aspect-ratio (not Outlook-safe).

No copy or layout structure changes beyond the two items above.
