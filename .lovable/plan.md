

## Creative Drops Section Redesign

### Overview
Reduce the drop timeline from 5 cards to 3, switch thumbnails to portrait orientation, show 3 visible images per drop plus a "+more" indicator, and generate new images with varied model poses (sitting, walking, standing) all wearing the same white crop top.

### Visual Changes

**Current state**: 5 drop cards, each with 4 small landscape thumbnails
**New state**: 3 drop cards (November, September, June), each with 3 tall portrait thumbnails + a "+N" overflow box

Layout per drop card:
```text
+------------------------------------------+
| [icon] November Drop         Delivered    |
|         16 visuals - Pilates Studio       |
+------------------------------------------+
| [portrait] [portrait] [portrait] [+12]   |
|  standing    seated    in-motion  more    |
+------------------------------------------+
```

### Image Generation (9 new images)

All images feature the same white Alo Yoga crop top on different models with varied poses:

**November Drop (Pilates Studio aesthetic)**
- `drop-nov-portrait-1.jpg` -- Model standing in minimalist white pilates studio
- `drop-nov-portrait-2.jpg` -- Model seated on reformer/bench in studio
- `drop-nov-portrait-3.jpg` -- Model in movement/stretching pose in studio

**September Drop (Autumn Collection)**
- `drop-sept-portrait-1.jpg` -- Model walking through autumn foliage path
- `drop-sept-portrait-2.jpg` -- Model standing against golden-leaf backdrop
- `drop-sept-portrait-3.jpg` -- Model seated on park bench with fall colors

**June Drop (Summer Campaign)**
- `drop-june-portrait-1.jpg` -- Model standing in bright sunlit garden
- `drop-june-portrait-2.jpg` -- Model walking on beach/boardwalk
- `drop-june-portrait-3.jpg` -- Model sitting at outdoor cafe/terrace

All images will be generated in portrait orientation (taller than wide) using Lovable AI image generation.

### Component Changes (`CreativeDropsSection.tsx`)

1. **Remove March and January drops** -- keep only November, September, June
2. **Remove unused imports** for old drop assets (model-specific ones and old seasonal ones)
3. **Import 9 new portrait images**
4. **Update thumbnail layout**:
   - Change from 4 equal landscape thumbnails to 3 portrait thumbnails + 1 overflow box
   - Make thumbnails taller: change from `h-16` to approximately `h-28` or `h-32` for portrait feel
   - Add a 4th slot styled as a muted box with "+12 more" or similar infinity indicator
5. **Adjust opacity** across only 3 cards: `opacity-100`, `opacity-80`, `opacity-60`
6. **Widen the max width** of the right column slightly to accommodate taller images

### Technical Details

- Generate images via Lovable AI (google/gemini-2.5-flash-image model) with specific prompts for each seasonal/pose variation
- Save generated images to `src/assets/drops/` with the new naming convention
- Update the `drops` array to reference only 3 entries with the new portrait assets
- Keep existing left-side copy (headline, bullets, CTA button) unchanged

