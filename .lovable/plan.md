

# Improve Refine Step: Banner, Background Indicators, Triangle

## 1. Redesign Model-Needed Banner

The current `Alert` with `AlertTriangle` icon looks generic and dated. Replace with a sleek inline card:

**File:** `ProductImagesStep3Refine.tsx` (lines 1459-1510)

- Remove the `Alert`/`AlertDescription` wrapper
- Replace with a minimal bordered card: subtle amber left-border accent (4px), clean layout with scene thumbnails inline, and a compact "Select Model" pill button
- When model IS selected: show a subtle green left-border with checkmark and "Model applied to N scenes" in muted text — much more compact, single line
- Remove the large triangle icon; use a small colored dot indicator instead

## 2. Show Background-Editable Indicator on Scene Cards

Each scene's `triggerBlocks` array already defines whether it has `'background'` controls. Surface this on the card:

**File:** `ProductImagesStep3Refine.tsx` (in `renderSceneCardButton`)

- Check if scene has `'background'` in its `triggerBlocks`
- If yes, show a small `Paintbrush` icon or "BG" chip on the card so users can see at a glance which scenes support background customization
- This answers the user's question: not all scenes have background settings — only those with `'background'` in `triggerBlocks` (e.g., Packshot, Marketplace, Pedestal) do

## 3. Fix Triangle Indicator

The CSS border-triangle approach still looks awkward. Replace with a cleaner visual connector:

**File:** `ProductImagesStep3Refine.tsx` (lines 1687-1696)

- Remove the layered border-triangle divs entirely
- Instead, use a simple thin vertical line (2px wide, 12px tall, border color) centered below the active card, connecting it to the expanded panel
- The expanded panel itself already has `border-primary/30` — the connector line uses the same color
- This creates a clean, minimal "stem" connecting card to panel, matching the app's editorial aesthetic

## Files

| File | Changes |
|---|---|
| `ProductImagesStep3Refine.tsx` | (1) Redesign model banner to sleek left-bordered card. (2) Add background-editable indicator on scene cards. (3) Replace triangle with thin vertical connector line. |

