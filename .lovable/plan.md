## Stop preselecting cast & scale in the Brand Scene wizard

### Where it happens
`src/features/brand-scenes/wizard/steps/Step4Cast.tsx` (lines 128–133) runs a mount effect that seeds both fields on entry:

```ts
useEffect(() => {
  if (!scale?.preset) onScaleChange({ preset: scalePreset }); // → "handheld" etc.
  if (!cast?.preset)  onCastChange({ preset: resolved.defaultCast }); // → "solo" etc.
}, [module, subFamily]);
```

That's why "Handheld" and a cast chip appear pre-active before the user clicks.

### Change
Remove that effect entirely. The user picks both manually. Validation in `step4Flow.ts` already blocks Continue with `"Choose who's in the shot"` and `"Pick a product scale"`, so nothing else needs to change.

Keep `resolved.scale.default` / `resolved.defaultCast` available as fallbacks for downstream computations (the `scalePreset` const at line 126 stays; it only feeds forbidden-rule math, not the UI selection state).

The Auto-cast / "skip" branch (lines 192–240) keeps its seeding behavior — that path is explicitly opt-in when the user chooses "Skip and auto-cast", so seeding there is intended.

### Files
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` — delete the mount seed effect (lines 128–133).

No other steps preselect values.