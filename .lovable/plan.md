

# Fix Scene Card Expansion Layout

## Problem

The expanded settings panel is rendered **inside** the CSS grid as a `col-span-full` sibling of `col-span-1` cards. CSS grid places items sequentially, so the expanded panel fills the remaining columns of its row and then wraps — creating unpredictable gaps and layout shifts depending on which card position is clicked and the current breakpoint. This is why it feels "buggy across different screens."

## Fix

**Move the expanded panel outside the grid entirely.** Instead of rendering it as a grid sibling via `React.Fragment`, render it as a standalone full-width block **below** the grid. The card itself stays in the grid with its highlighted border; the settings panel appears beneath the entire grid row as a clearly separated panel.

### Implementation

In `ProductImagesStep3Refine.tsx`, split `renderSceneCard` into two parts:

1. **Card only** (stays inside the grid) — remove the expanded panel from the Fragment, just return the button card.
2. **Expanded panel** (rendered outside the grid) — after each `<div className="grid ...">` that maps scene cards, render a conditional block: `{expandedSceneId && expandedScene is in this group && <ExpandedPanel />}`.

This guarantees the panel always gets full container width regardless of grid column count or card position.

### Changes

| File | What |
|---|---|
| `ProductImagesStep3Refine.tsx` | (1) Extract card rendering to only return the button — no Fragment, no expanded panel inside grid. (2) After each grid (`productShots` grid and `modelShots` grid), render the expanded panel conditionally when the expanded scene belongs to that group. The panel markup stays identical, just moves outside the `grid` div. |

