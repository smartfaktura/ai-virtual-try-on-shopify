

# Unlock Unlimited Scene & Model Selection for Paid Plans

## Current State
- **Scene limit**: Hardcoded `PAID_SCENE_LIMIT = 3` in both `Generate.tsx` and `WorkflowSettingsPanel.tsx`. Free users get 1 scene.
- **Model limit**: Single model selection only (`selectedModel` is a single object, not a set/array).
- **Credit calculation**: Already scales correctly — `tryOnSceneCount = selectedPoses.size`, so `creditCost = imageCount × 6 × sceneCount × productCount`. More scenes = more credits charged automatically.
- **Backend**: `enqueue-generation` receives per-job costs; the generation loop in `handleTryOnConfirmGenerate` already iterates over all selected poses, firing one job per scene. No backend limit on scene count.

## Analysis: Why This Is Easy

1. **Scenes (low effort)**: The architecture already supports N scenes. Each scene becomes its own generation job. Credit math already multiplies by scene count. The only gate is the hardcoded `PAID_SCENE_LIMIT = 3` constant. Removing/raising it for paid users is a 2-line change + UI label updates.

2. **Models (medium effort)**: Currently single-select. Supporting multiple models means the generation matrix becomes `products × models × scenes × images_per_scene`. This requires:
   - Changing `selectedModel` from a single object to a Set/Map
   - Updating the generation loop to iterate over models × scenes
   - Updating credit calculation to include model count
   - Updating the TryOnSettingsPanel to show multiple models
   - More complex but doable

3. **Credit guardrails**: Already partially in place — the settings panel shows cost and disables the generate button when balance is insufficient. We just need clearer warnings as users add more scenes/models.

## Recommendation

Start with **removing the scene limit for paid users** (quick win, low risk). Multi-model support is a separate, larger feature.

---

## Plan: Remove Scene Cap for Paid Plans

### 1. Remove hardcoded scene limit
**Files:** `src/pages/Generate.tsx`, `src/components/app/generate/WorkflowSettingsPanel.tsx`

- Change `PAID_SCENE_LIMIT = 3` to a high number (e.g., `99`) or remove the cap entirely for paid users
- Keep `FREE_SCENE_LIMIT = 1` unchanged
- Update toast messages: remove "up to 3" wording, replace with dynamic credit warnings

### 2. Add real-time credit warning in scene selector
**File:** `src/pages/Generate.tsx` (pose selection step)

- Show live credit cost as user selects scenes: "5 scenes × 2 images × 6 credits = 60 credits"
- When selecting a scene would exceed balance, show a warning badge: "Adding this scene would cost X more credits than your balance"
- Still allow selection (don't block), but make the cost visible
- Show "Buy Credits" link inline when balance would be exceeded

### 3. Update scene selector UI labels
**Files:** `src/pages/Generate.tsx`, `src/components/app/PoseCategorySection.tsx`

- Change "Choose up to 3 scenes" → "Select scenes for your shoot"
- Update counter badge from "2/3" → "2 selected · 24 credits"
- Keep the free-user message: "Free plan: 1 scene per generation"

### 4. Update WorkflowSettingsPanel scene limit
**File:** `src/components/app/generate/WorkflowSettingsPanel.tsx`

- Same change: remove `PAID_SCENE_LIMIT = 3` cap for paid users
- Keep flat-lay surface limit at 6 (different constraint)
- Add credit cost display in variation selector

### 5. Keep credit cost display accurate in TryOnSettingsPanel
**File:** `src/components/app/generate/TryOnSettingsPanel.tsx`

- Already shows `{imageCount} images × {sceneCount} scenes × 6 credits each` — no changes needed, it scales automatically

## Files to edit
- `src/pages/Generate.tsx` — remove cap, add credit warning in pose step
- `src/components/app/generate/WorkflowSettingsPanel.tsx` — remove cap
- `src/components/app/PoseCategorySection.tsx` — minor label update

No backend or database changes needed.

