

## Fix Progress Bar — Remove Dark Outline Artifact

### Problem
The `ring-1 ring-white/10` adds a dark-looking border around the track, and the inner `rounded-full` on the fill creates a gap where the darker track shows through at the edges — making it look like there's a dark line on top of a lighter line.

### Fix in `src/components/app/CreditIndicator.tsx` (line 64-68)

- Remove `ring-1 ring-white/10` — it adds an unwanted dark outline
- Remove `rounded-full` from the inner fill div — prevents the dark track peeking at corners
- Bump track to `bg-white/[0.4]` for even more contrast

```tsx
<div className="h-2.5 w-full rounded-full bg-white/[0.4] overflow-hidden">
  <div
    className="h-full bg-primary transition-all duration-500"
    style={{ width: `${usagePercent}%` }}
  />
</div>
```

### Files changed
- `src/components/app/CreditIndicator.tsx` — progress bar only

