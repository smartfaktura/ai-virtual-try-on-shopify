

## Update Environment Showcase: Replace scenes + add new ones + optimize images

### What changes
**`src/components/landing/EnvironmentShowcaseSection.tsx`** — Complete refresh of both marquee rows with the requested replacements and additions, plus image optimization via `getOptimizedUrl`.

### Replacements
| Current | New |
|---------|-----|
| Night Neon | Velvet Draped Elegance |
| Rooftop City | Natural Light Loft |
| Editorial Movement | Amber Glow Studio |
| Airport Transit | Earthy Woodland Product |
| Editorial Artistic | Poolside Chic |

### New additions
Coastal Horizon, Night Drive Glam, Sunlit Botanical Surface, Marble Console Vignette, Prism Glow Showcase, Desert Horizon, Golden Radiance Product, Desert Sunset

### Final layout (two rows, opposite directions)

**ROW_1** (left marquee, ~10 cards):
1. Earthy Woodland Product
2. Poolside Chic
3. Natural Light Loft
4. Salt Flat Serenity
5. Brutalist Urban Steps
6. Amber Glow Studio
7. Urban Dusk Portrait
8. Coastal Horizon
9. Velvet Draped Elegance
10. Studio Movement

**ROW_2** (right marquee, ~10 cards):
1. Night Drive Glam
2. Sunlit Botanical Surface
3. Marble Console Vignette
4. Prism Glow Showcase
5. Desert Horizon
6. Golden Radiance Product
7. Desert Sunset
8. Garden Natural
9. Studio Close-Up
10. Studio Crossed Arms Male

### Image optimization
- Import `getOptimizedUrl` from `@/lib/imageOptimization`
- Wrap every image URL through `getOptimizedUrl(url, { width: 400, quality: 60 })` in the render — these cards are max 208px (lg:w-52) so 400px width at 2x DPR is sufficient
- Apply optimization in the `ShimmerImage` `src` prop inline

### Implementation
- All scene URLs already exist in the `freestyle-images` storage bucket (confirmed via DB query)
- The `d()` helper handles direct URLs; keep `e()` for any remaining `landing-assets/poses/` images
- No new files, no DB changes — single file edit

