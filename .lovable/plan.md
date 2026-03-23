

# Recipe Strip Above Image + Animated Sequence + Browse Button

## Changes

### 1. `src/components/app/WorkflowCardCompact.tsx`

**Move recipe strip from after image to before image** (lines 65-87 → move above line 49):

When `modalCompact`, render the recipe strip ABOVE the thumbnail container. Make images smaller on mobile (`w-5 h-5` vs `w-7 h-7`).

**Add looping staggered animation**: Instead of `animate-fade-in` (plays once), use a CSS animation with `@keyframes` that:
- Fades each item in one-by-one with staggered delays (0.4s apart)
- After the last `=` result appears, apply a subtle shine/glow pulse on the result image
- After a 3s pause, reset and replay (use `animation-iteration-count: infinite` with total duration = items * 0.4s + 3s hold + 0.3s fade-out)

Simpler approach: use a React `useEffect` interval that toggles a `showRecipe` state every ~5s, causing the staggered fade-in to replay.

```tsx
// State for animation replay
const [recipeKey, setRecipeKey] = useState(0);
useEffect(() => {
  if (!modalCompact || !scene?.recipe) return;
  const interval = setInterval(() => setRecipeKey(k => k + 1), 6000);
  return () => clearInterval(interval);
}, [modalCompact, scene?.recipe]);
```

Each item uses `opacity-0 animate-fade-in` with `animationDelay` and `animationFillMode: 'forwards'`. The `key={recipeKey}` on the container forces re-mount, replaying animations.

Result image gets an additional shimmer/shine effect via a CSS pseudo-element or `ring-2 ring-primary/40 animate-pulse` after appearing.

### 2. `src/components/app/workflowAnimationData.tsx`

**Fix Selfie / UGC recipe** (line 100-104): The result should show the model using the product (ugcResult1), which already shows the redhead model. But the recipe currently shows `ugcProduct` + `ugcModel` = `ugcResult1`. This is correct conceptually but the user wants the redhead model in the result. The data already has `recipeResult: ugcResult1` which IS the redhead model using the ice roller. No data change needed — the issue was the floating overlay showing on top of the image. That was already fixed. Keep as-is.

### 3. `src/components/app/StartWorkflowModal.tsx`

**Add "Browse all workflows" button** after the workflow grid (line 200, after the grid `</div>`):

```tsx
<div className="flex justify-center pt-3">
  <Button
    variant="ghost"
    size="sm"
    className="text-xs text-muted-foreground gap-1.5"
    onClick={() => { onOpenChange(false); navigate('/app/workflows'); }}
  >
    Browse all workflows <ArrowRight className="w-3 h-3" />
  </Button>
</div>
```

### 4. Mobile fitting

In the recipe strip, use responsive sizing:
- Mobile: `w-5 h-5` images, `gap-0.5`, `text-[8px]` for `=`
- Desktop: `w-7 h-7` images, `gap-1`, `text-[10px]` for `=`

### Files
- `src/components/app/WorkflowCardCompact.tsx` — move recipe above image, add looping animation with replay key, responsive sizing
- `src/components/app/StartWorkflowModal.tsx` — add "Browse all workflows" button after grid

