## Why

Older blog cards show a 3-image collage because their `coverImage` is a pre-composed collage asset (e.g. `blogImgAiPhotography`). The three new posts (swimwear / bags / fashion) use a single scene image as `coverImage`, so they render as one image instead of the triple-image look.

## Change

1. **Type** — add optional `coverImages?: string[]` (length 3) to `BlogPost` in `src/data/blogPosts.ts`.
2. **Card render** — in `src/pages/Blog.tsx`, when `post.coverImages` has 3 entries, render a 3-column grid of those images (object-cover, same total aspect as current cover) inside the existing card image slot. Otherwise keep the current single `coverImage` behavior. Apply to both the featured block and the grid cards.
3. **Detail page** — in `src/pages/BlogPost.tsx` hero, do the same: if `coverImages` exists, render a 3-up grid; else fall back to current single image. OG/meta still uses `coverImage` (single).
4. **Data** — for each of the three new posts, add `coverImages` with 3 category-appropriate URLs sourced from the existing scene-preview URLs already used in `src/data/aiProductPhotographyCategoryPages.ts` / `aiProductPhotographyBuiltForGrids.ts` for swimwear, bags-accessories, and fashion. Keep the existing single `coverImage` as fallback for OG.

No other posts change — older posts continue to use their pre-composed collage `coverImage`.

## Files

- `src/data/blogPosts.ts` — type + 3 data entries
- `src/pages/Blog.tsx` — conditional 3-up grid in cards
- `src/pages/BlogPost.tsx` — conditional 3-up grid in hero
