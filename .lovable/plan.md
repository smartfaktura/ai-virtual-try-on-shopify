# Fix home-furniture chips: real per-room images + mobile chip layout

Two issues:

1. **Wrong images** — every chip on `/ai-product-photography/home-furniture` shows the same boucle chair in the same handful of empty rooms because the previous patch re-bucketed the *same* 18 imageIds across all rooms. The "Outdoor" tab in the screenshot has no actual outdoor scenes.
2. **Mobile chip rail** — with 7 chips at ~440px wide, the rail scrolls horizontally and only 3–4 chips are visible at once. The user wants them to fit cleanly on a mobile screen.

## Fix 1 — Source real per-room imageIds from the live scene catalog

The `product_image_scenes` table already has true room-tagged scenes for furniture / decor (verified via DB query). I'll replace the `"home-furniture"` entry in `src/data/aiProductPhotographyBuiltForGrids.ts` with **8 real, distinct imageIds per chip**, pulled from these `sub_category` rows:

| Chip | Source `sub_category` | Available scenes |
|---|---|---|
| Living Room | `Living Room` | 18 |
| Bedroom | `Bedroom` | 18 |
| Dining Room | `Dining Room` | 12 |
| Home Office | `Home Office` | 12 |
| Outdoor | `Outdoor Furniture` | 12 (real terraces / patios / pavilions) |
| Hallway | `Hallway` | 12 |
| Home Decor | `Aesthetic Color Decor Stories` + `Console / Table / Shelf Lifestyle` | 12 combined |

Each chip gets the first 8 scenes by `sort_order`, with the imageId extracted from `preview_image_url` (e.g. `1778048568910-lx1q0n`). Card `label` will be a clean human form of `scene_id` (e.g. `furniture-lifestyle-linen-cloud-suite` → `Linen Cloud Suite`).

This is a pure data swap in one file — no new images need to be generated. Identical URL pattern as today (`PREVIEW(imageId)` already resolves to `…/scene-previews/{imageId}.jpg`).

## Fix 2 — Make mobile chip row fit without horizontal scroll

In `src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx`, the mobile rail is currently a horizontal `overflow-x-auto` scroller. With 7 short chips it's small enough to wrap cleanly into 2 rows on a phone.

Change the mobile branch from a snap rail to a centered, wrapped flex container (same pattern the desktop branch already uses), with slightly tighter padding so all 7 chips are visible at once on a 360–440px screen. Keep the desktop branch as-is. Drop the now-unused peek-nudge / scroll-into-view logic for the mobile path.

## Out of scope

- Other category pages.
- New image generation.
- Heading / copy changes.
- The standalone `CategorySubcategoryChips` strip (already hidden for `home-furniture`).
