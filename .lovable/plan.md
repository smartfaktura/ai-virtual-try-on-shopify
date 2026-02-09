

## Gender-Matched Scene Previews

### Problem
All 24 scene/pose preview thumbnails show **female models**. When a user selects a male model (like Omar), the scene gallery still displays women, which looks inconsistent and confusing.

### Solution
Add a `previewUrlMale` field to each pose and use AI image generation to create 24 matching male pose images. The scene selector will then show the appropriate gender's preview based on the currently selected model.

### Steps

**1. Generate 24 male pose images using AI**
Use the Lovable AI image generation (Gemini) to create male equivalents for all 24 poses, matching the same environments and compositions. Save them to `src/assets/poses/` with a `-male` suffix (e.g., `pose-studio-front-male.jpg`).

**2. Update the `TryOnPose` type**
Add an optional `previewUrlMale` field:

| Field | Type | Description |
|---|---|---|
| `previewUrlMale` | `string` (optional) | Male version of the scene preview |

**3. Update `mockData.ts`**
- Import all 24 new male pose images
- Add `previewUrlMale` to each entry in `mockTryOnPoses`

**4. Update `PoseSelectorCard` component**
Accept an optional `selectedGender` prop. When set to `'male'` and a `previewUrlMale` exists, display the male preview image instead.

**5. Update `PoseCategorySection` component**
Pass the selected model's gender down to each `PoseSelectorCard`.

**6. Update `Generate.tsx`**
Pass `selectedModel?.gender` through the pose category section so it reaches the cards.

### Files Changed
- `src/types/index.ts` -- add `previewUrlMale` to `TryOnPose`
- `src/assets/poses/` -- 24 new AI-generated male pose images
- `src/data/mockData.ts` -- import male images, add to pose data
- `src/components/app/PoseSelectorCard.tsx` -- use gender-aware preview
- `src/components/app/PoseCategorySection.tsx` -- pass gender prop
- `src/pages/Generate.tsx` -- pass selected model gender to pose sections

### Note
Generating 24 AI images will take some time. Each image will match the composition, environment, and lighting of its female counterpart but feature a male model.
