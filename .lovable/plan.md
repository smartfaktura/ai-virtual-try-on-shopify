

# Per-Scene Aspect Ratio Overrides

## Problem
Currently the aspect ratio is a single global setting applied to all scenes. Users need the ability to override the format for specific scenes (e.g., all images at 4:5 but Amazon scenes at 1:1).

## Approach

### Data Model
**File**: `types.ts`

Add `sceneAspectOverrides?: Record<string, string>` to `DetailSettings`. Keys are scene IDs, values are aspect ratios. If a scene has no override, it uses the global `aspectRatio`.

### Settings UI
**File**: `ProductImagesStep3Settings.tsx`

- Pass `selectedScenes` as a new prop
- Below the global Format card, add a collapsible "Per-scene overrides" section
- Show a compact list of selected scenes, each with a small ratio chip selector
- When a scene's ratio matches the global ratio, show it as "Default" (muted). Clicking changes it to a custom override
- Add a "Reset all to default" link to clear all overrides
- Update the cost preview to account for mixed ratios (total image count stays the same since ratio doesn't affect count)

### UI Design
```text
┌─────────────────────────────────────────────┐
│  Format (applies to all)                    │
│  [■ 1:1] [▯ 4:5] [▯ 3:4] [▯ 9:16] [▯ 16:9]│
│                                             │
│  ▸ Customize per scene (3 scenes)           │
│  ┌─────────────────────────────────────────┐│
│  │ White Background      [1:1 ▾ default]   ││
│  │ Lifestyle Context     [4:5 ▾ custom]    ││
│  │ Flat Lay Arrangement  [1:1 ▾ default]   ││
│  │                     Reset all to default ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

Each scene row shows the scene name (truncated) and a small dropdown or chip group to pick a ratio. Scenes using the global default are visually muted; overridden scenes are highlighted.

### Props Threading
**File**: `ProductImages.tsx`

Pass `selectedScenes` array to `ProductImagesStep3Settings` so it can render the per-scene list.

## Files Modified

| File | Changes |
|------|---------|
| `types.ts` | Add `sceneAspectOverrides` to `DetailSettings` |
| `ProductImagesStep3Settings.tsx` | Add per-scene override UI, accept `selectedScenes` prop |
| `ProductImages.tsx` | Pass `selectedScenes` to Settings step |

