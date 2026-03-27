

# Adjust Time Estimates to Match Real Generation Data

## Real Data (last 30 days from database)

```text
Job Type          Median    Avg     P90      Current Estimate
─────────────────────────────────────────────────────────────
Freestyle std     22.5s    27.4s    —        ~25s (base15 + 10)  ✓ close
Freestyle high    30.1s    36.7s    —        ~40s (base15 + 10 + 15) ✓ ok
Workflow          42.6s    50.8s    87s      8s/image ✗ too low
Try-On            47.2s    62.9s    126s     "20-30s" ✗ way too low
Video             207s     220s     311s     "1-3 min" ✗ too low
Upscale           30.4s    35.2s    79s      —
Brand Model       ~40s     —        —        ~40s ✓ ok
```

## Changes

### 1. `QueuePositionIndicator.tsx` — `estimateSeconds()` (Freestyle/Generate queue)
Current formula produces ~25-70s depending on settings. Real data shows median 22-30s. This is **close enough** — only minor tweak needed:
- Change default (no meta) from `70` to `40` (real median for high quality)
- Keep base at 15, but lower `imageCount` multiplier from `10` to `8` (single image jobs dominate)

### 2. `WorkflowActivityCard.tsx` — per-image estimate
- Change `totalImageCount * 8` to `totalImageCount * 45` — real median is 42.6s per workflow job (each job = 1 image)
- This is the biggest fix: workflows show progress way too fast then stall

### 3. `TryOnConfirmModal.tsx` — static text
- Change "20-30 seconds" to "40-90 seconds" (median 47s, avg 63s)

### 4. `DropCard.tsx` — `SECONDS_PER_IMAGE`
- Change from `8` to `45` — drops run workflow jobs which take ~42-50s each

### 5. `VideoGenerate.tsx` and `AnimateVideo.tsx` — video estimate
- Change "1-3 minutes" to "3-5 minutes" (median 3.5 min, can go to 5 min)

### 6. `Generate.tsx` and `TryOnSettingsPanel.tsx` — quality selector text
- Change "~60-120s per image" to "~30-60s per image" (real median 30s for high quality freestyle, but keep higher range for complex setups)

## Summary
The biggest mismatches are **Workflows** (8s vs real 45s), **Try-On** (20-30s vs real 47-63s), and **Video** (1-3 min vs real 3.5 min). Freestyle estimates are close to reality.

