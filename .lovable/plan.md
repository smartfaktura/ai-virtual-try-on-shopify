## Why the "Studio Shots" tiles still show the old previews

Two different image sources feed the chip grid:

1. **Admin override** — when `/app/admin/seo-page-visuals` has a row for a slot, the page uses the override scene's live `preview_image_url`. (Just fixed in the previous turn.)
2. **Hardcoded fallback** — when no override exists, the tile renders `PREVIEW(card.imageId)`, which is a frozen URL pointing at a single static file in storage: `…/scene-previews/{imageId}.jpg`.

For `/ai-product-photography/bags` the override table only has rows for `builtFor_editorial-shots_*` and the orphaned `builtFor_editorial-studio_*`. The chips you see in the screenshot — **Campaigns**, **Studio Shots**, **UGC**, **On-Body Editorial** — have **no overrides set**, so every tile renders the hardcoded fallback URL keyed by `imageId`. Updating a scene in the scene library does not touch those static URLs, so the page keeps showing the original file at that exact path.

## What to change

Make hardcoded fallback tiles also resolve to the **live scene preview** when their `imageId` corresponds to a scene in the public library. That way, any scene you refresh in the library propagates to every chip that references it — no admin override needed.

### How the matching works

Each public scene's `preview_image_url` currently looks like:

```
https://…/scene-previews/{imageId}.{ext}
```

We can build a Map at runtime: `imageId → live preview_image_url`, by parsing the filename out of every scene's `preview_image_url`. Then when a tile has no admin override, instead of returning `PREVIEW(card.imageId)` we return the live URL for that `imageId` if one exists, falling back to `PREVIEW(card.imageId)` otherwise.

### Files

1. **`src/lib/resolveSlotImage.ts`** — add `livePreviewByImageId?: Map<string, string>` to `resolveSlotImageUrl`. When there's no override row, check the map for `imageId` (passed as a new arg) and use that if present; otherwise return `fallbackUrl`.

2. **`src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx`** — extend the existing `useMemo` over `scenes` to also build `livePreviewByImageId` by extracting the `{imageId}` segment from each scene's `preview_image_url`. Pass it plus `card.imageId` into `resolveSlotImageUrl`.

3. **No DB changes**, no admin UI changes, no data file edits.

## Caveats worth knowing

- If a scene was **renamed in the library to a brand-new filename** that no longer matches `card.imageId`, the map won't have an entry for that old id and the tile will keep showing the old static file. In that case the fix is either to set an explicit admin override for that tile, or to update `imageId` in `aiProductPhotographyBuiltForGrids.ts`. I can do a follow-up sweep of which bag cards fall into this bucket if you want.
- This only affects how fallback images are *resolved* at render time — nothing about the SEO `alt` text, hover labels (already live), or the static file URLs themselves changes.

## Verification

- Reload `/ai-product-photography/bags`, click each chip — tiles whose underlying scenes you updated now show the new previews.
- Other category pages keep working: any tile whose `imageId` matches a live scene picks up the live preview; tiles that don't match still render the existing static fallback.
