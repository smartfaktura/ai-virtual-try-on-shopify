

# Fix: Uploaded Scene Image Ignored When Scene Chip Also Selected

## Root Cause

When the user uploads an image and sets "Using image as: Scene", AND also has a scene chip selected (e.g. "White Seamless"), two conflicts occur:

1. **Duplicate scene references** — Both the uploaded image (via `sourceImage` labeled `[SCENE REFERENCE]`) and the scene chip image (via `sceneImage` also labeled `[SCENE REFERENCE]`) are sent to the AI. The model sees two conflicting environments and picks one arbitrarily (usually the simpler white one).

2. **Auto-prompt conflict** — The auto-generated prompt appends "set in a White Seamless environment — Pure white infinity backdrop..." from the scene chip's `promptHint`, which directly contradicts the uploaded scene.

## Fix

When the user uploads an image as "Scene", the uploaded image should take priority — automatically clear the selected scene chip.

### `src/pages/Freestyle.tsx`

In the `imageRole` change handler (or wherever `imageRole` is set to `'scene'`), auto-clear `selectedScene`:

- When `imageRole` changes to `'scene'`: set `selectedScene` to `null`
- This prevents the duplicate `[SCENE REFERENCE]` and conflicting prompt text
- The uploaded scene image becomes the sole scene reference

Also apply the reverse: when the user selects a scene chip while `imageRole === 'scene'`, switch `imageRole` back to the default (e.g. `'product'`), OR simply clear the uploaded source image's scene role.

### Simpler alternative (recommended)

Just auto-clear `selectedScene` when `imageRole === 'scene'` in the `handleGenerate` function, right before building the payload. This is the minimal fix:

```typescript
// If user uploaded image as scene, their upload takes priority over scene chip
if (imageRole === 'scene' && sourceImage) {
  // Clear scene chip to avoid duplicate [SCENE REFERENCE] conflict
  sceneImageUrl = undefined;
  // Also skip scene promptHint from auto-prompt
}
```

This ensures:
- Only one `[SCENE REFERENCE]` is sent (the uploaded image)
- The auto-prompt doesn't inject conflicting white background instructions from the scene chip
- The scene chip remains visually selected but doesn't interfere with generation

### Files to change

1. **`src/pages/Freestyle.tsx`** — In `handleGenerate`, when `imageRole === 'scene'` and `sourceImage` exists, skip `sceneImageUrl` and skip scene promptHint in auto-prompt building
2. Optionally: auto-clear `selectedScene` when user sets `imageRole` to `'scene'` for better UX clarity

