

## /app/workflows — unified 750ms carousel tempo with staggered starts

### Goal
All carousel-mode workflow thumbnails on `/app/workflows` cycle their images every **750ms** (the "0.75 tempo"), but each card starts its first swap at a different offset so the page doesn't pulse in sync.

### Findings
- `WorkflowAnimatedThumbnail` carousel uses `scene.interval ?? 2500` ms (`src/components/app/WorkflowAnimatedThumbnail.tsx`, line 241) inside a single `setInterval` keyed off `currentRef`.
- Scene data (`src/components/app/workflowAnimationData.tsx`) currently sets:
  - `Product Visuals`: 750
  - `Catalog Studio`: 500
  - All other carousel workflows (`Virtual Try-On Set`, `Product Listing Set`, `Selfie / UGC Set`, `Picture Perspectives`, plus Flat Lay / Mirror Selfie if carousel): no `interval` → fall back to 2500.
- `upscale` and `staging` modes have their own internal timing and should NOT be touched.

### Changes

**1. `src/components/app/workflowAnimationData.tsx` — set `interval: 750` on every carousel scene**
Apply `interval: 750` to:
- Virtual Try-On Set
- Product Listing Set
- Selfie / UGC Set
- Flat Lay Set (if carousel)
- Mirror Selfie Set (if carousel)
- Picture Perspectives
- Catalog Studio (change 500 → 750)
- Product Visuals (already 750, leave)

Skip `Image Upscaling` (upscale mode) and `Interior / Exterior Staging` (staging mode).

**2. `src/components/app/WorkflowAnimatedThumbnail.tsx` — add per-card random start offset**
In `CarouselThumbnail`, before the main `setInterval`, schedule a one-time `setTimeout` with a random offset in `[0, INTERVAL)` ms that performs one advance, then starts the regular interval. This guarantees:
- Every card cycles at the same 750ms rhythm (visually unified tempo).
- Cards never tick on the same frame across the page (offsets distributed across the 750ms window).

Implementation sketch:
```tsx
useEffect(() => {
  if (!isActive || backgrounds.length <= 1) return;
  const offset = Math.random() * INTERVAL; // 0–750ms jitter
  let interval: ReturnType<typeof setInterval>;
  const advance = () => {
    const next = (currentRef.current + 1) % backgrounds.length;
    currentRef.current = next;
    setCurrent(next);
    setProgressKey((k) => k + 1);
  };
  const initial = setTimeout(() => {
    advance();
    interval = setInterval(advance, INTERVAL);
  }, offset);
  return () => { clearTimeout(initial); if (interval) clearInterval(interval); };
}, [isActive, backgrounds.length, INTERVAL]);
```

The progress bar (`wf-progress-fill ${INTERVAL}ms`) automatically matches the new tempo since it reads `INTERVAL`.

### Acceptance
- Every carousel thumbnail on `/app/workflows` swaps images every 750ms.
- Cards visibly tick at different moments — no synchronized "page flash".
- Upscale and Staging cards behave exactly as before.
- Mobile, tablet, desktop unchanged structurally.

### Files touched
- `src/components/app/workflowAnimationData.tsx` (add/adjust `interval: 750` on ~6 scenes)
- `src/components/app/WorkflowAnimatedThumbnail.tsx` (random start offset in carousel `useEffect`, ~10 lines)

