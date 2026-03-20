

# Fix Generated Images Select All Toggle, Summary Scenes, Remove Badges

## Problems
1. **Select All button** cannot toggle to "Deselect All" — clicking it always selects, no way to unselect all
2. **Summary only shows one model/scene** — uses `selectedModel` and `selectedPose` (singular) instead of iterating over `selectedModels`/`selectedPoses` maps
3. **Unnecessary badges** — "Aspect: 4:5" and "Quality: Standard" badges are clutter in the results summary; quality is always high for workflows and aspect ratio is obvious from the images

## Changes

### File: `src/pages/Generate.tsx`

**1. Toggle Select All / Deselect All (line ~3927-3929)**
- Check if all images are already selected (`selectedForPublish.size === generatedImages.length`)
- If yes: clear the set (deselect all)
- If no: select all
- Change button label to reflect current state: "Deselect All" vs "Select All"

**2. Show all selected models and scenes in summary (lines ~3860-3877)**
- Replace the single `selectedModel` block with iteration over `selectedModelMap` values
- Replace the single `selectedPose` block with iteration over `selectedPoseMap` values
- Keep the existing variation-strategy scene display as-is (it already shows multiple)

**3. Remove Aspect and Quality badges (lines ~3897-3899)**
- Remove the `Aspect: {aspectRatio}` badge
- Remove the `Quality: {quality}` badge
- Keep framing and brand profile badges if present

