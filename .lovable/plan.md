

# Fix Transform Strip: Marquee, Zoom & Category Design

## Problems Identified

1. **Marquee not scrolling**: Conflict between CSS (`index.css` uses `translateX(-33.333%)`) and Tailwind config (`translateX(-50%)`). The CSS override wins, but the code doubles the array (needs `-50%`), so the animation either doesn't loop seamlessly or appears stuck.

2. **Images look zoomed**: Cards use `aspect-[3/4]` (portrait) with `object-cover`, which aggressively crops the source images. These are already tightly framed photos, so the extra crop makes them feel zoomed in.

3. **Category pills feel dated**: Basic rounded buttons with fill/no-fill states lack the polished, interactive feel expected in 2026 design.

## Fixes (all in `HomeTransformStrip.tsx` + `index.css`)

### 1. Fix marquee animation (`index.css`)
- Change `marquee-left` from `-33.333%` to `-50%` to match the doubled array
- Same for `marquee-right` start position
- This makes the infinite scroll loop seamlessly

### 2. Reduce zoom — change aspect ratio to `4/5`
- Switch cards from `aspect-[3/4]` to `aspect-[4/5]` — slightly less tall, less aggressive crop
- Shows more of each image without feeling squished
- Also reduce card width slightly on desktop (`lg:w-[240px]`) to fit more cards in view

### 3. Modern category selector — segmented control with sliding indicator
- Replace plain pills with a segmented control bar: a single `bg-muted/30` rounded container holding all options
- Active item gets a sliding white `bg-background` pill with subtle shadow, animated via `transition-all`
- Uses `relative` positioning with a calculated `translateX` for the active indicator
- Feels like iOS/Apple segmented control — modern, tactile, premium
- On mobile: horizontal scroll with `overflow-x-auto` and `scrollbar-hide`

### 4. Ensure `animationDuration` on marquee applies correctly
- The `style={{ animationDuration: duration }}` only applies to the parent div, but the Tailwind animation class also sets duration. Ensure the inline style wins by using `!important` or removing duration from the Tailwind animation definition.

