

# Fix Freestyle Image Detail Modal: Better Header + Remove Aspect Ratio + Spacing

## Problem
1. Shows "Freestyle" as small label AND "Freestyle" as large heading — redundant and unclear
2. Shows "· 4:5" aspect ratio text — not needed
3. No spacing between prompt and action buttons

## Changes

### 1. `src/pages/Freestyle.tsx` (line 953-962) — Pass richer data to LibraryDetailModal

Add model/scene/product names to the `libraryItem` so the detail modal can show them:

```tsx
const libraryItem: LibraryItem = {
  id: img.id,
  imageUrl: img.url,
  source: 'freestyle',
  label: buildDynamicLabel(img),  // dynamic name
  prompt: img.userPrompt || undefined,
  date: new Date(img.createdAt).toLocaleDateString(),
  createdAt: new Date(img.createdAt).toISOString(),
  aspectRatio: img.aspectRatio || '1:1',
  quality: 'standard',
  modelId: img.modelId,
  sceneId: img.sceneId,
  productId: img.productId,
};
```

Build a dynamic label from the image metadata — resolve model/scene/product names from the already-available `mockModels`, `customScenePoses`, and `products` arrays:
- If model + scene: "Freya · Coastal Studio"
- If model only: "Freya"
- If scene only: "Coastal Studio"
- If product only: "White Sneakers"
- Fallback: first ~40 chars of the user prompt, or "Freestyle Creation"

### 2. `src/components/app/LibraryDetailModal.tsx` (lines 126-150) — Improve header section

**Change the small label** from "Freestyle" to "Freestyle Generation":
```tsx
// Line 128
item.source === 'freestyle' ? 'Freestyle Generation' : 'Generation'
```

**Remove aspect ratio display** (lines 142-146): Delete the `{item.aspectRatio && ...}` block that shows "· 4:5".

**Add spacing** before buttons: Add `pt-2` or increase gap in the parent `flex flex-col gap-6` to `gap-8` — or simply add a `<div className="pt-2" />` before the actions section.

### Summary
| Change | Detail |
|--------|--------|
| Dynamic label | Resolve model/scene/product names for heading |
| Small label | "Freestyle" → "Freestyle Generation" |
| Remove aspect ratio | Remove "· 4:5" text |
| Spacing | Add gap before action buttons |

Two files, ~20 lines changed.

