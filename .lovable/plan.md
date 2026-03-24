

# Add Prompt Bar to Public Freestyle Page

## Problem
The public `/freestyle` page is just a gallery — it's missing the signature prompt bar that makes Freestyle feel like a creative tool. The user wants it to look and behave like the real Freestyle, with all settings working, but "Generate" redirects to auth instead of generating.

## Approach
Reuse the real `FreestylePromptPanel` component with empty/no-op handlers for auth-gated features (products, brand profiles). Scene and model selection work with mock + custom data. The generate button redirects to `/auth` with the selected settings as URL params.

## Changes

### 1. `src/pages/PublicFreestyle.tsx` — Add prompt bar + restructure layout

**Layout change**: Switch from centered gallery page to Freestyle-style layout (full viewport height, gallery scrollable area, prompt bar pinned at bottom).

**Add state for prompt bar**:
- `prompt`, `selectedModel`, `selectedScene`, `aspectRatio`, `quality`, `cameraStyle`, `framing` — same state as real Freestyle
- Popover open states for model/scene selectors
- Products and brand profiles: empty arrays (user not authenticated or no data)

**Import and render `FreestylePromptPanel`** at the bottom with:
- All selector chips functional (models from `mockModels`, scenes from `mockTryOnPoses` + custom scenes)
- Product chip disabled or hidden (requires auth)
- Brand profile chip disabled or hidden (requires auth)
- `onGenerate` → navigates to `/auth?redirect=/app/freestyle?prompt=X&scene=Y&model=Z&ratio=R`
- `canGenerate` = true when prompt has text OR scene/model selected
- `creditCost` = 0 (just show "Generate" without credit count)
- No image upload (requires auth storage)

**Gallery**: Moves into a scrollable container above the prompt bar, same masonry grid.

### 2. Data sourcing for scenes
- Import `mockTryOnPoses`, `mockModels` from mock data
- Use `useCustomScenes` + `useHiddenScenes` + `useSceneSortOrder` for the full scene list (same as real Freestyle)
- These hooks work without auth (they query public/anon-accessible tables)

### Files
- `src/pages/PublicFreestyle.tsx` — restructure layout, add FreestylePromptPanel with auth-gated generate

