

## Improve Progress Bar Visibility

The track at `bg-white/20` blends into the dark card (`bg-white/[0.06]`). Fix by making the track significantly lighter and adding a subtle inner border for definition.

### Changes in `src/components/app/CreditIndicator.tsx` (line 64)

- Track: `bg-white/20` → `bg-white/[0.35]` — much lighter, clearly visible against the dark sidebar
- Add `ring-1 ring-white/10` for a subtle border outline to further separate it from the background
- Fill: keep `bg-primary` but add a soft glow `shadow-[0_0_6px_hsl(var(--primary)/0.5)]` for extra pop

