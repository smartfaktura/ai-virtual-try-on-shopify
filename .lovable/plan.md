

# Fix Favorite Overlay on Library Cards

## Problem
Two separate favorite indicators overlap at `top-3 right-3`:
1. A **persistent heart** (always visible when favorited) — small, no background
2. A **hover heart button** (visible on hover) — larger, with circular `bg-black/40` background

They stack on top of each other on hover, creating the messy look from the screenshot.

## Fix
**Remove the persistent favorite indicator entirely** (lines 113-120). The hover overlay heart already shows the filled/unfilled state. When not hovering, favorited items don't need a persistent badge — the Favorites smart view tab handles filtering.

If we want a subtle always-visible indicator for favorited items, move it to a **different position** (e.g., bottom-left as a small dot or glow) so it never collides with the hover button. But the cleaner approach is: heart button on hover only, filled red when favorited.

## Changes — single file

### `src/components/app/LibraryImageCard.tsx`
- **Remove** the persistent favorite indicator block (lines 113-120)
- The hover overlay heart button (lines 163-174) already handles both states (filled rose when favorited, outline when not)
- No other changes needed

