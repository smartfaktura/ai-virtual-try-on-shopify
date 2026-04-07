

# Refined Generation Loading State — Clean & Minimal

## Design Direction
Aligned with the VOVV.AI luxury-restraint aesthetic: no glows, no pulsing rings, no gradients. Instead — clean typography, elegant spacing, a refined progress bar with a subtle shimmer, and smooth crossfade transitions for team messages.

## Layout (ASCII)

```text
┌──────────────────────────────────────┐
│                                      │
│      Generating your visuals         │
│      3 of 8 images completed         │
│                                      │
│   ━━━━━━━━━━━━━━━░░░░░░░  38%       │
│   ⏱ 0m 24s                          │
│                                      │
│   (avatar) Sophia — Setting up       │
│   your scene lighting...             │
│                                      │
│   ✓ Product A    ⟳ Product B        │
│                                      │
│   ~ 2 min remaining · safe to leave  │
└──────────────────────────────────────┘
```

## Changes

### 1. Remove the Loader2 spinner entirely
**File: `ProductImagesStep5Generating.tsx`**
- Delete the `<Loader2 className="w-12 h-12 animate-spin">` block (lines 123-126)
- The progress bar and completion counter already communicate activity — no spinner needed
- This declutters the top and lets the headline breathe

### 2. Remove the Card wrapper from the progress bar
- Replace the `<Card>/<CardContent>` wrapper (lines 145-156) with a plain `<div className="w-full max-w-md space-y-3">`
- Keeps progress bar + timer/percentage row, just without the bordered card chrome
- Cleaner, more editorial

### 3. Add shimmer animation to the Progress bar indicator
**File: `src/components/ui/progress.tsx`**
- Add a shimmer overlay via a pseudo-element or extra class on the indicator
- Use the existing `shimmer` keyframe from tailwind config (`backgroundPosition` shift)
- Apply as: `bg-primary relative overflow-hidden` with an `after:` pseudo that sweeps a subtle white highlight across

### 4. Smooth crossfade on team message rotation
**File: `ProductImagesStep5Generating.tsx`**
- Track a `visible` state that toggles to false 400ms before each message swap
- Apply `transition-all duration-400` with opacity 0/1 and a slight translateY shift
- Remove the italic style — use regular weight, slightly larger (`text-sm` instead of `text-xs`)
- Remove the `pl-0.5` — center the avatar + message row

### 5. Update the bottom copy (dynamic + accurate)
Replace lines 221-223 with:
- **Batch (2+ images):** `"About 2 minutes for your batch. Safe to leave — results appear in your library."`
- **Single image:** `"Usually under a minute. Safe to leave — results appear in your library."`
- Lighter tone: `text-xs text-muted-foreground/70` for even more subtlety

### 6. Refine the per-product rows
- Remove the Card wrapper from per-product progress (lines 159-177) — use a plain div with a top border separator instead
- Slightly increase row height for breathing room

## Files to modify
- `src/components/app/product-images/ProductImagesStep5Generating.tsx` — layout, copy, crossfade, remove spinner + card wrappers
- `src/components/ui/progress.tsx` — add shimmer sweep to indicator

## What stays unchanged
- All progress calculation logic, phase detection, time floor
- Team data and rotation interval (6s)
- Skip/View results button logic and thresholds
- Slow warning + failed jobs summary

