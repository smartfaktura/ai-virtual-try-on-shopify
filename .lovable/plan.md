

## Overhaul Channel Showcase — New Images, Names, 1:1 Cards

### Changes to `src/components/landing/ChannelShowcase.tsx`

**1. Save 6 uploaded images** to `public/images/try-showcase/`:
- `studio-lookbook.png` (Virtual_Try-On_Set-c9b44983.png)
- `cafe-lifestyle.png` (Freestyle-66e8ecfd.png)
- `pilates-studio.png` (freestyle-1_26.png)
- `at-home-editorial.png` (racer_knitted_crop_top-virtual_try_on_set-isabella-front_view-1.png)
- `golden-hour.png` (freestyle-1_27.png)
- `urban-edge.png` (Virtual_Try-On_Set_1_3.png)

**2. Update ITEMS array** with new local paths and improved naming:

| Card | Title | Subtitle | Category |
|------|-------|----------|----------|
| 1 | Studio Lookbook | Clean e-comm on white | Listing |
| 2 | Café Lifestyle | Sun-drenched editorial | Lifestyle |
| 3 | Pilates Studio | Active lifestyle campaign | Ads |
| 4 | At-Home Editorial | Cozy living room story | Website |
| 5 | Golden Hour | Warm outdoor portrait | Seasonal |
| 6 | Urban Edge | Street-style stairwell shoot | Lifestyle |

**3. Switch to 1:1 aspect ratio** — change `aspect-[4/5]` → `aspect-square` on all cards.

**4. Remove "Your Product" overlay thumbnail** from each card (the source callout at the top already communicates this). Cleaner look.

**5. Use local image paths** directly instead of `getLandingAssetUrl` + `getOptimizedUrl` for these cards (avoids the distortion issues).

**6. Update subtitle copy** under the heading to: "One upload creates visuals for every channel and campaign."

