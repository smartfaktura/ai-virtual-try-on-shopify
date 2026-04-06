

# Fix Scene Settings: Use Side Panel Instead of Below-Grid Expansion

## Problem

The expanded settings panel renders below the entire card grid, pushing content off-screen. Users click a card and see nothing happen because the panel is hidden below the fold. Auto-scroll is a band-aid — the real issue is the interaction pattern.

## Solution

**Replace the below-grid expansion with a right-side Sheet (drawer).** Clicking a scene card opens a slide-in panel from the right edge with that scene's settings. The card grid stays fully visible and undisturbed.

This pattern is already used elsewhere in the app (Sheet component exists in `src/components/ui/sheet.tsx`). It works well on all screen sizes — on mobile it overlays the full width, on desktop it slides in at ~400px.

## Changes

| File | What |
|---|---|
| `ProductImagesStep3Refine.tsx` | (1) Remove inline `renderExpandedPanel` calls from after both grids. (2) Add a single `<Sheet>` at the bottom of the section, controlled by `expandedSceneId`. When a scene card is clicked, `expandedSceneId` is set and the Sheet opens with that scene's settings. (3) The Sheet header shows the scene thumbnail + title. The body contains the same collapsible blocks (Visual Direction, Style, etc.) that currently live in `renderExpandedPanel`. (4) Scene cards keep their selected/highlighted border state but no longer need the chevron rotation — replace with a small settings icon. (5) Clicking the card again or the Sheet's X closes it. |

The Sheet provides immediate visibility (slides in from the right, always in viewport), clear visual hierarchy (overlay with backdrop), and works responsively out of the box.

