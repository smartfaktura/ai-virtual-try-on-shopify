

## Remove Duplicate "One Product. Every Channel." Section

### Problem
The `/try` page renders two nearly identical showcase sections:
1. `<ChannelShowcase />` (line 81) — the updated one with 9 uploaded model photos, filter chips, 1:1 cards
2. `<BeforeAfterGallery />` (line 84) — older section with the same "One Product. Every Channel." heading, same filter chips, and generic product before/after cards

### Fix — `src/pages/TryFree.tsx`

Remove the `<BeforeAfterGallery />` component call on line 84 and its import on line 7. One line each. The `ChannelShowcase` already replaces it fully.

