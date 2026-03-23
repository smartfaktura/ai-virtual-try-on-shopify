

# Remove "What You Can Create" — Keep Only Recent Creations

## Context
The `RecentCreationsGallery` component already handles both states:
- **No generations yet**: Shows curated scenes as "What You Can Create" with a placeholder title
- **Has generations**: Shows "Recent Creations" with real user images

The user wants to remove the placeholder/curated scenes state entirely, so the gallery only renders when the user has actual creations.

## Changes

### `src/components/app/RecentCreationsGallery.tsx`

1. **Return `null` when no creations exist** — after loading completes and `creations.length === 0`, return `null` instead of showing the curated scenes fallback.

2. **Remove curated scenes logic**:
   - Remove the `CURATED_SCENE_IDS` array (lines 18-26)
   - Remove the `curatedScenes` query (lines 47-60)
   - Remove the `isPlaceholder` variable and `displayItems` conditional (lines 214-225)
   - Always use `creations` directly
   - Remove placeholder-specific text ("What You Can Create", "Explore scenes and styles", "Use Scene", "View More" button with Compass icon)
   - Clean up unused imports (`Compass`)

### Files
- `src/components/app/RecentCreationsGallery.tsx` — remove curated scenes fallback, return null when empty

