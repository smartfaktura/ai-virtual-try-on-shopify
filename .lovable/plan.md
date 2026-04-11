

# Fix: Gradient Presets — Two Issues

## What works (solid swatches)
Solid swatches like sage, blush, navy are in `BG_MAP` with hex codes (e.g. `"soft sage green (#E8EDE6)"`). They're caught on line 795 and return cleanly on line 797. No white studio fallback. No contradiction.

## What's broken (gradient presets)
`gradient-cool`, `gradient-warm`, `gradient-sunset` are NOT in `BG_MAP`. They exist only in `COLOR_WORLD_MAP` (line 69-81). So the code:
1. Misses them at line 795
2. Falls back to `defaultBackground()` → white studio
3. Appends the gradient from `COLOR_WORLD_MAP` as "with..." modifier
4. Result: contradictory "white studio... with gradient..."

Also: gradient descriptions use names ("deep forest green") instead of hex codes like the solid swatches do.

## Fix — `src/lib/productImagePromptBuilder.ts`

**Change 1:** Add early return for gradient presets in `resolveToken` (after line 793, before line 795):

```ts
// Named gradient preset — direct background, not a modifier
if (colorWorld && colorWorld.startsWith('gradient-') && COLOR_WORLD_MAP[colorWorld]) {
  return `${COLOR_WORLD_MAP[colorWorld]}, no texture, no pattern`;
}
if (colorWorld === 'gradient' && COLOR_WORLD_MAP['gradient']) {
  return `${COLOR_WORLD_MAP['gradient']}, no texture, no pattern`;
}
```

**Change 2:** Update `COLOR_WORLD_MAP` gradient entries (lines 77-81) to use hex codes matching the UI swatches from `ColorPickerDialog.tsx`:

```ts
'gradient': 'smooth gradient background fading from #FFFFFF to #123668',
'gradient-warm': 'warm gradient background fading from #984D1B to #FBEFE9',
'gradient-cool': 'cool gradient background fading from #0F570F to #EAFBE9',
'gradient-sunset': 'warm gradient background fading from #B62020 to #FBE9E9',
```

**1 file, ~10 lines changed.** Solid swatches unaffected. Custom hex/gradient unaffected.

