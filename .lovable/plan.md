

# Fix Duplicate Missing Fields in Admin Scene Management

## Problem
When duplicating a scene, `suggested_colors` and `outfit_hint` are not copied to the new scene — they're missing from the `handleDuplicate` function.

## Fix
**File:** `src/pages/AdminProductImageScenes.tsx` (lines 246-261)

Add the two missing fields to the upsert call inside `handleDuplicate`:

```tsx
suggested_colors: scene.suggested_colors,
outfit_hint: scene.outfit_hint,
```

These go after `use_scene_reference` (line 261).

### Files changed
1. `src/pages/AdminProductImageScenes.tsx` — add `suggested_colors` and `outfit_hint` to duplicate payload

