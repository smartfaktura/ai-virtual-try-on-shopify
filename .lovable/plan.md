

# Multi-Model Selection + Preview Layout Fix

## What changes

### 1. Multi-model selection state (Generate.tsx)
- Change `selectedModel` from `ModelProfile | null` to a Set-based approach: add `selectedModels: Set<string>` and `selectedModelMap: Map<string, ModelProfile>` (mirrors how poses/scenes already work)
- Keep `selectedModel` as a derived value (first selected model) for backward compatibility with components that only need one
- Update `handleSelectModel` to toggle models in/out of the set (paid users: unlimited, free users: 1)
- Add credit warning toast when adding models would exceed balance

### 2. Credit calculation update (Generate.tsx)
- Add `modelCount = Math.max(1, selectedModels.size)` 
- Update `singleProductCreditCost` formula: `parseInt(imageCount) * 6 * tryOnSceneCount * modelCount`
- The generation matrix becomes: images × scenes × models × products × 6 credits

### 3. Generation loop update (Generate.tsx)
- Update `handleTryOnConfirmGenerate` to iterate over `models × scenes` (outer loop: models, inner loop: scenes)
- Each model+scene combination = one generation job
- Update `enqueueTryOnForProduct` calls to accept a model parameter instead of reading from `selectedModel`

### 4. Model selector UI (Generate.tsx, model step)
- Change `ModelSelectorCard` `isSelected` check from `selectedModel?.modelId === model.modelId` to `selectedModels.has(model.modelId)`
- Add counter badge similar to scenes: "2 selected · 48 credits"
- Free users: keep single-select behavior with upgrade prompt

### 5. TryOnPreview layout fix (TryOnPreview.tsx)
- Add multi-model support: show model thumbnails similar to multi-scene thumbnails (show up to 3 + "+N" badge)
- Update description: "Freya, Zara wearing Crop Top in 8 scenes"
- Add `Model (2)` count in status pills

### 6. TryOnSettingsPanel layout fix (TryOnSettingsPanel.tsx)
- Redesign "Selected Model & Scenes" section for many items: use compact grid layout instead of horizontal flex
- Each item: small thumbnail + truncated name (max ~12 chars)
- Group models and scenes with section labels
- Use 3-4 column grid so 8+ scenes don't overflow

### 7. TryOnConfirmModal update
- Accept array of models instead of single model
- Show model count in summary

## Files to edit
- `src/pages/Generate.tsx` — multi-model state, credit calc, generation loop, model step UI
- `src/components/app/TryOnPreview.tsx` — multi-model display, layout
- `src/components/app/generate/TryOnSettingsPanel.tsx` — compact grid layout for many models+scenes
- `src/components/app/TryOnConfirmModal.tsx` — accept multiple models
- `src/components/app/ModelSelectorCard.tsx` — no changes needed (already supports isSelected toggle)

