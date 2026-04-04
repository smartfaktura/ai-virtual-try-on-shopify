

# Product Images Flow — UX Fixes

## 3 Issues to Fix

### 1. Category collections should auto-prioritize based on selected products

**Current**: Category collections are always in the same static order, all collapsed.

**Fix**: Accept `selectedProducts` as a prop in `ProductImagesStep2Scenes`. Use a simple keyword/category detection function that maps product names/descriptions to category IDs (e.g., product named "Lipstick X" → `makeup-lipsticks`). Reorder `CATEGORY_COLLECTIONS` so matched categories appear first, and auto-expand them. Non-matching categories stay below, collapsed.

**Files**: `ProductImagesStep2Scenes.tsx` — add `selectedProducts` prop, add `detectRelevantCategories()` utility, sort + auto-open matched categories.

### 2. Sticky bar conflicts with app's floating menu / support icon

**Current**: `fixed bottom-0 left-0 right-0` overlaps the existing floating action button and customer support widget.

**Fix**: Change from `fixed bottom-0` to an inline sticky bar anchored inside the content area: `sticky bottom-0` within the scrollable content container. This keeps it visible at the bottom of the viewport scroll area without overlapping the global floating UI elements. Add a subtle top border and backdrop blur.

**File**: `ProductImagesStickyBar.tsx` — change positioning from `fixed` to `sticky`, scope it inside the content wrapper in `ProductImages.tsx`.

### 3. Step 3 Details — restructure completely

**Current problems**:
- "Generation settings & details" combines format/quality with scene-specific detail blocks in one flat page
- Blocks like "Background & Composition" appear without context of WHY
- User doesn't understand the connection between selected scenes and shown blocks
- Branding/Layout/Consistency always shown even when irrelevant

**Fix — new structure**:

**Section A: "Generation settings"** (always visible)
- Format/Size, Quality, Images per scene — same 3 cards as now

**Section B: "Based on your selected scenes"** (only if triggered blocks exist beyond branding/layout)
- Group detail blocks by the scenes that triggered them
- Show a header like: *"Because you selected In-Hand / Human Support"* → then show Person Details and Action Details inline
- Show: *"Because you selected Lifestyle Scene"* → then show Scene Environment and Visual Direction
- If multiple scenes trigger the same block, group under the first relevant scene and note "also used by X"
- Person Details and Action Details should always be **inline cards** (not collapsibles) when triggered — they're critical choices
- Only show blocks that are truly triggered — remove the always-show logic for `branding`, `layout`, and `consistency` unless explicitly triggered by selected scenes or multi-product

**Section C: "Custom note"** (always visible, simple textarea at bottom)

This means `detailBlockConfig.ts` needs a reverse-lookup: given triggered blocks, map back to which scenes caused them. The Step3 component will iterate selected scenes, find their triggered blocks, and render grouped sections.

**Files**:
- `ProductImagesStep3Details.tsx` — full restructure into Scene-grouped sections
- `detailBlockConfig.ts` — add `getBlocksByScene()` helper that returns `{ sceneTitle, sceneId, blocks: string[] }[]` for display grouping
- `sceneData.ts` — remove `branding` and `layout` from most scene triggerBlocks (they're generic filler, not useful detail blocks)

### Summary of file changes

| File | Change |
|------|--------|
| `ProductImagesStep2Scenes.tsx` | Add `selectedProducts` prop, auto-detect + reorder + auto-expand relevant categories |
| `ProductImagesStickyBar.tsx` | Change `fixed` → `sticky`, adjust positioning |
| `ProductImages.tsx` | Pass `selectedProducts` to Step2, move sticky bar inside content wrapper |
| `ProductImagesStep3Details.tsx` | Restructure into "Settings" + "Because you selected X" grouped sections |
| `detailBlockConfig.ts` | Add `getBlocksByScene()` reverse-lookup helper |
| `sceneData.ts` | Clean up triggerBlocks — remove generic `branding`/`layout` from most scenes, keep only meaningful triggers |

