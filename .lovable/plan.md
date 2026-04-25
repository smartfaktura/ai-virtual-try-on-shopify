Two small fixes:

## 1. Bug: "Built for every fragrance shot" shows a single chip and no images

Root cause: in `CategoryBuiltForEveryCategory.tsx`, the chip merge logic groups by **subject** (the part before `·`). For fragrance, all four built-for groups share the subject "Fragrance" (`Fragrance · Editorial`, `Fragrance · Conceptual Editorial`, `Fragrance · Dream Editorial`, `Fragrance · Essential Shots`). They all collapse into one chip and the visible grid renders only the first 8 cards of one merged blob.

Fix: detect when all groups would merge to a single subject and, in that case, switch the chip label to the **style** part instead. So fragrance chips become: Editorial · Conceptual Editorial · Dream Editorial · Essential Shots. Each chip then shows its own 8-image grid. Same logic protects any future single-subject category.

## 2. Wrong image: "Golden Hour Bottle" on the fragrance page is not a fragrance shot

The scene example uses imageId `1776574228066-oyklfz`, which is a generic editorial portrait (woman in swimwear with mountains) borrowed for the homepage hero — not a fragrance bottle. Replace with a confirmed on-subject fragrance scene from the live catalog: `1776018040785-dq78y5` ("Warm Neutral Studio"), and update the label/alt text accordingly.

Files touched:
- `src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx`
- `src/data/aiProductPhotographyCategoryPages.ts`
