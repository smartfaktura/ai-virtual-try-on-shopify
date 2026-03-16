

## Plan: Refresh Environment Showcase with more diverse scenes

### What changes
**`src/components/landing/EnvironmentShowcaseSection.tsx`** — Replace ROW_1 and ROW_2 arrays with a refreshed mix of scenes. Swap out ~8 cards for ones not currently shown, including male poses for diversity. Keep the same card count (9 per row) and update the badge to "30+ Scenes" since the library has grown.

### New scene lineup

**ROW_1** (left marquee):
1. Studio Classic → keep (`pose-studio-front.jpg`)
2. ~~Beach~~ → **Gym** (`pose-lifestyle-gym.jpg`)
3. Editorial Dark → keep (`pose-editorial-dramatic.jpg`)
4. ~~Neon Night~~ → **Resort** (`pose-lifestyle-resort.jpg`)
5. Coffee Shop → keep (`pose-lifestyle-coffee.jpg`)
6. ~~Studio Profile~~ → **Gallery** (`pose-editorial-gallery.jpg`)
7. ~~Garden~~ → **Urban Male** (`pose-streetwear-urban-male.jpg`)
8. Window Light → keep (`pose-editorial-window.jpg`)
9. ~~Urban Street~~ → **Autumn** (`pose-lifestyle-autumn.jpg`)

**ROW_2** (right marquee):
1. ~~Rooftop~~ → **Studio Profile Male** (`pose-studio-profile-male.jpg`)
2. Minimal White → keep (`pose-editorial-minimal.jpg`)
3. ~~Industrial~~ → **Shopping** (`pose-streetwear-shopping.jpg`)
4. ~~Studio Motion~~ → **Warehouse** (`pose-editorial-warehouse.jpg`)
5. Park → keep (`pose-lifestyle-park.jpg`)
6. Moody Editorial → keep (`pose-editorial-moody.jpg`)
7. ~~Basketball Court~~ → **Beach Male** (`pose-lifestyle-beach-male.jpg`)
8. Café Seated → keep (`pose-lifestyle-seated.jpg`)
9. ~~Underpass~~ → **Garden Male** (`pose-lifestyle-garden-male.jpg`)

### Badge update
Change "24+ Scenes" → "30+ Scenes"

### No other files affected
Same component structure, same marquee logic, same image optimization approach.

