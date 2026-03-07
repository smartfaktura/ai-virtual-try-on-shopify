

## Change Progress Bar Fill to Light Grey/White

### Change in `src/components/app/CreditIndicator.tsx` (line 72)

Replace the violet gradient fill with a clean white/light-grey fill:

```tsx
className="h-full bg-white/70 transition-all duration-500"
```

This gives a soft white bar against the darker `bg-slate-400/30` track — clearly visible, no violet.

### File changed
- `src/components/app/CreditIndicator.tsx` — one line

