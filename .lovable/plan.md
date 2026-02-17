

## Unique Carousel Animation for Selfie / UGC Set

### Problem
The Selfie / UGC Set uses the same "pop in elements then exit" animation pattern as all other workflows. The user wants a distinct animation: a continuous image carousel/slideshow with the recipe formula ("Product + Creator = Generated") always visible, plus a loading progress bar between transitions.

### Solution
Add a new animation mode (`mode: 'carousel'`) to the `WorkflowScene` type, and implement a dedicated rendering path in `WorkflowAnimatedThumbnail` that shows:
1. Static overlay chips (Product, +, Creator, = Generated) visible at all times
2. Background images crossfading in a carousel loop (4 UGC results rotating every ~3s)
3. A thin progress bar at the bottom that fills during each image's display time

### Changes

**File: `src/components/app/WorkflowAnimatedThumbnail.tsx`**

1. Add `mode?: 'recipe' | 'carousel'` to the `WorkflowScene` interface
2. Add a new rendering branch when `scene.mode === 'carousel'`:
   - Use React state to track the current background index, cycling every ~3 seconds
   - Render two stacked `<img>` tags for crossfade transitions (current and next image with opacity animation)
   - Render a thin horizontal progress bar (2-3px) at the bottom that animates from 0% to 100% width over the display interval
   - Render persistent overlay elements:
     - Top-left: Product chip (Ice Roller with thumbnail)
     - Top-right: Creator avatar circle
     - Center: Plus icon
     - Bottom-left: "UGC Style" badge
     - Bottom-right: "Generated" sparkle badge
   - These elements fade in once on mount and stay visible permanently (no exit animation)
3. Add CSS keyframes for the new animations:
   - `wf-carousel-crossfade`: opacity 0 to 1 transition
   - `wf-progress-fill`: width 0% to 100%

**File: `src/components/app/workflowAnimationData.tsx`**

1. Update the `'Selfie / UGC Set'` scene definition:
   - Add `mode: 'carousel'` property
   - Keep the existing `backgrounds` array (4 UGC result images)
   - Keep the existing `elements` array (used for the persistent overlay chips)
   - Remove `enterDelay` and `animation` properties from elements (they stay visible always)

### Animation Flow

```text
  +------------------------------------------+
  | [Product: Ice Roller]    [Creator avatar] |
  |                                          |
  |           [ + icon ]                     |
  |                                          |
  |   Background image                       |
  |   (crossfades every 3s)                  |
  |                                          |
  | [UGC Style]          [Sparkles Generated]|
  | [====progress bar filling====]           |
  +------------------------------------------+
```

- Images rotate: result-1 -> result-2 -> result-3 -> result-4 -> result-1...
- Each image displays for ~3 seconds with a smooth 0.6s crossfade
- Progress bar resets and fills for each image cycle
- All overlay chips remain visible throughout

### Files Modified

| File | Change |
|---|---|
| `src/components/app/WorkflowAnimatedThumbnail.tsx` | Add carousel mode rendering path with crossfade + progress bar |
| `src/components/app/workflowAnimationData.tsx` | Set `mode: 'carousel'` on UGC Set scene |

