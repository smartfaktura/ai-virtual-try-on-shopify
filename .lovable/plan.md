

## Improve Picture Perspectives Carousel Animation

### Problems
1. **Too fast** — carousel interval is 3000ms, transitions are 300–600ms. Images flash by before you can appreciate them.
2. **"One Click" badge** positioned at `bottom: 18%, right: 6%` — overlaps with the "Generated" badge at `bottom: 7, right: 4` creating visual clutter.
3. **No staggered entry** — both badges have `enterDelay: 0` and `animation: 'pop'`, so they appear simultaneously without storytelling.

### Changes

**`src/components/app/WorkflowAnimatedThumbnail.tsx`** — CarouselThumbnail:
- Increase `INTERVAL` from `3000` to `5000` (5 seconds per slide)
- Increase crossfade duration from `0.6s` to `1s` for smoother transitions
- Remove the hardcoded "Generated" badge from carousel mode (it adds clutter for Perspectives)

**`src/components/app/workflowAnimationData.tsx`** — Picture Perspectives entry:
- Move "One Click" badge to `bottom: 8%, left: 6%` (bottom-left, away from progress bar)
- Add staggered `enterDelay`: "1 Photo, 4 Angles" at `0.3s` with `slide-left`, "One Click" at `0.8s` with `slide-up`

| File | Change |
|------|--------|
| `src/components/app/WorkflowAnimatedThumbnail.tsx` | Slow carousel interval to 5s, longer crossfade, remove "Generated" badge from carousel mode |
| `src/components/app/workflowAnimationData.tsx` | Reposition "One Click" badge, add staggered entry delays |

