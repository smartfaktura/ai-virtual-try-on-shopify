

# Fix Shot Labels, Background Consistency, and Ghost Mannequin Shadows

## Issues Found

### 1. No shot label on generated images
The gallery grid at line 523 renders raw images without any overlay showing which shot produced them. The data is available — each job in `batchState.jobs` has a `shotLabel` property and the images are aggregated via `flatMap(j => j.images)`. We need to map each image index back to its parent job to display the label.

### 2. Ghost mannequin still has big floor shadows
**Root cause**: The `[BACKGROUND]` placeholder is replaced with the selected background's `promptBlock`, which includes phrases like `"subtle natural shadow beneath subject"` or `"gentle warm shadow beneath subject"`. This directly contradicts the ghost mannequin's "NO shadow" directive. The background shadow instruction wins because it's more specific about what kind of shadow to add.

**Fix**: In `assemblePrompt`, when the shot is `ghost_mannequin`, override the background prompt to strip shadow references and force pure white void — don't inject the user's selected background at all for this shot type.

### 3. Sun flares / lighting inconsistency still appearing
**Root cause**: The `BACKGROUND RULE` (which says "NO sun flares, NO lens flares") is only appended when `modelProfile !== 'no model'` (line 751). Product-only shots using the `'no model'` profile skip this directive entirely. Additionally, the `warm_beige_studio` background and `warm_studio_refined` / `soft_warm_luxury` lighting presets can produce warm hue variation between shots.

**Fix**: Move the anti-flare directive out of the model-only block so ALL shots get it. Also strengthen all background `promptBlock` values to include explicit hex color enforcement.

## Changes

### File 1: `src/pages/CatalogGenerate.tsx` (~line 523-531)
Add a shot label badge overlay on each generated image. Build a mapping from image index to job by iterating `batchState.jobs` in order (mirroring the `flatMap` logic):

```tsx
{(() => {
  // Build image-to-job mapping
  const imageJobMap: { url: string; shotLabel: string }[] = [];
  for (const j of batchState.jobs) {
    for (const img of j.images) {
      imageJobMap.push({ url: img, shotLabel: j.shotLabel });
    }
  }
  return imageJobMap.map((item, i) => (
    <button key={i} ...>
      <ShimmerImage ... />
      <span className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded truncate">
        {item.shotLabel}
      </span>
    </button>
  ));
})()}
```

### File 2: `src/lib/catalogEngine.ts` — `assemblePrompt` function
Three changes:

**a)** Ghost mannequin background override: Before template replacement, if `shotDef.id === 'ghost_mannequin'`, replace `backgroundPrompt` with a hardcoded pure white void prompt that has NO shadow language.

**b)** Move anti-flare directive to apply to ALL shots (not just model shots). Extract from the `if (modelProfile !== 'no model')` block and append unconditionally:
```
prompt += '\nLIGHTING RULE: NO sun flares, NO lens flares, NO window light, NO natural outdoor lighting, ONLY controlled even studio lighting.';
```

**c)** Add explicit hex color reinforcement to the background directive for all shots:
```
prompt += `\nBACKGROUND COLOR: The background MUST be exactly ${backgroundHex} — uniform, seamless, no gradients, no color shifts.`;
```
Pass the hex from the background definition through the `PromptAssemblyInput` interface.

### File 3: `src/lib/catalogEngine.ts` — Background definitions
Remove "shadow beneath subject" from ALL background `promptBlock` values for the ghost mannequin case (handled by the override above). No change to the actual definitions needed — the override in `assemblePrompt` handles it.

### File 4: `src/lib/catalogEngine.ts` — Types
Add `backgroundHex?: string` to `PromptAssemblyInput` interface.

### File 5: `src/hooks/useCatalogGenerate.ts`
Pass `backgroundHex` from the session's background definition when calling `assemblePrompt`.

## Summary
- Shot label badges on each generated image thumbnail
- Ghost mannequin gets a hardcoded pure-white-void background with zero shadow language
- Anti-flare lighting rule applied to ALL shots (not just model shots)
- Background hex color enforcement appended to every prompt

