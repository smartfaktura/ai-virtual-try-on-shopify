
## Changes to `ProductImagesStep3Refine.tsx`

### 1. Swap card order: Model first, Background second

Move the "Choose model" card block (lines ~2572-2700+) **above** the "Background style" card block (lines ~2518-2568). This makes the user pick their model first, then select background color — matching the logical flow.

### 2. Add scene thumbnail strip to Background style card

Add a scene thumbnails strip to the Background style card, matching the same pattern used by the Aesthetic color card (lines ~3031-3057). This will show small previews of the scenes that require a background color, so the user clearly understands which shots are affected.

The strip will display each `bgScene` with its preview image and title, styled identically to the aesthetic color card's thumbnail row (52px wide cards with scene name below).

### Result

- Users first pick their model, then scroll to background color — a more natural sequence
- Background style card will show scene thumbnails so users immediately see which shots need a background, removing ambiguity
