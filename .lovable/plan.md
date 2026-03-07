

## Make Progress Bar More Subtle & Minimalistic

Reduce the bar height from `h-2.5` (10px) to `h-1.5` (6px), lower the track and fill opacities for a whisper-thin look.

### Change in `src/components/app/CreditIndicator.tsx` (lines 70-74)

```tsx
<div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
  <div
    className="h-full bg-white/40 rounded-full transition-all duration-500"
    style={{ width: `${usagePercent}%` }}
  />
</div>
```

- **Track**: `h-1.5` (thinner), `bg-white/[0.08]` (barely visible guide)
- **Fill**: `bg-white/40` (soft glow, not stark), `rounded-full` on fill too for polish

### File changed
- `src/components/app/CreditIndicator.tsx`

