

## Plan: Replace "What You Can Create" with curated scenes + fix scene auto-select

### Problem
1. The "What You Can Create" section pulls from `discover_presets` (prompt-based), showing irrelevant images
2. Clicking "Try in Freestyle" only passes the prompt — it doesn't pre-select the scene
3. The scene pre-fill in Freestyle only checks `mockTryOnPoses`, not custom scenes

### Changes

#### 1. `src/components/app/RecentCreationsGallery.tsx` — Replace data source with hardcoded scene list

Instead of pulling from `discover_presets`, use a hardcoded list of 7 specific custom scene IDs to fetch directly from `custom_scenes` table:

```typescript
const CURATED_SCENE_IDS = [
  '5401494e-1aae-4953-8a10-bf90e525d980', // Urban Dusk Portrait
  '038e7ba5-0f3e-4679-8a1f-8a63a54b3baf', // Earthy Woodland Product
  '83eda438-1afe-4bef-9250-1fc580a1affc', // Gym Loft Light
  'ead64b8c-31eb-4427-9e1c-974021e5b7d8', // Skatepark Golden Hour
  'bf507e3a-ccd5-41b8-af12-f920e565cc60', // Wavy Metallic Surface
  '5c6c138a-3097-47cb-beaf-36fef3e6fb2c', // Natural Glow Interior
  'ff2ff0f9-535b-40a2-ba6f-75c846112123', // Sun-Kissed Living
];
```

- Add a `useQuery` to fetch these scenes from `custom_scenes` by ID
- Map them to `CreationItem` display format with scene name as label and category as subtitle
- Remove the `useDiscoverPresets` dependency for the placeholder state
- Remove the `PresetDetailOverlay` modal entirely — clicking a scene card navigates directly to Freestyle with `?scene=custom-{id}`

#### 2. `src/components/app/RecentCreationsGallery.tsx` — Simplify click handler

Replace `handleCardClick` + modal flow with direct navigation:
```typescript
const handleCardClick = (sceneId: string) => {
  navigate(`/app/freestyle?scene=custom-${sceneId}`);
};
```

No modal needed — just navigate to Freestyle with the scene pre-selected.

#### 3. `src/pages/Freestyle.tsx` (lines 175-183) — Fix scene pre-fill to include custom scenes

Currently the scene param lookup only checks `mockTryOnPoses`. Update to also check custom scenes:

```typescript
if (sceneParam) {
  // Check built-in scenes first
  let matchedScene = filterVisible(mockTryOnPoses).find((s) => s.poseId === sceneParam);
  // Then check custom scenes
  if (!matchedScene && sceneParam.startsWith('custom-')) {
    const customId = sceneParam.replace('custom-', '');
    const customScene = customScenes.find(s => s.poseId === `custom-${customId}`);
    if (customScene) matchedScene = customScene;
  }
  if (matchedScene) {
    setSelectedScene(matchedScene);
    // ...existing hint logic
  }
}
```

This requires importing `useCustomScenes` (already imported via `SceneSelectorChip` dependency) and accessing `asPoses` from it — need to add a direct call in Freestyle.tsx.

#### 4. Remove unused code
- Remove `PresetDetailOverlay` component from `RecentCreationsGallery.tsx`
- Remove `useDiscoverPresets` import (only needed if user has creations — but it was only used for placeholder)
- Remove `selectedPreset` state, `handleUseStyle`, related modal imports (`X`, `Workflow`, `Sparkles` if unused)

