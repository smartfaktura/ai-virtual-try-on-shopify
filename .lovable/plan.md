

## Refresh Environment Showcase with different scenes from Freestyle

### Problem
The current showcase reuses the same scenes that were just added. The user wants a different selection drawn from the full Freestyle scene library (30 on-model + 18 product scenes).

### Changes — `src/components/landing/EnvironmentShowcaseSection.tsx`

Replace ROW_1 and ROW_2 arrays with scenes not currently shown, keeping a good mix across categories (studio, lifestyle, editorial, streetwear) and including both male and female variants for diversity.

**ROW_1** (9 cards, left marquee):
1. Studio Movement (`pose-studio-movement.jpg`)
2. Urban Walking (`pose-lifestyle-walking.jpg`)
3. Editorial Artistic (`pose-editorial-artistic.jpg`)
4. Rooftop City (`pose-lifestyle-rooftop.jpg`)
5. Night Neon (`pose-streetwear-neon.jpg`)
6. Studio Back View (`pose-studio-back.jpg`)
7. Beach Sunset (`pose-lifestyle-beach.jpg`)
8. Editorial Movement (`pose-editorial-motion.jpg`)
9. Urban Stairs Male (`pose-streetwear-stairs-male.jpg`)

**ROW_2** (9 cards, right marquee):
1. Studio Crossed Arms Male (`pose-studio-arms-male.jpg`)
2. Garden Natural (`pose-lifestyle-garden.jpg`)
3. Basketball Court (`pose-streetwear-basketball.jpg`)
4. Studio Close-Up (`pose-studio-closeup.jpg`)
5. Industrial Underpass (`pose-streetwear-underpass.jpg`)
6. Rooftop Male (`pose-lifestyle-rooftop-male.jpg`)
7. Editorial Dramatic Male (`pose-editorial-dramatic-male.jpg`)
8. Studio Movement Male (`pose-studio-movement-male.jpg`)
9. Autumn Male (`pose-lifestyle-autumn-male.jpg`)

All these files already exist in the `poses/` storage folder. No other files change.

