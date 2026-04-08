

# Fix: Add `background` to `trigger_blocks` for All Scenes Using `{{background}}`

## The Issue
146 non-fragrance scenes contain `{{background}}` in their prompt template but do NOT have `background` in their `trigger_blocks`. This means:
- The prompt builder **can** resolve the background token
- But the UI **never shows** the background picker for these scenes
- Users have no way to customize backgrounds on packshots, macros, flat lays, or portrait scenes

## The Fix
Add `background` to the `trigger_blocks` array for all 146 affected scenes. This will make the background selection panel visible whenever a user selects any of these scenes.

**Breakdown by scene type:**
- 92 packshot scenes
- 35 macro scenes
- 13 flatlay scenes
- 6 portrait scenes (in-hand-lifestyle variants — already have `personDetails`, will get `background` added)

## Implementation
A single SQL UPDATE using `array_append` on `trigger_blocks` for all scenes where `prompt_template LIKE '%{{background}}%'` and `background` is not already in `trigger_blocks`, excluding fragrance.

No frontend code changes needed — the UI already reads `trigger_blocks` to decide which panels to show.

