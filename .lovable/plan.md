

## Fix Free Plan Scene Limit Banner & Remove Regenerate Previews Button

### Changes — `src/pages/Generate.tsx`

**1. Redesign the free plan upgrade banner (lines 2603-2608)**
Replace the dark navy inline chip with a cleaner, more readable banner:
- Use a light background (`bg-muted border border-border`) instead of the dark `bg-[hsl(222,30%,15%)]` that makes the link invisible
- Make the upgrade CTA a visible button/link with proper contrast
- Single readable sentence: "Free plan: 1 scene per generation. **Upgrade** to unlock up to 3."
- Use `rounded-lg px-4 py-2.5` with an icon (Lock or Sparkles) for visual clarity

```tsx
<div className="mt-2 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
  <Lock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
  <p className="text-xs text-muted-foreground">
    Free plan: 1 scene per generation.{' '}
    <button onClick={openBuyModal} className="text-primary font-semibold hover:underline">
      Upgrade
    </button>{' '}
    to unlock up to 3.
  </p>
</div>
```

**2. Remove the Regenerate Previews button (lines 2611-2625)**
Delete the entire `{isAdmin && (<Button ...>Regenerate Previews</Button>)}` block.

### Files changed — 1
- `src/pages/Generate.tsx`

