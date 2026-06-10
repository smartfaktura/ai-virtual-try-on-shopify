## Goal

Rebuild the "Built for every supplements & wellness shot" chip rail + grids on `/ai-product-photography/supplements-wellness` so the chips and the 8-image grids beneath each chip match the **current** state of the wellness library (which now has 60 scenes across 7 sub-categories, including the new Outdoor Editorial set and many new Editorial Wellness Routine / Creative Shots).

## Why it's wrong today

`src/data/aiProductPhotographyBuiltForGrids.ts` `supplements-wellness` block is stale:
- Missing the new **Outdoor Editorial** chip (3 new coastal scenes)
- "Editorial Routine" chip still shows the 6 older shots, missing 7 new editorial routine scenes (Soft Ritual Hold, Pure Joy Glow, Sunlit Ritual Hand Hold, Glossed Wellness Close-Up, Bathroom Wellness Routine, Clean Profile Wellness Hold, Joyful Active Beauty Hold)
- "Creative Shots" chip references some old scene IDs but misses new ones (Sky Product Portrait, Brutalist Concrete, Volcanic Sunset, Earthy Botanicals Plinth, etc.) and contains 2 IDs no longer in the live library (`1775135707468-egh405`, `1775132044712-m8fods`)
- "Essential Shots" still has `1776247486394-r95qn0` and `1776247476167-fwn0so` which are no longer in the active wellness library (replaced with Hard Shadow Hero, new In-Hand Studio, new Close-Up Detail)
- Daily UGC has a stale `Post-Workout Routine` and `Smoothie or Mix Prep Lifestyle` (no longer active) — only 4 daily UGC scenes are live now

## What changes (single file)

Replace the `"supplements-wellness": [...]` block (lines 1727–1914) of `src/data/aiProductPhotographyBuiltForGrids.ts` with 7 chip groups, in this order. All `subCategory` values keep the `"Supplements · {Style}"` prefix so `splitLabel` produces short, single-word-ish chips ("Essential Shots", "Editorial Routine", …) — same convention used across all other categories.

Each group capped at 8 cards (matches the live grid). New / refreshed list (all IDs verified live in DB):

### 1. Supplements · Essential Shots (8)
Front View · In-Hand Studio · Capsule / Tablet Spill · Close-Up Detail · In-Hand Lifestyle · Product + Packaging · Back View · Hard Shadow Hero

### 2. Supplements · Editorial Routine (8 of 13 — newest first)
Soft Ritual Hold · Pure Joy Glow · Glossed Wellness Close-Up · Sunlit Ritual Hand Hold · Morning Counter Ritual · Hand and Water Ritual · Bathroom Wellness Routine · Wellness Tray Ritual

### 3. Supplements · Aesthetic Color (6 — all live)
Color Counter Ritual · Color Kitchen Wellness Story · Color Surface Still Life · Color Reflection Wellness Mood · Color Tray Ritual Hero · Color Hero Campaign Wellness

### 4. Supplements · Still Life (5 — all live)
Powder and Scoop Still · Ingredient Pairing Surface Story · Capsule Dish and Tray Composition · Clean Product and Water Glass Still · Macro Wellness Detail Still

### 5. Supplements · Daily UGC (4 — all live)
Kitchen Counter Daily Use · Workday Wellness Break · Travel or On-the-Go Wellness · Handheld Daily Wellness Moment

### 6. Supplements · Outdoor Editorial (3 — NEW chip)
Coastal Cliff · Coastal Wellness Ritual · Beachside Supplement Ritual

### 7. Supplements · Creative Shots (8 of 21 — curated mix new + classics)
Sky Product Portrait · Brutalist Concrete · Volcanic Sunset · Dynamic Water Splash · Earthy Botanicals Plinth · Frozen Aura · Sunny Shadows · Warm Neutral Studio

## Technical notes

- Chip labels come from `splitLabel(subCategory).subject`. The grid resolver auto-strips the shared "Supplements" prefix because all 7 entries share it (`singleSubject` branch in `getBuiltForGroupsForPage`). Result: chip rail reads `Essential Shots · Editorial Routine · Aesthetic Color · Still Life · Daily UGC · Outdoor Editorial · Creative Shots`.
- All `imageId` values are the `scene-previews/{id}.jpg` filename (no extension); `PREVIEW(id)` builds the URL. None are in the PNG list — all `.jpg`.
- Admin SEO overrides are keyed by `builtFor_{slot-slug}_{n}`. Renaming/reordering creates new slot keys, so any existing per-slot admin overrides for old wellness slots become orphaned — they don't break anything (the page falls back to the new defaults).
- The file header says "AUTO-GENERATED" by `scripts/build_category_grids.py`. We're hand-editing only the wellness block because the live library is the source of truth and the script hasn't been re-run since the new scenes shipped. If the script is run later, it should regenerate this same block from the DB.

## Out of scope

- No layout/component changes (`CategoryBuiltForEveryCategory.tsx` already supports any chip count).
- Other categories (`fashion`, `electronics-gadgets`, etc.) untouched.
- The `sceneExamples` and `heroImageId` on the supplements-wellness page were already refreshed in the previous turn — unchanged here.
