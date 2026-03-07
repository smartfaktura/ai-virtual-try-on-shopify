

## Redesign Credit Indicator in Desktop Sidebar

### Issues from screenshot
1. **Progress bar nearly invisible** — `h-1.5` with `bg-white/[0.08]` track and `bg-primary/70` fill has almost no contrast against the dark sidebar
2. **Credits stacked awkwardly** — balance and total on separate lines (`3904` then `/ 4,500`) feels misaligned and wastes vertical space

### Changes to `src/components/app/CreditIndicator.tsx`

**1. Inline credit display** — Put balance and total on one line: `3,904 / 4,500` with the balance bold and the denominator in muted text. Removes the stacked layout.

```tsx
<div className="flex items-baseline gap-1">
  <span className="text-sm font-bold text-sidebar-foreground">{balance.toLocaleString()}</span>
  <span className="text-[10px] text-sidebar-foreground/40">
    / {monthlyCredits === Infinity ? '∞' : monthlyCredits.toLocaleString()}
  </span>
</div>
```

**2. Better progress bar** — Increase height to `h-2`, use a more visible track (`bg-white/[0.12]`), and bump fill opacity to full `bg-primary`. Add a subtle inner glow with a gradient overlay for depth.

```tsx
<div className="h-2 w-full rounded-full bg-white/[0.12] overflow-hidden">
  <div
    className={`h-full rounded-full transition-all duration-500 ${
      hasBonus ? 'bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.4)]' : 'bg-primary'
    }`}
    style={{ width: `${usagePercent}%` }}
  />
</div>
```

### Files changed
- `src/components/app/CreditIndicator.tsx`

