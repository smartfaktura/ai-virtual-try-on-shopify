## Why the previews look old

The Studio Shots chip on `/ai-product-photography/bags` renders 8 tiles from a hardcoded list in `src/data/aiProductPhotographyBuiltForGrids.ts` (the `Bags · Studio Shots` block, ~line 2110). Each tile's `imageId` points to a static file in storage.

When the scenes were updated in the library, the new previews got new file names. Examples from the current `product_image_scenes` rows (`category_collection = bags`, `sub_category = Essential Shots`):

```
front-view-bags             → 1779254030949-v68n45.jpg
side-view-bags              → 1779254041863-k3zxv4.jpg
in-hand-studio-bags         → 1779254031965-rv0m89.jpg
reclined-studio-editorial   → 1779254040532-4kp20n.jpg
mid-portrait-hold-bags      → 1779254035988-crjdso.jpg
back-minimal-carry          → 1779254025567-r5307n.jpg
closeup-detail-bags         → 1779254029922-zqx2b6.jpg
interior-view-bags          → 1779254033291-hid7c1.jpg
```

The hardcoded data still references the previous generation of files (`1776239…`, `1776749…`). The imageId-based live-lookup I wired up last turn can never match these, so it correctly falls back to the static URL — which is the old image. Same story for any other category where scenes were re-shot under new filenames.

## Fix

Refresh the `Bags · Studio Shots` entry in `src/data/aiProductPhotographyBuiltForGrids.ts` to mirror the 8 current `Essential Shots` scenes for bags, using their **current** preview imageIds and titles:

```
{ label: 'Front View',                imageId: '1779254030949-v68n45' },
{ label: 'Side View',                 imageId: '1779254041863-k3zxv4' },
{ label: 'In-Hand Studio',            imageId: '1779254031965-rv0m89' },
{ label: 'Reclined Studio Editorial', imageId: '1779254040532-4kp20n' },
{ label: 'Mid Portrait Hold',         imageId: '1779254035988-crjdso' },
{ label: 'Back Minimal Carry',        imageId: '1779254025567-r5307n' },
{ label: 'Close-Up Detail',           imageId: '1779254029922-zqx2b6' },
{ label: 'Interior View',             imageId: '1779254033291-hid7c1' },
```

This:
- Restores 1:1 alignment between the chip grid and the live scenes on the bags page.
- Lets the live-preview-by-imageId lookup keep working: any future small re-render of a scene whose filename is unchanged is reflected automatically, while big re-shoots with new filenames stay easy to point at by editing this one list.
- No DB, admin UI, hooks, or resolver logic changes.

## Scope

- Only `Bags · Studio Shots` in `src/data/aiProductPhotographyBuiltForGrids.ts`.
- Other chips (Campaigns, Editorial Shots, On-Body Editorial, UGC) and other category pages are out of scope for this turn — if they look stale too, we can do the same refresh per chip.

## Not changing

- `src/lib/resolveSlotImage.ts` and `CategoryBuiltForEveryCategory.tsx` stay as-is — the live-lookup wiring from last turn is correct, it just had nothing to match against here.
- No admin overrides are touched.
