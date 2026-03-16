

## Plan: Simplify "What You Can Create" section and modal

### Changes

**`src/components/app/RecentCreationsGallery.tsx`**

1. **Subtitle text** (line 176): Change from `"Copy any style, scene, or prompt to create your own."` to `"Explore scenes and styles to get started."`

2. **Remove "Copy Prompt" button** (lines 341-348): Delete the secondary actions section with the Copy Prompt button entirely.

3. **Remove Prompt section** (lines 301-305): Remove the "PROMPT" label and prompt text display from the modal since we're no longer offering copy prompt.

4. **Rename primary CTA** (line 323): Change `"Use This Style"` to `"Try in Freestyle"` — shorter, clearer action.

5. **Remove `Copy` import** (line 4): No longer needed. Remove `handleCopyPrompt` handler (lines 157-160) and the `onCopyPrompt` prop from `PresetDetailOverlay`.

