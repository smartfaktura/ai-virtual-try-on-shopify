

# Admin Scene Upload Page

## Summary
Create a dedicated admin page to upload new scenes with full control over how they behave during generation: image as reference vs prompt-only mode (like White Studio).

## Database Migration
Add two columns to `custom_scenes`:
- `prompt_hint TEXT DEFAULT ''` — separate AI-facing text (falls back to `description` if empty)
- `prompt_only BOOLEAN DEFAULT false` — when true, scene image is NOT sent to AI, only the prompt text (White Studio behavior)

## New Page: `src/pages/AdminSceneUpload.tsx`
Admin-protected page at `/app/admin/scene-upload`:
- **Drag-and-drop image upload** → `product-uploads` bucket via `useFileUpload`
- **AI auto-analysis** → calls `create-scene-from-image` edge function to prefill name, description, category
- **Editable fields:**
  - Name (short label)
  - Description (user-facing, shown in UI)
  - Prompt Hint (AI-facing textarea, sent alongside/instead of image)
  - Scene Type toggle: On-Model / Product (filters category chips)
  - Category chips
  - **"Prompt Only" toggle** with explanation: "Don't send image to AI — use only the prompt text for generation (like White Studio). Use for solid color or abstract backgrounds."
- Image preview
- Save → `useAddCustomScene` (updated)
- "Add Another" button after save

## Hook Updates: `useCustomScenes.ts`
- Add `prompt_hint` and `prompt_only` to `CustomScene` interface
- `useAddCustomScene`: accept and insert both new fields
- `toTryOnPose()`: map `prompt_hint` → `promptHint` (fallback to `description`), pass through `prompt_only`

## Type Update: `TryOnPose`
Add optional `promptOnly?: boolean` to the interface so the flag flows through to generation logic.

## Generation Logic: `Freestyle.tsx` + `generate-freestyle/index.ts`
**Freestyle.tsx (~line 509):** Currently hardcodes `scene_038` check. Change to also check `selectedScene.promptOnly`:
```
} else if (selectedScene && selectedScene.poseId !== 'scene_038' && !selectedScene.promptOnly) {
  sceneImageUrl = selectedScene.previewUrl;
}
```

**generate-freestyle/index.ts (~line 745):** Currently hardcodes `scene_038`. Add check for custom prompt-only scenes via a flag in the payload. When `promptOnly` is true, clear `sceneImage` same as White Studio.

## Update `AddSceneModal.tsx`
Add prompt hint textarea and prompt-only toggle to the existing modal (used when adding scenes from library images).

## Route + Navigation
- Add `/app/admin/scene-upload` route in `App.tsx`
- Add "+ Add Scene" button in `AdminScenes.tsx` header linking to the upload page

## Files Changed
- `custom_scenes` table — migration (add `prompt_hint`, `prompt_only`)
- `src/pages/AdminSceneUpload.tsx` (new)
- `src/hooks/useCustomScenes.ts` (interface + mutation + mapping)
- `src/types/index.ts` (add `promptOnly` to `TryOnPose`)
- `src/pages/Freestyle.tsx` (extend prompt-only check)
- `supabase/functions/generate-freestyle/index.ts` (extend prompt-only check)
- `src/components/app/AddSceneModal.tsx` (add fields)
- `src/App.tsx` (add route)
- `src/pages/AdminScenes.tsx` (add button)

