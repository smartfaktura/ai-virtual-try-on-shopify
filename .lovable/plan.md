
## Separate User-Facing and AI-Internal Scene Descriptions

### Problem

The scene `description` field is shown to users on the scene cards (in the Generate workflow page via `PoseSelectorCard`). After the recent enrichment, these descriptions now contain detailed AI prompt instructions like "Model standing facing camera in a classic lookbook pose, full body front view, relaxed shoulders..." which are internal engineering details that should not be visible to end users.

### Solution

Add a new `promptHint` field to the `TryOnPose` type for AI-only instructions. Revert `description` to short, user-friendly text. Use `promptHint` in all generation code paths instead of `description`.

### Files to Modify

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `promptHint` field to `TryOnPose` interface |
| `src/data/mockData.ts` | Move enriched text to `promptHint`, revert `description` to short user-friendly labels |
| `src/pages/Freestyle.tsx` | Use `selectedScene.promptHint` instead of `selectedScene.description` in `finalPrompt` |
| `supabase/functions/generate-tryon/index.ts` | Use `req.pose.promptHint` instead of `req.pose.description` in prompt construction |
| `src/hooks/useGenerateTryOn.ts` | Pass `promptHint` alongside `description` to the edge function |
| `src/hooks/useBulkGeneration.ts` | Pass `promptHint` alongside `description` to the edge function |
| `src/hooks/useCustomScenes.ts` | Map custom scenes with a `promptHint` (fallback to `description`) |

### Technical Details

**Type change (`src/types/index.ts`):**

```typescript
export interface TryOnPose {
  poseId: string;
  name: string;
  category: PoseCategory;
  description: string;       // Short, user-facing (e.g., "Classic front view on white background")
  promptHint: string;         // Detailed AI instructions (e.g., "Model standing facing camera...")
  previewUrl: string;
  previewUrlMale?: string;
}
```

**Data change (`src/data/mockData.ts`):**

Each scene entry gets the enriched text moved to `promptHint` and `description` reverted to a short label. For example:

```typescript
{
  poseId: 'pose_001',
  name: 'Studio Front',
  category: 'studio',
  description: 'Classic lookbook pose, full body front view with clean white background',
  promptHint: 'Model standing facing camera in a classic lookbook pose, full body front view, relaxed shoulders, arms naturally at sides, clean white studio background',
  previewUrl: '...',
}
```

**Generation code paths** -- all places that currently read `.description` for AI prompt construction will switch to `.promptHint`:

- `Freestyle.tsx`: `selectedScene.promptHint` in the MANDATORY SCENE text
- `generate-tryon/index.ts`: `req.pose.promptHint` in the photography style section
- `useGenerateTryOn.ts` and `useBulkGeneration.ts`: include `promptHint` in the pose payload sent to the edge function

**Display stays unchanged** -- `PoseSelectorCard.tsx` continues to render `pose.description` (which is now the short user-friendly text).

**Custom scenes** -- `useCustomScenes.ts` will set `promptHint` to the same value as `description` (since custom scenes from the database only have one description field; this can be enhanced later).
