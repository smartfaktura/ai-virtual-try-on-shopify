

# Fix: Background Color Selection Not Applied to Generation Prompt

## Problem
When you select a background like "Sage" in Step 3, it's stored as `backgroundTone = 'sage'`. But the prompt builder treats `backgroundTone` as a **color world** (mapped via `COLOR_WORLD_MAP`), which only knows values like `warm-neutral`, `cool-neutral`, `monochrome` — not the actual swatch values like `sage`, `blush`, `taupe`, `off-white`, etc.

Result: the selected background color is silently dropped from the prompt, and the AI defaults to a generic gray/white.

## Root Cause
The `BackgroundSwatchSelector` UI writes swatch values (`sage`, `blush`, `taupe`, `white`, `off-white`, `light-gray`, etc.) into `details.backgroundTone`. But the prompt builder's `background` token resolution only checks:
1. `details.negativeSpace` → `BG_MAP` (has `taupe`, `off-white`, but NOT `sage` or `blush`)
2. `details.backgroundTone` → `COLOR_WORLD_MAP` (only has `warm-neutral`, `cool-neutral`, etc.)

So swatch values like `sage` and `blush` have **no mapping** in either map and produce an empty string.

## Fix

### 1. Add missing swatch values to `BG_MAP` in `productImagePromptBuilder.ts`
Add entries for all UI swatch values that are missing:
- `'sage'` → `'soft sage green (#E8EDE6)'`
- `'blush'` → `'soft blush pink (#F8ECE8)'`
- `'white'` → `'pure seamless white (#FFFFFF)'`
- `'warm-neutral'` → `'warm beige (#F5F0EB)'`
- `'cool-neutral'` → `'cool gray (#EDF0F4)'`

### 2. Update the `background` token resolution logic
Change the prompt builder so that `backgroundTone` swatch values are checked against `BG_MAP` first (as the primary background descriptor), falling back to `COLOR_WORLD_MAP` only for color-world values. This ensures selected swatches like "Sage" produce a concrete background instruction like `"soft sage green (#E8EDE6) background"`.

### 3. Also add gradient preset mappings
The gradient preset values (`gradient-warm`, `gradient-cool`, `gradient-sunset`) are already in `COLOR_WORLD_MAP` but should also work when set via `backgroundTone`.

## Files to modify
- **`src/lib/productImagePromptBuilder.ts`** — add missing swatch entries to `BG_MAP` and update the `background` token to resolve `backgroundTone` against `BG_MAP` first, then `COLOR_WORLD_MAP`

## No other changes needed
The UI, state management, and edge function are all fine — only the prompt builder's mapping is incomplete.

