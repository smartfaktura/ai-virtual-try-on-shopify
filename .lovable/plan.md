## /home fixes

### 1. Remove the trust section
- Delete the `<HomeTrustBlock />` line and its import from `src/pages/Home.tsx`.
- Delete the `src/components/home/HomeTrustBlock.tsx` file (no other usages).

### 2. Fix flickering / blank tiles in "Built for every category." (`HomeTransformStrip.tsx`)
All scene image URLs return 200 — the blank cards in the screenshot are caused by `loading="lazy"` combined with the section's scroll-reveal opacity transition, so tiles don't decode until well after they enter the viewport, leaving white squares.

Fixes:
- Switch the first 6 cards (above-fold row) from `loading="lazy"` to `loading="eager"` and `fetchPriority="high"`; keep lazy for the rest.
- Add a stable neutral placeholder background (`bg-[#efece8]`) so the card area never appears as a flashing white square while the image decodes.
- Add `onError` fallback that hides the broken `<img>` and reveals a soft "image" icon placeholder, so any single bad URL no longer leaves a blank rectangle.
- Add `referrerPolicy="no-referrer"` to avoid Supabase rejecting requests with certain referer headers from preview/published domains.

No copy or layout changes; grid sizing, animations, and category pills stay identical.