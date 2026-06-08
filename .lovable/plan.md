# Slow down the perceived progress curve

**Goal:** the bar should land near **94% at ~30 seconds**, then crawl asymptotically toward 95% until real completions arrive. Today the curve is tied to `totalEstSeconds = effectiveTotal * 5`, so 1–2 visuals hit 94% almost instantly while 10+ visuals feel sluggish. Switch to a **wall-clock anchored curve** so every job — regardless of image count — has the same satisfying pace.

**Scope:** frontend only — `src/components/app/product-images/ProductImagesStep5Generating.tsx`. No backend, no estimate-copy change (the "~1–2 min" copy stays as-is — that's still scaled per image count).

## The new curve (wall-clock based)

| Elapsed | Display % |
|---|---|
| 0 s   | 2%   |
| 6 s   | ~35% |
| 12 s  | 70%  |
| 18 s  | 80%  |
| 24 s  | 90%  |
| 30 s  | ~94% |
| 60 s  | ~94.8% |
| ∞     | → 95% (capped until real completion) |

Implementation:

```ts
// Wall-clock anchored perceived progress.
// Hits 70 at 12s, 90 at 24s, ~94 at 30s, asymptote → 95.
let timeCurve: number;
if (elapsed < 12) {
  timeCurve = (elapsed / 12) * 70;                  // 0  → 70
} else if (elapsed < 24) {
  timeCurve = 70 + ((elapsed - 12) / 12) * 20;      // 70 → 90
} else {
  timeCurve = 90 + (1 - Math.exp(-(elapsed - 24) / 6)) * 5; // 90 → ~95
}

const isAllDone = effectiveTotal > 0 && completedJobs >= effectiveTotal;
const ceiling = isAllDone ? 100 : 95;
const displayPct = isQueuing
  ? Math.max(2, Math.round((enqueuedJobs / Math.max(expectedJobCount, 1)) * 10))
  : Math.min(ceiling, Math.max(Math.round(timeCurve), pct, 2));
```

`totalEstSeconds` / `estimatePerImage` are no longer used by the curve, so those lines get removed. The estimate copy (`lowMin` / `highMin`) keeps its own per-image math — untouched.

## Why this is safe

- **Real `pct` still wins** if jobs finish faster than the curve — bar can still leap forward.
- **100% only fires on real completion** (`isAllDone` gate unchanged).
- **95% cap** until truly done means we never lie when something genuinely takes 2 min.
- One file, ~10 lines changed, trivially reversible.

## Validation

- 2-visual job: bar moves smoothly toward 94% by 30 s, then crawls until completion (no more "instant 94%").
- 10-visual job: same 30 s pacing — feels identical to a 2-visual job until real completions push the bar past 94%.
- 20-visual job: same — but `showSlowWarning` at 180 s still fires honestly if backend is slow.
