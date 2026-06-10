## Goal

Three updates to `/ai-product-photography/eyewear`:

1. Swap the hero banner editorial image to the new old-money outdoor portrait.
2. Add 2 new cards to the **Color Vintage** chip in the "Built for every eyewear shot" grid.
3. Flag the trailing **"Also."** in your message — looks cut off; I'll ship the two confirmed changes and wait on the third.

## File 1 — `src/data/aiProductPhotographyCategoryPages.ts` (eyewear entry)

- `heroImageId`: replace `beauty-closeup-oversized-eyewear-1776150210659` with `apparel-oldmoney-outdoor-portrait-copy-copy-copy-copy-copy-1780507647655`
- `heroAlt`: update to "AI eyewear product photography example showing an old-money outdoor editorial portrait"
- `heroCollage` first tile keeps the original beauty closeup (collage is a separate 4-up; leaving it alone unless you say otherwise).

## File 2 — `src/data/aiProductPhotographyBuiltForGrids.ts` (eyewear → Color Vintage)

Append 2 new cards to the existing 6 (chip will then show 8 — the max the grid renders):

```
{ "label": "Color Vintage Studio",  "imageId": "1780509112937-eo400q" },
{ "label": "Color Vintage Editorial", "imageId": "1780509114264-eb6aw7" }
```

(Final labels: open to your preferred wording — these are placeholders that read naturally next to the existing Color Vintage cards.)

## Technical notes

- All three new imageIds use the `scene-previews/{id}.jpg` pattern that `PREVIEW(id)` already builds — no PNG list entry needed.
- No layout or component changes.

## Question before I build

You wrote **"Also."** at the end with nothing after — was there a third change (another section, another image, a copy edit)? If yes, share it and I'll roll it into the same turn. If you meant nothing further, just say "go" and I'll ship #1 + #2.
