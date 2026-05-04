
## Limit scene thumbnails + improve model/reference/styling UX

### 1. Cap scene thumbnail strips at 4 + overflow counter

All three thumbnail strips (background, outfit, aesthetic) currently render every scene. Change each to show max 4 thumbnails + a "+N more" card when there are more than 4 scenes.

Extract a shared helper render pattern:
```
const MAX_THUMBS = 4;
const visible = scenes.slice(0, MAX_THUMBS);
const overflow = scenes.length - MAX_THUMBS;
```
The "+N" card is a 52x65 rounded-lg with muted bg, centered text showing `+{overflow}`.

**Files:** `ProductImagesStep3Refine.tsx` — 3 thumbnail strips (bg ~line 2619, outfit ~line 2718, aesthetic ~line 3236)

### 2. Improve "Choose model" card copy

- Change title from "Choose model" to "Model Selection"
- Change subtitle from "Needed for X selected shots." to "Pick one or more models for your {X} on-model shots"

**Files:** `ProductImagesStep3Refine.tsx` ~lines 2542, 2558

### 3. Simplify styling direction textarea

Replace the current label + textarea + helper trio with a single-line collapsible:
- Show a subtle clickable row: pencil icon + "Add styling direction" (collapsed by default)
- On click, expand to show the textarea only
- Remove the `<Label>`, the `<Info>` icon, and the bottom helper `<p>` tag
- Keep the textarea placeholder as-is

**Files:** `ProductImagesStep3Refine.tsx` ~lines 2830-2847

### 4. Add scene thumbnails near reference sections

For each reference card (packaging, back view, trigger-based), compute which selected scenes actually use that trigger and show a small thumbnail strip (also capped at 4) above the upload area so the user knows which shots benefit from the reference.

**Files:** `ProductImagesStep3Refine.tsx` ~lines 3409-3460
