

## Fix Interior/Exterior Staging Animation

### Problem
The carousel cycles too fast (3s), badges are static/generic ("Room Photo", "3 Styles"), and the animation doesn't tell a clear story of "empty room → styled result."

### Solution
Create a new `staging` mode in `WorkflowAnimatedThumbnail.tsx` with a slower, storytelling animation:

1. **Start**: Show empty room with "Empty Room" label (hold ~2s)
2. **Transition**: Crossfade to first styled result, swap label to style name (e.g., "Japandi") with a "Sparkles + Generated" badge
3. **Hold** styled result ~3s, then crossfade to next style
4. **Loop** through all 3 styles, then back to empty room

### Changes

**`src/components/app/workflowAnimationData.tsx`**
- Add `mode: 'staging'` and a new `slideLabels` array: `['Empty Room', 'Japandi', 'Eclectic', 'Contemporary']`
- Remove the static badge elements (they'll be rendered dynamically by the new component)

**`src/components/app/WorkflowAnimatedThumbnail.tsx`**
- Add `slideLabels?: string[]` to `WorkflowScene` type
- Create a new `StagingThumbnail` component:
  - Slower interval: ~4s per slide
  - Shows a single dynamic label badge that changes text per slide (style name)
  - First slide shows "Empty Room" with Home icon; subsequent slides show style name with Sparkles icon + "Generated" badge
  - Smooth crossfade between backgrounds (reuse existing pattern)
  - Progress dots at bottom instead of progress bar (4 dots for 4 slides)
- Wire up `mode === 'staging'` in the main component

### Result
A slow, clear animation: empty room → "Japandi" (generated) → "Eclectic" (generated) → "Contemporary" (generated) → loop. Each transition is ~4s with smooth crossfade and dynamic style labels.

