

# Personalized Scene Presets Based on User Categories

## Overview
Replace hardcoded `QUICK_PRESETS` with a dynamic system that loads scenes from `mockTryOnPoses` (same images as scene picker) and personalizes them based on the user's `product_categories` from their profile.

## How It Works

**Category-to-Scene Mapping:**
Each user product category maps to relevant scene categories:
- `fashion` → studio, lifestyle, editorial, streetwear (on-model scenes)
- `beauty`, `fragrances` → clean-studio, surface, bathroom, botanical
- `jewelry`, `accessories` → clean-studio, surface, flat-lay
- `home` → living-space, clean-studio, botanical, outdoor
- `food` → surface, kitchen (mapped from existing scenes), clean-studio
- `electronics` → clean-studio, surface
- `sports` → lifestyle, streetwear, outdoor
- `supplements` → clean-studio, surface, botanical
- `any` → mix of all

**8 scenes total**, dynamically distributed:
- Single category → 8 scenes from that category's mapped scene types
- Two categories → 4 from each
- Three+ → ~2-3 from each, filling to 8
- Fallback: if user has no categories or `any`, show a curated mix across all types

## Changes

### 1. `src/components/app/freestyle/FreestyleQuickPresets.tsx` — Full rewrite of preset logic

**Remove** the hardcoded `QUICK_PRESETS` array and `QuickPreset` interface.

**Add:**
- Accept `userCategories: string[]` prop (fetched from profile)
- New `CATEGORY_SCENE_MAP` mapping user product categories to scene categories
- Function `buildPersonalizedScenes(categories, allScenes)` that:
  1. Resolves which scene categories are relevant
  2. Distributes 8 slots across categories (equal split)
  3. Returns `TryOnPose[]` directly from `mockTryOnPoses`
- Each card shows the scene's `previewUrl` (same image as scene picker), `name`, and scene category label
- Clicking a card calls `onSelect(scene)` passing the `TryOnPose` directly

**Update interface:**
```typescript
interface FreestyleQuickPresetsProps {
  onSelect: (scene: TryOnPose) => void;
  activeSceneId?: string | null;
  userCategories?: string[];
}
```

The carousel card renders:
- Scene image from `pose.previewUrl` (same as scene picker)
- Scene name
- Scene category label as subtle subtitle

### 2. `src/pages/Freestyle.tsx` — Fetch user categories, pass to presets

- Fetch `product_categories` from the user's profile (query or inline fetch)
- Pass `userCategories` to `FreestyleQuickPresets`
- Update `handlePresetSelect` to accept a `TryOnPose` directly (set scene, no model)
- Update `activePresetId` → `activeSceneId` tracking by `poseId`

### Files
- `src/components/app/freestyle/FreestyleQuickPresets.tsx` — dynamic personalized scenes
- `src/pages/Freestyle.tsx` — fetch user categories, updated preset handler

