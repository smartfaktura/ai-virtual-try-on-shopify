

## Limit Image Count for Free Users (MVP Stability)

### Problem
Free users can select up to 4 images in Freestyle and Generate, but with only 20 credits and sequential processing (MAX_IMAGES_PER_JOB=1), this causes confusion — they expect 4 images but may only get 1, or run out of credits unexpectedly.

### Approach
For MVP stability, lock free users to **1 image per generation** across all surfaces. The `isFreeUser` / `plan` check already exists in Generate.tsx and can be added to Freestyle.tsx.

### Changes

| File | Change |
|------|--------|
| `src/components/app/freestyle/FreestyleSettingsChips.tsx` | Add `maxImageCount` prop (default 4). Use it in stepper max instead of hardcoded `4`. |
| `src/pages/Freestyle.tsx` | Derive `maxImageCount = plan === 'free' ? 1 : 4` from `useCredits()`. Pass to `FreestyleSettingsChips`. Clamp `imageCount` to 1 if free user. |
| `src/pages/Generate.tsx` | In both image count `<Select>` dropdowns (lines ~2014 and ~2784), filter options to only show `'1'` for free users. Already has `isFreeUser` available. |
| `src/components/app/BulkSettingsCard.tsx` | Disable or limit the `imageCount` options (currently 1/4/8) to 1 for free users. Accept a `isFreeUser` prop. |
| `src/pages/BulkGenerate.tsx` | Pass `isFreeUser` to `BulkSettingsCard`. |

### Workflow Scenes (Already Handled)
Generate.tsx already limits free users to `FREE_SCENE_LIMIT = 3` scenes in workflow mode with proper messaging and upgrade prompts. No changes needed there.

### Summary
- Freestyle: stepper max capped to 1
- Generate (try-on + standard): dropdown shows only "1" option
- Bulk: image count limited to 1
- Workflows: already limited (3 scenes max)
- All backed by existing server-side credit checks as safety net

