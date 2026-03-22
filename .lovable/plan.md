

# "Recreate This" — Pre-Fill Without Skipping Steps

## Approach

Keep the normal flow (Source → Product → Model → Scene → Settings) but **pre-select** the model and scene from URL params when the page loads. The user walks through every step as usual, sees the pre-selected items highlighted, and can add more or change them freely.

A small banner at the top of the Generate page indicates: "Recreating look from Discover" with the model/scene names — dismissible.

## Changes

### 1. `src/pages/Generate.tsx` — Pre-fill state from URL params

- On mount, read `?model=charlotte&scene=editorial-minimal` from URL
- Look up matching model from `mockModels` + custom models by name → pre-set into `selectedModel`, `selectedModels`, `selectedModelMap`
- Look up matching scene from `mockTryOnPoses` + custom scenes by name → pre-set into `selectedPose`, `selectedPoses`, `selectedPoseMap`
- Store a `recreateSource` state flag to show the banner
- Show a small info banner (dismissible): "Recreating look from Discover — Charlotte · Editorial Minimal"
- User proceeds through all steps normally, sees pre-selections when they reach Model/Scene steps, can modify freely

### 2. `src/pages/Discover.tsx` — Smart routing in `handleUseItem`

- If preset has `workflow_slug`: navigate to `/app/generate/:workflow_slug?model=X&scene=Y`
- If no workflow: navigate to `/app/freestyle` with prompt params (existing behavior)

### 3. `src/pages/PublicDiscover.tsx` — Same routing with auth redirect

### 4. `src/components/app/DiscoverDetailModal.tsx` — Update CTA routing

## Files

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` | Read URL params, pre-fill model/scene state, show banner |
| `src/pages/Discover.tsx` | Route workflow presets to Generate with params |
| `src/pages/PublicDiscover.tsx` | Same with auth redirect |
| `src/components/app/DiscoverDetailModal.tsx` | Update "Recreate this" CTA |

