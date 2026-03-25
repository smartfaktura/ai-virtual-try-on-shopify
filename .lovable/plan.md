

# Optimize Unoptimized Scene & Model Thumbnails

## Problem
4 places load full-resolution images (1–5MB) for tiny thumbnails. The `getOptimizedUrl` utility exists and is already used in some places, but these were missed.

## What needs to change

### 1. `SceneSelectorChip.tsx` — trigger button (line 217)
**Current:** `<img src={selectedScene.previewUrl}` — 16px circle, full-res image  
**Fix:** `<img src={getOptimizedUrl(selectedScene.previewUrl, { quality: 60 })}` — import already exists

### 2. `ModelSelectorChip.tsx` — trigger button (line 62) + grid (line 143)
**Current:** No `getOptimizedUrl` import, both places use raw `model.previewUrl`  
**Fix:**  
- Add `import { getOptimizedUrl } from '@/lib/imageOptimization'`  
- Line 62 (16px trigger): `src={getOptimizedUrl(selectedModel.previewUrl, { quality: 60 })}`  
- Line 143 (grid thumbnail): `src={getOptimizedUrl(model.previewUrl, { quality: 60 })}`

### 3. `FreestyleQuickPresets.tsx` — preset thumbnail (line 216)
**Current:** No import, raw `scene.previewUrl` for 44px thumbnail  
**Fix:**  
- Add `import { getOptimizedUrl } from '@/lib/imageOptimization'`  
- Line 216: `src={getOptimizedUrl(scene.previewUrl, { quality: 60 })}`

### 4. `PoseSelectorCard.tsx` — Workflow/Generate scene grid (line 16)
**Current:** No import, `const displayImage = pose.previewUrl`  
**Fix:**  
- Add `import { getOptimizedUrl } from '@/lib/imageOptimization'`  
- Line 16: `const displayImage = getOptimizedUrl(pose.previewUrl, { quality: 60 })`

## Why no quality loss
These are all small UI elements (16px–44px). Quality 60 at these sizes is visually identical. Full-size views (lightbox, generation) always use the raw URL — no change there.

## Files
- `src/components/app/freestyle/SceneSelectorChip.tsx`
- `src/components/app/freestyle/ModelSelectorChip.tsx`
- `src/components/app/freestyle/FreestyleQuickPresets.tsx`
- `src/components/app/PoseSelectorCard.tsx`

