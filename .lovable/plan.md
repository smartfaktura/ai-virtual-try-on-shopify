

# Add "Fit Your Brand" Color Hint to Sub-Category Headers

## Problem
Scene cards show curator color swatches (e.g., Buttercream for Concept Shots), but there's no indication that these are just suggestions and fully customizable. Users assume they're locked to one color per group.

## Solution
Add a compact animated hint next to sub-category labels that have curator colors. The hint cycles through 3-4 colors with a smooth crossfade animation, visually demonstrating "you can pick any color." Accompanied by a short text like "Fit your brand aesthetic."

```text
CONCEPT SHOTS ── [● ● ●] Fit your brand aesthetic ──────── Select All
                  ↑ cycles through colors every 2s
```

## Design Details

**Color cycling animation:**
- Extract the curator color from scenes in the sub-group
- Show a single swatch dot that crossfades between the curator color → 3 other common brand colors (e.g., black, warm beige, sage) on a 2-second interval
- Uses CSS `transition-colors duration-500` for smooth color morphing
- Small `useEffect` with `setInterval` to rotate through the palette

**Text + layout:**
- Sits inline after the sub-group label, before the divider line
- Text: "Fit your brand aesthetic" in `text-[10px] text-muted-foreground/60 italic`
- Only renders when at least one scene in the group has `suggestedColors`
- Entire hint is a subtle, non-interactive element

## Technical Details

### File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

**SubGroupSection component (~line 708):**

1. Derive curator color: `const curatorColor = scenes.find(s => s.suggestedColors?.length)?.suggestedColors?.[0]`
2. If `curatorColor` exists, render a small `CuratorColorHint` inline component after the label `<p>`:
   - Uses `useState` + `useEffect` to cycle through `[curatorColor.hex, '#1a1a1a', '#D4C5B2', '#8B9E7E']` every 2 seconds
   - Renders: `<span className="flex items-center gap-1.5">` containing:
     - A `div` with `w-2.5 h-2.5 rounded-full transition-colors duration-500` and inline `backgroundColor` set to current color
     - Text: `"Fit your brand aesthetic"` styled `text-[10px] text-muted-foreground/60 italic`

This is ~25 lines of code in one file. No database changes.

