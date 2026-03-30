

## Change Hero Trust Badges

**File:** `src/components/landing/HeroSection.tsx` (line 16)

Change the third trust badge from `Cancel anytime` to `Start in seconds`, and swap the `Shield` icon for a more fitting one like `Zap` (lightning bolt = speed/instant).

```ts
// Before
{ icon: Shield, text: 'Cancel anytime' },

// After
{ icon: Zap, text: 'Start in seconds' },
```

Update the `lucide-react` import to replace `Shield` with `Zap`.

