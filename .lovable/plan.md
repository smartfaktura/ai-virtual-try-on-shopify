

## Expand Showcase to 12 Cards + Remove Filters + Add CTA

### Changes to `src/components/landing/ChannelShowcase.tsx`

**1. Add 3 new images** from uploads to `public/images/try-showcase/`:
- `virtual-tryon-1.png` (virtual-try-on-set-2b6dd369.png)
- `virtual-tryon-2.png` (virtual-try-on-set-34d0d438.png)
- `virtual-tryon-3.png` (virtual-try-on-set-f036bb8d.png)

**2. Expand ITEMS to 12 cards** using all 9 existing + 3 new images. Varied titles/subtitles across the grid.

**3. Remove category filter chips entirely** — no more `All`, `Ads`, `Website` etc. buttons. Remove the `useState`, `Category` type, filtering logic. Just show all 12 cards in a static grid (4 cols on lg, 3 on md, 2 on sm).

**4. Remove category Badge** from each card — simplify to just title + subtitle.

**5. Add CTA section** after the grid with a heading like "Ready to create yours?" and a button linking to `/auth` ("Start Creating for Free").

**6. Grid layout**: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` to fit 12 cards nicely in 3 rows on desktop.

### Files changed
- Copy 3 new images → `public/images/try-showcase/`
- Edit `src/components/landing/ChannelShowcase.tsx` — remove filters, expand to 12 cards, add CTA

