

# Fashion Virtual Try-On Feature Plan

## Summary

Add a new "Virtual Try-On" generation mode specifically for fashion/clothing brands. This allows merchants to select a human model, choose a pose/scene style, and have their garment product digitally placed on the model - creating realistic "model wearing product" images without actual photoshoots.

## Current State Analysis

The current Generate workflow follows this pattern:
1. Select a Product
2. Choose a Template (photography style)
3. Configure settings (count, ratio, quality)
4. Generate product images

This works well for product-only shots but doesn't support "on-model" fashion photography.

## Proposed Workflow

```text
+------------------+     +------------------+     +------------------+     +------------------+
|   1. Product     | --> |   2. Model       | --> |   3. Style       | --> |   4. Settings    |
|   (Garment)      |     |   Selection      |     |   & Pose         |     |   & Generate     |
+------------------+     +------------------+     +------------------+     +------------------+
        |                        |                        |                        |
   Upload/Select           Choose from:              Choose from:            Same as now:
   clothing item           - Gender                  - Studio poses          - Count (1,4,8)
                           - Body type               - Lifestyle             - Aspect ratio
                           - Ethnicity               - Editorial             - Quality
                           - Age range               - Streetwear            
```

## Implementation Details

### 1. New Type Definitions

Add to `src/types/index.ts`:

- `GenerationMode`: 'product-only' | 'virtual-try-on'
- `ModelProfile` interface with:
  - `modelId`: string
  - `name`: string
  - `gender`: 'male' | 'female' | 'non-binary'
  - `bodyType`: 'slim' | 'athletic' | 'average' | 'plus-size'
  - `ethnicity`: string (diverse options)
  - `ageRange`: 'young-adult' | 'adult' | 'mature'
  - `previewUrl`: string

- `TryOnPose` interface with:
  - `poseId`: string
  - `name`: string
  - `category`: 'studio' | 'lifestyle' | 'editorial' | 'streetwear'
  - `description`: string
  - `previewUrl`: string

### 2. Mock Data for Models and Poses

Add to `src/data/mockData.ts`:

- `mockModels`: Array of 8-12 diverse model profiles with preview images
- `mockTryOnPoses`: Array of pose/scene options (e.g., "Walking Urban", "Studio Front", "Casual Lifestyle")

### 3. Model Preview Assets

Create `src/assets/models/` directory with placeholder model silhouette previews:
- `model-female-slim.jpg`
- `model-female-athletic.jpg`
- `model-male-slim.jpg`
- `model-male-athletic.jpg`
- etc.

### 4. New Components

**ModelSelectorCard** (`src/components/app/ModelSelectorCard.tsx`):
- Visual card showing model preview
- Gender, body type, ethnicity badges
- Selected state with checkmark overlay

**PoseSelectorCard** (`src/components/app/PoseSelectorCard.tsx`):
- Preview of pose/scene style
- Category badge
- Description tooltip

**GenerationModeToggle** (`src/components/app/GenerationModeToggle.tsx`):
- Toggle between "Product Shot" and "Virtual Try-On"
- Only shows for clothing category products

### 5. Generate Page Updates

Modify `src/pages/Generate.tsx`:

**New State Variables**:
```typescript
const [generationMode, setGenerationMode] = useState<'product-only' | 'virtual-try-on'>('product-only');
const [selectedModel, setSelectedModel] = useState<ModelProfile | null>(null);
const [selectedPose, setSelectedPose] = useState<TryOnPose | null>(null);
```

**Conditional Step Flow**:
- After product selection, if product category is "clothing", show mode toggle
- If "Virtual Try-On" selected, show Model Selection step
- Then show Pose Selection step
- Finally, standard settings and generate

**Updated Step Indicator**:
For virtual try-on mode, steps become:
1. Product
2. Model
3. Pose
4. Settings
5. Results

### 6. Visual Design Principles

- Model selection cards in a 2x3 or 3x4 grid
- Diverse representation is essential (gender, ethnicity, body types)
- Clear visual distinction between modes
- Pose previews show silhouettes/example compositions
- Banner explaining the feature: "AI will digitally dress the model in your garment"

## File Changes Summary

| File | Action |
|------|--------|
| `src/types/index.ts` | Add ModelProfile, TryOnPose, GenerationMode types |
| `src/data/mockData.ts` | Add mockModels and mockTryOnPoses arrays |
| `src/components/app/ModelSelectorCard.tsx` | Create new component |
| `src/components/app/PoseSelectorCard.tsx` | Create new component |
| `src/components/app/GenerationModeToggle.tsx` | Create new component |
| `src/pages/Generate.tsx` | Add mode toggle, model/pose selection steps |
| `src/assets/models/` | Create directory with model preview images |

## Technical Considerations

1. **AI Integration**: The virtual try-on feature would use the existing Lovable AI gateway with specialized prompts for clothing overlay/inpainting

2. **Credit Cost**: Virtual try-on generations may cost more credits (e.g., 3 credits per image vs 1-2 for standard) - this should be displayed clearly

3. **Product Type Detection**: Auto-detect when a product is clothing-related to surface the try-on option

4. **Fallback**: If try-on fails or produces poor results, offer easy fallback to standard product photography

