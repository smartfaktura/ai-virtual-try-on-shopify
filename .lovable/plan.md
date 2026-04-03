

# Fix Hero: 40/60 Split, Pill Styling, Image Zoom

## Issues Found

1. **Grid ratio wrong**: `lg:grid-cols-[2fr_3fr]` = 40/60 ✓ on paper, but the `max-w-lg` on the left column constrains it to ~32rem, making the left side appear much narrower than 40%. Need to remove `max-w-lg` or increase it.

2. **Selected pill looks like CTA**: Active pill uses `bg-foreground text-background` — same visual weight as the primary CTA button. Fix: use a subtle highlight instead (e.g., light fill + dark text + bottom underline or ring).

3. **Images zoomed in**: Cards are `w-[160px] h-[213px]` / `w-[200px] h-[267px]` with `object-cover`. The source images have different aspect ratios than 3:4, so `object-cover` crops/zooms them. Fix: use `object-contain` with a subtle background color, or adjust card dimensions to better match source image ratios.

## Changes (all in `HomeHero.tsx`)

### 1. Fix 40/60 split
- Remove `max-w-lg` from the left column — let the grid columns actually control the width
- Keep `lg:grid-cols-[2fr_3fr]` which is the correct 40/60 ratio

### 2. Improve pill styling
- Active: `bg-secondary text-foreground border-foreground/20 font-semibold` — subtle filled look, clearly different from the rounded CTA button
- Inactive: keep current outlined style

### 3. Fix image zoom
- Change `object-cover` to `object-cover` but with a larger `width` optimization param (800 instead of 400) so less upscaling crop
- Better fix: switch card images to `object-contain bg-[#f0efed]` so full image is visible without cropping

## File Modified
- `src/components/home/HomeHero.tsx`

