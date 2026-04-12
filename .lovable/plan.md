

# Fix Background Color Drift for Swatch Presets

## Problem
When a user picks a swatch preset (e.g. "sage"), the prompt resolves to descriptive text like:
```
soft sage green (#E8EDE6) seamless studio background, no texture, no pattern
```
The AI model focuses on "soft sage green" (subjective) and may interpret the hue differently per scene. Meanwhile, custom hex picks resolve to:
```
flat solid #E8EDE6 color background, no texture, no pattern
```
…which is precise and consistent. The swatch path needs to match this precision.

## Fix

**File:** `src/lib/productImagePromptBuilder.ts` (line 872-873)

Change the swatch resolution path to use the same assertive hex-first format as custom hex:

```ts
// Before (line 872-873):
if (swatchResolved) {
  return `${swatchResolved} seamless studio background, no texture, no pattern`;
}

// After:
if (swatchResolved) {
  // Extract hex if present in the resolved string, otherwise use descriptive fallback
  const hexMatch = swatchResolved.match(/#[0-9A-Fa-f]{6}/);
  if (hexMatch) {
    return `flat solid ${hexMatch[0]} color background, no texture, no pattern`;
  }
  return `${swatchResolved} seamless studio background, no texture, no pattern`;
}
```

This ensures every swatch with a hex code (sage `#E8EDE6`, blush `#F8ECE8`, white `#FFFFFF`, etc.) resolves to the exact same format as a custom hex pick — making the AI treat them identically and eliminating hue drift between scenes.

Swatches without embedded hex codes (like `taupe`, `stone`) fall back to the current descriptive behavior.

## Files changed
1. `src/lib/productImagePromptBuilder.ts` — use hex-first format for swatch backgrounds

