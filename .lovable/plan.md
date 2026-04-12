

# Add Hex Codes to All Background Swatch Entries

## Problem
The fix we applied earlier (extracting hex from swatch strings) only works when the resolved string contains a `#hex` code. Several `BG_MAP` entries — including `off-white`, `warm-beige`, `soft-white`, `cool-gray`, `black`, `taupe`, `stone` — have no hex code embedded. They resolve to vague descriptive text like `"off-white / ivory"`, which the AI interprets inconsistently across scenes (some get yellowish, others stay neutral).

The user's last generation used the `off-white` swatch, which resolved to `"off-white / ivory seamless studio background"` — the word "ivory" introduces a warm/yellow bias that varies per scene.

## Fix

**File:** `src/lib/productImagePromptBuilder.ts` (lines 44-66)

Add explicit hex codes to every `BG_MAP` entry that currently lacks one:

```ts
const BG_MAP: Record<string, string> = {
  'pure-white': 'pure seamless white (#FFFFFF)',
  'warm-beige': 'warm beige (#F5F0EB)',
  'light-gray': 'soft neutral light gray (#E8E8E8)',
  'light-grey': 'soft neutral light gray (#E8E8E8)',
  'soft-white': 'soft warm white (#FAFAFA)',
  'cool-gray': 'cool mid-gray (#D0D4D8)',
  'off-white': 'off-white (#F8F8F5)',
  'black': 'deep matte black (#1A1A1A)',
  'gradient': 'subtle gradient',
  'colored': 'solid colored',
  'taupe': 'warm taupe (#C4B7A6)',
  'stone': 'natural stone gray (#B8B0A8)',
  // Swatch values (already have hex)
  'sage': 'soft sage green (#E8EDE6)',
  'blush': 'soft blush pink (#F8ECE8)',
  'white': 'pure seamless white (#FFFFFF)',
  'warm-neutral': 'warm beige (#F5F0EB)',
  'cool-neutral': 'cool gray (#EDF0F4)',
  'ivory': 'warm ivory (#FFFFF0)',
  'charcoal': 'deep charcoal gray (#36454F)',
  'navy': 'deep navy (#2B3A4E)',
};
```

Key change: removed "ivory" from the `off-white` entry and gave it a neutral hex `#F8F8F5`. Now the regex in our previous fix will extract the hex and produce `"flat solid #F8F8F5 color background, no texture, no pattern"` — identical format across all scenes, eliminating yellowish drift.

`gradient` and `colored` are left as-is since they're handled by separate code paths.

## Files changed
1. `src/lib/productImagePromptBuilder.ts` — add hex codes to all BG_MAP entries missing them

