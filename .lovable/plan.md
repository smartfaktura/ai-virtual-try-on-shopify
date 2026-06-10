## Problem

On `/ai-product-photography/jewelry`, the two necklace tiles in the "Scene Examples" grid (`Editorial Neck Portrait` and `Dark Campaign Necklace`) point at stale preview image IDs that no longer match the current scene library. The "Dark Campaign Necklace" scene was also renamed/removed.

## Fix

In `src/data/aiProductPhotographyCategoryPages.ts` (jewelry block, `sceneExamples` array, lines 486–487), replace the two necklace entries with current scenes pulled from the two subcategories the user requested — **Editorial Neck Studio** and **LIFESTYLE EDITORIAL** — using their real `preview_image_url` IDs.

| Slot | Label | Subcategory | New imageId |
|---|---|---|---|
| 1 | Editorial Neck Portrait | Editorial Neck Studio | `1781094448800-p8owdm` |
| 2 | Mediterranean Sun Necklace | LIFESTYLE EDITORIAL | `1781079796604-6n66k3` |

All other tiles (rings, earrings, bracelets) stay unchanged. Alt text and labels updated to match new scenes.

## Files touched

- `src/data/aiProductPhotographyCategoryPages.ts` — 2 line edits inside the jewelry `sceneExamples`.

No other components, hero image, or copy changes.
