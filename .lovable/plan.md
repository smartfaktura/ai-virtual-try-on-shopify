

# Fix Transform Strip Section — Categories, Visibility & Mobile

## Problems
1. **Category tabs feel like floating text** — plain text with underline sitting on a border line looks "text on text", no visual separation from the heading above
2. **Desktop images too small** — cards at 180px/220px with tiny original thumbnail feel undersized on large screens
3. **Mobile: original card hidden** — `hidden sm:block` means mobile users never see the "before" context
4. **Mobile: can't see all cards** — marquee scrolls but cards are narrow and rows feel cramped

## Changes (all in `HomeTransformStrip.tsx`)

### 1. Category tabs — pill-style with background fill
- Replace underline tabs with filled pill/chip buttons inside a centered row
- Active: `bg-foreground text-background` (dark fill, white text) — clear, tappable
- Inactive: `bg-muted/50 text-muted-foreground hover:bg-muted` — subtle but distinct
- Add `rounded-full px-5 py-2` for proper pill shape
- Remove the `border-b border-border/40` container border
- Add more gap between heading and tabs (`mb-12`)

### 2. Desktop — larger cards and original thumbnail
- Increase card width: `w-[180px] sm:w-[240px] lg:w-[260px]`
- Increase original thumbnail: `w-24 lg:w-32` with bigger label text
- Increase gap between rows: `gap-4`

### 3. Mobile — show original card above the marquee
- Remove `hidden sm:block` — instead show the original card on mobile as a horizontal strip above the marquee rows
- On mobile: render the original as a small card (w-16, aspect 3/4) centered above the grid with a "Your photo →" label and a subtle arrow, giving context
- On `sm+`: keep the current left-side layout

### 4. Mobile card sizing
- Slightly larger mobile cards: `w-[160px]` (from 180 which is fine, but ensure gap is tighter `gap-2`)
- This keeps more cards visible in the viewport

