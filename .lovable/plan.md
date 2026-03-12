

## Fix Hero Mobile Layout — Stacked Design

### Problem
On mobile (390px), the hero showcase uses a horizontal `flex` row where the product upload card takes ~180px and the output carousel gets the remaining ~180px — making the upload image appear larger than the results, which is visually unbalanced.

### Solution — Stack vertically on mobile
Switch from side-by-side to a **stacked layout** on mobile:

1. **Top: Small product card + scene pills** — Compact horizontal row with a small product thumbnail (80px wide), product label, and the 3 scene switcher pills inline
2. **Below: Full-width output carousel** — The output images get the full screen width, making them the hero of the showcase

### Changes — `src/components/landing/HeroSection.tsx`

#### Layout structure (lines 248-385)
- Change the outer flex from `flex items-center` to `flex flex-col md:flex-row md:items-center`
- **Mobile product section**: Shrink to a compact horizontal bar — small 60×80px thumbnail on the left, label text, and scene switcher pills on the right, all in one row
- **Desktop**: Keep the existing side-by-side layout unchanged (w-[200px] upload + arrow + carousel)
- Hide the flow arrow on mobile (already `hidden sm:flex`, keep as-is)
- The output carousel section becomes `w-full md:flex-1` so it spans full width on mobile

#### Mobile product bar specifics
- Product image: ~60px wide thumbnail with rounded corners, no card wrapper
- "Your Upload" badge: small inline text instead of overlay
- Scene pills: inline next to the product info
- Remove "↑ Tap to switch product" hint on mobile (unnecessary when inline)

#### Output carousel on mobile
- Cards: keep `w-[150px]` but now they have full viewport width to scroll through
- Caption and dots remain centered below

This gives the results prominence while keeping the "1 photo → many outputs" story clear.

