

# Background System Overhaul — Apply to All + Color Swatches + Gradients + Custom Hex

## What's Wrong

1. **Background only affects ~11/19 scenes** — the strip says "7 scenes" because it filters on `{{background}}` token presence. The user expects "Pure White" to apply across ALL selected scenes. Scenes without the token silently ignore the setting.

2. **No visual color swatches** — the background chips are plain text ("Pure White", "Light Gray"). Users expect to see a colored rectangle next to each option so they can visually identify the tone.

3. **No gradient options** — only a single "Soft Gradient" chip exists. Users want to see gradient presets (warm fade, cool fade, etc.) and the ability to input a custom gradient.

4. **No custom hex/color input** — users want to type their own hex code or pick a custom color for backgrounds.

5. **Changes are cosmetic only if the prompt template doesn't contain `{{background}}`** — this is the core bug. The backgroundTone needs to be injected into ALL scene prompts, not just those with the token.

## Plan

### 1. Fix prompt injection: backgroundTone applies globally

**File: `src/lib/productImagePromptBuilder.ts`**

In the main prompt builder function, after resolving all template tokens, append a background directive suffix to scenes that DON'T already have `{{background}}` in their template. This ensures every scene gets the user's background preference injected.

Add logic: if the scene template doesn't contain `{{background}}` AND `backgroundTone` is set (not 'auto'), append a background instruction line like: `"Background: {resolved background tone}."` to the final prompt.

Also add new entries to `COLOR_WORLD_MAP` for gradient presets and custom hex values.

### 2. Background strip applies to ALL scenes

**File: `ProductImagesStep3Refine.tsx`**

- Remove the filter `scenesWithBackground.length >= 2` — always show the background strip when there are 2+ selected scenes
- Change label from "· {scenesWithBackground.length} scenes" to "· all {selectedScenes.length} scenes"
- This makes it clear the background setting is global

### 3. Add color swatches to background chips

**File: `ProductImagesStep3Refine.tsx`**

Create a new `BackgroundChipSelector` component (inline) that renders each option with a small colored square:

| Value | Swatch Color |
|-------|-------------|
| `white` | `#FFFFFF` (with border) |
| `light-gray` | `#E5E7EB` |
| `warm-neutral` | `#F5F0EB` |
| `cool-neutral` | `#EDF0F4` |
| `gradient` | CSS linear-gradient preview |

Each chip: `[■ Pure White]` — 12x12 rounded color swatch + label text.

### 4. Add gradient presets

Expand the background options with gradient presets:

| Value | Label | Gradient CSS |
|-------|-------|-------------|
| `gradient-warm` | Warm Fade | `#FAF7F2 → #F0E6D8` |
| `gradient-cool` | Cool Fade | `#F0F4F8 → #E0E8F0` |
| `gradient-sunset` | Sunset | `#FEF3E6 → #F8E0D0` |
| `gradient` | Soft Gradient | `#F8F8F8 → #EEEEEE` |

Add corresponding entries to `COLOR_WORLD_MAP` in the prompt builder for proper prompt injection.

### 5. Add custom hex/gradient input

Below the background chips, add a compact row:
- **Custom color**: a hex input field with a small color preview swatch (reuse existing `CustomHexPanel` pattern but simplified)
- When the user enters a custom hex, set `backgroundTone` to `custom` and store the hex value in a new field `backgroundCustomHex` on `DetailSettings`

Add `backgroundCustomHex` to the `DetailSettings` type and handle it in the prompt builder.

### 6. Update DetailSettings type

**File: `src/components/app/product-images/types.ts`**

Add:
```
backgroundCustomHex?: string;
```

## Files to Update

| File | Changes |
|---|---|
| `types.ts` | Add `backgroundCustomHex?: string` to `DetailSettings` |
| `ProductImagesStep3Refine.tsx` | (1) Remove `scenesWithBackground` filter — show strip for all scenes. (2) Replace plain `ChipSelector` with new `BackgroundChipSelector` that renders color swatches. (3) Add gradient preset chips. (4) Add custom hex input row below chips. (5) Update label to "all N scenes". |
| `productImagePromptBuilder.ts` | (1) Add gradient preset entries to `COLOR_WORLD_MAP`. (2) Add custom hex handling. (3) After template token resolution, inject background directive into scenes that don't have `{{background}}` token — ensuring global application. |

