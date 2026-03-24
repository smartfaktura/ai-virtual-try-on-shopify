

# Pin "Studio Profile" First for Fashion Category

## Change

In `src/components/app/freestyle/FreestyleQuickPresets.tsx`, update `buildPersonalizedScenes` to check if the user has `fashion` in their categories. If so, find the "Studio Profile" scene (`pose_002`) in `allScenes`, place it first in the result array, then fill the remaining 7 slots with the normal distribution logic (skipping `pose_002` since it's already used).

### File
- `src/components/app/freestyle/FreestyleQuickPresets.tsx` — after building the result array, if `fashion` is in `filtered` categories, prepend `pose_002` and cap at 8 total

