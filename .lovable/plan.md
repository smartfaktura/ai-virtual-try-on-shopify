

## Redesign Staging Animation as Before/After Slider

### Current Problem
The staging animation cycles through images with a simple crossfade — it doesn't clearly show the transformation from empty to styled. The user wants a slow before/after wipe slider effect.

### New Animation Flow
1. Show empty room (hold 2s)
2. Wipe divider slides left-to-right revealing "Japandi" (1.5s wipe)
3. Hold styled result (2s), show style label + "Generated" badge
4. Wipe back right-to-left revealing empty room (1.5s)
5. Pause on empty (1.5s)
6. Wipe to "Contemporary" (same pattern)
7. Back to empty, then "Eclectic", loop

Total per style: ~7s. Full cycle: ~21s. Slow and deliberate.

### Changes

**`src/components/app/WorkflowAnimatedThumbnail.tsx` — Replace `StagingThumbnail`**

- Replace the crossfade carousel with a wipe-based before/after slider (similar to the upscale mode but cycling through styles)
- State machine with phases: `empty-hold` → `wiping-in` → `styled-hold` → `wiping-out` → next style
- Empty room image is always the base layer; styled image is clipped with `clip-path: inset()` animated via CSS keyframes
- A vertical divider line (2px white) tracks the wipe edge (reuse `wf-divider-move` pattern from upscale)
- Style label badge updates per style with fade transition
- "Generated" badge appears during `styled-hold` phase
- Progress dots remain to show which style is active
- Use `object-cover` without any scale transforms to keep images natural (no zoom)
- Optimize background URLs with `getOptimizedUrl({ quality: 60 })` for performance
- All transitions use `ease-in-out` for smoothness; no abrupt opacity changes

**`src/components/app/workflowAnimationData.tsx`** — No changes needed (already has correct data)

### Key Implementation Detail
```tsx
// Phase cycle per style:
// empty-hold (2s) → wiping-in (1.5s) → styled-hold (2.5s) → wiping-out (1.5s)
// Then advance styleIndex and repeat

// Wipe-in: clip-path goes from inset(0 100% 0 0) to inset(0 0% 0 0)
// Wipe-out: clip-path goes from inset(0 0% 0 0) to inset(0 100% 0 0)
// Divider line tracks the wipe edge position
```

