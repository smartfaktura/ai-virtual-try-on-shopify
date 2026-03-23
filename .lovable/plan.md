

# Fix Workflow Card Images + Remove Nav Pills + Update Subtitle

## Changes

### 1. `src/components/app/workflowAnimationData.tsx`

**Virtual Try-On Set** (line 41): Change `objectPosition: 'top'` → `objectPosition: 'center top'` — the `top` position zooms into the head. Using `center` will show more of the full body/outfit.

**Product Listing Set** (line 66): Add `objectPosition: 'center'` — currently defaults to `center` but the image itself may be tightly framed. Since both scenes use `object-cover` in a `3/4` aspect container, the fix is to change `objectPosition` to show more of the composition.

Actually, the real issue is `object-cover` on tall aspect ratio (`aspect-[3/4]`) crops wide images aggressively. The `objectPosition` values control where the crop anchors. For these two workflows:

- **Virtual Try-On Set**: `objectPosition: 'top'` crops from the top — showing the head but cutting the outfit. Change to `objectPosition: 'center'` to show the full model centered.
- **Product Listing Set**: No `objectPosition` set (defaults to `center`). The image is likely a tall product that gets cropped. Change to `objectPosition: 'center'` explicitly (keep as-is, or use `'top center'` if the product is in the upper portion).

### 2. `src/pages/Workflows.tsx`

**Remove quick-nav pills** (lines 381-398): Delete the entire `{!isLoading && workflows.length > 0 && (` block with the `flex-wrap gap-2` buttons.

**Update subtitle** (line 379): Change from `"Pick a workflow to start generating — or jump to one below."` to `"Choose a workflow and generate brand-ready visuals instantly."`

### Files
- `src/components/app/workflowAnimationData.tsx` — adjust `objectPosition` for Virtual Try-On Set and Product Listing Set
- `src/pages/Workflows.tsx` — remove nav pills block, update subtitle text

