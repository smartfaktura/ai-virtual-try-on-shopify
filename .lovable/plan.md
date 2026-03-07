

## Make Credit Progress Bar Fill Brighter

### Problem
The track (`bg-slate-400/60`) is now nicely visible, but the **fill** uses `bg-primary` which resolves to a dark navy/indigo — nearly the same as the sidebar background. This makes the "used credits" portion appear as a dark stripe sitting on the lighter track.

### Fix in `src/components/app/CreditIndicator.tsx` (lines 70-74)

Replace the dark `bg-primary` fill with a bright, clearly visible gradient:

```tsx
<div className="h-2.5 w-full rounded-full bg-slate-400/30 overflow-hidden">
  <div
    className="h-full bg-gradient-to-r from-primary via-primary/80 to-violet-400 transition-all duration-500"
    style={{ width: `${usagePercent}%` }}
  />
</div>
```

- **Track**: soften slightly to `bg-slate-400/30` so it doesn't overpower the fill
- **Fill**: use a gradient (`from-primary via-primary/80 to-violet-400`) — the violet end ensures the bar is always visibly brighter than both the track and the sidebar, even if `--primary` is dark

This gives a glowing, clearly distinguishable fill against the lighter track.

### File changed
- `src/components/app/CreditIndicator.tsx` — progress bar only (lines 70-74)

