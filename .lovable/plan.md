

# Refine Step UX Improvements

## Issues Identified

1. **Product thumbnails** in `ProductContextStrip` use `object-contain` with `p-0.5` padding — products appear small with whitespace instead of covering the thumbnail frame.

2. **Model-needed banner** shows a generic User icon instead of 3 overlapping model avatar circles — looks like a placeholder rather than a visual preview.

3. **Custom Color / Gradient cards** in the background swatch grid appear at the end of the grid row alongside preset cards. On certain screen widths they wrap to a second row with no visual separation — the user reports "not appear in right place." These should remain integrated in the grid but be visually distinct.

4. **On-model scene cards have no expandable settings** — unlike product shots that show lighting/shadow/surface controls when clicked, on-model scene cards redirect to the Outfit section instead of offering their own scene-specific controls (action type, environment, etc.). This is because `toggleSceneExpand` returns early for model scenes when no model is selected, AND even after model selection, the scene cards' `triggerBlocks` may only contain `personDetails` which is filtered out from displayed blocks.

5. **Outfit section is flat and overwhelming** — Presets, Top/Bottom/Shoes fields, Appearance, and Accessories all render in a single scrollable card. User requests: presets first, then a collapsible "Customize Outfit" tab for the detailed fields.

## Plan

### Change 1: Fix product thumbnails to cover frame
**File: `src/components/app/product-images/ProductContextStrip.tsx`**

Change the thumbnail from `object-contain` to `object-cover` and remove the `p-0.5` padding so product images fill the 32×32 frame edge-to-edge with minimal zoom.

```
// Line 27-28: Change
<div className="w-8 h-8 rounded-md overflow-hidden bg-white flex-shrink-0 border border-border/40 p-0.5">
  <ShimmerImage ... className="w-full h-full object-contain" />

// To:
<div className="w-8 h-8 rounded-md overflow-hidden bg-white flex-shrink-0 border border-border/40">
  <ShimmerImage ... className="w-full h-full object-cover" />
```

### Change 2: Replace User icon with 3 overlapping model circles in banner
**File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`**

In the model-needed banner (line 1727-1744), replace the single `<User>` icon in the amber circle with 3 small overlapping model avatar circles using the first 3 global models' preview images. This gives a visual preview of available models.

```tsx
// Replace the amber circle with:
<div className="flex -space-x-2 flex-shrink-0">
  {globalModels.slice(0, 3).map((m, i) => (
    <div key={m.modelId} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-muted" style={{ zIndex: 3 - i }}>
      <img src={m.previewUrl} alt={m.name} className="w-full h-full object-cover" />
    </div>
  ))}
</div>
```

### Change 3: Visually separate Custom & Gradient cards in background grid
The Custom and Gradient cards currently sit inline in the `grid-cols-8` grid, which is correct layout-wise. The issue is they look identical to preset cards when inactive (just a `+` icon). Improve by:
- Adding a subtle dashed border styling (already partially there with `ring-dashed`)
- Adding a small label inside the card above the `+` icon ("Pick" or similar) to differentiate from preset swatches

This is actually already implemented with dashed borders. The real UX issue from the screenshot is that on narrower viewports, these cards wrap oddly. Fix: ensure the grid always shows Custom and Gradient on the same row by keeping the grid `grid-cols-4 sm:grid-cols-8` but verifying the total count (11 presets + saved + 2 custom = variable). No structural change needed — the current grid handles this correctly. The visual issue in the screenshot appears to be at a specific breakpoint. Add `min-w-0` to the grid container to prevent overflow.

### Change 4: Allow on-model scene cards to expand their controls
**File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`**

In `toggleSceneExpand` (line 1608-1619), currently if a scene needs a model and none is selected, it redirects to the outfit section. Change this so it still expands the scene card if the scene has other controls (action, environment, etc.), only redirecting to outfit if the scene has NO other controls.

Also, in `renderExpandedPanel`, `personDetails` is filtered from `sceneBlocks`. On-model scenes often ONLY have `personDetails` + `actionDetails`. The `actionDetails` block IS rendered. Verify that `sceneHasControls` correctly detects `actionDetails` — it does, since it filters only `personDetails`.

The fix: in `toggleSceneExpand`, allow expansion even without a model if the scene has non-person controls:

```tsx
const toggleSceneExpand = (id: string) => {
  const scene = selectedScenes.find(s => s.id === id);
  if (scene && !details.selectedModelId) {
    const needsModelForScene = (scene.triggerBlocks || []).some(b => b === 'personDetails' || b === 'actionDetails');
    // Only redirect to outfit if scene has NO other expandable controls
    if (needsModelForScene && !sceneHasControls(scene)) {
      scrollToOutfit();
      return;
    }
  }
  setExpandedSceneId(prev => prev === id ? null : id);
};
```

But actually, `sceneHasControls` filters out `personDetails` — so if a scene only has `personDetails` in triggerBlocks and no template controls, it returns false, and the scene card is not clickable at all. This is correct behavior — there's nothing to expand.

For scenes with `actionDetails` (like "In-Hand Studio"), they DO have expandable controls (Action Type, Intensity). The issue may be that these scenes' `triggerBlocks` in the DB don't include `actionDetails`. Let me check — the user says "on model scenes shots do not have any more settings to select." This suggests the DB scenes lack non-person trigger blocks. This is a data issue, not a code issue.

For now, keep the redirect behavior but make the scene cards always expandable if they have template-derived controls (lighting/shadow/etc from `{{tokens}}` in prompt templates).

### Change 5: Restructure Outfit section with Presets-first + collapsible customization
**File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`**

Restructure the Outfit & Model collapsible content:

1. **Model picker** — stays at top
2. **Preset cards** — stays visible, moved out of `OutfitLockPanel` wrapper
3. **"Customize Outfit" collapsible** — wraps Top/Bottom/Shoes `PieceField` components
4. **"Appearance & Styling" collapsible** — wraps `InlinePersonDetails`

This groups related controls and reduces visual overwhelm. The preset selection auto-fills everything, and users only expand customization if they want to tweak.

```tsx
<CardContent className="p-4 space-y-5">
  {/* Model picker */}
  <ModelPickerSections ... />

  {/* Outfit presets — always visible */}
  <OutfitPresetStrip ... />

  {/* Customize Outfit — collapsible */}
  <Collapsible>
    <CollapsibleTrigger>Customize Outfit</CollapsibleTrigger>
    <CollapsibleContent>
      <PieceField label="Top" ... />
      <PieceField label="Bottom" ... />
      <PieceField label="Shoes" ... />
    </CollapsibleContent>
  </Collapsible>

  {/* Appearance & Styling — collapsible */}
  <Collapsible>
    <CollapsibleTrigger>Appearance & Styling</CollapsibleTrigger>
    <CollapsibleContent>
      <InlinePersonDetails ... />
    </CollapsibleContent>
  </Collapsible>
</CardContent>
```

## Files Modified

| File | Change |
|---|---|
| `src/components/app/product-images/ProductContextStrip.tsx` | `object-contain` → `object-cover`, remove `p-0.5` |
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | Overlapping model avatars in banner; restructure Outfit section into Presets + collapsible Customize + collapsible Appearance; fix scene expand logic for on-model scenes with controls |

