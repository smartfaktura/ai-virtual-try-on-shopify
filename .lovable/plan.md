

# Fix: Show Scene Outfit Direction for All Scenes

## Problem
The "Scene Outfit Direction" textarea in the admin panel is gated behind `personDetails` or `actionDetails` trigger blocks (line 825). But outfit hints should be available for **any** scene — the whole point is it's a universal override. Your scene only has `aestheticColor` checked, so the field doesn't appear.

## Fix

### `src/pages/AdminProductImageScenes.tsx` (line 825)
Remove the trigger-block condition entirely. The outfit hint textarea should always be visible in the scene form — if an admin fills it in, the prompt builder uses it; if left empty, standard behavior applies.

**Before:**
```tsx
{((draft.trigger_blocks || []).includes('personDetails') || (draft.trigger_blocks || []).includes('actionDetails')) && (
```

**After:**
```tsx
{/* Always visible — outfit hint is a universal override */}
{true && (
```

Or simply remove the conditional wrapper entirely and render the block unconditionally.

### File changed
- `src/pages/AdminProductImageScenes.tsx` — remove condition on line 825, ~1 line change

